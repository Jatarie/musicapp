const NOTES = [
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
  { midi: 88, step: "E", octave: 6 }
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
const FOURTHS_KEY_SEQUENCE = ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "B", "E", "A", "D", "G"];
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
  nextNotes: [],
  nextKey: null,
  current: 0,
  round: 0,
  correct: 0,
  missed: 0,
  streak: 0,
  demoMode: false,
  midiConnectPending: false,
  roundsUntilKeyChange: null
};

const els = {
  midiStatus: document.querySelector("#midiStatus"),
  midiInputs: document.querySelector("#midiInputs"),
  connectMidi: document.querySelector("#connectMidi"),
  rangeSelect: document.querySelector("#rangeSelect"),
  lengthSelect: document.querySelector("#lengthSelect"),
  keySelect: document.querySelector("#keySelect"),
  keyIntervalSelect: document.querySelector("#keyIntervalSelect"),
  keyCountdown: document.querySelector("#keyCountdown"),
  accidentalsSelect: document.querySelector("#accidentalsSelect"),
  distanceSelect: document.querySelector("#distanceSelect"),
  harmonicEnabled: document.querySelector("#harmonicEnabled"),
  harmonicDistanceSelect: document.querySelector("#harmonicDistanceSelect"),
  harmonicChanceSelect: document.querySelector("#harmonicChanceSelect"),
  chordSizeSelect: document.querySelector("#chordSizeSelect"),
  newRound: document.querySelector("#newRound"),
  demoMode: document.querySelector("#demoMode"),
  scoreValue: document.querySelector("#scoreValue"),
  missValue: document.querySelector("#missValue"),
  streakValue: document.querySelector("#streakValue"),
  roundLabel: document.querySelector("#roundLabel"),
  nextRoundLabel: document.querySelector("#nextRoundLabel"),
  targetLabel: document.querySelector("#targetLabel"),
  feedback: document.querySelector("#feedback"),
  score: document.querySelector("#score"),
  nextScore: document.querySelector("#nextScore"),
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
  if (mode === "treble") return note.midi >= 53 && note.midi <= 88;
  if (mode === "bass") return note.midi >= 33 && note.midi <= 67;
  return note.midi >= 33 && note.midi <= 88;
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
  return target && Array.isArray(target.notes) ? target.notes : target ? [target] : [];
}

function targetLeadNote(target) {
  const notes = targetNotes(target);
  return notes[0] || null;
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
  const length = Number(els.lengthSelect.value);
  const notes = [];

  for (let index = 0; index < length; index += 1) {
    const note = nextNote(pool, targetLeadNote(notes[index - 1]));
    notes.push(shouldMakeHarmonicTarget() ? makeHarmonicTarget(note, pool) : { ...note });
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
  if (options.countKeyRound) {
    advanceKeyRoundCounter();
  }

  makeRound({ usePrepared: true });
}

function handleKeyChange() {
  resetKeyRoundCounter();
  makeRound({ usePrepared: false });
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

function drawKeySignature(staff, mode, key = keySignature()) {
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
  const maxLedgerLines = 3;
  const lines = [];

  for (let lineY = bottom + 14, count = 0; lineY <= y + 1 && count < maxLedgerLines; lineY += 14, count += 1) {
    lines.push(`<line class="ledger-line" x1="${x - 18}" y1="${lineY}" x2="${x + 18}" y2="${lineY}"></line>`);
  }

  for (let lineY = top - 14, count = 0; lineY >= y - 1 && count < maxLedgerLines; lineY -= 14, count += 1) {
    lines.push(`<line class="ledger-line" x1="${x - 18}" y1="${lineY}" x2="${x + 18}" y2="${lineY}"></line>`);
  }

  return lines.join("");
}

function drawScoreSvg(notes, currentIndex, keyValue) {
  const mode = els.rangeSelect.value;
  const key = keySignature(keyValue);
  const width = 980;
  const height = mode === "grand" ? 410 : 270;
  const noteStart = 155 + key.steps.length * 16;
  const noteGap = 760 / Math.max(notes.length, 1);

  const staves = mode === "bass"
    ? `${drawStaff(null, 142, "bass", "Bass")}${drawKeySignature("bass", mode, key)}`
    : mode === "treble"
      ? `${drawStaff(null, 142, "treble", "Treble")}${drawKeySignature("treble", mode, key)}`
      : `${drawStaff(null, 142, "treble", "Treble")}${drawKeySignature("treble", mode, key)}${drawStaff(null, 282, "bass", "Bass")}${drawKeySignature("bass", mode, key)}`;

  const noteMarkup = notes.map((target, index) => {
    const x = noteStart + index * noteGap;
    const notesInTarget = targetNotes(target);
    const className = [
      "note",
      index === currentIndex ? "active" : "",
      currentIndex >= 0 && index < currentIndex ? "correct" : "",
      target.missed ? "missed" : ""
    ].filter(Boolean).join(" ");
    const noteHeads = notesInTarget.map((note, noteIndex) => {
      const y = yForNote(note, mode);
      const staff = staffForNote(note, mode);
      const stemDirection = y < staffMiddle(staff, mode) ? "down" : "up";
      const adjacentLowerNote = notesInTarget
        .slice(0, noteIndex)
        .some((otherNote) => Math.abs(diatonicIndex(otherNote) - diatonicIndex(note)) === 1);
      const headX = adjacentLowerNote ? x + 14 : x;
      const stem = stemDirection === "up"
        ? `<line class="stem" x1="${headX + 11}" y1="${y}" x2="${headX + 11}" y2="${y - 48}"></line>`
        : `<line class="stem" x1="${headX - 11}" y1="${y}" x2="${headX - 11}" y2="${y + 48}"></line>`;
      const accidental = note.accidental
        ? `<text class="accidental" x="${x - 34}" y="${y + 8}">${note.accidental === "#" ? "&#9839;" : "&#9837;"}</text>`
        : "";

      return `
        ${ledgerLines(headX, y, staff, mode)}
        ${accidental}
        <ellipse class="note-head" cx="${headX}" cy="${y}" rx="11" ry="8" transform="rotate(-18 ${headX} ${y})"></ellipse>
        ${stem}
      `;
    }).join("");

    return `
      <g class="${className}">
        ${noteHeads}
      </g>
    `;
  }).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#fffdf8"></rect>
      ${staves}
      ${noteMarkup}
    </svg>
  `;
}

function drawScore() {
  els.score.innerHTML = drawScoreSvg(state.notes, state.current, els.keySelect.value);
  els.nextScore.innerHTML = drawScoreSvg(state.nextNotes, -1, state.nextKey || els.keySelect.value);
}

function updateLabels() {
  const target = state.notes[state.current];
  const noteCount = targetNotes(target).length;
  els.roundLabel.textContent = `Round ${state.round}`;
  els.nextRoundLabel.textContent = `Next round: Round ${state.round + 1}`;
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
  if (!state.demoMode || event.repeat) return;
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
els.midiInputs.addEventListener("change", selectMidiInput);
els.newRound.addEventListener("click", () => startNextRound({ countKeyRound: true }));
els.demoMode.addEventListener("click", toggleDemoMode);
els.rangeSelect.addEventListener("change", () => makeRound({ usePrepared: false }));
els.lengthSelect.addEventListener("change", () => makeRound({ usePrepared: false }));
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

makeRound({ usePrepared: false });
