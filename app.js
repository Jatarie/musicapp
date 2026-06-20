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
const MEASURES_PER_SYSTEM = 4;
const BEATS_PER_MEASURE = 4;
const TARGETS_PER_ROUND = SYSTEMS_PER_ROUND * MEASURES_PER_SYSTEM * BEATS_PER_MEASURE;
const INCLUDED_MIDI_FILE = "gymnopedie-no-1-satie.mid";
const INCLUDED_MIDI_BASE64 = "TVRoZAAAAAYAAQACAeBNVHJrAAAEBwD/AwZQaWFubwAA/1gEAwIYCAD/WQICAAD/UQMQ9EcAsHkAAMAAALAHZAAKQABbAABdAAD/IQEAsGCQTiGDX04AAVEjg19RAAFPJYNfTwABTieDX04AAUkqg19JAAFHLINfRwABSS6DX0kAAUoxg19KAAFFLYsfRQABQiGDYEIArQBOIYNfTgABUSODX1EAAU8lg19PAAFOJ4NfTgABSSmDX0kAAUcrg19HAAFJLYNfSQABSi+DX0oAAUUxix9FAAFJLIsfSQABTieLH04AAUAhoAdAAIFZRTGDX0UAAUcyg19HAAFININfSAABTDaDX0wAAUo3g19KAAFHOYNfRwABSjuDX0oAAUg8g19IAAFHPoNfRwABSkCSL0oAMUoxg19KAAFMM4NfTAABTTWDX00AAU83g19PAAFROYNfUQABSDuDX0gAAUo9g19KAAFMQINfTAABSj6DX0oAAUc7g19HAAFKOZIvSgAxSjGDX0oAAU8zix9PAAFOOYsfTgABR0CDX0cAAUU+g19FAAFHO4NfRwABSTmDX0kAAUo2g19KAAFMNINfTAABSTGDX0kAAUoxg19KAAFMLoNfTAABQiuDYDkoAD4og185AAA+AAE7JQA+JQBDJYNfQgAAOwAAPgAAQwABPCEAQCEARSEASCGKVzwAAEAAAEUAAEgAST4hAEIhAEUhAEohilc+AABCAABFAABKALEpTiGDX04AAVEkg19RAAFPJ4NfTwABTiqDX04AAUktg19JAAFHMYNfRwABSSyDX0kAAUong19KAAFFIYsfRQABQiGDYEIArQBOIYNfTgABUSODX1EAAU8lg19PAAFOJ4NfTgABSSmDX0kAAUcrg19HAAFJLYNfSQABSi+DX0oAAUUxix9FAAFJLYsfSQABTimLH04AAUAloE9AAIERRTGDX0UAAUczg19HAAFINoNfSAABTDiDX0wAAUo7g19KAAFHPYNfRwABSkCDX0oAAUg7g19IAAFHNoNfRwABSjGSL0oAMUoxg19KAAFMM4NfTAABTTWDX00AAU83g19PAAFROYNfUQABSDuDX0gAAUo9g19KAAFMQINfTAABSj6DX0oAAUc7g19HAAFKOZIvSgAxSjGDX0oAAU8zix9PAAFNOYsfTQABR0CDX0cAAUg/g19IAAFNPYNf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";
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
  importedPageIndex: -1,
  importedFileName: ""
};

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
  midiFile: document.querySelector("#midiFile"),
  loadIncludedMidi: document.querySelector("#loadIncludedMidi"),
  midiFileStatus: document.querySelector("#midiFileStatus"),
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

function readMidiFile(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  let offset = 0;

  const readText = (length) => {
    const value = new TextDecoder().decode(bytes.slice(offset, offset + length));
    offset += length;
    return value;
  };
  const readUint16 = () => {
    const value = view.getUint16(offset);
    offset += 2;
    return value;
  };
  const readUint32 = () => {
    const value = view.getUint32(offset);
    offset += 4;
    return value;
  };
  const readVlq = (trackEnd) => {
    let value = 0;
    let byte;
    do {
      if (offset >= trackEnd) throw new Error("Unexpected end of MIDI track");
      byte = bytes[offset];
      offset += 1;
      value = (value * 128) + (byte & 0x7f);
    } while (byte & 0x80);
    return value;
  };

  if (readText(4) !== "MThd") throw new Error("Not a Standard MIDI file");
  const headerLength = readUint32();
  if (headerLength < 6) throw new Error("Invalid MIDI header");
  const format = readUint16();
  const trackCount = readUint16();
  const division = readUint16();
  offset += headerLength - 6;

  if (format > 1) throw new Error("MIDI format 2 is not supported");
  if (division & 0x8000) throw new Error("SMPTE-timed MIDI files are not supported");

  const noteEvents = [];
  const trackNames = [];
  let timeSignature = null;
  let keySignature = null;

  for (let trackIndex = 0; trackIndex < trackCount; trackIndex += 1) {
    if (readText(4) !== "MTrk") throw new Error("Invalid MIDI track header");
    const trackLength = readUint32();
    const trackEnd = offset + trackLength;
    let tick = 0;
    let runningStatus = null;

    while (offset < trackEnd) {
      tick += readVlq(trackEnd);
      let status = bytes[offset];
      if (status < 0x80) {
        if (runningStatus === null) throw new Error("Invalid MIDI running status");
        status = runningStatus;
      } else {
        offset += 1;
        if (status < 0xf0) runningStatus = status;
      }

      if (status === 0xff) {
        const type = bytes[offset];
        offset += 1;
        const length = readVlq(trackEnd);
        const data = bytes.slice(offset, offset + length);
        offset += length;

        if (type === 0x03) {
          trackNames[trackIndex] = new TextDecoder().decode(data).replace(/\0/g, "").trim();
        } else if (type === 0x58 && data.length >= 2 && !timeSignature) {
          timeSignature = { numerator: data[0], denominator: 2 ** data[1] };
        } else if (type === 0x59 && data.length >= 2 && !keySignature) {
          keySignature = { sharpsFlats: data[0] > 127 ? data[0] - 256 : data[0], minor: data[1] === 1 };
        }
        continue;
      }

      if (status === 0xf0 || status === 0xf7) {
        offset += readVlq(trackEnd);
        continue;
      }

      const messageType = status & 0xf0;
      const dataLength = messageType === 0xc0 || messageType === 0xd0 ? 1 : 2;
      const firstData = bytes[offset];
      const secondData = dataLength === 2 ? bytes[offset + 1] : 0;
      offset += dataLength;

      if (messageType === 0x90 && secondData > 0) {
        noteEvents.push({ tick, midi: firstData, trackIndex });
      }
    }

    offset = trackEnd;
  }

  return {
    division,
    noteEvents,
    trackNames,
    timeSignature: timeSignature || { numerator: 4, denominator: 4 },
    keySignature: keySignature || { sharpsFlats: 0, minor: false }
  };
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

function convertMidiToTargets(midi) {
  const { numerator, denominator } = midi.timeSignature;
  if (![1, 2, 4, 8, 16].includes(denominator)) throw new Error(`Unsupported ${numerator}/${denominator} meter`);
  if (!midi.noteEvents.length) throw new Error("The MIDI file contains no note events");

  const keyValue = keyValueForMidiSignature(midi.keySignature.sharpsFlats);
  const eventsByTrack = new Map();
  midi.noteEvents.forEach((event) => {
    const values = eventsByTrack.get(event.trackIndex) || [];
    values.push(event.midi);
    eventsByTrack.set(event.trackIndex, values);
  });
  const tracksByPitch = [...eventsByTrack.entries()]
    .map(([trackIndex, values]) => ({
      trackIndex,
      average: values.reduce((sum, value) => sum + value, 0) / values.length
    }))
    .sort((a, b) => a.average - b.average);
  const staffByTrack = new Map();
  tracksByPitch.forEach(({ trackIndex, average }, index) => {
    const staff = tracksByPitch.length === 1
      ? (average < 60 ? "bass" : "treble")
      : (index < tracksByPitch.length / 2 ? "bass" : "treble");
    staffByTrack.set(trackIndex, staff);
  });

  const eventsByBeat = new Map();
  const ticksPerBeat = midi.division * (4 / denominator);
  midi.noteEvents.forEach((event) => {
    const beat = Math.round(event.tick / ticksPerBeat);
    const events = eventsByBeat.get(beat) || [];
    events.push(event);
    eventsByBeat.set(beat, events);
  });
  const finalBeat = Math.max(...eventsByBeat.keys());
  const targets = [];

  for (let beat = 0; beat <= finalBeat; beat += 1) {
    const events = eventsByBeat.get(beat) || [];
    const uniqueEvents = [...new Map(events.map((event) => [event.midi, event])).values()];
    if (!uniqueEvents.length) {
      targets.push({ rest: true });
      continue;
    }

    const notes = uniqueEvents
      .map((event) => importedNoteForMidi(event.midi, keyValue, staffByTrack.get(event.trackIndex)))
      .sort((a, b) => a.midi - b.midi);
    targets.push(notes.length === 1 ? notes[0] : { notes, playedMidi: [] });
  }

  return { targets, keyValue, numerator, denominator };
}

function firstPlayableTargetIndex(targets, startIndex = 0) {
  let index = startIndex;
  while (index < targets.length && targets[index].rest) index += 1;
  return index;
}

function startImportedPage(pageIndex) {
  const page = state.importedPages && state.importedPages[pageIndex];
  if (!page) {
    setFeedback("MIDI piece complete", "good");
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

function importMidiArrayBuffer(arrayBuffer, fileName) {
  const midi = readMidiFile(arrayBuffer);
  const converted = convertMidiToTargets(midi);
  const pageSize = SYSTEMS_PER_ROUND * MEASURES_PER_SYSTEM * converted.numerator;
  const pages = [];

  for (let index = 0; index < converted.targets.length; index += pageSize) {
    const page = converted.targets.slice(index, index + pageSize);
    while (page.length < pageSize) page.push({ rest: true });
    pages.push(page);
  }

  state.importedPages = pages;
  state.importedPageIndex = -1;
  state.importedFileName = fileName.replace(/\.(mid|midi)$/i, "");
  state.beatsPerMeasure = converted.numerator;
  state.beatValue = converted.denominator;
  state.timeSignature = `${converted.numerator}/${converted.denominator}`;
  state.nextNotes = [];
  state.nextKey = null;
  els.rangeSelect.value = "grand";
  els.keySelect.value = converted.keyValue;
  els.midiFileStatus.textContent = `${fileName} · ${pages.length} score ${pages.length === 1 ? "page" : "pages"}`;
  setFeedback(`Loaded ${fileName}`, "good");
  startImportedPage(0);
}

async function loadMidiFile(file) {
  if (!file) return;
  try {
    importMidiArrayBuffer(await file.arrayBuffer(), file.name);
  } catch (error) {
    els.midiFileStatus.textContent = "MIDI import failed";
    setFeedback(error.message || "Could not import MIDI file", "bad");
  }
}

function loadIncludedMidi() {
  try {
    const binary = atob(INCLUDED_MIDI_BASE64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    importMidiArrayBuffer(bytes.buffer, INCLUDED_MIDI_FILE);
  } catch (error) {
    els.midiFileStatus.textContent = "Included MIDI could not be decoded";
    setFeedback(error.message || "Could not decode included MIDI", "bad");
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
  state.importedPageIndex = -1;
  state.importedFileName = "";
  state.beatsPerMeasure = BEATS_PER_MEASURE;
  state.beatValue = 4;
  state.timeSignature = "4/4";
  els.midiFileStatus.textContent = "Generated exercises";

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

function makeVexTarget(target, index, staff, currentIndex) {
  const VF = window.VexFlow;
  const duration = vexDurationForBeatValue(state.beatValue);
  if (target && target.rest) {
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
  return staveNote;
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

  const width = Math.max(container.clientWidth || 960, 960);
  const systemSpacing = 300;
  const height = 1280;
  const pageMargin = 18;
  const systemWidth = width - (pageMargin * 2);
  const firstMeasureWidth = systemWidth * 0.28;
  const otherMeasureWidth = (systemWidth - firstMeasureWidth) / (MEASURES_PER_SYSTEM - 1);

  container.innerHTML = "";
  container.style.minHeight = `${height}px`;

  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(width, height);

  const context = renderer.getContext();
  context.setBackgroundFillStyle("#fffdf8");

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

  for (let systemIndex = 0; systemIndex < SYSTEMS_PER_ROUND; systemIndex += 1) {
    const trebleY = 74 + (systemIndex * systemSpacing);
    const bassY = trebleY + 110;
    let measureX = pageMargin;

    for (let measureIndex = 0; measureIndex < MEASURES_PER_SYSTEM; measureIndex += 1) {
      const isSystemStart = measureIndex === 0;
      const isScoreStart = systemIndex === 0 && isSystemStart;
      const measureWidth = isSystemStart ? firstMeasureWidth : otherMeasureWidth;
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
      const voices = staves.map(({ clef, stave }) => {
        const staveNotes = measureTargets.map((target, index) => (
          makeVexTarget(target, targetOffset + index, clef, currentIndex)
        ));
        const voice = new VF.Voice({ num_beats: state.beatsPerMeasure, beat_value: state.beatValue })
          .setStrict(false)
          .addTickables(staveNotes);

        return { voice, stave };
      });
      const vexVoices = voices.map(({ voice }) => voice);
      const noteAreaWidth = Math.min(
        ...staves.map(({ stave }) => stave.getNoteEndX() - stave.getNoteStartX())
      ) - 12;

      new VF.Formatter()
        .joinVoices(vexVoices)
        .format(vexVoices, noteAreaWidth);
      voices.forEach(({ voice, stave }) => voice.draw(context, stave));

      measureX += measureWidth;
    }
  }
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
  const target = state.notes[state.current];
  if (!target) return;

  const expectedNotes = targetNotes(target);
  const expectedMidi = expectedNotes.map((note) => note.midi);
  const isExpected = expectedMidi.includes(midi);

  if (isExpected) {
    target.playedMidi = target.playedMidi || [];
    if (!target.playedMidi.includes(midi)) {
      target.playedMidi.push(midi);
    }

    const isComplete = expectedMidi.every((noteMidi) => target.playedMidi.includes(noteMidi));
    if (!isComplete) {
      const remaining = expectedMidi.length - target.playedMidi.length;
      const label = remaining === 1 ? "note" : "notes";
      setFeedback(`${remaining} ${label} left`, "good");
      updateLabels();
      drawScore();
      return;
    }

    state.correct += 1;
    state.streak += 1;
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
    startNextRound({ countKeyRound: true });
  }

  updateLabels();
  drawScore();
}

function midiToName(midi) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return `${names[pitchClass(midi)]}${Math.floor(midi / 12) - 1}`;
}

function onMidiMessage(event) {
  const [status, note, velocity] = event.data;
  const command = status & 0xf0;
  if (command === 0x90 && velocity > 0) {
    handlePlayedNote(note);
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
    targetNotes(target).forEach((note) => handlePlayedNote(note.midi));
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
    handlePlayedNote(mappedNote.midi);
  }
}

els.connectMidi.addEventListener("click", connectMidi);
els.toggleControls.addEventListener("click", () => setControlsCollapsed(true));
els.showControls.addEventListener("click", () => setControlsCollapsed(false));
els.midiInputs.addEventListener("change", selectMidiInput);
els.midiFile.addEventListener("change", () => loadMidiFile(els.midiFile.files[0]));
els.loadIncludedMidi.addEventListener("click", loadIncludedMidi);
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
