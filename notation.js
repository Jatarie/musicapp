(function () {
  const KEY_SIGNATURE_ACCIDENTALS = {
    C: {},
    G: { f: "#" },
    D: { f: "#", c: "#" },
    A: { f: "#", c: "#", g: "#" },
    E: { f: "#", c: "#", g: "#", d: "#" },
    B: { f: "#", c: "#", g: "#", d: "#", a: "#" },
    "F#": { f: "#", c: "#", g: "#", d: "#", a: "#", e: "#" },
    F: { b: "b" },
    Bb: { b: "b", e: "b" },
    Eb: { b: "b", e: "b", a: "b" }
  };

  function initializeVexFlow() {
    if (!window.VexFlow) return Promise.resolve({ ok: false, reason: "missing-vexflow" });
    if (!window.VexFlow.loadFonts || !window.VexFlow.setFonts) {
      return Promise.resolve({ ok: true, reason: "fonts-not-required" });
    }

    return window.VexFlow
      .loadFonts("Bravura", "Academico")
      .then(() => {
        window.VexFlow.setFonts("Bravura", "Academico");
        return { ok: true };
      })
      .catch(() => ({ ok: false, reason: "fonts-unavailable" }));
  }

  function parseVexKey(rawKey) {
    const match = /^([a-g])(bb|b|##|#)?\/(\d)$/i.exec(rawKey);
    if (!match) return null;
    return {
      letter: match[1].toLowerCase(),
      accidental: match[2] || "",
      octave: match[3]
    };
  }

  function inferClefFromKeys(noteKeys) {
    const averageOctave = noteKeys
      .map(parseVexKey)
      .filter(Boolean)
      .reduce((sum, key) => sum + Number(key.octave), 0) / Math.max(noteKeys.length, 1);
    return averageOctave < 4 ? "bass" : "treble";
  }

  function accidentalForKeySignature(keySignature, letter) {
    if (!keySignature) return "";
    const signature = KEY_SIGNATURE_ACCIDENTALS[keySignature];
    if (!signature) return "";
    return signature[letter] || "";
  }

  function addAccidentalsToNote(VF, staveNote, noteKeys, keySignature) {
    noteKeys.forEach((key, index) => {
      const parsed = parseVexKey(key);
      if (!parsed) return;
      const expectedAccidental = accidentalForKeySignature(keySignature, parsed.letter);
      if (parsed.accidental === expectedAccidental) return;
      staveNote.addModifier(new VF.Accidental(parsed.accidental || "n"), index);
    });
  }

  function createExerciseNote(VF, noteKeys, clef, duration, keySignature) {
    const staveNote = new VF.StaveNote({
      clef,
      duration,
      keys: noteKeys.map((key) => {
        const parsed = parseVexKey(key);
        return parsed ? `${parsed.letter}/${parsed.octave}` : key;
      })
    });
    addAccidentalsToNote(VF, staveNote, noteKeys, keySignature);
    return staveNote;
  }

  function noteValueForVexKey(rawKey) {
    const parsed = parseVexKey(rawKey);
    if (!parsed) return null;
    return `${parsed.letter.toUpperCase()}${parsed.accidental}${parsed.octave}`;
  }

  function midiForParsedVexKey(parsed) {
    if (!parsed) return null;
    const semitones = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    const accidentalOffset = (parsed.accidental || "").split("").reduce((sum, accidental) => (
      sum + (accidental === "#" ? 1 : accidental === "b" ? -1 : 0)
    ), 0);
    return ((Number(parsed.octave) + 1) * 12) + semitones[parsed.letter] + accidentalOffset;
  }

  function noteValueForMidi(midi) {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(midi / 12) - 1;
    return `${names[((midi % 12) + 12) % 12]}${octave}`;
  }

  function remapChordNotesToMiddleRegister(noteKeys) {
    const minMidi = 48; // C3
    const maxMidi = 83; // B5
    let midis = noteKeys.map(parseVexKey).map(midiForParsedVexKey).filter((midi) => Number.isFinite(midi));
    if (!midis.length) return [];

    while (Math.max(...midis) > maxMidi) {
      midis = midis.map((midi) => midi - 12);
    }
    while (Math.min(...midis) < minMidi) {
      midis = midis.map((midi) => midi + 12);
    }

    return midis.map(noteValueForMidi);
  }

  function pianoSettingsForNotes(noteKeys) {
    return {
      startOctave: 1,
      startNote: "A",
      endOctave: 7,
      endNote: "C",
      showNoteNames: "onpress",
      showOctaveNumbers: false,
      keyPressStyle: "vivid",
      vividKeyPressColor: "#d1d5db"
    };
  }

  function clearRenderedState(container) {
    if (container._musicAppPiano?.destroy) {
      container._musicAppPiano.destroy();
      container._musicAppPiano = null;
    }
    container._musicAppRenderRoot = null;
    container.innerHTML = "";
  }

  function createRenderRoot(container) {
    const renderRoot = document.createElement("div");
    renderRoot.style.width = "100%";
    renderRoot.style.height = "100%";
    container.appendChild(renderRoot);
    container._musicAppRenderRoot = renderRoot;
    return renderRoot;
  }

  function drawExercisePiano(container, noteKeys, options = {}) {
    if (!window.pianoChart?.Instrument) {
      container.textContent = "Piano chart failed to load";
      return false;
    }

    const notes = remapChordNotesToMiddleRegister(noteKeys);
    if (!notes.length) {
      container.textContent = "Unable to render piano chord";
      return false;
    }

    const height = options.height || 320;
    clearRenderedState(container);
    container.style.minHeight = `${height}px`;
    const renderRoot = createRenderRoot(container);

    const piano = new window.pianoChart.Instrument(renderRoot, pianoSettingsForNotes(noteKeys));
    piano.create();
    notes.forEach((note, index) => {
      if (index === 0) return;
      piano.keyDown(note);
    });
    piano.keyDown(notes[0]);
    container._musicAppPiano = piano;
    return true;
  }

  function drawExerciseChord(container, noteKeys, options = {}) {
    const VF = window.VexFlow;
    const displayMode = options.displayMode || "stacked";

    if (displayMode === "piano") {
      return drawExercisePiano(container, noteKeys, options);
    }

    if (!VF) {
      container.textContent = "VexFlow failed to load";
      return false;
    }

    const scale = options.scale || 1.45;
    const width = Math.max(container.clientWidth || 420, 420);
    const height = options.height || 320;
    const padding = 22;
    const logicalWidth = width / scale;
    const logicalHeight = height / scale;
    const clef = options.clef || inferClefFromKeys(noteKeys);
    const keySignature = options.keySignature || null;

    clearRenderedState(container);
    container.style.minHeight = `${height}px`;
    const renderRoot = createRenderRoot(container);

    const renderer = new VF.Renderer(renderRoot, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);

    const context = renderer.getContext();
    context.setBackgroundFillStyle("#fffdf8");
    context.scale(scale, scale);

    const stave = new VF.Stave(padding, 44, logicalWidth - (padding * 2));
    stave.addClef(clef);
    if (keySignature) stave.addKeySignature(keySignature);
    stave.setContext(context).draw();

    if (displayMode === "arpeggio") {
      const staveNotes = noteKeys.map((key) => createExerciseNote(VF, [key], clef, "8", keySignature));
      const voice = new VF.Voice({ num_beats: Math.max(staveNotes.length, 1), beat_value: 8 })
        .setStrict(false)
        .addTickables(staveNotes);
      const beams = staveNotes.length > 1 ? [new VF.Beam(staveNotes)] : [];
      const arpeggioWidth = Math.max(90, Math.min(stave.getWidth() - 180, 40 + (staveNotes.length * 24)));
      new VF.Formatter().joinVoices([voice]).format([voice], arpeggioWidth);
      voice.draw(context, stave);
      beams.forEach((beam) => beam.setContext(context).draw());
      return true;
    }

    const staveNote = createExerciseNote(VF, noteKeys, clef, "q", keySignature);
    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 })
      .setStrict(false)
      .addTickables([staveNote]);
    new VF.Formatter().joinVoices([voice]).format([voice], Math.max(stave.getWidth() - 80, 120));
    voice.draw(context, stave);
    return true;
  }

  window.MusicAppNotation = {
    drawExerciseChord,
    initializeVexFlow
  };
}());
