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
  accidentalsSelect: document.querySelector("#accidentalsSelect"),
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

function noteName(note) {
  return `${note.step}${note.accidental || ""}${note.octave}`;
}

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

function notePool() {
  const mode = els.rangeSelect.value;
  let pool = NOTES.filter((note) => {
    if (mode === "treble") return note.midi >= 60 && note.midi <= 81;
    if (mode === "bass") return note.midi >= 40 && note.midi <= 62;
    return note.midi >= 40 && note.midi <= 81;
  });

  if (els.accidentalsSelect.value === "some" && mode !== "bass") {
    pool = pool.concat(ACCIDENTALS);
  }

  return pool;
}

function makeRound() {
  const pool = notePool();
  const length = Number(els.lengthSelect.value);
  state.notes = Array.from({ length }, () => ({ ...pool[Math.floor(Math.random() * pool.length)] }));
  state.current = 0;
  state.round += 1;
  updateLabels();
  drawScore();
}

function drawStaff(svg, y, clef, label) {
  const lines = Array.from({ length: 5 }, (_, index) => {
    const lineY = y + index * 14;
    return `<line class="staff-line" x1="70" y1="${lineY}" x2="930" y2="${lineY}"></line>`;
  }).join("");
  return `
    <text class="clef" x="88" y="${y + 50}">${clef}</text>
    <text class="note-label" x="26" y="${y + 34}">${label}</text>
    ${lines}
  `;
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
  const noteGap = 760 / Math.max(state.notes.length, 1);

  const staves = mode === "bass"
    ? drawStaff(null, 142, "F", "Bass")
    : mode === "treble"
      ? drawStaff(null, 142, "G", "Treble")
      : `${drawStaff(null, 142, "G", "Treble")}${drawStaff(null, 282, "F", "Bass")}`;

  const notes = state.notes.map((note, index) => {
    const x = 155 + index * noteGap;
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
      ? `<text class="accidental" x="${x - 34}" y="${y + 8}">${note.accidental}</text>`
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
  els.targetLabel.textContent = target ? `Play ${noteName(target)}` : "Round complete";
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
    window.setTimeout(makeRound, 900);
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
els.accidentalsSelect.addEventListener("change", makeRound);
document.addEventListener("keydown", handleComputerKey);

makeRound();
