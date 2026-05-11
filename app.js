const NOTES = [
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
  { midi: 84, step: "C", octave: 6 }
];

const ACCIDENTALS = [
  { midi: 61, step: "C", octave: 4, accidental: "#" },
  { midi: 63, step: "D", octave: 4, accidental: "#" },
  { midi: 66, step: "F", octave: 4, accidental: "#" },
  { midi: 68, step: "G", octave: 4, accidental: "#" },
  { midi: 70, step: "A", octave: 4, accidental: "#" },
  { midi: 73, step: "C", octave: 5, accidental: "#" },
  { midi: 75, step: "D", octave: 5, accidental: "#" },
  { midi: 78, step: "F", octave: 5, accidental: "#" },
  { midi: 80, step: "G", octave: 5, accidental: "#" }
];

const STEP_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const KEYBOARD_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k"];
const KEYS = {
  C: { type: "natural", steps: [] },
  G: { type: "sharp", steps: ["F"] },
  D: { type: "sharp", steps: ["F", "C"] },
  A: { type: "sharp", steps: ["F", "C", "G"] },
  E: { type: "sharp", steps: ["F", "C", "G", "D"] },
  B: { type: "sharp", steps: ["F", "C", "G", "D", "A"] },
  F: { type: "flat", steps: ["B"] },
  Bb: { type: "flat", steps: ["B", "E"] },
  Eb: { type: "flat", steps: ["B", "E", "A"] },
  Ab: { type: "flat", steps: ["B", "E", "A", "D"] },
  Db: { type: "flat", steps: ["B", "E", "A", "D", "G"] },
  Gb: { type: "flat", steps: ["B", "E", "A", "D", "G", "C"] }
};
const SIGNATURE_NOTES = {
  treble: {
    sharp: [
      { step: "F", octave: 5 },
      { step: "C", octave: 5 },
      { step: "G", octave: 5 },
      { step: "D", octave: 5 },
      { step: "A", octave: 4 },
      { step: "E", octave: 5 },
      { step: "B", octave: 4 }
    ],
    flat: [
      { step: "B", octave: 4 },
      { step: "E", octave: 5 },
      { step: "A", octave: 4 },
      { step: "D", octave: 5 },
      { step: "G", octave: 4 },
      { step: "C", octave: 5 },
      { step: "F", octave: 4 }
    ]
  },
  bass: {
    sharp: [
      { step: "F", octave: 3 },
      { step: "C", octave: 3 },
      { step: "G", octave: 3 },
      { step: "D", octave: 3 },
      { step: "A", octave: 2 },
      { step: "E", octave: 3 },
      { step: "B", octave: 2 }
    ],
    flat: [
      { step: "B", octave: 2 },
      { step: "E", octave: 3 },
      { step: "A", octave: 2 },
      { step: "D", octave: 3 },
      { step: "G", octave: 2 },
      { step: "C", octave: 3 },
      { step: "F", octave: 2 }
    ]
  }
};

const state = {
  midiAccess: null,
  midiInput: null,
  notes: [],
  current: 0,
  round: 0,
  correct: 0,
  missed: 0,
  streak: 0,
  demoMode: false
};

const els = {
  midiStatus: document.querySelector("#midiStatus"),
  midiInputs: document.querySelector("#midiInputs"),
  connectMidi: document.querySelector("#connectMidi"),
  rangeSelect: document.querySelector("#rangeSelect"),
  lengthSelect: document.querySelector("#lengthSelect"),
  keySelect: document.querySelector("#keySelect"),
  accidentalsSelect: document.querySelector("#accidentalsSelect"),
  distanceSelect: document.querySelector("#distanceSelect"),
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

function diatonicIndex(note) {
  return note.octave * 7 + STEP_INDEX[note.step];
}

function staffTop(staff, mode) {
  return staff === "bass" && mode === "grand" ? 282 : 142;
}

function staffBottom(staff, mode) {
  return staffTop(staff, mode) + 56;
}

function staffMiddle(staff, mode) {
  return staffTop(staff, mode) + 28;
}

function staffForNote(note, mode) {
  if (mode === "bass") return "bass";
  if (mode === "treble") return "treble";
  return note.midi < 60 ? "bass" : "treble";
}

function yForNote(note, mode) {
  const staff = staffForNote(note, mode);
  const bottomLineNote = staff === "bass"
    ? 2 * 7 + STEP_INDEX.G
    : 4 * 7 + STEP_INDEX.E;

  return staffBottom(staff, mode) - (diatonicIndex(note) - bottomLineNote) * 7;
}

function noteInRange(note, mode) {
  if (mode === "treble") return note.midi >= 60 && note.midi <= 81;
  if (mode === "bass") return note.midi >= 40 && note.midi <= 62;
  return note.midi >= 40 && note.midi <= 81;
}

function keySignature() {
  return KEYS[els.keySelect.value] || KEYS.C;
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

function notePool() {
  const mode = els.rangeSelect.value;
  const key = keySignature();
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

function nextNote(pool, previous) {
  const distance = els.distanceSelect.value;
  if (!previous || distance === "any") return randomFrom(pool);

  const maxDistance = Number(distance);
  const previousIndex = diatonicIndex(previous);
  const nearby = pool.filter((note) => Math.abs(diatonicIndex(note) - previousIndex) <= maxDistance);

  return randomFrom(nearby.length ? nearby : pool);
}

function makeRound() {
  const pool = notePool();
  const length = Number(els.lengthSelect.value);
  state.notes = [];

  for (let index = 0; index < length; index += 1) {
    const note = nextNote(pool, state.notes[index - 1]);
    state.notes.push({ ...note });
  }

  state.current = 0;
  state.round += 1;
  updateLabels();
  drawScore();
}

function drawStaff(svg, y, clef, label) {
  const clefSymbol = clef === "treble" ? "&#119070;" : "&#119074;";
  const clefY = clef === "treble" ? y + 55 : y + 40;
  const lines = Array.from({ length: 5 }, (_, index) => {
    const lineY = y + index * 14;
    return `<line class="staff-line" x1="70" y1="${lineY}" x2="930" y2="${lineY}"></line>`;
  }).join("");
  return `
    <text class="clef clef-${clef}" x="88" y="${clefY}">${clefSymbol}</text>
    ${lines}
  `;
}

function drawKeySignature(staff, mode) {
  const key = keySignature();
  if (key.type === "natural") return "";

  const symbol = key.type === "sharp" ? "&#9839;" : "&#9837;";
  const marks = SIGNATURE_NOTES[staff][key.type].slice(0, key.steps.length);
  const yOffset = key.type === "sharp" ? 13 : 6;
  return marks.map((note, index) => {
    const x = 132 + index * 15;
    const y = yForNote({ ...note, midi: staff === "bass" ? 48 : 72 }, mode) + yOffset;
    return `<text class="key-signature key-signature-${key.type}" x="${x}" y="${y}">${symbol}</text>`;
  }).join("");
}

function ledgerLines(x, y, staff, mode) {
  const top = staffTop(staff, mode);
  const bottom = staffBottom(staff, mode);
  const lines = [];

  for (let lineY = bottom + 14; lineY <= y + 1; lineY += 14) {
    lines.push(`<line class="ledger-line" x1="${x - 18}" y1="${lineY}" x2="${x + 18}" y2="${lineY}"></line>`);
  }

  for (let lineY = top - 14; lineY >= y - 1; lineY -= 14) {
    lines.push(`<line class="ledger-line" x1="${x - 18}" y1="${lineY}" x2="${x + 18}" y2="${lineY}"></line>`);
  }

  return lines.join("");
}

function drawScore() {
  const mode = els.rangeSelect.value;
  const width = 980;
  const height = mode === "grand" ? 410 : 270;
  const noteStart = 155 + keySignature().steps.length * 16;
  const noteGap = 760 / Math.max(state.notes.length, 1);

  const staves = mode === "bass"
    ? `${drawStaff(null, 142, "bass", "Bass")}${drawKeySignature("bass", mode)}`
    : mode === "treble"
      ? `${drawStaff(null, 142, "treble", "Treble")}${drawKeySignature("treble", mode)}`
      : `${drawStaff(null, 142, "treble", "Treble")}${drawKeySignature("treble", mode)}${drawStaff(null, 282, "bass", "Bass")}${drawKeySignature("bass", mode)}`;

  const notes = state.notes.map((note, index) => {
    const x = noteStart + index * noteGap;
    const y = yForNote(note, mode);
    const staff = staffForNote(note, mode);
    const className = [
      "note",
      index === state.current ? "active" : "",
      index < state.current ? "correct" : "",
      note.missed ? "missed" : ""
    ].filter(Boolean).join(" ");
    const stemDirection = y < staffMiddle(staff, mode) ? "down" : "up";
    const stem = stemDirection === "up"
      ? `<line class="stem" x1="${x + 11}" y1="${y}" x2="${x + 11}" y2="${y - 48}"></line>`
      : `<line class="stem" x1="${x - 11}" y1="${y}" x2="${x - 11}" y2="${y + 48}"></line>`;
    const accidental = note.accidental
      ? `<text class="accidental" x="${x - 34}" y="${y + 8}">${note.accidental === "#" ? "&#9839;" : "&#9837;"}</text>`
      : "";

    return `
      <g class="${className}">
        ${ledgerLines(x, y, staff, mode)}
        ${accidental}
        <ellipse class="note-head" cx="${x}" cy="${y}" rx="11" ry="8" transform="rotate(-18 ${x} ${y})"></ellipse>
        ${stem}
      </g>
    `;
  }).join("");

  els.score.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#fffdf8"></rect>
      ${staves}
      ${notes}
    </svg>
  `;
}

function updateLabels() {
  const target = state.notes[state.current];
  els.roundLabel.textContent = `Round ${state.round}`;
  els.targetLabel.textContent = target ? "Play the highlighted note" : "Round complete";
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

  if (midi === target.midi) {
    state.correct += 1;
    state.streak += 1;
    state.current += 1;
    setFeedback("Correct", "good");
  } else {
    state.missed += 1;
    state.streak = 0;
    target.missed = true;
    setFeedback(`Heard ${midiToName(midi)}`, "bad");
  }

  if (state.current >= state.notes.length) {
    setFeedback("Round complete", "good");
    makeRound();
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

function refreshMidiInputs() {
  const inputs = state.midiAccess ? Array.from(state.midiAccess.inputs.values()) : [];
  els.midiInputs.innerHTML = "";

  if (!inputs.length) {
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
  if (!navigator.requestMIDIAccess) {
    setFeedback("Web MIDI is not available in this browser", "bad");
    els.midiStatus.textContent = "Unsupported browser";
    return;
  }

  try {
    state.midiAccess = await navigator.requestMIDIAccess();
    state.midiAccess.onstatechange = refreshMidiInputs;
    refreshMidiInputs();
    selectMidiInput();
  } catch (error) {
    setFeedback("MIDI permission was not granted", "bad");
    els.midiStatus.textContent = "MIDI blocked";
  }
}

function selectMidiInput() {
  if (!state.midiAccess) return;

  if (state.midiInput) {
    state.midiInput.onmidimessage = null;
  }

  const inputId = els.midiInputs.value;
  const input = inputId
    ? state.midiAccess.inputs.get(inputId)
    : Array.from(state.midiAccess.inputs.values())[0];

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
  if (!state.demoMode || event.repeat) return;
  const keyIndex = KEYBOARD_KEYS.indexOf(event.key.toLowerCase());
  if (keyIndex === -1) return;

  const pool = notePool();
  const target = state.notes[state.current];
  const targetIndex = Math.max(0, pool.findIndex((note) => note.midi === target.midi));
  const start = Math.max(0, Math.min(pool.length - KEYBOARD_KEYS.length, targetIndex - 3));
  const mappedNote = pool[start + keyIndex];

  if (mappedNote) {
    handlePlayedNote(mappedNote.midi);
  }
}

els.connectMidi.addEventListener("click", connectMidi);
els.midiInputs.addEventListener("change", selectMidiInput);
els.newRound.addEventListener("click", makeRound);
els.demoMode.addEventListener("click", toggleDemoMode);
els.rangeSelect.addEventListener("change", makeRound);
els.lengthSelect.addEventListener("change", makeRound);
els.keySelect.addEventListener("change", makeRound);
els.accidentalsSelect.addEventListener("change", makeRound);
els.distanceSelect.addEventListener("change", makeRound);
document.addEventListener("keydown", handleComputerKey);

makeRound();
