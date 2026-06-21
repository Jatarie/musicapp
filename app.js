const NOTES = [
  { midi: 26, step: "D", octave: 1 },
  { midi: 28, step: "E", octave: 1 },
  { midi: 29, step: "F", octave: 1 },
  { midi: 31, step: "G", octave: 1 },
  { midi: 33, step: "A", octave: 1 },
  { midi: 35, step: "B", octave: 1 },
  { midi: 36, step: "C", octave: 2 },
  { midi: 38, step: "D", octave: 2 },
  { midi: 40, step: "E", octave: 2 },
  { midi: 41, step: "F", octave: 2 },
  { midi: 43, step: "G", octave: 2 },
  { midi: 45, step: "A", octave: 2 },
  { midi: 47, step: "B", octave: 2 },
  { midi: 48, step: "C", octave: 3 },
  { midi: 50, step: "D", octave: 3 },
  { midi: 52, step: "E", octave: 3 },
  { midi: 53, step: "F", octave: 3 },
  { midi: 55, step: "G", octave: 3 },
  { midi: 57, step: "A", octave: 3 },
  { midi: 59, step: "B", octave: 3 },
  { midi: 60, step: "C", octave: 4 },
  { midi: 62, step: "D", octave: 4 },
  { midi: 64, step: "E", octave: 4 },
  { midi: 65, step: "F", octave: 4 },
  { midi: 67, step: "G", octave: 4 },
  { midi: 69, step: "A", octave: 4 },
  { midi: 71, step: "B", octave: 4 },
  { midi: 72, step: "C", octave: 5 },
  { midi: 74, step: "D", octave: 5 },
  { midi: 76, step: "E", octave: 5 },
  { midi: 77, step: "F", octave: 5 },
  { midi: 79, step: "G", octave: 5 },
  { midi: 81, step: "A", octave: 5 },
  { midi: 83, step: "B", octave: 5 },
  { midi: 84, step: "C", octave: 6 },
  { midi: 86, step: "D", octave: 6 },
  { midi: 88, step: "E", octave: 6 },
  { midi: 89, step: "F", octave: 6 },
  { midi: 91, step: "G", octave: 6 },
  { midi: 93, step: "A", octave: 6 },
  { midi: 95, step: "B", octave: 6 }
];

const ACCIDENTALS = [
  { midi: 27, step: "D", octave: 1, accidental: "#" },
  { midi: 30, step: "F", octave: 1, accidental: "#" },
  { midi: 32, step: "G", octave: 1, accidental: "#" },
  { midi: 34, step: "A", octave: 1, accidental: "#" },
  { midi: 37, step: "C", octave: 2, accidental: "#" },
  { midi: 39, step: "D", octave: 2, accidental: "#" },
  { midi: 42, step: "F", octave: 2, accidental: "#" },
  { midi: 44, step: "G", octave: 2, accidental: "#" },
  { midi: 46, step: "A", octave: 2, accidental: "#" },
  { midi: 49, step: "C", octave: 3, accidental: "#" },
  { midi: 51, step: "D", octave: 3, accidental: "#" },
  { midi: 54, step: "F", octave: 3, accidental: "#" },
  { midi: 56, step: "G", octave: 3, accidental: "#" },
  { midi: 58, step: "A", octave: 3, accidental: "#" },
  { midi: 61, step: "C", octave: 4, accidental: "#" },
  { midi: 63, step: "D", octave: 4, accidental: "#" },
  { midi: 66, step: "F", octave: 4, accidental: "#" },
  { midi: 68, step: "G", octave: 4, accidental: "#" },
  { midi: 70, step: "A", octave: 4, accidental: "#" },
  { midi: 73, step: "C", octave: 5, accidental: "#" },
  { midi: 75, step: "D", octave: 5, accidental: "#" },
  { midi: 78, step: "F", octave: 5, accidental: "#" },
  { midi: 80, step: "G", octave: 5, accidental: "#" },
  { midi: 82, step: "A", octave: 5, accidental: "#" },
  { midi: 85, step: "C", octave: 6, accidental: "#" },
  { midi: 87, step: "D", octave: 6, accidental: "#" },
  { midi: 90, step: "F", octave: 6, accidental: "#" },
  { midi: 92, step: "G", octave: 6, accidental: "#" },
  { midi: 94, step: "A", octave: 6, accidental: "#" }
];

const STEP_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const KEYBOARD_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k"];
const FOURTHS_KEY_SEQUENCE = ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "B", "E", "A", "D", "G"];
const STAFF_RANGES = {
  treble: { min: 47, max: 95 },
  bass: { min: 26, max: 74 }
};
const SYSTEMS_PER_ROUND = 4;
const MEASURES_PER_SYSTEM = 3;
const BEATS_PER_MEASURE = 4;
const TARGETS_PER_ROUND = SYSTEMS_PER_ROUND * MEASURES_PER_SYSTEM * BEATS_PER_MEASURE;
const INCLUDED_MUSICXML_FILE = "prelude-in-c-major.xml";
const KEY_TONICS = {
  C: 0, "C#": 1, Db: 1, D: 2, Eb: 3, E: 4, F: 5, "F#": 6,
  Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11, Cb: 11
};
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
  nextNotes: [],
  nextKey: null,
  current: 0,
  round: 0,
  correct: 0,
  missed: 0,
  streak: 0,
  demoMode: false,
  midiConnectPending: false,
  roundsUntilKeyChange: null,
  beatsPerMeasure: BEATS_PER_MEASURE,
  beatValue: 4,
  timeSignature: "4/4",
  importedPages: null,
  importedSourceTargets: null,
  importedOriginalKey: "",
  importedPageIndex: -1,
  importedFileName: ""
};
let renderedTargetNotes = new Map();

const els = {
  workspace: document.querySelector(".workspace"),
  settingsPanel: document.querySelector("#settingsPanel"),
  toggleControls: document.querySelector("#toggleControls"),
  showControls: document.querySelector("#showControls"),
  midiStatus: document.querySelector("#midiStatus"),
  midiInputs: document.querySelector("#midiInputs"),
  connectMidi: document.querySelector("#connectMidi"),
  rangeSelect: document.querySelector("#rangeSelect"),
  keySelect: document.querySelector("#keySelect"),
  keyIntervalSelect: document.querySelector("#keyIntervalSelect"),
  keyCountdown: document.querySelector("#keyCountdown"),
  accidentalsSelect: document.querySelector("#accidentalsSelect"),
  distanceSelect: document.querySelector("#distanceSelect"),
  harmonicEnabled: document.querySelector("#harmonicEnabled"),
  harmonicDistanceSelect: document.querySelector("#harmonicDistanceSelect"),
  harmonicChanceSelect: document.querySelector("#harmonicChanceSelect"),
  chordSizeSelect: document.querySelector("#chordSizeSelect"),
  musicXmlFile: document.querySelector("#musicXmlFile"),
  loadIncludedMusicXml: document.querySelector("#loadIncludedMusicXml"),
  musicXmlFileStatus: document.querySelector("#musicXmlFileStatus"),
  newRound: document.querySelector("#newRound"),
  demoMode: document.querySelector("#demoMode"),
  scoreValue: document.querySelector("#scoreValue"),
  missValue: document.querySelector("#missValue"),
  streakValue: document.querySelector("#streakValue"),
  roundLabel: document.querySelector("#roundLabel"),
  targetLabel: document.querySelector("#targetLabel"),
  feedback: document.querySelector("#feedback"),
  score: document.querySelector("#score"),
  keyboardHint: document.querySelector("#keyboardHint")
};

function setControlsCollapsed(isCollapsed) {
  document.body.classList.toggle("notation-focus", isCollapsed);
  els.workspace.classList.toggle("controls-collapsed", isCollapsed);
  els.settingsPanel.hidden = isCollapsed;
  els.showControls.hidden = !isCollapsed;
  els.toggleControls.setAttribute("aria-expanded", String(!isCollapsed));
  els.showControls.setAttribute("aria-expanded", String(!isCollapsed));

  requestAnimationFrame(drawScore);
}

function diatonicIndex(note) {
  return note.octave * 7 + STEP_INDEX[note.step];
}

function staffForNote(note, mode) {
  if (mode === "bass") return "bass";
  if (mode === "treble") return "treble";
  if (note.staff) return note.staff;
  return note.midi < 60 ? "bass" : "treble";
}

function noteInRange(note, mode) {
  if (mode === "treble" || mode === "bass") {
    const range = STAFF_RANGES[mode];
    return note.midi >= range.min && note.midi <= range.max;
  }

  return noteInRange(note, "treble") || noteInRange(note, "bass");
}

function grandStavesForNote(note) {
  return ["treble", "bass"].filter((staff) => noteInRange(note, staff));
}

function noteWithGrandStaff(note, preferredStaff = "") {
  const staves = grandStavesForNote(note);
  const staff = preferredStaff && staves.includes(preferredStaff)
    ? preferredStaff
    : randomFrom(staves);

  return { ...note, staff };
}

function targetWithStaffForMode(target, mode) {
  if (mode !== "grand") return target;

  const notes = targetNotes(target);
  const leadNote = notes[0];
  const staffedLead = leadNote ? noteWithGrandStaff(leadNote) : null;

  if (!target || !Array.isArray(target.notes)) {
    return staffedLead || target;
  }

  return {
    ...target,
    notes: target.notes.map((note, index) => (
      index === 0
        ? staffedLead
        : noteWithGrandStaff(note, staffedLead ? staffedLead.staff : "")
    ))
  };
}

function keySignature(keyValue = els.keySelect.value) {
  return KEYS[keyValue] || KEYS.C;
}

function keyAlteration(note, key = keySignature()) {
  if (!key.steps.includes(note.step)) return 0;
  return key.type === "sharp" ? 1 : -1;
}

function applyKey(note, key = keySignature()) {
  const alteration = keyAlteration(note, key);
  return {
    ...note,
    midi: note.midi + alteration,
    keyAccidental: alteration === 1 ? "#" : alteration === -1 ? "b" : ""
  };
}

function notePool(keyValue = els.keySelect.value) {
  const mode = els.rangeSelect.value;
  const key = keySignature(keyValue);
  let pool = NOTES
    .map((note) => applyKey(note, key))
    .filter((note) => noteInRange(note, mode));

  if (els.accidentalsSelect.value === "some") {
    const existingMidi = new Set(pool.map((note) => note.midi));
    const chromaticNotes = ACCIDENTALS
      .filter((note) => !existingMidi.has(note.midi))
      .filter((note) => noteInRange(note, mode));
    pool = pool.concat(chromaticNotes);
  }

  return pool;
}

function randomFrom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function targetNotes(target) {
  if (target && target.rest) return [];
  return target && Array.isArray(target.notes) ? target.notes : target ? [target] : [];
}

function targetLeadNote(target) {
  const notes = targetNotes(target);
  return notes[0] || null;
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

function importedNoteForMidi(midi, keyValue, staff) {
  const sharpSpellings = [
    ["C", ""], ["C", "#"], ["D", ""], ["D", "#"], ["E", ""], ["F", ""],
    ["F", "#"], ["G", ""], ["G", "#"], ["A", ""], ["A", "#"], ["B", ""]
  ];
  const flatSpellings = [
    ["C", ""], ["D", "b"], ["D", ""], ["E", "b"], ["E", ""], ["F", ""],
    ["G", "b"], ["G", ""], ["A", "b"], ["A", ""], ["B", "b"], ["B", ""]
  ];
  const key = KEYS[keyValue] || KEYS.C;
  const spellings = key.type === "flat" ? flatSpellings : sharpSpellings;
  const [step, writtenAccidental] = spellings[pitchClass(midi)];
  const keyAccidental = key.steps.includes(step) ? (key.type === "sharp" ? "#" : "b") : "";
  let accidental = "";

  if (writtenAccidental !== keyAccidental) {
    accidental = writtenAccidental || (keyAccidental ? "n" : "");
  }

  return {
    midi,
    step,
    octave: Math.floor(midi / 12) - 1,
    accidental,
    keyAccidental: writtenAccidental === keyAccidental ? keyAccidental : "",
    staff
  };
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
  state.round = pageIndex + 1;
  updateLabels();
  drawScore();
  return true;
}

function importedTargetInKey(target, keyValue, semitoneOffset) {
  if (target.rest) {
    return {
      rest: true,
      ...(target.staffRests ? { staffRests: [...target.staffRests] } : {}),
      ...(target.notationRests ? { notationRests: target.notationRests.map((rest) => ({ ...rest })) } : {})
    };
  }

  const notes = targetNotes(target)
    .map((note) => {
      const pitchedNote = semitoneOffset === 0 && keyValue === state.importedOriginalKey
        ? { ...note }
        : importedNoteForMidi(note.midi + semitoneOffset, keyValue, note.staff);
      return {
        ...pitchedNote,
        voice: note.voice,
        duration: note.duration,
        type: note.type,
        dots: note.dots,
        slurs: note.slurs?.map((slur) => ({ ...slur })),
        ties: note.ties?.map((tie) => ({ ...tie }))
      };
    })
    .sort((a, b) => a.midi - b.midi);
  const transposedTarget = notes.length === 1 ? notes[0] : { notes, playedMidi: [] };
  if (target.staffRests) transposedTarget.staffRests = [...target.staffRests];
  if (target.notationRests) {
    transposedTarget.notationRests = target.notationRests.map((rest) => ({ ...rest }));
  }
  return transposedTarget;
}

function rebuildImportedPages(keyValue, feedbackMessage) {
  const originalTonic = KEY_TONICS[state.importedOriginalKey];
  const selectedTonic = KEY_TONICS[keyValue];
  let semitoneOffset = ((selectedTonic - originalTonic) + 12) % 12;
  if (semitoneOffset > 6) semitoneOffset -= 12;

  const targets = state.importedSourceTargets.map((target) => (
    importedTargetInKey(target, keyValue, semitoneOffset)
  ));
  const pageSize = SYSTEMS_PER_ROUND * MEASURES_PER_SYSTEM * state.beatsPerMeasure;
  const pages = [];
  for (let index = 0; index < targets.length; index += pageSize) {
    const page = targets.slice(index, index + pageSize);
    while (page.length < pageSize) page.push({ rest: true });
    pages.push(page);
  }

  state.importedPages = pages;
  state.importedPageIndex = -1;
  state.nextNotes = [];
  state.nextKey = null;
  els.musicXmlFileStatus.textContent = `${state.importedFileName}.xml · ${keyName(keyValue)} · ${pages.length} score ${pages.length === 1 ? "page" : "pages"}`;
  setFeedback(feedbackMessage, "good");
  startImportedPage(0);
}

function importMusicXml(xmlText, fileName) {
  const score = readMusicXml(xmlText);
  const converted = convertMusicXmlToTargets(score);
  state.importedFileName = fileName.replace(/\.(musicxml|xml)$/i, "");
  state.importedSourceTargets = converted.targets;
  state.importedOriginalKey = converted.keyValue;
  state.beatsPerMeasure = converted.targetsPerMeasure;
  state.beatValue = converted.beatValue;
  state.timeSignature = converted.timeSignature;
  els.rangeSelect.value = "grand";
  els.keySelect.value = converted.keyValue;
  rebuildImportedPages(converted.keyValue, `Loaded ${fileName}`);
}

async function loadMusicXmlFile(file) {
  if (!file) return;
  try {
    importMusicXml(await file.text(), file.name);
  } catch (error) {
    els.musicXmlFileStatus.textContent = "MusicXML import failed";
    setFeedback(error.message || "Could not import MusicXML file", "bad");
  }
}

async function loadIncludedMusicXml() {
  try {
    const response = await fetch(INCLUDED_MUSICXML_FILE);
    if (!response.ok) throw new Error(`Could not load ${INCLUDED_MUSICXML_FILE}`);
    importMusicXml(await response.text(), INCLUDED_MUSICXML_FILE);
  } catch (error) {
    els.musicXmlFileStatus.textContent = "Included MusicXML could not be loaded";
    setFeedback(error.message || "Could not load included MusicXML", "bad");
  }
}

function nextNote(pool, previous) {
  const distance = els.distanceSelect.value;
  if (!previous || distance === "any") return randomFrom(pool);

  const maxDistance = Number(distance);
  const previousIndex = diatonicIndex(previous);
  const nearby = pool.filter((note) => Math.abs(diatonicIndex(note) - previousIndex) <= maxDistance);

  return randomFrom(nearby.length ? nearby : pool);
}

function shouldMakeHarmonicTarget() {
  if (!els.harmonicEnabled.checked) return false;
  return Math.random() * 100 < Number(els.harmonicChanceSelect.value);
}

function makeHarmonicTarget(base, pool) {
  const maxDistance = Number(els.harmonicDistanceSelect.value);
  const chordSize = Number(els.chordSizeSelect.value);
  const baseIndex = diatonicIndex(base);
  const selected = [{ ...base }];
  const candidates = shuffle(pool)
    .filter((note) => note.midi !== base.midi)
    .filter((note) => Math.abs(diatonicIndex(note) - baseIndex) <= maxDistance);

  candidates.forEach((candidate) => {
    if (selected.length >= chordSize) return;

    const testNotes = selected.concat(candidate);
    const indexes = testNotes.map(diatonicIndex);
    const span = Math.max(...indexes) - Math.min(...indexes);

    if (span <= maxDistance) {
      selected.push({ ...candidate });
    }
  });

  if (selected.length < chordSize) {
    return { ...base };
  }

  return {
    notes: selected.sort((a, b) => a.midi - b.midi),
    playedMidi: []
  };
}

function makeNotes(keyValue = els.keySelect.value) {
  const pool = notePool(keyValue);
  const mode = els.rangeSelect.value;
  const notes = [];

  for (let index = 0; index < TARGETS_PER_ROUND; index += 1) {
    const note = nextNote(pool, targetLeadNote(notes[index - 1]));
    const target = shouldMakeHarmonicTarget() ? makeHarmonicTarget(note, pool) : { ...note };
    notes.push(targetWithStaffForMode(target, mode));
  }

  return notes;
}

function keyAfterAdvanceByFourth(keyValue) {
  const currentIndex = FOURTHS_KEY_SEQUENCE.indexOf(keyValue);
  const nextIndex = currentIndex === -1
    ? 0
    : (currentIndex + 1) % FOURTHS_KEY_SEQUENCE.length;

  return FOURTHS_KEY_SEQUENCE[nextIndex];
}

function previewKeyValue() {
  const interval = selectedKeyRoundInterval();
  if (interval <= 0) return els.keySelect.value;

  const roundsUntilKeyChange = state.roundsUntilKeyChange || interval;
  return roundsUntilKeyChange <= 1
    ? keyAfterAdvanceByFourth(els.keySelect.value)
    : els.keySelect.value;
}

function prepareNextRound() {
  state.nextKey = previewKeyValue();
  state.nextNotes = makeNotes(state.nextKey);
}

function makeRound(options = {}) {
  const usePrepared = options.usePrepared !== false;

  state.importedPages = null;
  state.importedSourceTargets = null;
  state.importedOriginalKey = "";
  state.importedPageIndex = -1;
  state.importedFileName = "";
  state.beatsPerMeasure = BEATS_PER_MEASURE;
  state.beatValue = 4;
  state.timeSignature = "4/4";
  els.musicXmlFileStatus.textContent = "Generated exercises";

  if (!usePrepared || !state.nextNotes.length || state.nextKey !== els.keySelect.value) {
    state.notes = makeNotes();
  } else {
    state.notes = state.nextNotes;
  }

  state.current = 0;
  state.round += 1;
  prepareNextRound();
  updateLabels();
  drawScore();
}

function keyName(value) {
  const selectedOption = Array.from(els.keySelect.options).find((option) => option.value === value);
  return selectedOption ? selectedOption.textContent : `${value} major`;
}

function advanceKeyByFourth() {
  const nextKey = keyAfterAdvanceByFourth(els.keySelect.value);

  els.keySelect.value = nextKey;
  setFeedback(`Key changed to ${keyName(nextKey)}`);
}

function selectedKeyRoundInterval() {
  return Number(els.keyIntervalSelect.value);
}

function updateKeyCountdown() {
  if (!state.roundsUntilKeyChange) {
    els.keyCountdown.textContent = "Key changes off";
    return;
  }

  const label = state.roundsUntilKeyChange === 1 ? "round" : "rounds";
  els.keyCountdown.textContent = `Next key in ${state.roundsUntilKeyChange} ${label}`;
}

function resetKeyRoundCounter() {
  const interval = selectedKeyRoundInterval();
  state.roundsUntilKeyChange = interval > 0 ? interval : null;

  updateKeyCountdown();
}

function refreshNextRoundPreview() {
  prepareNextRound();
  updateLabels();
  drawScore();
}

function advanceKeyRoundCounter() {
  const interval = selectedKeyRoundInterval();
  if (interval <= 0) return;

  state.roundsUntilKeyChange = state.roundsUntilKeyChange || interval;
  state.roundsUntilKeyChange -= 1;

  if (state.roundsUntilKeyChange <= 0) {
    advanceKeyByFourth();
    state.roundsUntilKeyChange = interval;
  }

  updateKeyCountdown();
}

function startNextRound(options = {}) {
  if (state.importedPages) {
    startImportedPage(state.importedPageIndex + 1);
    return;
  }

  if (options.countKeyRound) {
    advanceKeyRoundCounter();
  }

  makeRound({ usePrepared: true });
}

function handleKeyChange() {
  if (state.importedSourceTargets) {
    rebuildImportedPages(els.keySelect.value, `Transposed to ${keyName(els.keySelect.value)}`);
    return;
  }

  resetKeyRoundCounter();
  makeRound({ usePrepared: false });
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

function makeVexTarget(target, index, staff, currentIndex) {
  const VF = window.VexFlow;
  const duration = vexDurationForBeatValue(state.beatValue);
  if (target && target.rest) {
    if (target.staffRests && !target.staffRests.includes(staff)) {
      return new VF.GhostNote(duration);
    }
    return new VF.StaveNote({
      clef: staff,
      keys: [staff === "bass" ? "d/3" : "b/4"],
      duration: `${duration}r`
    });
  }

  const notesInStaff = targetNotes(target)
    .filter((note) => staffForNote(note, els.rangeSelect.value) === staff)
    .sort((a, b) => a.midi - b.midi);

  if (!notesInStaff.length) {
    if (target?.staffRests?.includes(staff)) {
      return new VF.StaveNote({
        clef: staff,
        keys: [staff === "bass" ? "d/3" : "b/4"],
        duration: `${duration}r`
      });
    }
    return new VF.GhostNote(duration);
  }

  const staveNote = new VF.StaveNote({
    clef: staff,
    keys: notesInStaff.map(vexKey),
    duration,
    autoStem: true
  });

  notesInStaff.forEach((note, noteIndex) => {
    if (note.accidental) {
      staveNote.addModifier(new VF.Accidental(note.accidental), noteIndex);
    }
  });

  staveNote.setStyle(noteStyleForIndex(index, currentIndex, target));
  registerRenderedTargetNote(index, staveNote);
  return staveNote;
}

function makeBeamsForMeasure(staveNotes) {
  const VF = window.VexFlow;
  if (!VF.Beam || state.beatValue < 8) return [];

  const [numerator, denominator] = state.timeSignature.split("/").map(Number);
  const slotsPerWrittenBeat = state.beatValue / denominator;
  const slotsPerBeam = denominator === 8 && numerator > 3 && numerator % 3 === 0
    ? slotsPerWrittenBeat * 3
    : slotsPerWrittenBeat;
  if (!Number.isInteger(slotsPerBeam) || slotsPerBeam < 1) return [];

  const beams = [];
  for (let start = 0; start < staveNotes.length; start += slotsPerBeam) {
    const beatNotes = staveNotes.slice(start, start + slotsPerBeam);
    let group = [];
    const finishGroup = () => {
      if (group.length > 1) {
        const beam = new VF.Beam(group, true);
        group.forEach((note) => note.setStemLength(45));
        beams.push(beam);
      }
      group = [];
    };

    beatNotes.forEach((note) => {
      const isBeamableNote = note.getCategory?.() === "StaveNote" && !note.isRest?.();
      if (isBeamableNote) group.push(note);
      else finishGroup();
    });
    finishGroup();
  }
  return beams;
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
      const staveNote = new VF.StaveNote({
        clef: staff,
        keys: rest
          ? [rest.displayKey || (staff === "bass" ? "d/3" : "b/4")]
          : notes.map(vexKey),
        duration,
        autoStem: true
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

function drawVexScore(container, notes, currentIndex, keyValue) {
  const VF = window.VexFlow;
  if (!VF) {
    container.textContent = "VexFlow failed to load";
    return;
  }
  renderedTargetNotes = new Map();

  const width = Math.max(container.clientWidth || 960, 960);
  const systemSpacing = 300;
  const height = 1280;
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

  for (let systemIndex = 0; systemIndex < SYSTEMS_PER_ROUND; systemIndex += 1) {
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
      const voices = state.importedPages
        ? staves.flatMap(({ clef, stave }) => (
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
        ))
        : staves.map(({ clef, stave }) => {
        const staveNotes = measureTargets.map((target, index) => (
          makeVexTarget(target, targetOffset + index, clef, currentIndex)
        ));
        const beams = makeBeamsForMeasure(staveNotes);
        const voice = new VF.Voice({ num_beats: state.beatsPerMeasure, beat_value: state.beatValue })
          .setStrict(false)
          .addTickables(staveNotes);

          return { voice, stave, beams, staff: clef };
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
  drawVexScore(els.score, state.notes, state.current, els.keySelect.value);
}

function updateLabels() {
  const target = state.notes[state.current];
  const noteCount = targetNotes(target).length;
  els.roundLabel.textContent = state.importedPages
    ? `${state.importedFileName} · Page ${state.importedPageIndex + 1} of ${state.importedPages.length}`
    : `Round ${state.round}`;
  els.targetLabel.textContent = target
    ? `Play the highlighted ${noteCount > 1 ? "chord" : "note"}`
    : "Round complete";
  els.scoreValue.textContent = state.correct;
  els.missValue.textContent = state.missed;
  els.streakValue.textContent = state.streak;
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
    state.streak += 1;
    if (target.missed) target.corrected = true;
    state.current = firstPlayableTargetIndex(state.notes, state.current + 1);
    setFeedback("Correct", "good");
  } else {
    state.missed += 1;
    state.streak = 0;
    target.missed = true;
    setFeedback(`Heard ${midiToName(midi)}`, "bad");
  }

  if (state.current >= state.notes.length) {
    setFeedback("Round complete", "good");
    const completedPage = state.notes;
    startNextRound({ countKeyRound: true });
    if (state.notes !== completedPage) return;
  }

  updateLabels();
  refreshRenderedTargetStyle(targetIndex);
  if (state.current !== targetIndex) refreshRenderedTargetStyle(state.current);
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
  if (event.repeat) return;

  if (event.code === "Space") {
    const target = state.notes[state.current];
    if (!target) return;

    event.preventDefault();
    const notes = targetNotes(target);
    notes.forEach((note) => state.heldMidi.add(note.midi));
    handlePlayedNote(notes[notes.length - 1].midi);
    notes.forEach((note) => state.heldMidi.delete(note.midi));
    return;
  }

  if (!state.demoMode) return;
  const keyIndex = KEYBOARD_KEYS.indexOf(event.key.toLowerCase());
  if (keyIndex === -1) return;

  const pool = notePool();
  const target = state.notes[state.current];
  const leadNote = targetLeadNote(target);
  const targetIndex = Math.max(0, pool.findIndex((note) => leadNote && note.midi === leadNote.midi));
  const start = Math.max(0, Math.min(pool.length - KEYBOARD_KEYS.length, targetIndex - 3));
  const mappedNote = pool[start + keyIndex];

  if (mappedNote) {
    state.heldMidi.add(mappedNote.midi);
    handlePlayedNote(mappedNote.midi);
    state.heldMidi.delete(mappedNote.midi);
  }
}

els.connectMidi.addEventListener("click", connectMidi);
els.toggleControls.addEventListener("click", () => setControlsCollapsed(true));
els.showControls.addEventListener("click", () => setControlsCollapsed(false));
els.midiInputs.addEventListener("change", selectMidiInput);
els.musicXmlFile.addEventListener("change", () => loadMusicXmlFile(els.musicXmlFile.files[0]));
els.loadIncludedMusicXml.addEventListener("click", loadIncludedMusicXml);
els.newRound.addEventListener("click", () => startNextRound({ countKeyRound: true }));
els.demoMode.addEventListener("click", toggleDemoMode);
els.rangeSelect.addEventListener("change", () => makeRound({ usePrepared: false }));
els.keySelect.addEventListener("change", handleKeyChange);
els.keyIntervalSelect.addEventListener("change", () => {
  resetKeyRoundCounter();
  refreshNextRoundPreview();
});
els.accidentalsSelect.addEventListener("change", () => makeRound({ usePrepared: false }));
els.distanceSelect.addEventListener("change", () => makeRound({ usePrepared: false }));
els.harmonicEnabled.addEventListener("change", () => makeRound({ usePrepared: false }));
els.harmonicDistanceSelect.addEventListener("change", () => makeRound({ usePrepared: false }));
els.harmonicChanceSelect.addEventListener("change", () => makeRound({ usePrepared: false }));
els.chordSizeSelect.addEventListener("change", () => makeRound({ usePrepared: false }));
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

initializeNotation().then(() => makeRound({ usePrepared: false }));
