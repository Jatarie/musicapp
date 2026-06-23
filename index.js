const SYSTEMS_PER_PAGE = 4;
const MEASURES_PER_SYSTEM = 2;
const BEATS_PER_MEASURE = 4;
const NOTE_SCALE = 1.0;
const RENDER_SLURS = false;
const RENDER_TIES = true;
// Keep ledger lines inside the notehead bounds so adjacent notes retain a visible gap.
const LEDGER_LINE_OVERHANG = 0.00;
// A sixteenth rest spans several staff positions. Keep its anchor at least an
// octave from a simultaneous notehead in another voice.
const REST_NOTE_CLEARANCE_STEPS = 5;
// A sixteenth-rest glyph can overlap a notehead through a diatonic fourth.
const REST_NOTE_OVERLAP_STEPS = 5;
// Positive screen y runs downward; one diatonic step is half a staff space.
const DYNAMIC_REST_Y_OFFSET_STEPS = -1;
// Keep multi-voice rests clear of ledger lines below each staff.
const MULTI_VOICE_REST_FLOOR_KEYS = {
  treble: "a/4",
  bass: "c/3"
};
const PERFORMANCE_STORAGE_KEY = "sightline-performance-v1";
const LEARN_STORAGE_KEY = "sightline-learn-v1";
const LEARN_STREAK_GOAL = 10;
const LEARN_HIDE_AFTER_STREAK = 5;
// Static sites cannot enumerate their directory, so repository scores are declared here.
const MUSIC_XML_LIBRARY = [
  {
    id: "prelude-in-c-major",
    file: "https://jatarie.github.io/musicapp/prelude-in-c-major.xml",
    title: "Prelude in C Major",
    composer: "J. S. Bach"
  },
  {
    id: "moonlight",
    file: "https://jatarie.github.io/musicapp/moonlight.xml",
    title: "Moonlight Sonata mv. 1",
    composer: "Beethoven"
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
  slotsPerQuarter: 1,
  timeSignature: "4/4",
  importedPages: null,
  importedSourceTargets: null,
  importedPageIndex: -1,
  importedMeasureCount: 0,
  fullScoreView: false,
  keyValue: "C",
  totalQuarterNoteBeats: 0,
  activeScore: null,
  performanceStartedAt: null,
  performanceElapsedMs: 0,
  performanceComplete: false,
  timerId: null,
  learn: {
    active: false,
    steps: [],
    stepIndex: 0,
    streak: 0,
    completed: false
  }
};
let renderedTargetNotes = new Map();

const els = {
  libraryView: document.querySelector("#libraryView"),
  playerView: document.querySelector("#playerView"),
  playerFooter: document.querySelector("#playerFooter"),
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

function readLearnProgress() {
  try {
    return JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeLearnProgress(progress) {
  try {
    localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Learning can continue for the session even when persistence is blocked.
  }
}

function learnProgressForScore(scoreId) {
  return readLearnProgress()[scoreId] || null;
}

function formatLearnProgress(progress) {
  if (!progress) return "Not started";
  if (progress.completed) return "Complete";
  if (!progress.totalSteps) return "In progress";
  return `Step ${Math.min(progress.stepIndex + 1, progress.totalSteps)} of ${progress.totalSteps}`;
}

function saveCurrentLearnProgress() {
  if (!state.learn.active || !state.activeScore) return;

  const progress = readLearnProgress();
  progress[state.activeScore.id] = {
    stepIndex: state.learn.stepIndex,
    streak: state.learn.streak,
    totalSteps: state.learn.steps.length,
    measureCount: state.importedMeasureCount,
    completed: state.learn.completed,
    updatedAt: new Date().toISOString()
  };
  writeLearnProgress(progress);
}

function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs)) return "—";
  const totalSeconds = Math.max(0, durationMs) / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${seconds}`;
}

function formatTempo(tempo) {
  return Number.isFinite(tempo) ? `${Math.round(tempo)} BPM` : "—";
}

function currentMeasureResults() {
  const total = state.importedMeasureCount;
  if (!total || !state.importedPages || state.importedPageIndex < 0) {
    return { correct: 0, completed: 0, total };
  }

  const measuresPerPage = SYSTEMS_PER_PAGE * MEASURES_PER_SYSTEM;
  const completed = state.performanceComplete
    ? total
    : Math.min(
      total,
      (state.importedPageIndex * measuresPerPage)
        + Math.max(0, Math.floor(state.current / state.beatsPerMeasure))
    );
  let correct = 0;

  for (let measureIndex = 0; measureIndex < completed; measureIndex += 1) {
    const pageIndex = Math.floor(measureIndex / measuresPerPage);
    const measureIndexOnPage = measureIndex % measuresPerPage;
    const measureStart = measureIndexOnPage * state.beatsPerMeasure;
    const measureTargets = state.importedPages[pageIndex]?.slice(
      measureStart,
      measureStart + state.beatsPerMeasure
    ) || [];
    if (!measureTargets.some((target) => target.missed)) correct += 1;
  }

  return { correct, completed, total };
}

function currentAccuracy() {
  const { correct, completed, total } = currentMeasureResults();
  return completed && total ? (correct / total) * 100 : null;
}

function tempoForDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs <= 0 || !state.totalQuarterNoteBeats) return null;
  return state.totalQuarterNoteBeats / (durationMs / 60000);
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
  const measureResults = currentMeasureResults();
  const tempo = tempoForDuration(state.performanceElapsedMs) || 0;
  const stats = readPerformanceStats();
  const previous = stats[state.activeScore.id] || { attempts: 0 };
  stats[state.activeScore.id] = {
    attempts: previous.attempts + 1,
    lastDurationMs: state.performanceElapsedMs,
    bestDurationMs: Math.min(previous.bestDurationMs ?? Infinity, state.performanceElapsedMs),
    lastAccuracy: accuracy,
    bestAccuracy: Math.max(previous.bestAccuracy ?? 0, accuracy),
    lastTempo: tempo,
    bestTempo: Math.max(previous.bestTempo ?? 0, tempo),
    lastCorrectMeasures: measureResults.correct,
    lastMissedMeasures: measureResults.total - measureResults.correct,
    completedAt: new Date().toISOString()
  };
  writePerformanceStats(stats);
  updatePerformanceDisplay();
}

function renderScoreLibrary() {
  const stats = readPerformanceStats();
  const learnProgress = readLearnProgress();
  els.scoreLibrary.innerHTML = "";

  MUSIC_XML_LIBRARY.forEach((score) => {
    const result = stats[score.id];
    const learning = learnProgress[score.id];
    const card = document.createElement("article");
    card.className = "score-card grid gap-4 border border-slate-200 p-4 lg:grid-cols-[1fr_2fr_auto] lg:items-center";
    card.innerHTML = `
      <div class="score-card-main">
        <p class="text-sm text-slate-500">${score.composer || "MusicXML score"}</p>
        <h3 class="m-0 text-xl">${score.title}</h3>
        <span class="mt-1 block text-sm text-slate-500">${score.file}</span>
      </div>
      <dl class="score-results grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7 [&_dt]:text-xs [&_dt]:text-slate-500 ">
        <div><dt>Attempts</dt><dd>${result?.attempts || 0}</dd></div>
        <div><dt>Best time</dt><dd>${formatDuration(result?.bestDurationMs)}</dd></div>
        <div><dt>Last time</dt><dd>${formatDuration(result?.lastDurationMs)}</dd></div>
        <div><dt>Best accuracy</dt><dd>${result ? `${Math.round(result.bestAccuracy)}%` : "—"}</dd></div>
        <div><dt>Last accuracy</dt><dd>${result ? `${Math.round(result.lastAccuracy)}%` : "—"}</dd></div>
        <div><dt>Best tempo</dt><dd>${formatTempo(result?.bestTempo)}</dd></div>
        <div><dt>Last tempo</dt><dd>${formatTempo(result?.lastTempo)}</dd></div>
        <div><dt>Learn</dt><dd>${formatLearnProgress(learning)}</dd></div>
      </dl>
      <div class="score-actions flex flex-wrap gap-2 justify-self-start">
        <button class="bg-teal-700 px-4 py-2 text-white hover:bg-teal-800" type="button" data-action="play">Play score</button>
        <button class="bg-teal-700 px-4 py-2 text-white hover:bg-teal-800" type="button" data-action="learn">${learning && !learning.completed ? "Resume learning" : "Learn score"}</button>
        <button class="secondary bg-slate-200 px-4 py-2 font-semibold hover:bg-slate-300" type="button" data-action="view">View score</button>
        <button class="secondary bg-slate-200 px-4 py-2 font-semibold hover:bg-slate-300" type="button" data-action="random-key">Play score in random key</button>
      </div>
    `;
    card.querySelector('[data-action="play"]').addEventListener("click", () => loadLibraryScore(score));
    card.querySelector('[data-action="learn"]').addEventListener("click", () => loadLibraryScore(score, false, false, true));
    card.querySelector('[data-action="view"]').addEventListener("click", () => loadLibraryScore(score, false, true));
    card.querySelector('[data-action="random-key"]').addEventListener("click", () => loadLibraryScore(score, true));
    els.scoreLibrary.append(card);
  });
}

function showLibrary() {
  stopPerformanceTimer();
  if (state.learn.active) saveCurrentLearnProgress();
  state.learn.active = false;
  state.fullScoreView = false;
  els.score.style.maxHeight = "";
  els.score.style.overflowY = "";
  document.body.classList.remove("player-active");
  els.playerView.hidden = true;
  els.libraryView.hidden = false;
  renderScoreLibrary();
}

function showPlayer(immersive = true) {
  document.body.classList.toggle("player-active", immersive);
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

function greatestCommonDivisor(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function leastCommonMultiple(left, right) {
  return Math.abs(left * right) / greatestCommonDivisor(left, right);
}

function fractionDenominator(value, maximum = 192) {
  for (let denominator = 1; denominator <= maximum; denominator += 1) {
    if (Math.abs((value * denominator) - Math.round(value * denominator)) < 1e-7) {
      return denominator;
    }
  }
  return maximum;
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
        const stemDirection = directChild(element, "stem")?.textContent.trim() || "";
        const beams = Array.from(element.children)
          .filter((child) => child.localName === "beam")
          .map((beam) => ({
            number: beam.getAttribute("number") || "1",
            type: beam.textContent.trim()
          }));
        const dots = Array.from(element.children).filter((child) => child.localName === "dot").length;
        const notations = directChild(element, "notations");
        const timeModificationElement = directChild(element, "time-modification");
        const timeModification = timeModificationElement
          ? {
            actualNotes: childNumber(timeModificationElement, "actual-notes", 3),
            normalNotes: childNumber(timeModificationElement, "normal-notes", 2)
          }
          : null;
        const tuplets = notations
          ? Array.from(notations.children)
            .filter((child) => child.localName === "tuplet")
            .map((tuplet) => ({
              type: tuplet.getAttribute("type") || "start",
              number: tuplet.getAttribute("number") || "1",
              bracketed: tuplet.getAttribute("bracket") !== "no",
              showNumber: tuplet.getAttribute("show-number") !== "none"
            }))
          : [];
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
            stemDirection,
            beams,
            timeModification,
            tuplets,
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
            stemDirection,
            beams,
            timeModification,
            tuplets,
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

  const timingResolution = events.reduce((resolution, event) => (
    leastCommonMultiple(
      resolution,
      leastCommonMultiple(
        fractionDenominator(event.onset),
        fractionDenominator(event.duration)
      )
    )
  ), 1);

  return {
    events,
    measureCount,
    numerator,
    denominator,
    sharpsFlats,
    smallestType,
    timingResolution
  };
}

function keyValueForMidiSignature(sharpsFlats) {
  const majorKeys = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];
  return majorKeys[Math.max(0, Math.min(14, sharpsFlats + 7))];
}

function randomKeySignatureExcluding(sharpsFlats) {
  // Use one conventional spelling for each pitch class, and exclude enharmonic
  // equivalents of the source so the random action always changes the pitch.
  const supportedSignatures = [0, -5, 2, -3, 4, -1, 6, 1, -4, 3, -2, 5];
  const sourcePitchClass = ((sharpsFlats * 7) % 12 + 12) % 12;
  const alternatives = supportedSignatures.filter(
    (fifths) => (((fifths * 7) % 12 + 12) % 12) !== sourcePitchClass
  );
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

function transposeMusicXmlScore(score, targetSharpsFlats) {
  const keyTonicSteps = ["C", "G", "D", "A", "E", "B", "F"];
  const stepNames = ["C", "D", "E", "F", "G", "A", "B"];
  const naturalSemitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const tonicForSignature = (fifths) => keyTonicSteps[((fifths % 7) + 7) % 7];
  const tonicPitchClass = (fifths) => ((fifths * 7) % 12 + 12) % 12;
  const sourceTonic = tonicForSignature(score.sharpsFlats);
  const targetTonic = tonicForSignature(targetSharpsFlats);
  let semitoneShift = tonicPitchClass(targetSharpsFlats) - tonicPitchClass(score.sharpsFlats);
  if (semitoneShift > 6) semitoneShift -= 12;
  if (semitoneShift < -6) semitoneShift += 12;

  const sourceStepIndex = stepNames.indexOf(sourceTonic);
  const targetStepIndex = stepNames.indexOf(targetTonic);
  const baseDiatonicShift = ((targetStepIndex - sourceStepIndex) % 7 + 7) % 7;
  const diatonicShift = [-2, -1, 0, 1, 2]
    .map((octaves) => baseDiatonicShift + (octaves * 7))
    .reduce((best, candidate) => (
      Math.abs((candidate * 12 / 7) - semitoneShift) < Math.abs((best * 12 / 7) - semitoneShift)
        ? candidate
        : best
    ));

  const events = score.events.map((event) => {
    if (event.rest) return { ...event };
    const absoluteStep = (event.octave * 7) + stepNames.indexOf(event.step) + diatonicShift;
    const stepIndex = ((absoluteStep % 7) + 7) % 7;
    const octave = Math.floor(absoluteStep / 7);
    const step = stepNames[stepIndex];
    const midi = event.midi + semitoneShift;
    const alter = midi - (((octave + 1) * 12) + naturalSemitones[step]);
    return { ...event, midi, step, octave, alter };
  });

  return { ...score, events, sharpsFlats: targetSharpsFlats };
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
  const slotsPerQuarter = leastCommonMultiple(beatValue / 4, score.timingResolution);
  const targetsPerMeasure = score.numerator * (4 / score.denominator) * slotsPerQuarter;
  if (!Number.isInteger(targetsPerMeasure)) {
    throw new Error("The MusicXML meter cannot be represented by the supported note grid");
  }

  const eventsBySlot = new Map();
  score.events.forEach((event) => {
    const slotInMeasure = Math.round(event.onset * slotsPerQuarter);
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
      stemDirection: event.stemDirection,
      beams: event.beams,
      timeModification: event.timeModification,
      tuplets: event.tuplets,
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
        stemDirection: event.stemDirection,
        beams: event.beams,
        timeModification: event.timeModification,
        tuplets: event.tuplets,
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
    measureCount: score.measureCount,
    numerator: score.numerator,
    denominator: score.denominator,
    targetsPerMeasure,
    beatValue,
    slotsPerQuarter,
    timeSignature: `${score.numerator}/${score.denominator}`
  };
}

function firstPlayableTargetIndex(targets, startIndex = 0) {
  let index = startIndex;
  while (index < targets.length && targets[index].rest) index += 1;
  return index;
}

function lastPlayableTargetIndex(targets, startIndex, endIndex) {
  for (let index = endIndex - 1; index >= startIndex; index -= 1) {
    if (targetNotes(targets[index]).length) return index;
  }
  return -1;
}

function clearTargetRunState(targets) {
  targets.forEach((target) => {
    delete target.missed;
    delete target.corrected;
    if (Array.isArray(target.playedMidi)) target.playedMidi.length = 0;
  });
}

function rangeHasMultipleVoices(startIndex, endIndex) {
  const voices = new Set();
  for (let index = startIndex; index < endIndex; index += 1) {
    targetNotes(state.importedSourceTargets[index]).forEach((note) => {
      if (note.voice) voices.add(note.voice);
    });
    if (voices.size > 1) return true;
  }
  return false;
}

function makeLearnPhases(stepBase, startIndex, endIndex) {
  const phases = rangeHasMultipleVoices(startIndex, endIndex)
    ? [
      { id: "left", label: "Left hand only", loose: true },
      { id: "right", label: "Right hand only", loose: true },
      { id: "both", label: "Both hands", loose: false }
    ]
    : [{ id: "both", label: "Both hands", loose: false }];

  return phases.map((phase) => ({
    ...stepBase,
    id: `${stepBase.id}:${phase.id}`,
    phase: phase.id,
    phaseLabel: phase.label,
    loose: phase.loose
  }));
}

function buildLearnSteps() {
  const targetsPerMeasure = state.beatsPerMeasure;
  const steps = [];

  for (let measureIndex = 0; measureIndex < state.importedMeasureCount; measureIndex += 1) {
    const measureStart = measureIndex * targetsPerMeasure;
    const measureEnd = measureStart + targetsPerMeasure;

    if (measureIndex === 0) {
      steps.push(...makeLearnPhases({
        id: "measure-1",
        label: "Measure 1",
        renderStartMeasure: 0,
        renderMeasureCount: 1,
        practiceStartOffset: 0,
        practiceEndOffset: targetsPerMeasure
      }, measureStart, measureEnd));
      continue;
    }

    const previousStart = (measureIndex - 1) * targetsPerMeasure;
    const previousEnd = previousStart + targetsPerMeasure;
    const leadInIndex = lastPlayableTargetIndex(state.importedSourceTargets, previousStart, previousEnd);
    const transitionStart = leadInIndex >= 0 ? leadInIndex : measureStart;

    steps.push(...makeLearnPhases({
      id: `measure-${measureIndex + 1}-lead-in`,
      label: `Measure ${measureIndex + 1} with previous final note`,
      renderStartMeasure: measureIndex - 1,
      renderMeasureCount: 2,
      practiceStartOffset: transitionStart - previousStart,
      practiceEndOffset: targetsPerMeasure * 2
    }, transitionStart, measureEnd));

    steps.push(...makeLearnPhases({
      id: `measures-1-${measureIndex + 1}`,
      label: `Measures 1-${measureIndex + 1}`,
      renderStartMeasure: 0,
      renderMeasureCount: measureIndex + 1,
      practiceStartOffset: 0,
      practiceEndOffset: measureEnd
    }, 0, measureEnd));
  }

  return steps;
}

function currentLearnStep() {
  return state.learn.steps[state.learn.stepIndex] || null;
}

function learnStepTargets(step) {
  const start = step.renderStartMeasure * state.beatsPerMeasure;
  const end = start + (step.renderMeasureCount * state.beatsPerMeasure);
  return state.importedSourceTargets.slice(start, end);
}

function learnStatusText(step = currentLearnStep()) {
  if (!step) return "Learning complete";
  return `${step.label} - ${step.phaseLabel} - ${state.learn.streak}/${LEARN_STREAK_GOAL}`;
}

function shouldHideLearnMusic() {
  return state.learn.active && state.learn.streak >= LEARN_HIDE_AFTER_STREAK;
}

function renderHiddenLearnMusic(step = currentLearnStep()) {
  renderedTargetNotes = new Map();
  els.score.innerHTML = "";
  els.score.style.minHeight = "100vh";

  const panel = document.createElement("div");
  panel.className = "grid min-h-screen items-center bg-white p-6 text-center";
  panel.innerHTML = `
    <div>
      <p class="text-sm font-bold text-slate-500 uppercase">Music hidden</p>
      <h3 class="text-2xl">${step?.label || "Learning step"}</h3>
      <p class="mt-3 text-xl">${step?.phaseLabel || "Play from memory"}</p>
      <p class="mt-3 text-sm text-slate-500">Repetitions 6-10 are from memory.</p>
    </div>
  `;
  els.score.append(panel);
  renderLearnOverlay();
}

function renderLearnOverlay() {
  if (!state.learn.active) return;

  let overlay = els.score.querySelector(".learn-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "learn-overlay absolute top-0 z-2 border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600";
    overlay.style.left = "0";
    overlay.style.maxWidth = "calc(100% - 1rem)";
    overlay.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.12)";
    els.score.append(overlay);
  }
  overlay.textContent = learnStatusText();
}

function startCurrentLearnStep(feedbackMessage = "") {
  const step = currentLearnStep();
  if (!step) {
    state.learn.completed = true;
    state.learn.streak = LEARN_STREAK_GOAL;
    saveCurrentLearnProgress();
    setFeedback("Learning complete", "good");
    showLibrary();
    return;
  }

  state.notes = learnStepTargets(step);
  clearTargetRunState(state.notes);
  state.current = firstPlayableTargetIndex(state.notes, step.practiceStartOffset);
  if (state.current >= step.practiceEndOffset) {
    state.learn.stepIndex += 1;
    state.learn.streak = 0;
    saveCurrentLearnProgress();
    startCurrentLearnStep("Skipped empty step");
    return;
  }

  state.importedPageIndex = Math.floor(step.renderStartMeasure / (SYSTEMS_PER_PAGE * MEASURES_PER_SYSTEM));
  els.score.style.maxHeight = "100vh";
  els.score.style.overflowY = "auto";
  setFeedback(feedbackMessage || learnStatusText(step), "good");
  updateLabels();
  drawScore();
  renderLearnOverlay();
}

function startLearnMode() {
  const steps = buildLearnSteps();
  const progress = learnProgressForScore(state.activeScore.id);
  const canResume = progress
    && !progress.completed
    && progress.measureCount === state.importedMeasureCount
    && progress.totalSteps === steps.length;

  state.learn = {
    active: true,
    steps,
    stepIndex: canResume ? Math.min(progress.stepIndex || 0, Math.max(steps.length - 1, 0)) : 0,
    streak: canResume ? Math.min(progress.streak || 0, LEARN_STREAK_GOAL - 1) : 0,
    completed: false
  };
  state.fullScoreView = false;
  state.importedPages = null;
  state.importedPageIndex = -1;
  els.playerFooter.hidden = false;
  resetPerformance();
  showPlayer();
  saveCurrentLearnProgress();
  startCurrentLearnStep(canResume ? "Resuming learning" : "Ready to learn");
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

function startFullScoreView() {
  state.importedPages = null;
  state.importedPageIndex = -1;
  state.notes = state.importedSourceTargets || [];
  state.current = -1;
  state.fullScoreView = true;
  els.score.style.maxHeight = "";
  els.score.style.overflowY = "";
  els.playerFooter.hidden = true;
  showPlayer(false);
  updateLabels();
  drawScore();
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
  state.fullScoreView = false;
  els.playerFooter.hidden = false;
  resetPerformance();
  setFeedback(feedbackMessage, "good");
  startImportedPage(0);
}

function importMusicXml(xmlText, scoreMeta, targetSharpsFlats = null, options = {}) {
  const originalScore = readMusicXml(xmlText);
  const score = targetSharpsFlats === null
    ? originalScore
    : transposeMusicXmlScore(originalScore, targetSharpsFlats);
  const converted = convertMusicXmlToTargets(score);
  const displayTitle = targetSharpsFlats === null
    ? scoreMeta.title
    : `${scoreMeta.title} — ${converted.keyValue}`;
  state.activeScore = { ...scoreMeta, displayTitle };
  if (!options.learn) state.learn.active = false;
  state.importedSourceTargets = converted.targets;
  state.importedMeasureCount = converted.measureCount;
  state.keyValue = converted.keyValue;
  state.totalQuarterNoteBeats = converted.measureCount
    * converted.numerator
    * (4 / converted.denominator);
  state.beatsPerMeasure = converted.targetsPerMeasure;
  state.beatValue = converted.beatValue;
  state.slotsPerQuarter = converted.slotsPerQuarter;
  state.timeSignature = converted.timeSignature;
  els.pieceTitle.textContent = displayTitle;
  if (options.learn) {
    startLearnMode();
  } else if (options.fullScore) {
    resetPerformance();
    setFeedback("Full score");
    startFullScoreView();
  } else {
    els.score.style.maxHeight = "";
    els.score.style.overflowY = "";
    showPlayer();
    rebuildImportedPages("Ready to play");
  }
}

async function loadMusicXmlFile(file) {
  if (!file) return;
  showPlayer();
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

async function loadLibraryScore(scoreMeta, useRandomKey = false, fullScore = false, learn = false) {
  showPlayer(!fullScore);
  els.pieceTitle.textContent = scoreMeta.title;
  setFeedback("Loading score");
  try {
    const response = await fetch(scoreMeta.file);
    if (!response.ok) throw new Error(`Could not load ${scoreMeta.file}`);
    const xmlText = await response.text();
    const originalScore = readMusicXml(xmlText);
    const targetSharpsFlats = useRandomKey
      ? randomKeySignatureExcluding(originalScore.sharpsFlats)
      : null;
    importMusicXml(xmlText, scoreMeta, targetSharpsFlats, { fullScore, learn });
  } catch (error) {
    setFeedback(error.message || "Could not load MusicXML", "bad");
  }
}

function vexKey(note) {
  const accidental = note.accidental === "n" ? "" : note.accidental || note.keyAccidental || "";
  return `${note.step.toLowerCase()}${accidental}/${note.octave}`;
}

const DIATONIC_STEPS = ["C", "D", "E", "F", "G", "A", "B"];

function diatonicPosition(step, octave) {
  const stepIndex = DIATONIC_STEPS.indexOf(String(step).toUpperCase());
  return stepIndex < 0 || !Number.isFinite(octave) ? null : (octave * 7) + stepIndex;
}

function diatonicPositionForVexKey(key) {
  const match = /^([a-g])(?:bb|##|b|#|n)?\/(-?\d+)$/i.exec(key || "");
  return match ? diatonicPosition(match[1], Number(match[2])) : null;
}

function vexKeyForDiatonicPosition(position) {
  const stepIndex = ((position % 7) + 7) % 7;
  return `${DIATONIC_STEPS[stepIndex].toLowerCase()}/${Math.floor(position / 7)}`;
}

function vexKeyForDynamicRestPosition(position) {
  return vexKeyForDiatonicPosition(position - DYNAMIC_REST_Y_OFFSET_STEPS);
}

function clampMultiVoiceRestKey(key, staff) {
  const floorKey = MULTI_VOICE_REST_FLOOR_KEYS[staff];
  const position = diatonicPositionForVexKey(key);
  const floorPosition = diatonicPositionForVexKey(floorKey);
  return Number.isFinite(position) && position < floorPosition ? floorKey : key;
}

function nearestVoicePosition(measureTargets, slot, staff, voiceId) {
  let nearestDistance = Infinity;
  let nearestPositions = [];

  measureTargets.forEach((target, targetSlot) => {
    const positions = targetNotes(target)
      .filter((note) => note.staff === staff && note.voice === voiceId)
      .map((note) => diatonicPosition(note.step, note.octave))
      .filter(Number.isFinite);
    if (!positions.length) return;

    const distance = Math.abs(targetSlot - slot);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPositions = positions;
    }
  });

  if (!nearestPositions.length) return null;
  return Math.round(nearestPositions.reduce((sum, position) => sum + position, 0) / nearestPositions.length);
}

function collisionAwareRestKey(measureTargets, slot, staff, voiceId, rest) {
  const staffDefaultKey = staff === "bass" ? "d/3" : "b/4";
  const sourcePosition = diatonicPositionForVexKey(rest.displayKey);
  const voicePosition = nearestVoicePosition(measureTargets, slot, staff, voiceId);
  const basePosition = voicePosition ?? sourcePosition
    ?? diatonicPositionForVexKey(staffDefaultKey);
  const otherVoicePositions = targetNotes(measureTargets[slot])
    .filter((note) => note.staff === staff && note.voice !== voiceId)
    .map((note) => diatonicPosition(note.step, note.octave))
    .filter(Number.isFinite);

  if (!otherVoicePositions.some(
    (position) => Math.abs(basePosition - position) < REST_NOTE_OVERLAP_STEPS
  )) {
    return clampMultiVoiceRestKey(vexKeyForDiatonicPosition(basePosition), staff);
  }

  const upperPosition = Math.max(...otherVoicePositions) + REST_NOTE_CLEARANCE_STEPS;
  const lowerPosition = Math.min(...otherVoicePositions) - REST_NOTE_CLEARANCE_STEPS;
  const otherVoiceCenter = otherVoicePositions.reduce((sum, position) => sum + position, 0)
    / otherVoicePositions.length;

  // Follow the melodic side occupied by this voice. If both voices are on the
  // same line, retain the source rest's side; otherwise take the shorter move.
  let key;
  if (basePosition > otherVoiceCenter) key = vexKeyForDynamicRestPosition(upperPosition);
  else if (basePosition < otherVoiceCenter) key = vexKeyForDynamicRestPosition(lowerPosition);
  else if (sourcePosition > otherVoiceCenter) key = vexKeyForDynamicRestPosition(upperPosition);
  else if (sourcePosition < otherVoiceCenter) key = vexKeyForDynamicRestPosition(lowerPosition);
  else key = vexKeyForDynamicRestPosition(
    upperPosition - basePosition <= basePosition - lowerPosition ? upperPosition : lowerPosition
  );
  return clampMultiVoiceRestKey(key, staff);
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

function accidentalDisplayForMeasure(measureTargets, keyValue) {
  const displays = new WeakMap();
  const activeAccidentals = new Map();
  const key = KEYS[keyValue] || KEYS.C;

  measureTargets.forEach((target) => {
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

function groupCandidatesByVoice(candidates) {
  const groups = new Map();
  candidates.forEach((candidate) => {
    const group = groups.get(candidate.voiceId) || [];
    group.push(candidate);
    groups.set(candidate.voiceId, group);
  });
  return groups;
}

function makeTuplets(tupletCandidates) {
  const VF = window.VexFlow;
  const tuplets = [];
  const candidatesByVoice = groupCandidatesByVoice(tupletCandidates);

  candidatesByVoice.forEach((voiceCandidates) => {
    let group = [];
    let ratioKey = "";

    const finishGroup = () => {
      if (!group.length) return;
      const { actualNotes, normalNotes } = group[0].event.timeModification;
      if (group.length === actualNotes) {
        const start = group
          .flatMap(({ event }) => event.tuplets || [])
          .find((tuplet) => tuplet.type === "start");
        const tuplet = new VF.Tuplet(group.map(({ staveNote }) => staveNote), {
          numNotes: actualNotes,
          notesOccupied: normalNotes,
          bracketed: start?.bracketed ?? false
        });
        if (start?.showNumber === false) tuplet.textElement.setText("");
        tuplets.push(tuplet);
      }
      group = [];
      ratioKey = "";
    };

    voiceCandidates
      .sort((left, right) => left.slot - right.slot)
      .forEach((candidate) => {
        const modification = candidate.event.timeModification;
        if (!modification) {
          finishGroup();
          return;
        }

        const candidateRatio = `${modification.actualNotes}:${modification.normalNotes}`;
        if (ratioKey && candidateRatio !== ratioKey) finishGroup();
        ratioKey = candidateRatio;
        group.push(candidate);
        if (group.length === modification.actualNotes) finishGroup();
      });
    finishGroup();
  });
  return tuplets;
}

function makeMusicXmlBeams(beamCandidates) {
  const VF = window.VexFlow;
  const beams = [];
  const candidatesByVoice = groupCandidatesByVoice(beamCandidates);

  candidatesByVoice.forEach((voiceCandidates) => {
    let group = [];
    const finishGroup = () => {
      if (group.length > 1) {
        const beam = new VF.Beam(group.map(({ staveNote }) => staveNote));
        beams.push(beam);
      }
      group = [];
    };

    voiceCandidates
      .sort((left, right) => left.slot - right.slot)
      .forEach((candidate) => {
        const primaryBeam = (candidate.event.beams || [])
          .find((beam) => beam.number === "1");
        if (!primaryBeam) {
          finishGroup();
          return;
        }
        if (primaryBeam.type === "begin") finishGroup();
        group.push(candidate);
        if (primaryBeam.type === "end") finishGroup();
      });
    finishGroup();
  });
  return beams;
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
  if (!voicesInMeasure.size) voicesInMeasure.add("__ghost");
  const hasMultipleVoices = voicesInMeasure.size > 1;

  return [...voicesInMeasure].map((voiceId) => {
    const staveNotes = [];
    const notationCandidates = [];
    let slot = 0;

    const eventAtSlot = (targetSlot) => {
      const target = measureTargets[targetSlot];
      const notes = targetNotes(target)
        .filter((note) => note.staff === staff && note.voice === voiceId)
        .sort((a, b) => a.midi - b.midi);
      const rest = (target?.notationRests || [])
        .find((event) => event.staff === staff && event.voice === voiceId);
      return { target, notes, rest, event: notes[0] || rest };
    };

    while (slot < measureTargets.length) {
      const { target, notes, rest, event } = eventAtSlot(slot);

      if (!event) {
        let gapEnd = slot + 1;
        while (gapEnd < measureTargets.length && !eventAtSlot(gapEnd).event) gapEnd += 1;
        const ghostNote = new VF.GhostNote("q");
        ghostNote.setDuration(new VF.Fraction(gapEnd - slot, state.slotsPerQuarter * 4));
        staveNotes.push(ghostNote);
        slot = gapEnd;
        continue;
      }

      const dots = event.dots || 0;
      const duration = `${vexDurationForMusicXmlType(event.type)}${"d".repeat(dots)}${rest ? "r" : ""}`;
      const stemDirection = event.stemDirection === "down"
        ? VF.Stem.DOWN
        : event.stemDirection === "up" ? VF.Stem.UP : null;
      const restKey = rest && hasMultipleVoices
        ? collisionAwareRestKey(measureTargets, slot, staff, voiceId, rest)
        : rest?.displayKey || (staff === "bass" ? "d/3" : "b/4");
      const staveNote = makeStaveNote({
        clef: staff,
        keys: rest ? [restKey] : notes.map(vexKey),
        duration,
        autoStem: stemDirection === null,
        ...(stemDirection === null ? {} : { stemDirection }),
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
      notationCandidates.push({
        staveNote,
        event,
        slot,
        voiceId,
        staff,
        restLine: rest ? staveNote.getKeyProps()[0].line : null
      });

      const durationSlots = Math.max(
        1,
        Math.round((event.duration || (1 / state.slotsPerQuarter)) * state.slotsPerQuarter)
      );
      slot += durationSlots;
    }

    return { stave, staveNotes, notationCandidates, staff };
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
    if (RENDER_SLURS) {
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
    }

    if (RENDER_TIES) {
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
    }
  });

  if (RENDER_SLURS) {
    pendingSlurs.forEach(({ endpoint, placement }) => drawSlur(endpoint, null, placement));
  }
  if (RENDER_TIES) pendingTies.forEach((endpoint) => drawTie(endpoint, null));
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
  const measureCount = options.measureCount || systemCount * MEASURES_PER_SYSTEM;
  const measureNumberOffset = options.measureNumberOffset || 0;

  const width = Math.max(container.clientWidth || 960, 960);
  const systemSpacing = 300;
  const height = options.height || (systemCount === 1 ? 290 : (systemCount * systemSpacing) + 80);
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
    let measureX = pageMargin;

    for (let measureIndex = 0; measureIndex < MEASURES_PER_SYSTEM; measureIndex += 1) {
      const measureNumber = (systemIndex * MEASURES_PER_SYSTEM) + measureIndex;
      if (measureNumber >= measureCount) break;
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

      const displayMeasureNumber = measureNumberOffset + measureNumber + 1;
      if (
        isSystemStart
        && displayMeasureNumber > 1
        && displayMeasureNumber <= state.importedMeasureCount
      ) {
        context.save();
        context.setFont("Arial", 11, "normal");
        context.setFillStyle("#475569");
        context.fillText(String(displayMeasureNumber), measureX + 0, trebleY + 20);
        context.restore();
      }

      const targetOffset = measureNumber * state.beatsPerMeasure;
      const measureTargets = notes.slice(targetOffset, targetOffset + state.beatsPerMeasure);
      const accidentalDisplays = accidentalDisplayForMeasure(measureTargets, keyValue);
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
      const notationCandidates = voices.flatMap(({ notationCandidates: candidates }) => candidates);
      const tuplets = makeTuplets(notationCandidates);
      const [voiceBeats, voiceBeatValue] = state.timeSignature.split("/").map(Number);
      voices.forEach((entry) => {
        entry.voice = new VF.Voice({ num_beats: voiceBeats, beat_value: voiceBeatValue })
          .setStrict(false)
          .addTickables(entry.staveNotes);
      });
      const vexVoices = voices.map(({ voice }) => voice);
      const noteAreaWidth = Math.min(
        ...staves.map(({ stave }) => stave.getNoteEndX() - stave.getNoteStartX())
      ) - 12;

      const formatter = new VF.Formatter();
      staves.forEach(({ clef }) => {
        formatter.joinVoices(voices.filter(({ staff }) => staff === clef).map(({ voice }) => voice));
      });
      formatter.format(vexVoices, noteAreaWidth);
      notationCandidates.forEach(({ staveNote, event, restLine }) => {
        // VexFlow also shifts rests during formatting. Restore the position
        // selected above so a non-overlapping rest remains on its own voice.
        if (Number.isFinite(restLine)) staveNote.setKeyLine(0, restLine);
        if (event.stemDirection === "up") staveNote.setStemDirection(VF.Stem.UP);
        if (event.stemDirection === "down") staveNote.setStemDirection(VF.Stem.DOWN);
      });
      const beams = makeMusicXmlBeams(notationCandidates);
      voices.forEach(({ voice, stave }) => {
        voice.draw(context, stave);
      });
      beams.forEach((beam) => beam.setContext(context).draw());
      tuplets.forEach((tuplet) => tuplet.setContext(context).draw());

      measureX += measureWidth;
    }
  }

  if (state.importedSourceTargets && (RENDER_SLURS || RENDER_TIES)) {
    drawMusicXmlCurves(context, notationEndpoints);
  }
}

function drawScore() {
  if (state.learn.active) {
    const step = currentLearnStep();
    if (shouldHideLearnMusic()) {
      renderHiddenLearnMusic(step);
      updateNextSystemPreview();
      return;
    }
    const measureCount = step?.renderMeasureCount || 1;
    drawVexScore(els.score, state.notes, state.current, state.keyValue, {
      systemCount: Math.ceil(measureCount / MEASURES_PER_SYSTEM),
      measureCount,
      measureNumberOffset: step?.renderStartMeasure || 0
    });
    renderLearnOverlay();
  } else if (state.fullScoreView) {
    drawVexScore(els.score, state.notes, -1, state.keyValue, {
      systemCount: Math.ceil(state.importedMeasureCount / MEASURES_PER_SYSTEM),
      measureCount: state.importedMeasureCount
    });
  } else {
    drawVexScore(els.score, state.notes, state.current, state.keyValue, {
      measureNumberOffset: state.importedPageIndex * SYSTEMS_PER_PAGE * MEASURES_PER_SYSTEM
    });
  }
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
  if (state.fullScoreView || state.learn.active) {
    existingPreview?.remove();
    return;
  }
  const finalSystemStart = (SYSTEMS_PER_PAGE - 1) * MEASURES_PER_SYSTEM * state.beatsPerMeasure;
  const previewData = state.current >= finalSystemStart ? nextSystemPreviewData() : null;

  if (!previewData) {
    existingPreview?.remove();
    return;
  }
  if (existingPreview) return;

  const preview = document.createElement("div");
  preview.className = "next-system-preview pointer-events-none absolute inset-x-0 top-0 z-2 h-[340px] min-w-3xl overflow-hidden shadow-xl border-b-2 border-slate-300 bg-white";
  preview.setAttribute("aria-label", "First system of the next page");
  els.score.append(preview);

  const currentRenderedTargets = renderedTargetNotes;
  try {
    drawVexScore(preview, previewData.notes, -1, previewData.keyValue, {
      systemCount: 1,
      height: 340,
      measureNumberOffset: (state.importedPageIndex + 1) * SYSTEMS_PER_PAGE * MEASURES_PER_SYSTEM
    });
  } finally {
    renderedTargetNotes = currentRenderedTargets;
  }
}

function updateLabels() {
  const target = state.notes[state.current];
  els.pageLabel.textContent = state.learn.active
    ? `Learn score - Step ${Math.min(state.learn.stepIndex + 1, state.learn.steps.length)} of ${state.learn.steps.length}`
    : state.fullScoreView
    ? `Full score - ${state.importedMeasureCount} measures`
    : state.importedPages
    ? `Page ${state.importedPageIndex + 1} of ${state.importedPages.length}`
    : "Page 1";
  if (state.activeScore) els.pieceTitle.textContent = state.activeScore.displayTitle || state.activeScore.title;
  if (!target && state.performanceComplete) setFeedback("Piece complete", "good");
  updatePerformanceDisplay();
}

function setFeedback(message, type = "") {
  els.feedback.textContent = message;
  els.feedback.classList.remove("good", "bad");
  if (type) els.feedback.classList.add(type);
}

function pitchClass(midi) {
  return ((midi % 12) + 12) % 12;
}

function learnPracticeEnd(step = currentLearnStep()) {
  return Math.min(step?.practiceEndOffset || state.notes.length, state.notes.length);
}

function nextLearnPlayableIndex(startIndex) {
  const endIndex = learnPracticeEnd();
  let index = Math.max(startIndex, currentLearnStep()?.practiceStartOffset || 0);
  while (index < endIndex && !targetNotes(state.notes[index]).length) index += 1;
  return index;
}

function resetCurrentLearnAttempt(message, type = "bad") {
  const step = currentLearnStep();
  state.learn.streak = 0;
  clearTargetRunState(state.notes);
  state.current = nextLearnPlayableIndex(step?.practiceStartOffset || 0);
  saveCurrentLearnProgress();
  setFeedback(message, type);
  drawScore();
}

function completeLearnAttempt() {
  const step = currentLearnStep();
  state.learn.streak += 1;

  if (state.learn.streak >= LEARN_STREAK_GOAL) {
    state.learn.stepIndex += 1;
    state.learn.streak = 0;
    saveCurrentLearnProgress();
    startCurrentLearnStep(step ? `${step.label} complete` : "Step complete");
    return;
  }

  saveCurrentLearnProgress();
  clearTargetRunState(state.notes);
  state.current = nextLearnPlayableIndex(step?.practiceStartOffset || 0);
  setFeedback(learnStatusText(step), "good");
  drawScore();
}

function finishLearnTarget(targetIndex) {
  const previousIndex = state.current;
  state.current = nextLearnPlayableIndex(targetIndex + 1);
  setFeedback("Correct", "good");

  if (state.current >= learnPracticeEnd()) {
    completeLearnAttempt();
    return;
  }

  updateLabels();
  for (let index = previousIndex; index <= targetIndex; index += 1) {
    refreshRenderedTargetStyle(index);
  }
  refreshRenderedTargetStyle(state.current);
  renderLearnOverlay();
}

function findLooseLearnMatch(midi) {
  const endIndex = learnPracticeEnd();
  for (let index = state.current; index < endIndex; index += 1) {
    if (targetNotes(state.notes[index]).some((note) => note.midi === midi)) return index;
  }
  return -1;
}

function handleLearnPlayedNote(midi) {
  const step = currentLearnStep();
  if (!step) return;

  if (state.current >= learnPracticeEnd()) {
    completeLearnAttempt();
    return;
  }

  if (step.loose) {
    const targetIndex = findLooseLearnMatch(midi);
    if (targetIndex < 0) {
      resetCurrentLearnAttempt(`Heard ${midiToName(midi)}`);
      return;
    }
    finishLearnTarget(targetIndex);
    return;
  }

  const targetIndex = state.current;
  const target = state.notes[targetIndex];
  const expectedMidi = targetNotes(target).map((note) => note.midi);
  if (!expectedMidi.includes(midi)) {
    resetCurrentLearnAttempt(`Heard ${midiToName(midi)}`);
    return;
  }

  const isComplete = expectedMidi.every((noteMidi) => state.heldMidi.has(noteMidi));
  if (!isComplete) {
    const remaining = expectedMidi.filter((noteMidi) => !state.heldMidi.has(noteMidi)).length;
    const label = remaining === 1 ? "note" : "notes";
    setFeedback(`${remaining} ${label} left`, "good");
    renderLearnOverlay();
    return;
  }

  finishLearnTarget(targetIndex);
}

function handlePlayedNote(midi) {
  if (state.learn.active) {
    handleLearnPlayedNote(midi);
    return;
  }

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
    showLibrary();
    return;
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
  if (state.learn.active) {
    state.learn.streak = 0;
    saveCurrentLearnProgress();
    startCurrentLearnStep("Restarted learning step");
    return;
  }
  resetPerformance();
  startImportedPage(0);
  setFeedback("Ready to play");
});
els.demoMode.addEventListener("click", toggleDemoMode);
document.addEventListener("keydown", handleComputerKey);

window.setInterval(() => {
  if (navigator.requestMIDIAccess && !hasMidiConnection() && !state.midiConnectPending) {
    connectMidi();
  }
}, 1000);

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
