const SYSTEMS_PER_PAGE = 4;
const MEASURES_PER_SYSTEM = 2;
const BEATS_PER_MEASURE = 4;
const NOTE_SCALE = 1.0;
// Keep ledger lines inside the notehead bounds so adjacent notes retain a visible gap.
const LEDGER_LINE_OVERHANG = 0.00;
const PERFORMANCE_STORAGE_KEY = "sightline-performance-v1";
// Static sites cannot enumerate their directory, so repository scores are declared here.
const MUSIC_XML_LIBRARY = [
  {
    id: "prelude-in-c-major",
    file: "prelude-in-c-major.xml",
    title: "Prelude in C Major",
    composer: "J. S. Bach"
  }
];
const KEYS = {
  C: { type: "natural", steps: [] },
  G: { type: "sharp", steps: ["F"] },
  D: { type: "sharp", steps: ["F", "C"] },
  A: { type: "sharp", steps: ["F", "C", "G"] },
  E: { type: "sharp", steps: ["F", "C", "G", "D"] },
  B: { type: "sharp", steps: ["F", "C", "G", "D", "A"] },
  "F#": { type: "sharp", steps: ["F", "C", "G", "D", "A", "E"] },
  "C#": { type: "sharp", steps: ["F", "C", "G", "D", "A", "E", "B"] },
  F: { type: "flat", steps: ["B"] },
  Bb: { type: "flat", steps: ["B", "E"] },
  Eb: { type: "flat", steps: ["B", "E", "A"] },
  Ab: { type: "flat", steps: ["B", "E", "A", "D"] },
  Db: { type: "flat", steps: ["B", "E", "A", "D", "G"] },
  Gb: { type: "flat", steps: ["B", "E", "A", "D", "G", "C"] },
  Cb: { type: "flat", steps: ["B", "E", "A", "D", "G", "C", "F"] }
};
const state = {
  midiAccess: null,
  midiInput: null,
  heldMidi: new Set(),
  notes: [],
  current: 0,
  correct: 0,
  missed: 0,
  demoMode: false,
  midiConnectPending: false,
  beatsPerMeasure: BEATS_PER_MEASURE,
  beatValue: 4,
  timeSignature: "4/4",
  importedPages: null,
  importedSourceTargets: null,
  importedPageIndex: -1,
  keyValue: "C",
  activeScore: null,
  performanceStartedAt: null,
  performanceElapsedMs: 0,
  performanceComplete: false,
  timerId: null
};
let renderedTargetNotes = new Map();

const els = {
  libraryView: document.querySelector("#libraryView"),
  playerView: document.querySelector("#playerView"),
  scoreLibrary: document.querySelector("#scoreLibrary"),
  importScore: document.querySelector("#importScore"),
  backToLibrary: document.querySelector("#backToLibrary"),
  restartPiece: document.querySelector("#restartPiece"),
  midiStatus: document.querySelector("#midiStatus"),
  midiInputs: document.querySelector("#midiInputs"),
  connectMidi: document.querySelector("#connectMidi"),
  musicXmlFile: document.querySelector("#musicXmlFile"),
  demoMode: document.querySelector("#demoMode"),
  pageLabel: document.querySelector("#pageLabel"),
  pieceTitle: document.querySelector("#pieceTitle"),
  timerValue: document.querySelector("#timerValue"),
  accuracyValue: document.querySelector("#accuracyValue"),
  feedback: document.querySelector("#feedback"),
  score: document.querySelector("#score"),
  keyboardHint: document.querySelector("#keyboardHint")
};

function readPerformanceStats() {
  try {
    return JSON.parse(localStorage.getItem(PERFORMANCE_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writePerformanceStats(stats) {
  try {
    localStorage.setItem(PERFORMANCE_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Practice still works when browser storage is unavailable.
  }
}

function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs)) return "—";
  const totalSeconds = Math.max(0, durationMs) / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${seconds}`;
}

function currentAccuracy() {
  const attempts = state.correct + state.missed;
  return attempts ? (state.correct / attempts) * 100 : null;
}

function updatePerformanceDisplay() {
  const elapsed = state.performanceStartedAt === null
    ? state.performanceElapsedMs
    : performance.now() - state.performanceStartedAt;
  els.timerValue.textContent = formatDuration(elapsed);
  const accuracy = currentAccuracy();
  els.accuracyValue.textContent = accuracy === null ? "—" : `${Math.round(accuracy)}%`;
}

function stopPerformanceTimer() {
  if (state.timerId !== null) window.clearInterval(state.timerId);
  state.timerId = null;
}

function startPerformanceTimer() {
  if (state.performanceStartedAt !== null || state.performanceComplete) return;
  state.performanceStartedAt = performance.now();
  state.timerId = window.setInterval(updatePerformanceDisplay, 100);
  updatePerformanceDisplay();
}

function resetPerformance() {
  stopPerformanceTimer();
  state.performanceStartedAt = null;
  state.performanceElapsedMs = 0;
  state.performanceComplete = false;
  state.correct = 0;
  state.missed = 0;
  (state.importedPages || []).flat().forEach((target) => {
    delete target.missed;
    delete target.corrected;
    if (Array.isArray(target.playedMidi)) target.playedMidi.length = 0;
  });
  updatePerformanceDisplay();
}

function recordCompletedPerformance() {
  if (state.performanceComplete || !state.activeScore || state.performanceStartedAt === null) return;
  state.performanceElapsedMs = performance.now() - state.performanceStartedAt;
  state.performanceComplete = true;
  stopPerformanceTimer();

  const accuracy = currentAccuracy() || 0;
  const stats = readPerformanceStats();
  const previous = stats[state.activeScore.id] || { attempts: 0 };
  stats[state.activeScore.id] = {
    attempts: previous.attempts + 1,
    lastDurationMs: state.performanceElapsedMs,
    bestDurationMs: Math.min(previous.bestDurationMs ?? Infinity, state.performanceElapsedMs),
    lastAccuracy: accuracy,
    bestAccuracy: Math.max(previous.bestAccuracy ?? 0, accuracy),
    lastCorrect: state.correct,
    lastMissed: state.missed,
    completedAt: new Date().toISOString()
  };
  writePerformanceStats(stats);
  updatePerformanceDisplay();
}

function renderScoreLibrary() {
  const stats = readPerformanceStats();
  els.scoreLibrary.innerHTML = "";

  MUSIC_XML_LIBRARY.forEach((score) => {
    const result = stats[score.id];
    const card = document.createElement("article");
    card.className = "score-card";
    card.innerHTML = `
      <div class="score-card-main">
        <p>${score.composer || "MusicXML score"}</p>
        <h3>${score.title}</h3>
        <span>${score.file}</span>
      </div>
      <dl class="score-results">
        <div><dt>Attempts</dt><dd>${result?.attempts || 0}</dd></div>
        <div><dt>Best time</dt><dd>${formatDuration(result?.bestDurationMs)}</dd></div>
        <div><dt>Last time</dt><dd>${formatDuration(result?.lastDurationMs)}</dd></div>
        <div><dt>Best accuracy</dt><dd>${result ? `${Math.round(result.bestAccuracy)}%` : "—"}</dd></div>
        <div><dt>Last accuracy</dt><dd>${result ? `${Math.round(result.lastAccuracy)}%` : "—"}</dd></div>
      </dl>
      <button type="button">Play score</button>
    `;
    card.querySelector("button").addEventListener("click", () => loadLibraryScore(score));
    els.scoreLibrary.append(card);
  });
}

function showLibrary() {
  stopPerformanceTimer();
  els.playerView.hidden = true;
  els.libraryView.hidden = false;
  renderScoreLibrary();
}

function showPlayer() {
  els.libraryView.hidden = true;
  els.playerView.hidden = false;
}

function targetNotes(target) {
  if (target && target.rest) return [];
  return target && Array.isArray(target.notes) ? target.notes : target ? [target] : [];
}

function directChild(element, name) {
  return Array.from(element.children).find((child) => child.localName === name) || null;
}

function childNumber(element, name, fallback = 0) {
  const child = directChild(element, name);
  const value = child ? Number(child.textContent.trim()) : NaN;
  return Number.isFinite(value) ? value : fallback;
}

function readMusicXml(xmlText) {
  const documentNode = new DOMParser().parseFromString(xmlText, "application/xml");
  if (documentNode.querySelector("parsererror")) throw new Error("The MusicXML file is not valid XML");
  if (documentNode.documentElement.localName !== "score-partwise") {
    throw new Error("Only partwise MusicXML scores are supported");
  }

  let divisions = 1;
  let numerator = 4;
  let denominator = 4;
  let sharpsFlats = 0;
  let smallestType = 4;
  let measureCount = 0;
  const events = [];
  const typeValues = { whole: 1, half: 2, quarter: 4, eighth: 8, "16th": 16 };
  const parts = Array.from(documentNode.documentElement.children)
    .filter((element) => element.localName === "part");

  parts.forEach((part, partIndex) => {
    const measures = Array.from(part.children).filter((element) => element.localName === "measure");
    measureCount = Math.max(measureCount, measures.length);

    measures.forEach((measure, measureIndex) => {
      let cursor = 0;
      let previousOnset = 0;

      Array.from(measure.children).forEach((element) => {
        if (element.localName === "attributes") {
          divisions = childNumber(element, "divisions", divisions);
          const key = directChild(element, "key");
          const time = directChild(element, "time");
          if (key) sharpsFlats = childNumber(key, "fifths", sharpsFlats);
          if (time) {
            numerator = childNumber(time, "beats", numerator);
            denominator = childNumber(time, "beat-type", denominator);
          }
          return;
        }

        if (element.localName === "backup") {
          cursor -= childNumber(element, "duration") / divisions;
          return;
        }
        if (element.localName === "forward") {
          cursor += childNumber(element, "duration") / divisions;
          return;
        }
        if (element.localName !== "note") return;

        const duration = childNumber(element, "duration") / divisions;
        const isChordNote = Boolean(directChild(element, "chord"));
        const onset = isChordNote ? previousOnset : cursor;
        const type = directChild(element, "type")?.textContent.trim();
        const voice = directChild(element, "voice")?.textContent.trim() || "1";
        const dots = Array.from(element.children).filter((child) => child.localName === "dot").length;
        const notations = directChild(element, "notations");
        const slurs = notations
          ? Array.from(notations.children)
            .filter((child) => child.localName === "slur")
            .map((slur) => ({
              id: `${partIndex}:${slur.getAttribute("number") || "1"}`,
              type: slur.getAttribute("type") || "start",
              placement: slur.getAttribute("placement") || ""
            }))
          : [];
        if (typeValues[type]) smallestType = Math.max(smallestType, typeValues[type]);

        const pitch = directChild(element, "pitch");
        const isGraceNote = Boolean(directChild(element, "grace"));
        const staff = childNumber(element, "staff", 0);
        if (pitch && !isGraceNote) {
          const step = directChild(pitch, "step")?.textContent.trim();
          const octave = childNumber(pitch, "octave");
          const alter = childNumber(pitch, "alter");
          const semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
          if (!(step in semitones)) throw new Error("A MusicXML pitch has no valid step");
          const midi = ((octave + 1) * 12) + semitones[step] + alter;
          const ties = [...new Set(Array.from(element.children)
            .filter((child) => child.localName === "tie")
            .map((tie) => tie.getAttribute("type") || "start"))]
            .map((tieType) => ({
              id: `${partIndex}:${staff}:${voice}:${midi}`,
              type: tieType
            }));
          events.push({
            measureIndex,
            onset,
            midi,
            step,
            octave,
            alter,
            staff,
            voice,
            duration,
            type,
            dots,
            slurs,
            ties
          });
        } else if (directChild(element, "rest") && !isGraceNote) {
          const restElement = directChild(element, "rest");
          const displayStep = directChild(restElement, "display-step")?.textContent.trim();
          const displayOctave = childNumber(restElement, "display-octave", NaN);
          const displayKey = displayStep && Number.isFinite(displayOctave)
            ? `${displayStep.toLowerCase()}/${displayOctave}`
            : null;
          events.push({
            measureIndex,
            onset,
            rest: true,
            staff,
            voice,
            duration,
            type,
            dots,
            displayKey
          });
        }

        if (!isChordNote) {
          previousOnset = onset;
          cursor += duration;
        }
      });
    });
  });

  if (!events.some((event) => !event.rest)) throw new Error("The MusicXML file contains no pitched notes");
  if (![1, 2, 4, 8, 16].includes(denominator)) {
    throw new Error(`Unsupported ${numerator}/${denominator} meter`);
  }

  return { events, measureCount, numerator, denominator, sharpsFlats, smallestType };
}

function keyValueForMidiSignature(sharpsFlats) {
  const majorKeys = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];
  return majorKeys[Math.max(0, Math.min(14, sharpsFlats + 7))];
}

function importedNoteForMusicXml(event, keyValue) {
  const key = KEYS[keyValue] || KEYS.C;
  const keyAlter = key.steps.includes(event.step) ? (key.type === "sharp" ? 1 : -1) : 0;
  const accidentalNames = { "-2": "bb", "-1": "b", 0: "", 1: "#", 2: "##" };
  const writtenAccidental = accidentalNames[event.alter] ?? "";
  const keyAccidental = accidentalNames[keyAlter];

  return {
    midi: event.midi,
    step: event.step,
    octave: event.octave,
    accidental: event.alter === keyAlter ? "" : (writtenAccidental || "n"),
    keyAccidental: event.alter === keyAlter ? keyAccidental : "",
    staff: event.staff === 1
      ? "treble"
      : event.staff === 2 ? "bass" : (event.midi < 60 ? "bass" : "treble")
  };
}

function convertMusicXmlToTargets(score) {
  const keyValue = keyValueForMidiSignature(score.sharpsFlats);
  const beatValue = Math.min(16, Math.max(score.denominator, score.smallestType));
  const targetsPerMeasure = score.numerator * (beatValue / score.denominator);
  if (!Number.isInteger(targetsPerMeasure)) {
    throw new Error("The MusicXML meter cannot be represented by the supported note grid");
  }

  const eventsBySlot = new Map();
  score.events.forEach((event) => {
    const slotInMeasure = Math.round(event.onset * (beatValue / 4));
    if (slotInMeasure < 0 || slotInMeasure >= targetsPerMeasure) return;
    const slot = (event.measureIndex * targetsPerMeasure) + slotInMeasure;
    const values = eventsBySlot.get(slot) || [];
    values.push(event);
    eventsBySlot.set(slot, values);
  });

  const targets = [];
  const targetCount = score.measureCount * targetsPerMeasure;
  for (let slot = 0; slot < targetCount; slot += 1) {
    const events = eventsBySlot.get(slot) || [];
    const noteEvents = events.filter((event) => !event.rest);
    const uniqueEvents = [...new Map(noteEvents.map((event) => [`${event.voice}:${event.midi}`, event])).values()];
    const staffRests = [...new Set(events
      .filter((event) => event.rest && event.staff)
      .map((event) => event.staff === 1 ? "treble" : "bass"))];
    const notationRests = events.filter((event) => event.rest).map((event) => ({
      staff: event.staff === 1 ? "treble" : "bass",
      voice: event.voice,
      duration: event.duration,
      type: event.type,
      dots: event.dots,
      displayKey: event.displayKey
    }));
    if (!uniqueEvents.length) {
      targets.push(staffRests.length
        ? { rest: true, staffRests, notationRests }
        : { rest: true });
      continue;
    }

    const notes = uniqueEvents
      .map((event) => ({
        ...importedNoteForMusicXml(event, keyValue),
        voice: event.voice,
        duration: event.duration,
        type: event.type,
        dots: event.dots,
        slurs: event.slurs,
        ties: event.ties
      }))
      .sort((a, b) => a.midi - b.midi);
    const target = notes.length === 1 ? notes[0] : { notes, playedMidi: [] };
    if (staffRests.length) target.staffRests = staffRests;
    if (notationRests.length) target.notationRests = notationRests;
    targets.push(target);
  }

  return {
    targets,
    keyValue,
    targetsPerMeasure,
    beatValue,
    timeSignature: `${score.numerator}/${score.denominator}`
  };
}

function firstPlayableTargetIndex(targets, startIndex = 0) {
  let index = startIndex;
  while (index < targets.length && targets[index].rest) index += 1;
  return index;
}

function startImportedPage(pageIndex) {
  const page = state.importedPages && state.importedPages[pageIndex];
  if (!page) {
    setFeedback("MusicXML piece complete", "good");
    return false;
  }

  state.importedPageIndex = pageIndex;
  state.notes = page;
  state.current = firstPlayableTargetIndex(page);
  updateLabels();
  drawScore();
  return true;
}

function rebuildImportedPages(feedbackMessage) {
  const targets = state.importedSourceTargets;
  const pageSize = SYSTEMS_PER_PAGE * MEASURES_PER_SYSTEM * state.beatsPerMeasure;
  const pages = [];
  for (let index = 0; index < targets.length; index += pageSize) {
    const page = targets.slice(index, index + pageSize);
    while (page.length < pageSize) page.push({ rest: true });
    pages.push(page);
  }

  state.importedPages = pages;
  state.importedPageIndex = -1;
  resetPerformance();
  setFeedback(feedbackMessage, "good");
  startImportedPage(0);
}

function importMusicXml(xmlText, scoreMeta) {
  const score = readMusicXml(xmlText);
  const converted = convertMusicXmlToTargets(score);
  state.activeScore = scoreMeta;
  state.importedSourceTargets = converted.targets;
  state.keyValue = converted.keyValue;
  state.beatsPerMeasure = converted.targetsPerMeasure;
  state.beatValue = converted.beatValue;
  state.timeSignature = converted.timeSignature;
  els.pieceTitle.textContent = scoreMeta.title;
  showPlayer();
  rebuildImportedPages("Ready to play");
}

async function loadMusicXmlFile(file) {
  if (!file) return;
  try {
    const title = file.name.replace(/\.(musicxml|xml)$/i, "");
    importMusicXml(await file.text(), {
      id: `local:${file.name}`,
      file: file.name,
      title,
      composer: "Imported score"
    });
  } catch (error) {
    showPlayer();
    setFeedback(error.message || "Could not import MusicXML file", "bad");
  }
}

async function loadLibraryScore(scoreMeta) {
  showPlayer();
  els.pieceTitle.textContent = scoreMeta.title;
  setFeedback("Loading score");
  try {
    const response = await fetch(scoreMeta.file);
    if (!response.ok) throw new Error(`Could not load ${scoreMeta.file}`);
    importMusicXml(await response.text(), scoreMeta);
  } catch (error) {
    setFeedback(error.message || "Could not load MusicXML", "bad");
  }
}

function vexKey(note) {
  const accidental = note.accidental === "n" ? "" : note.accidental || note.keyAccidental || "";
  return `${note.step.toLowerCase()}${accidental}/${note.octave}`;
}

function vexDurationForBeatValue(beatValue) {
  return ({ 1: "w", 2: "h", 4: "q", 8: "8", 16: "16" })[beatValue] || "q";
}

function noteStyleForIndex(index, currentIndex, target) {
  if (target.corrected) {
    return { fillStyle: "#177245", strokeStyle: "#177245" };
  }

  if (target.missed) {
    return { fillStyle: "#b23a34", strokeStyle: "#b23a34" };
  }

  if (index === currentIndex) {
    return { fillStyle: "#f0b43c", strokeStyle: "#4d3708" };
  }

  if (currentIndex >= 0 && index < currentIndex) {
    return { fillStyle: "#177245", strokeStyle: "#177245" };
  }

  return { fillStyle: "#11191d", strokeStyle: "#11191d" };
}

function registerRenderedTargetNote(index, staveNote) {
  const targetNotesAtIndex = renderedTargetNotes.get(index) || [];
  targetNotesAtIndex.push(staveNote);
  renderedTargetNotes.set(index, targetNotesAtIndex);
}

function refreshRenderedTargetStyle(index) {
  const target = state.notes[index];
  if (!target) return;
  const style = noteStyleForIndex(index, state.current, target);

  (renderedTargetNotes.get(index) || []).forEach((staveNote) => {
    staveNote.setStyle(style);
    const element = staveNote.getSVGElement?.();
    if (!element) return;

    element.style.fill = style.fillStyle;
    element.style.stroke = style.strokeStyle;
    element.querySelectorAll("path, line, polygon, rect, ellipse").forEach((shape) => {
      if (shape.getAttribute("fill") !== "none") shape.setAttribute("fill", style.fillStyle);
      if (shape.getAttribute("stroke") !== "none") shape.setAttribute("stroke", style.strokeStyle);
    });
  });
}

function makeStaveNote(options) {
  const staveNote = new window.VexFlow.StaveNote(options);
  staveNote.setFontSize(staveNote.fontSizeInPoints * NOTE_SCALE);
  staveNote.reset();
  staveNote.buildFlag();
  return staveNote;
}

function vexDurationForMusicXmlType(type) {
  return ({ whole: "w", half: "h", quarter: "q", eighth: "8", "16th": "16" })[type]
    || vexDurationForBeatValue(state.beatValue);
}

function accidentalDisplayForSystem(systemTargets, keyValue) {
  const displays = new WeakMap();
  const activeAccidentals = new Map();
  const key = KEYS[keyValue] || KEYS.C;

  systemTargets.forEach((target) => {
    targetNotes(target).forEach((note) => {
      const keyAccidental = key.steps.includes(note.step)
        ? (key.type === "sharp" ? "#" : "b")
        : "";
      const writtenAccidental = note.accidental === "n"
        ? ""
        : (note.accidental || note.keyAccidental || keyAccidental);
      const pitchKey = `${note.staff}:${note.step}:${note.octave}`;
      const activeAccidental = activeAccidentals.has(pitchKey)
        ? activeAccidentals.get(pitchKey)
        : keyAccidental;

      displays.set(
        note,
        writtenAccidental === activeAccidental ? "" : (writtenAccidental || "n")
      );
      activeAccidentals.set(pitchKey, writtenAccidental);
    });
  });

  return displays;
}

function makeImportedStaffVoices(
  measureTargets,
  targetOffset,
  staff,
  stave,
  currentIndex,
  notationEndpoints,
  systemIndex,
  accidentalDisplays
) {
  const VF = window.VexFlow;
  const voicesInMeasure = new Set();
  measureTargets.forEach((target) => {
    targetNotes(target)
      .filter((note) => note.staff === staff && note.voice)
      .forEach((note) => voicesInMeasure.add(note.voice));
    (target?.notationRests || [])
      .filter((rest) => rest.staff === staff)
      .forEach((rest) => voicesInMeasure.add(rest.voice));
  });
  if (!voicesInMeasure.size) voicesInMeasure.add("1");

  return [...voicesInMeasure].map((voiceId) => {
    const staveNotes = [];
    let slot = 0;

    while (slot < measureTargets.length) {
      const target = measureTargets[slot];
      const notes = targetNotes(target)
        .filter((note) => note.staff === staff && note.voice === voiceId)
        .sort((a, b) => a.midi - b.midi);
      const rest = (target?.notationRests || [])
        .find((event) => event.staff === staff && event.voice === voiceId);
      const event = notes[0] || rest;

      if (!event) {
        staveNotes.push(new VF.GhostNote(vexDurationForBeatValue(state.beatValue)));
        slot += 1;
        continue;
      }

      const dots = event.dots || 0;
      const duration = `${vexDurationForMusicXmlType(event.type)}${"d".repeat(dots)}${rest ? "r" : ""}`;
      const staveNote = makeStaveNote({
        clef: staff,
        keys: rest
          ? [rest.displayKey || (staff === "bass" ? "d/3" : "b/4")]
          : notes.map(vexKey),
        duration,
        autoStem: true,
        strokePx: LEDGER_LINE_OVERHANG
      });

      if (!rest) {
        notes.forEach((note, noteIndex) => {
          const accidental = accidentalDisplays.get(note);
          if (accidental) staveNote.addModifier(new VF.Accidental(accidental), noteIndex);
          if (note.slurs?.length || note.ties?.length) {
            notationEndpoints.push({
              staveNote,
              stave,
              systemIndex,
              noteIndex,
              slurs: note.slurs || [],
              ties: note.ties || []
            });
          }
        });
        staveNote.setStyle(noteStyleForIndex(targetOffset + slot, currentIndex, target));
        registerRenderedTargetNote(targetOffset + slot, staveNote);
      }
      for (let dot = 0; dot < dots; dot += 1) {
        VF.Dot.buildAndAttach([staveNote], { all: true });
      }
      staveNotes.push(staveNote);

      const durationSlots = Math.max(1, Math.round((event.duration || (4 / state.beatValue)) * state.beatValue / 4));
      slot += durationSlots;
    }

    const [numerator, denominator] = state.timeSignature.split("/").map(Number);
    const beamGroup = denominator === 8 && numerator > 3 && numerator % 3 === 0
      ? new VF.Fraction(3, 8)
      : new VF.Fraction(1, denominator);
    const beams = VF.Beam.generateBeams(staveNotes, { groups: [beamGroup] });
    beams.forEach((beam) => beam.getNotes().forEach((note) => note.setStemLength(45)));
    const voice = new VF.Voice({ num_beats: state.beatsPerMeasure, beat_value: state.beatValue })
      .setStrict(false)
      .addTickables(staveNotes);

    return { voice, stave, beams, staff };
  });
}

function drawMusicXmlCurves(context, endpoints) {
  const VF = window.VexFlow;
  const pendingSlurs = new Map();
  const pendingTies = new Map();

  const drawSlur = (start, stop, placement = "") => {
    const options = { invert: placement === "below" };
    if (start && stop && start.systemIndex !== stop.systemIndex) {
      new VF.Curve(start.staveNote, null, options).setContext(context).draw();
      new VF.Curve(null, stop.staveNote, options).setContext(context).draw();
    } else {
      new VF.Curve(start?.staveNote || null, stop?.staveNote || null, options)
        .setContext(context)
        .draw();
    }
  };

  const drawTie = (start, stop) => {
    const makeTie = (from, to) => {
      const stemDirection = (from?.staveNote || to?.staveNote).getStemDirection();
      new VF.StaveTie({
        firstNote: from?.staveNote || null,
        lastNote: to?.staveNote || null,
        firstIndexes: from ? [from.noteIndex] : [],
        lastIndexes: to ? [to.noteIndex] : []
      })
        .setDirection(-stemDirection)
        .setContext(context)
        .draw();
    };

    if (start && stop && start.systemIndex !== stop.systemIndex) {
      makeTie(start, null);
      makeTie(null, stop);
    } else {
      makeTie(start, stop);
    }
  };

  endpoints.forEach((endpoint) => {
    endpoint.slurs.forEach((slur) => {
      if (slur.type === "stop" || slur.type === "continue") {
        const start = pendingSlurs.get(slur.id);
        if (start) {
          drawSlur(start.endpoint, endpoint, start.placement || slur.placement);
          pendingSlurs.delete(slur.id);
        } else if (slur.type === "stop") {
          drawSlur(null, endpoint, slur.placement);
        }
      }
      if (slur.type === "start" || slur.type === "continue") {
        pendingSlurs.set(slur.id, { endpoint, placement: slur.placement });
      }
    });

    endpoint.ties.forEach((tie) => {
      if (tie.type === "stop") {
        const start = pendingTies.get(tie.id);
        if (start) {
          drawTie(start, endpoint);
          pendingTies.delete(tie.id);
        } else {
          drawTie(null, endpoint);
        }
      }
      if (tie.type === "start") pendingTies.set(tie.id, endpoint);
    });
  });

  pendingSlurs.forEach(({ endpoint, placement }) => drawSlur(endpoint, null, placement));
  pendingTies.forEach((endpoint) => drawTie(endpoint, null));
}

function addStaveConnectors(context, trebleStave, bassStave, isSystemStart) {
  const VF = window.VexFlow;

  if (!VF.StaveConnector) return;

  const connectorTypes = [VF.StaveConnector.type.SINGLE_RIGHT];
  if (isSystemStart) {
    connectorTypes.unshift(
      VF.StaveConnector.type.BRACE,
      VF.StaveConnector.type.SINGLE_LEFT
    );
  }

  connectorTypes.forEach((type) => {
    new VF.StaveConnector(trebleStave, bassStave)
      .setType(type)
      .setContext(context)
      .draw();
  });
}

function drawVexScore(container, notes, currentIndex, keyValue, options = {}) {
  const VF = window.VexFlow;
  if (!VF) {
    container.textContent = "VexFlow failed to load";
    return;
  }
  renderedTargetNotes = new Map();
  const systemCount = options.systemCount || SYSTEMS_PER_PAGE;

  const width = Math.max(container.clientWidth || 960, 960);
  const systemSpacing = 300;
  const height = systemCount === 1 ? 290 : 1280;
  const pageMargin = 18;
  const systemWidth = width - (pageMargin * 2);

  container.innerHTML = "";
  container.style.minHeight = `${height}px`;

  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(width, height);

  const context = renderer.getContext();
  context.setBackgroundFillStyle("#fffdf8");
  const notationEndpoints = [];

  const makeStave = (clef, x, y, staveWidth, isSystemStart, isScoreStart) => {
    const stave = new VF.Stave(x, y, staveWidth);
    if (isSystemStart) {
      stave.addClef(clef).addKeySignature(keyValue);
    }
    if (isScoreStart) {
      stave.addTimeSignature(state.timeSignature);
    }
    stave.setContext(context).draw();
    return stave;
  };

  const startingSymbolWidth = (isScoreStart) => Math.max(...["treble", "bass"].map((clef) => {
    const plainStave = new VF.Stave(0, 0, systemWidth);
    const decoratedStave = new VF.Stave(0, 0, systemWidth)
      .addClef(clef)
      .addKeySignature(keyValue);
    if (isScoreStart) decoratedStave.addTimeSignature(state.timeSignature);
    return decoratedStave.getNoteStartX() - plainStave.getNoteStartX();
  }));

  for (let systemIndex = 0; systemIndex < systemCount; systemIndex += 1) {
    const trebleY = 74 + (systemIndex * systemSpacing);
    const bassY = trebleY + 110;
    const symbolWidth = startingSymbolWidth(systemIndex === 0);
    const noteSpaceWidth = (systemWidth - symbolWidth) / MEASURES_PER_SYSTEM;
    const systemTargetOffset = systemIndex * MEASURES_PER_SYSTEM * state.beatsPerMeasure;
    const systemTargets = notes.slice(
      systemTargetOffset,
      systemTargetOffset + (MEASURES_PER_SYSTEM * state.beatsPerMeasure)
    );
    const accidentalDisplays = accidentalDisplayForSystem(systemTargets, keyValue);
    let measureX = pageMargin;

    for (let measureIndex = 0; measureIndex < MEASURES_PER_SYSTEM; measureIndex += 1) {
      const isSystemStart = measureIndex === 0;
      const isScoreStart = systemIndex === 0 && isSystemStart;
      const measureWidth = noteSpaceWidth + (isSystemStart ? symbolWidth : 0);
      const trebleStave = makeStave(
        "treble", measureX, trebleY, measureWidth, isSystemStart, isScoreStart
      );
      const bassStave = makeStave(
        "bass", measureX, bassY, measureWidth, isSystemStart, isScoreStart
      );
      addStaveConnectors(context, trebleStave, bassStave, isSystemStart);

      const measureNumber = (systemIndex * MEASURES_PER_SYSTEM) + measureIndex;
      const targetOffset = measureNumber * state.beatsPerMeasure;
      const measureTargets = notes.slice(targetOffset, targetOffset + state.beatsPerMeasure);
      const staves = [
        { clef: "treble", stave: trebleStave },
        { clef: "bass", stave: bassStave }
      ];
      const voices = staves.flatMap(({ clef, stave }) => (
        makeImportedStaffVoices(
          measureTargets,
          targetOffset,
          clef,
          stave,
          currentIndex,
          notationEndpoints,
          systemIndex,
          accidentalDisplays
        )
      ));
      const vexVoices = voices.map(({ voice }) => voice);
      const noteAreaWidth = Math.min(
        ...staves.map(({ stave }) => stave.getNoteEndX() - stave.getNoteStartX())
      ) - 12;

      const formatter = new VF.Formatter();
      staves.forEach(({ clef }) => {
        formatter.joinVoices(voices.filter(({ staff }) => staff === clef).map(({ voice }) => voice));
      });
      formatter.format(vexVoices, noteAreaWidth);
      voices.forEach(({ voice, stave, beams }) => {
        voice.draw(context, stave);
        beams.forEach((beam) => beam.setContext(context).draw());
      });

      measureX += measureWidth;
    }
  }

  if (state.importedPages) drawMusicXmlCurves(context, notationEndpoints);
}

function drawScore() {
  drawVexScore(els.score, state.notes, state.current, state.keyValue);
  updateNextSystemPreview();
}

function nextSystemPreviewData() {
  const previewTargetCount = MEASURES_PER_SYSTEM * state.beatsPerMeasure;
  const nextPage = state.importedPages?.[state.importedPageIndex + 1];
  return nextPage
    ? { notes: nextPage.slice(0, previewTargetCount), keyValue: state.keyValue }
    : null;
}

function updateNextSystemPreview() {
  const existingPreview = els.score.querySelector(".next-system-preview");
  const finalSystemStart = (SYSTEMS_PER_PAGE - 1) * MEASURES_PER_SYSTEM * state.beatsPerMeasure;
  const previewData = state.current >= finalSystemStart ? nextSystemPreviewData() : null;

  if (!previewData) {
    existingPreview?.remove();
    return;
  }
  if (existingPreview) return;

  const preview = document.createElement("div");
  preview.className = "next-system-preview";
  preview.setAttribute("aria-label", "First system of the next page");
  els.score.append(preview);

  const currentRenderedTargets = renderedTargetNotes;
  try {
    drawVexScore(preview, previewData.notes, -1, previewData.keyValue, { systemCount: 1 });
  } finally {
    renderedTargetNotes = currentRenderedTargets;
  }
}

function updateLabels() {
  const target = state.notes[state.current];
  els.pageLabel.textContent = state.importedPages
    ? `Page ${state.importedPageIndex + 1} of ${state.importedPages.length}`
    : "Page 1";
  if (state.activeScore) els.pieceTitle.textContent = state.activeScore.title;
  if (!target && state.performanceComplete) setFeedback("Piece complete", "good");
  updatePerformanceDisplay();
}

function setFeedback(message, type = "") {
  els.feedback.textContent = message;
  els.feedback.className = `feedback ${type}`.trim();
}

function pitchClass(midi) {
  return ((midi % 12) + 12) % 12;
}

function handlePlayedNote(midi) {
  const targetIndex = state.current;
  const target = state.notes[targetIndex];
  if (!target) return;
  startPerformanceTimer();

  const expectedNotes = targetNotes(target);
  const expectedMidi = expectedNotes.map((note) => note.midi);
  const isExpected = expectedMidi.includes(midi);

  if (isExpected) {
    const isComplete = expectedMidi.every((noteMidi) => state.heldMidi.has(noteMidi));
    if (!isComplete) {
      const remaining = expectedMidi.filter((noteMidi) => !state.heldMidi.has(noteMidi)).length;
      const label = remaining === 1 ? "note" : "notes";
      setFeedback(`${remaining} ${label} left`, "good");
      return;
    }

    state.correct += 1;
    if (target.missed) target.corrected = true;
    state.current = firstPlayableTargetIndex(state.notes, state.current + 1);
    setFeedback("Correct", "good");
  } else {
    state.missed += 1;
    target.missed = true;
    setFeedback(`Heard ${midiToName(midi)}`, "bad");
  }

  if (state.current >= state.notes.length) {
    const nextPageIndex = state.importedPageIndex + 1;
    if (nextPageIndex < state.importedPages.length) {
      setFeedback(`Page ${state.importedPageIndex + 1} complete`, "good");
      startImportedPage(nextPageIndex);
      return;
    }
    recordCompletedPerformance();
    setFeedback("Piece complete", "good");
  }

  updateLabels();
  refreshRenderedTargetStyle(targetIndex);
  if (state.current !== targetIndex) refreshRenderedTargetStyle(state.current);
  updateNextSystemPreview();
}

function midiToName(midi) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return `${names[pitchClass(midi)]}${Math.floor(midi / 12) - 1}`;
}

function onMidiMessage(event) {
  const [status, note, velocity] = event.data;
  const command = status & 0xf0;
  if (command === 0x90 && velocity > 0) {
    state.heldMidi.add(note);
    handlePlayedNote(note);
  } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    state.heldMidi.delete(note);
  }
}

function hasMidiConnection() {
  return state.midiInput && state.midiInput.state !== "disconnected";
}

function refreshMidiInputs() {
  const inputs = state.midiAccess
    ? Array.from(state.midiAccess.inputs.values()).filter((input) => input.state !== "disconnected")
    : [];
  els.midiInputs.innerHTML = "";

  if (!inputs.length) {
    state.midiInput = null;
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No MIDI inputs";
    els.midiInputs.append(option);
    return;
  }

  inputs.forEach((input) => {
    const option = document.createElement("option");
    option.value = input.id;
    option.textContent = input.name || `MIDI input ${input.id}`;
    els.midiInputs.append(option);
  });
}

async function connectMidi() {
  if (hasMidiConnection() || state.midiConnectPending) return;

  if (!navigator.requestMIDIAccess) {
    setFeedback("Web MIDI is not available in this browser", "bad");
    els.midiStatus.textContent = "Unsupported browser";
    return;
  }

  state.midiConnectPending = true;

  try {
    state.midiAccess = await navigator.requestMIDIAccess();
    state.midiAccess.onstatechange = refreshMidiInputs;
    refreshMidiInputs();
    selectMidiInput();
  } catch (error) {
    setFeedback("MIDI permission was not granted", "bad");
    els.midiStatus.textContent = "MIDI blocked";
  } finally {
    state.midiConnectPending = false;
  }
}

function selectMidiInput() {
  if (!state.midiAccess) return;

  if (state.midiInput) {
    state.midiInput.onmidimessage = null;
  }
  state.heldMidi.clear();

  const inputId = els.midiInputs.value;
  const inputs = Array.from(state.midiAccess.inputs.values()).filter((input) => input.state !== "disconnected");
  const selectedInput = inputId ? state.midiAccess.inputs.get(inputId) : null;
  const input = selectedInput && selectedInput.state !== "disconnected"
    ? selectedInput
    : inputs[0];

  state.midiInput = input || null;

  if (state.midiInput) {
    state.midiInput.onmidimessage = onMidiMessage;
    els.midiStatus.textContent = "MIDI connected";
    els.midiStatus.classList.add("connected");
    setFeedback("Waiting for input");
  } else {
    els.midiStatus.textContent = "MIDI disconnected";
    els.midiStatus.classList.remove("connected");
  }
}

function toggleDemoMode() {
  state.demoMode = !state.demoMode;
  els.keyboardHint.hidden = !state.demoMode;
  els.demoMode.textContent = state.demoMode ? "Disable computer keys" : "Use computer keys";
  setFeedback(state.demoMode ? "Computer keys enabled" : "Waiting for input");
}

function handleComputerKey(event) {
  if (event.repeat || !state.demoMode) return;

  if (event.code === "Space") {
    const target = state.notes[state.current];
    if (!target) return;

    event.preventDefault();
    const notes = targetNotes(target);
    notes.forEach((note) => state.heldMidi.add(note.midi));
    handlePlayedNote(notes[notes.length - 1].midi);
    notes.forEach((note) => state.heldMidi.delete(note.midi));
  }
}

els.connectMidi.addEventListener("click", connectMidi);
els.midiInputs.addEventListener("change", selectMidiInput);
els.musicXmlFile.addEventListener("change", () => loadMusicXmlFile(els.musicXmlFile.files[0]));
els.importScore.addEventListener("click", () => els.musicXmlFile.click());
els.backToLibrary.addEventListener("click", showLibrary);
els.restartPiece.addEventListener("click", () => {
  resetPerformance();
  startImportedPage(0);
  setFeedback("Ready to play");
});
els.demoMode.addEventListener("click", toggleDemoMode);
document.addEventListener("keydown", handleComputerKey);

function initializeNotation() {
  if (!window.VexFlow) {
    setFeedback("VexFlow failed to load", "bad");
    return Promise.resolve();
  }

  if (!window.VexFlow.loadFonts || !window.VexFlow.setFonts) {
    return Promise.resolve();
  }

  return window.VexFlow
    .loadFonts("Bravura", "Academico")
    .then(() => {
      window.VexFlow.setFonts("Bravura", "Academico");
    })
    .catch(() => {
      setFeedback("VexFlow fonts unavailable", "bad");
    });
}

initializeNotation().then(() => {
  renderScoreLibrary();
  updatePerformanceDisplay();
});
