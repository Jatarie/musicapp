(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SightreadingEngine = factory();
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DIATONIC_STEPS = ["C", "D", "E", "F", "G", "A", "B"];
  const NATURAL_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const SLOTS_PER_QUARTER = 12; // Divisible by 1, 2, 3, 4, 6 (handles 16ths, triplets, sextuplets cleanly)

  // Key metadata: keySignature is the VexFlow major-equivalent key signature string.
  const KEY_SPECS = {
    C:   { name: "C major",   mode: "major", keySignature: "C",  fifths: 0,  tonicStep: "C", tonicAlter: 0 },
    G:   { name: "G major",   mode: "major", keySignature: "G",  fifths: 1,  tonicStep: "G", tonicAlter: 0 },
    D:   { name: "D major",   mode: "major", keySignature: "D",  fifths: 2,  tonicStep: "D", tonicAlter: 0 },
    A:   { name: "A major",   mode: "major", keySignature: "A",  fifths: 3,  tonicStep: "A", tonicAlter: 0 },
    E:   { name: "E major",   mode: "major", keySignature: "E",  fifths: 4,  tonicStep: "E", tonicAlter: 0 },
    B:   { name: "B major",   mode: "major", keySignature: "B",  fifths: 5,  tonicStep: "B", tonicAlter: 0 },
    "F#":{ name: "F# major",  mode: "major", keySignature: "F#", fifths: 6,  tonicStep: "F", tonicAlter: 1 },
    F:   { name: "F major",   mode: "major", keySignature: "F",  fifths: -1, tonicStep: "F", tonicAlter: 0 },
    Bb:  { name: "Bb major",  mode: "major", keySignature: "Bb", fifths: -2, tonicStep: "B", tonicAlter: -1 },
    Eb:  { name: "Eb major",  mode: "major", keySignature: "Eb", fifths: -3, tonicStep: "E", tonicAlter: -1 },
    Ab:  { name: "Ab major",  mode: "major", keySignature: "Ab", fifths: -4, tonicStep: "A", tonicAlter: -1 },
    Db:  { name: "Db major",  mode: "major", keySignature: "Db", fifths: -5, tonicStep: "D", tonicAlter: -1 },
    Gb:  { name: "Gb major",  mode: "major", keySignature: "Gb", fifths: -6, tonicStep: "G", tonicAlter: -1 },

    Am:  { name: "A minor",   mode: "minor", keySignature: "C",  fifths: 0,  tonicStep: "A", tonicAlter: 0 },
    Em:  { name: "E minor",   mode: "minor", keySignature: "G",  fifths: 1,  tonicStep: "E", tonicAlter: 0 },
    Bm:  { name: "B minor",   mode: "minor", keySignature: "D",  fifths: 2,  tonicStep: "B", tonicAlter: 0 },
    "F#m":{ name: "F# minor", mode: "minor", keySignature: "A",  fifths: 3,  tonicStep: "F", tonicAlter: 1 },
    "C#m":{ name: "C# minor", mode: "minor", keySignature: "E",  fifths: 4,  tonicStep: "C", tonicAlter: 1 },
    "G#m":{ name: "G# minor", mode: "minor", keySignature: "B",  fifths: 5,  tonicStep: "G", tonicAlter: 1 },
    Dm:  { name: "D minor",   mode: "minor", keySignature: "F",  fifths: -1, tonicStep: "D", tonicAlter: 0 },
    Gm:  { name: "G minor",   mode: "minor", keySignature: "Bb", fifths: -2, tonicStep: "G", tonicAlter: 0 },
    Cm:  { name: "C minor",   mode: "minor", keySignature: "Eb", fifths: -3, tonicStep: "C", tonicAlter: 0 },
    Fm:  { name: "F minor",   mode: "minor", keySignature: "Ab", fifths: -4, tonicStep: "F", tonicAlter: 0 },
    Bbm: { name: "Bb minor",  mode: "minor", keySignature: "Db", fifths: -5, tonicStep: "B", tonicAlter: -1 }
  };

  const SHARP_ORDER = ["F", "C", "G", "D", "A", "E", "B"];
  const FLAT_ORDER = ["B", "E", "A", "D", "G", "C", "F"];
  const MAJOR_SCALE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
  const MINOR_SCALE_SEMITONES = [0, 2, 3, 5, 7, 8, 10];
  const ACCIDENTAL_NAMES = { "-2": "bb", "-1": "b", "0": "", "1": "#", "2": "##" };

  const DIFFICULTY_LEVELS = [
    {
      level: 1,
      name: "First Melodies",
      subtitle: "Single hand, 5-finger position, C major",
      hands: 1,
      defaultStaffMode: "treble",
      keys: ["C"],
      meters: [{ numerator: 4, denominator: 4 }],
      targetBpm: 72,
      scoreMultiplier: 1.0,
      tags: ["1 Hand", "C Major", "Quarters & Halves", "Stepwise"]
    },
    {
      level: 2,
      name: "Flowing Lines",
      subtitle: "Single hand (RH or LH), eighth notes, 3/4 & 4/4",
      hands: 1,
      defaultStaffMode: "treble",
      keys: ["C", "G", "F"],
      meters: [
        { numerator: 4, denominator: 4 },
        { numerator: 3, denominator: 4 }
      ],
      targetBpm: 78,
      scoreMultiplier: 1.25,
      tags: ["1 Hand", "Up to 1 #/b", "Eighths & Rests", "3/4 & 4/4"]
    },
    {
      level: 3,
      name: "Hands Together",
      subtitle: "Grand staff melodies with steady bass harmony",
      hands: 2,
      defaultStaffMode: "grand",
      keys: ["C", "G", "F", "D", "Am"],
      meters: [
        { numerator: 4, denominator: 4 },
        { numerator: 3, denominator: 4 }
      ],
      targetBpm: 76,
      scoreMultiplier: 1.55,
      tags: ["2 Hands", "Basic Inversions", "Smooth Bass", "Major & Minor"]
    },
    {
      level: 4,
      name: "Classical Patterns",
      subtitle: "Alberti bass, waltz textures, dotted rhythms & inversions",
      hands: 2,
      defaultStaffMode: "grand",
      keys: ["C", "G", "D", "F", "Bb", "Am", "Em", "Dm"],
      meters: [
        { numerator: 4, denominator: 4 },
        { numerator: 3, denominator: 4 },
        { numerator: 6, denominator: 8 }
      ],
      targetBpm: 80,
      scoreMultiplier: 1.9,
      tags: ["Alberti & Waltz", "1st/2nd Inversions", "Dotted & 6/8", "Leading Tones"]
    },
    {
      level: 5,
      name: "Expressive Harmony",
      subtitle: "7th chord inversions, secondary dominants, ties & 16ths",
      hands: 2,
      defaultStaffMode: "grand",
      keys: ["G", "D", "A", "F", "Bb", "Eb", "Am", "Em", "Dm", "Gm", "Cm"],
      meters: [
        { numerator: 4, denominator: 4 },
        { numerator: 3, denominator: 4 },
        { numerator: 6, denominator: 8 }
      ],
      targetBpm: 82,
      scoreMultiplier: 2.3,
      tags: ["Accidentals", "7th Inversions", "Syncopation & Ties", "16th Figures"]
    },
    {
      level: 6,
      name: "Tuplets & Modulations",
      subtitle: "Triplets, two-voice counterpoint & mid-piece key changes",
      hands: 2,
      defaultStaffMode: "grand",
      keys: ["D", "A", "E", "Bb", "Eb", "Ab", "Em", "Bm", "Gm", "Cm", "Fm"],
      meters: [
        { numerator: 4, denominator: 4 },
        { numerator: 3, denominator: 4 }
      ],
      targetBpm: 80,
      scoreMultiplier: 2.8,
      tags: ["Key Changes", "Triplets", "2-Voice Polyphony", "Up to 4 #/b"]
    },
    {
      level: 7,
      name: "Romantic & Extended",
      subtitle: "Rich chords, remote keys, dotted-16ths, key & meter changes",
      hands: 2,
      defaultStaffMode: "grand",
      keys: ["A", "E", "B", "Eb", "Ab", "Db", "F#m", "C#m", "Cm", "Fm", "Bbm"],
      meters: [
        { numerator: 4, denominator: 4 },
        { numerator: 3, denominator: 4 },
        { numerator: 6, denominator: 8 }
      ],
      targetBpm: 82,
      scoreMultiplier: 3.4,
      tags: ["All Keys", "Key & Meter Shifts", "Extended Chords", "Mixed Rhythms"]
    },
    {
      level: 8,
      name: "Concert Challenge",
      subtitle: "Polyphony, sextuplets, chromaticism, modulations & wide chords",
      hands: 2,
      defaultStaffMode: "grand",
      keys: ["E", "B", "F#", "Ab", "Db", "Gb", "F#m", "C#m", "G#m", "Fm", "Bbm"],
      meters: [
        { numerator: 4, denominator: 4 },
        { numerator: 3, denominator: 4 },
        { numerator: 2, denominator: 4 }
      ],
      targetBpm: 84,
      scoreMultiplier: 4.1,
      tags: ["Virtuoso", "Sextuplets & Runs", "Chromaticism", "Frequent Modulations"]
    }
  ];

  // Utility random helpers (supports optional seeded PRNG for deterministic testing)
  function createRng(seed) {
    if (!Number.isFinite(seed)) {
      return () => Math.random();
    }
    let s = (seed >>> 0) || 1;
    return () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(list, rng) {
    return list[Math.floor(rng() * list.length)];
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function keySpec(keyId) {
    return KEY_SPECS[keyId] || KEY_SPECS.C;
  }

  function keySignatureAlters(keySignature) {
    const spec = KEY_SPECS[keySignature] || KEY_SPECS.C;
    const alters = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
    if (spec.fifths > 0) {
      for (let i = 0; i < spec.fifths; i += 1) alters[SHARP_ORDER[i]] = 1;
    } else if (spec.fifths < 0) {
      for (let i = 0; i < -spec.fifths; i += 1) alters[FLAT_ORDER[i]] = -1;
    }
    return alters;
  }

  function tonicBaseMidi(keyId, baseOctave = 4) {
    const spec = keySpec(keyId);
    return ((baseOctave + 1) * 12) + NATURAL_SEMITONES[spec.tonicStep] + spec.tonicAlter;
  }

  /**
   * Spell a diatonic scale degree (0-indexed, may be negative or >= 7)
   * with optional chromatic alteration (-1 flat, +1 sharp) in a given key.
   * baseOctave specifies the octave of tonic degree 0 (adjusted cleanly so C4=60).
   */
  function spellDegree(keyId, degree, baseOctave = 4, chromaticAlter = 0) {
    const spec = keySpec(keyId);
    const scale = spec.mode === "minor" ? MINOR_SCALE_SEMITONES : MAJOR_SCALE_SEMITONES;
    const tonicStepIdx = DIATONIC_STEPS.indexOf(spec.tonicStep);

    const degOctaveShift = Math.floor(degree / 7);
    const degMod = ((degree % 7) + 7) % 7;

    const absStep = (baseOctave * 7) + tonicStepIdx + degree;
    const stepIdx = ((absStep % 7) + 7) % 7;
    const octave = Math.floor(absStep / 7);
    const step = DIATONIC_STEPS[stepIdx];

    const tonicMidi = ((baseOctave + 1) * 12) + NATURAL_SEMITONES[spec.tonicStep] + spec.tonicAlter;
    const midi = tonicMidi + (degOctaveShift * 12) + scale[degMod] + chromaticAlter;
    const alter = midi - (((octave + 1) * 12) + NATURAL_SEMITONES[step]);

    // Guard against triple sharps/flats by enharmonic respelling if ever encountered
    if (alter > 2 || alter < -2) {
      return respellMidiForKey(midi, keyId);
    }

    const sigAlters = keySignatureAlters(spec.keySignature);
    const keyAlter = sigAlters[step] || 0;
    const writtenAcc = ACCIDENTAL_NAMES[String(alter)] ?? "";
    const keyAcc = ACCIDENTAL_NAMES[String(keyAlter)] ?? "";

    return {
      midi,
      step,
      octave,
      alter,
      accidental: alter === keyAlter ? "" : (writtenAcc || "n"),
      keyAccidental: alter === keyAlter ? keyAcc : ""
    };
  }

  function respellMidiForKey(midi, keyId) {
    const spec = keySpec(keyId);
    const preferFlats = spec.fifths < 0;
    const pc = ((midi % 12) + 12) % 12;
    const sharpSpelling = [
      ["C", 0], ["C", 1], ["D", 0], ["D", 1], ["E", 0], ["F", 0],
      ["F", 1], ["G", 0], ["G", 1], ["A", 0], ["A", 1], ["B", 0]
    ];
    const flatSpelling = [
      ["C", 0], ["D", -1], ["D", 0], ["E", -1], ["E", 0], ["F", 0],
      ["G", -1], ["G", 0], ["A", -1], ["A", 0], ["B", -1], ["B", 0]
    ];
    const [step, alter] = (preferFlats ? flatSpelling : sharpSpelling)[pc];
    const octave = Math.floor((midi - NATURAL_SEMITONES[step] - alter) / 12) - 1;
    const sigAlters = keySignatureAlters(spec.keySignature);
    const keyAlter = sigAlters[step] || 0;
    const writtenAcc = ACCIDENTAL_NAMES[String(alter)] ?? "";
    const keyAcc = ACCIDENTAL_NAMES[String(keyAlter)] ?? "";
    return {
      midi,
      step,
      octave,
      alter,
      accidental: alter === keyAlter ? "" : (writtenAcc || "n"),
      keyAccidental: alter === keyAlter ? keyAcc : ""
    };
  }

  function shiftPitchOctaves(pitch, octaves) {
    return {
      ...pitch,
      midi: pitch.midi + (octaves * 12),
      octave: pitch.octave + octaves
    };
  }

  function placePitchInRange(pitch, minMidi, maxMidi, preferredMidi = null) {
    const candidates = [];
    for (let oct = -4; oct <= 4; oct += 1) {
      const p = shiftPitchOctaves(pitch, oct);
      if (p.midi >= minMidi && p.midi <= maxMidi) candidates.push(p);
    }
    if (!candidates.length) {
      let cur = pitch;
      while (cur.midi < minMidi) cur = shiftPitchOctaves(cur, 1);
      while (cur.midi > maxMidi) cur = shiftPitchOctaves(cur, -1);
      return cur;
    }
    const target = Number.isFinite(preferredMidi) ? preferredMidi : (minMidi + maxMidi) / 2;
    return candidates.reduce((best, c) => (
      Math.abs(c.midi - target) < Math.abs(best.midi - target) ? c : best
    ));
  }

  /**
   * Build a musical chord in a key with explicit inversion and chromatic alterations.
   * Chord descriptor:
   *   { label, degree, intervals: [0,2,4] or [0,2,4,6], alters: { 2: 1 }, inversion: 0|1|2|3 }
   * Returns { bassPitch, chordTones (sorted ascending in close/open voicing), pool (multi-octave) }
   */
  function realizeChord(keyId, chord, options = {}) {
    const spec = keySpec(keyId);
    const bassRange = options.bassRange || [38, 49];
    const trebleRange = options.trebleRange || [60, 79];
    const prevBassMidi = options.prevBassMidi ?? 45;
    const intervals = chord.intervals || [0, 2, 4];
    const alters = chord.alters || {};
    const inversion = chord.inversion || 0;

    // Harmonic minor automatically raises the 7th on V and vii° unless explicitly overridden
    const effectiveAlters = { ...alters };
    if (spec.mode === "minor") {
      intervals.forEach((iv) => {
        const scaleDeg = ((chord.degree + iv) % 7 + 7) % 7;
        if (scaleDeg === 6 && (chord.degree === 4 || chord.degree === 6) && effectiveAlters[iv] === undefined) {
          effectiveAlters[iv] = 1;
        }
      });
    }

    const baseTones = intervals.map((iv) => (
      spellDegree(keyId, chord.degree + iv, 4, effectiveAlters[iv] || 0)
    ));

    const bassToneIdx = inversion % baseTones.length;
    let bassPitch = placePitchInRange(baseTones[bassToneIdx], bassRange[0], bassRange[1], prevBassMidi);

    // Build close-position upper chord starting at or near trebleRange
    const trebleCenter = options.trebleCenter ?? ((trebleRange[0] + trebleRange[1]) / 2);
    const upperTones = [];
    for (let i = 0; i < baseTones.length; i += 1) {
      const idx = (bassToneIdx + i) % baseTones.length;
      const p = placePitchInRange(baseTones[idx], trebleRange[0], trebleRange[1], trebleCenter);
      upperTones.push(p);
    }
    upperTones.sort((a, b) => a.midi - b.midi);

    // Build LH close triad/7th voicing starting from bassPitch ascending, staying <= B3 (59) and span <= 12
    const buildCloseLh = (startBass) => {
      const v = [startBass];
      for (let i = 1; i < baseTones.length; i += 1) {
        const idx = (bassToneIdx + i) % baseTones.length;
        let p = baseTones[idx];
        while (p.midi <= v[v.length - 1].midi) p = shiftPitchOctaves(p, 1);
        while (p.midi - v[v.length - 1].midi > 12) p = shiftPitchOctaves(p, -1);
        if (p.midi <= v[v.length - 1].midi) p = shiftPitchOctaves(p, 1);
        v.push(p);
      }
      return v;
    };

    let lhVoicing = buildCloseLh(bassPitch);
    if (lhVoicing[lhVoicing.length - 1].midi > 59 && bassPitch.midi - 12 >= 33) {
      bassPitch = shiftPitchOctaves(bassPitch, -1);
      lhVoicing = buildCloseLh(bassPitch);
    }
    // Keep simultaneous LH chord span comfortable (<= 11 semitones)
    lhVoicing = lhVoicing.filter((p) => p.midi - bassPitch.midi <= 11);

    // Build a multi-octave pool of all chord tones for melodic/arpeggio navigation
    const pool = [];
    for (let oct = -3; oct <= 3; oct += 1) {
      baseTones.forEach((tone) => {
        const p = shiftPitchOctaves(tone, oct);
        if (p.midi >= 28 && p.midi <= 96) pool.push(p);
      });
    }
    pool.sort((a, b) => a.midi - b.midi);

    return {
      chord,
      keyId,
      bassPitch,
      lhVoicing,
      upperTones,
      baseTones,
      pool
    };
  }

  // Build scale tone pool in a key (with optional harmonic minor raised 7th)
  function scalePoolInRange(keyId, minMidi, maxMidi, raisedLeading = false) {
    const spec = keySpec(keyId);
    const pool = [];
    for (let oct = -2; oct <= 4; oct += 1) {
      for (let d = 0; d < 7; d += 1) {
        const alt = (spec.mode === "minor" && raisedLeading && d === 6) ? 1 : 0;
        const p = spellDegree(keyId, d + (oct * 7), 4, alt);
        if (p.midi >= minMidi && p.midi <= maxMidi) pool.push(p);
      }
    }
    pool.sort((a, b) => a.midi - b.midi);
    return pool;
  }

  // Related modulation targets that sound genuinely musical
  function modulationTargetsForKey(keyId, level) {
    const spec = keySpec(keyId);
    const byFifths = (targetFifths, mode) => Object.keys(KEY_SPECS).find(
      (k) => KEY_SPECS[k].fifths === targetFifths && KEY_SPECS[k].mode === mode
    );
    const candidates = [];
    if (spec.mode === "major") {
      // Dominant (I -> V), Subdominant (I -> IV), Relative minor (I -> vi)
      [
        byFifths(spec.fifths + 1, "major"),
        byFifths(spec.fifths - 1, "major"),
        byFifths(spec.fifths, "minor")
      ].forEach((k) => { if (k && k !== keyId) candidates.push(k); });
      if (level >= 7) {
        // Parallel minor, Chromatic mediant (+3 / -3 fifths or +4 fifths)
        [
          byFifths(spec.fifths - 3, "minor"),
          byFifths(spec.fifths + 2, "major"),
          byFifths(spec.fifths - 2, "major")
        ].forEach((k) => { if (k && k !== keyId) candidates.push(k); });
      }
    } else {
      // Relative major (i -> III), Dominant minor (i -> v), Subdominant minor (i -> iv)
      [
        byFifths(spec.fifths, "major"),
        byFifths(spec.fifths + 1, "minor"),
        byFifths(spec.fifths - 1, "minor")
      ].forEach((k) => { if (k && k !== keyId) candidates.push(k); });
      if (level >= 7) {
        // Parallel major
        const parallelMaj = byFifths(spec.fifths + 3, "major");
        if (parallelMaj && parallelMaj !== keyId) candidates.push(parallelMaj);
      }
    }
    return candidates.length ? candidates : ["G", "F", "Am"].filter((k) => k !== keyId);
  }

  // Functional harmonic progressions per mode & sophistication tier
  // Each progression is 4 bars (1 phrase) or 8 bars (period).
  const PROGRESSIONS = {
    majorBasic: [
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "IV", degree: 3, intervals: [0, 2, 4], inversion: 0 },
        { label: "V", degree: 4, intervals: [0, 2, 4], inversion: 0 },
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 }
      ],
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "vi", degree: 5, intervals: [0, 2, 4], inversion: 0 },
        { label: "IV", degree: 3, intervals: [0, 2, 4], inversion: 0 },
        { label: "V", degree: 4, intervals: [0, 2, 4], inversion: 0 }
      ],
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "V6", degree: 4, intervals: [0, 2, 4], inversion: 1 },
        { label: "vi", degree: 5, intervals: [0, 2, 4], inversion: 0 },
        { label: "V", degree: 4, intervals: [0, 2, 4], inversion: 0 }
      ]
    ],
    majorClassical: [
      // Smooth bass line: 1 - 3 - 4 - 5 (I - I6 - IV - V)
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "I6", degree: 0, intervals: [0, 2, 4], inversion: 1 },
        { label: "IV", degree: 3, intervals: [0, 2, 4], inversion: 0 },
        { label: "V", degree: 4, intervals: [0, 2, 4], inversion: 0 }
      ],
      // Pachelbel / Romanesca bass: 1 - 7 - 6 - 5
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "V6", degree: 4, intervals: [0, 2, 4], inversion: 1 },
        { label: "vi", degree: 5, intervals: [0, 2, 4], inversion: 0 },
        { label: "I6/4", degree: 0, intervals: [0, 2, 4], inversion: 2 }
      ],
      // Cadential answer: ii6 - I6/4 - V7 - I
      [
        { label: "ii6", degree: 1, intervals: [0, 2, 4], inversion: 1 },
        { label: "I6/4", degree: 0, intervals: [0, 2, 4], inversion: 2 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 },
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 }
      ],
      // Circle of fifths: I - IV - ii6 - V
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "vi", degree: 5, intervals: [0, 2, 4], inversion: 0 },
        { label: "ii6", degree: 1, intervals: [0, 2, 4], inversion: 1 },
        { label: "V", degree: 4, intervals: [0, 2, 4], inversion: 0 }
      ]
    ],
    majorRich: [
      // Secondary dominant V7/V -> V7 -> I
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "V6/5/V", degree: 1, intervals: [0, 2, 4, 6], alters: { 2: 1 }, inversion: 1 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 },
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 }
      ],
      // Secondary dominant V/vi -> vi -> ii6/5 -> V7
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "V6/vi", degree: 2, intervals: [0, 2, 4], alters: { 2: 1 }, inversion: 1 },
        { label: "vi", degree: 5, intervals: [0, 2, 4], inversion: 0 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 }
      ],
      // Modal mixture IV -> iv -> I6/4 -> V7
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "IV", degree: 3, intervals: [0, 2, 4], inversion: 0 },
        { label: "iv", degree: 3, intervals: [0, 2, 4], alters: { 2: -1 }, inversion: 0 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 }
      ],
      // Passing V4/2 -> I6 -> ii7 -> V7
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "V4/2", degree: 4, intervals: [0, 2, 4, 6], inversion: 3 },
        { label: "I6", degree: 0, intervals: [0, 2, 4], inversion: 1 },
        { label: "ii6/5", degree: 1, intervals: [0, 2, 4, 6], inversion: 1 }
      ],
      // Chromatic diminished passing: I -> #i°7 -> ii6 -> V7
      [
        { label: "I", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "vii°7/ii", degree: 0, intervals: [0, 2, 4, 6], alters: { 0: 1, 6: -1 }, inversion: 0 },
        { label: "ii6", degree: 1, intervals: [0, 2, 4], inversion: 1 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 }
      ]
    ],
    minorClassical: [
      [
        { label: "i", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "iv", degree: 3, intervals: [0, 2, 4], inversion: 0 },
        { label: "V", degree: 4, intervals: [0, 2, 4], inversion: 0 },
        { label: "i", degree: 0, intervals: [0, 2, 4], inversion: 0 }
      ],
      // Andalusian / Lament bass
      [
        { label: "i", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "i6", degree: 0, intervals: [0, 2, 4], inversion: 1 },
        { label: "iv", degree: 3, intervals: [0, 2, 4], inversion: 0 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 }
      ],
      [
        { label: "i", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "VI", degree: 5, intervals: [0, 2, 4], inversion: 0 },
        { label: "ii°6", degree: 1, intervals: [0, 2, 4], inversion: 1 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 }
      ]
    ],
    minorRich: [
      // Neapolitan bII6 -> V7 -> i
      [
        { label: "i", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "bII6", degree: 1, intervals: [0, 2, 4], alters: { 0: -1 }, inversion: 1 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 },
        { label: "i", degree: 0, intervals: [0, 2, 4], inversion: 0 }
      ],
      // Diminished seventh color: i -> vii°7 -> i6 -> V7
      [
        { label: "i", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "vii°7", degree: 6, intervals: [0, 2, 4, 6], alters: { 0: 1 }, inversion: 0 },
        { label: "i6", degree: 0, intervals: [0, 2, 4], inversion: 1 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 }
      ],
      // Secondary dominant to iv -> iv -> V7 -> i
      [
        { label: "i", degree: 0, intervals: [0, 2, 4], inversion: 0 },
        { label: "V7/iv", degree: 0, intervals: [0, 2, 4, 6], alters: { 2: 1 }, inversion: 0 },
        { label: "iv", degree: 3, intervals: [0, 2, 4], inversion: 0 },
        { label: "V7", degree: 4, intervals: [0, 2, 4, 6], inversion: 0 }
      ]
    ]
  };

  function choosePhraseChords(keyId, level, isFinalPhrase, rng) {
    const spec = keySpec(keyId);
    let bank;
    if (spec.mode === "minor") {
      bank = level >= 5 ? [...PROGRESSIONS.minorClassical, ...PROGRESSIONS.minorRich] : PROGRESSIONS.minorClassical;
    } else if (level <= 2) {
      bank = PROGRESSIONS.majorBasic;
    } else if (level <= 4) {
      bank = PROGRESSIONS.majorClassical;
    } else {
      bank = [...PROGRESSIONS.majorClassical, ...PROGRESSIONS.majorRich];
    }
    const chosen = pick(bank, rng).map((c) => ({ ...c, alters: c.alters ? { ...c.alters } : {} }));

    // Ensure proper musical cadences: final phrase resolves to tonic on bar 4!
    if (isFinalPhrase) {
      if (chosen[3].degree !== 0) {
        chosen[2] = {
          label: level >= 5 ? "V7" : "V",
          degree: 4,
          intervals: level >= 5 ? [0, 2, 4, 6] : [0, 2, 4],
          alters: {},
          inversion: 0
        };
        chosen[3] = {
          label: spec.mode === "minor" ? "i" : "I",
          degree: 0,
          intervals: [0, 2, 4],
          alters: {},
          inversion: 0
        };
      }
    }
    return chosen;
  }

  // Convert duration in slots (where 12 = quarter) to MusicXML-compatible event metadata
  function durationMetaFromSlots(slots, isTuplet = false) {
    if (isTuplet) {
      // 4 slots = eighth-note triplet (3 per quarter = 12 slots)
      if (slots === 4) {
        return {
          type: "eighth",
          dots: 0,
          duration: 1 / 3,
          timeModification: { actualNotes: 3, normalNotes: 2 }
        };
      }
      // 2 slots = 16th-note sextuplet (6 per quarter = 12 slots)
      if (slots === 2) {
        return {
          type: "16th",
          dots: 0,
          duration: 1 / 6,
          timeModification: { actualNotes: 6, normalNotes: 4 }
        };
      }
      // 8 slots = quarter-note triplet (3 per half = 24 slots)
      if (slots === 8) {
        return {
          type: "quarter",
          dots: 0,
          duration: 2 / 3,
          timeModification: { actualNotes: 3, normalNotes: 2 }
        };
      }
    }
    const table = {
      48: { type: "whole", dots: 0, duration: 4 },
      36: { type: "half", dots: 1, duration: 3 },
      24: { type: "half", dots: 0, duration: 2 },
      18: { type: "quarter", dots: 1, duration: 1.5 },
      12: { type: "quarter", dots: 0, duration: 1 },
      9:  { type: "eighth", dots: 1, duration: 0.75 },
      6:  { type: "eighth", dots: 0, duration: 0.5 },
      3:  { type: "16th", dots: 0, duration: 0.25 }
    };
    return table[slots] || { type: "quarter", dots: 0, duration: slots / SLOTS_PER_QUARTER };
  }

  // Assign musical beams to a single voice's events within a measure
  function assignBeamsToVoiceEvents(events, numerator, denominator) {
    // Beat group size in slots: 18 slots (dotted quarter) for 6/8, 12 slots (quarter) for 4/4, 3/4, 2/4
    const beatGroupSlots = denominator === 8 && numerator % 3 === 0 ? 18 : 12;
    const beamableTypes = new Set(["eighth", "16th"]);

    // Partition consecutive beamable non-rest events within the same beat group & same tuplet group
    let i = 0;
    while (i < events.length) {
      const ev = events[i];
      if (ev.rest || !beamableTypes.has(ev.type)) {
        ev.beams = [];
        i += 1;
        continue;
      }
      const groupIdx = Math.floor(ev.slot / beatGroupSlots);
      const tupletKey = ev.timeModification
        ? `${ev.timeModification.actualNotes}:${ev.timeModification.normalNotes}:${ev.tupletGroupId || 0}`
        : "";
      let j = i;
      while (j < events.length) {
        const cur = events[j];
        const curGroupIdx = Math.floor(cur.slot / beatGroupSlots);
        const curTupletKey = cur.timeModification
          ? `${cur.timeModification.actualNotes}:${cur.timeModification.normalNotes}:${cur.tupletGroupId || 0}`
          : "";
        if (
          cur.rest
          || !beamableTypes.has(cur.type)
          || curGroupIdx !== groupIdx
          || curTupletKey !== tupletKey
        ) {
          break;
        }
        j += 1;
      }
      const len = j - i;
      if (len >= 2) {
        for (let k = i; k < j; k += 1) {
          events[k].beams = [{
            number: "1",
            type: k === i ? "begin" : k === j - 1 ? "end" : "continue"
          }];
        }
      } else {
        events[i].beams = [];
      }
      i = j;
    }
  }

  /**
   * Convert a list of voice streams in a measure into the slot-indexed `targets` array
   * expected by the VexFlow renderer and MIDI checker.
   */
  function compileMeasureTargets(measureSlots, voiceEventsList) {
    const eventsBySlot = new Map();
    voiceEventsList.forEach((ev) => {
      if (ev.slot < 0 || ev.slot >= measureSlots) return;
      const list = eventsBySlot.get(ev.slot) || [];
      list.push(ev);
      eventsBySlot.set(ev.slot, list);
    });

    const targets = [];
    for (let slot = 0; slot < measureSlots; slot += 1) {
      const events = eventsBySlot.get(slot) || [];
      const noteItems = [];
      const notationRests = [];
      const staffRestsSet = new Set();

      events.forEach((ev) => {
        if (ev.rest) {
          staffRestsSet.add(ev.staff);
          notationRests.push({
            staff: ev.staff,
            voice: ev.voice,
            duration: ev.duration,
            type: ev.type,
            dots: ev.dots || 0,
            stemDirection: ev.stemDirection || "",
            beams: ev.beams || [],
            timeModification: ev.timeModification || null,
            tuplets: ev.tuplets || [],
            displayKey: ev.displayKey || null
          });
        } else {
          const pitches = ev.pitches || (ev.pitch ? [ev.pitch] : []);
          pitches.forEach((p) => {
            noteItems.push({
              midi: p.midi,
              step: p.step,
              octave: p.octave,
              accidental: p.accidental || "",
              keyAccidental: p.keyAccidental || "",
              staff: ev.staff,
              voice: ev.voice,
              duration: ev.duration,
              type: ev.type,
              dots: ev.dots || 0,
              stemDirection: ev.stemDirection || "",
              beams: ev.beams || [],
              timeModification: ev.timeModification || null,
              tuplets: ev.tuplets || [],
              ties: ev.ties || [],
              slurs: ev.slurs || []
            });
          });
        }
      });

      // Deduplicate identical (voice, midi) in same slot
      const uniqueNotes = [...new Map(
        noteItems.map((n) => [`${n.staff}:${n.voice}:${n.midi}`, n])
      ).values()].sort((a, b) => a.midi - b.midi);

      const staffRests = [...staffRestsSet];

      if (!uniqueNotes.length) {
        targets.push(
          notationRests.length
            ? { rest: true, staffRests, notationRests }
            : { rest: true }
        );
      } else {
        const target = uniqueNotes.length === 1
          ? uniqueNotes[0]
          : { notes: uniqueNotes, playedMidi: [] };
        if (staffRests.length) target.staffRests = staffRests;
        if (notationRests.length) target.notationRests = notationRests;
        targets.push(target);
      }
    }
    return targets;
  }

  // Rhythmic templates in slots (12 = quarter). Every template sums to measureSlots!
  const MELODY_RHYTHMS = {
    // 4/4 (48 slots)
    "4/4": {
      1: [
        [12, 12, 12, 12],
        [12, 12, 24],
        [24, 12, 12],
        [24, 24]
      ],
      2: [
        [12, 6, 6, 12, 12],
        [6, 6, 12, 6, 6, 12],
        [12, 12, 6, 6, 12],
        [12, 6, 6, 24],
        [12, 12, 12, -12], // negative = rest!
        [36, 12]
      ],
      3: [
        [12, 6, 6, 12, 12],
        [24, 6, 6, 12],
        [18, 6, 12, 12],
        [6, 6, 12, 24]
      ],
      4: [
        [18, 6, 6, 6, 12],
        [12, 6, 6, 18, 6],
        [6, 6, 12, 6, 6, 12],
        [18, 6, 24],
        [-6, 6, 6, 6, 12, 12]
      ],
      5: [
        [12, 6, 6, { tie: [6, 6] }, 6, 6], // syncopation across beat 3!
        [18, 6, 3, 3, 6, 12],             // sixteenth-note turn
        [6, 6, { tie: [6, 6] }, 6, 6, 12],
        [12, 3, 3, 3, 3, 12, 12],
        [-6, 6, 12, 18, 6]
      ],
      6: [
        [12, { tuplet3: [4, 4, 4] }, 12, 12],
        [{ tuplet3: [4, 4, 4] }, 12, { tuplet3: [4, 4, 4] }, 12],
        [18, 6, { tuplet3: [4, 4, 4] }, 12],
        [12, 6, 6, { tuplet3: [4, 4, 4] }, 12]
      ],
      7: [
        [9, 3, 12, { tuplet3: [4, 4, 4] }, 12],
        [12, 3, 3, 3, 3, 9, 3, 12],
        [{ tuplet3: [4, 4, 4] }, 6, 6, 9, 3, 12],
        [6, { tie: [6, 6] }, 6, 3, 3, 3, 3, 12]
      ],
      8: [
        [{ tuplet6: [2, 2, 2, 2, 2, 2] }, 12, { tuplet3: [4, 4, 4] }, 12],
        [3, 3, 3, 3, { tuplet3: [4, 4, 4] }, 9, 3, 12],
        [9, 3, { tuplet6: [2, 2, 2, 2, 2, 2] }, 6, 6, 12],
        [{ tuplet3: [4, 4, 4] }, 3, 3, 3, 3, { tuplet3: [4, 4, 4] }, 12]
      ]
    },
    // 3/4 (36 slots)
    "3/4": {
      2: [
        [12, 12, 12],
        [24, 12],
        [12, 6, 6, 12],
        [6, 6, 12, 12]
      ],
      3: [
        [24, 12],
        [12, 6, 6, 12],
        [18, 6, 12]
      ],
      4: [
        [18, 6, 12],
        [12, 6, 6, 6, 6],
        [6, 6, 18, 6],
        [24, 6, 6]
      ],
      5: [
        [12, 6, { tie: [6, 6] }, 6],
        [18, 6, 3, 3, 6],
        [6, 6, 12, 3, 3, 6]
      ],
      6: [
        [12, { tuplet3: [4, 4, 4] }, 12],
        [{ tuplet3: [4, 4, 4] }, 12, 6, 6],
        [18, 6, { tuplet3: [4, 4, 4] }]
      ],
      7: [
        [9, 3, { tuplet3: [4, 4, 4] }, 12],
        [12, 3, 3, 3, 3, 9, 3],
        [{ tuplet3: [4, 4, 4] }, 9, 3, 12]
      ],
      8: [
        [{ tuplet6: [2, 2, 2, 2, 2, 2] }, 12, { tuplet3: [4, 4, 4] }],
        [9, 3, 3, 3, 3, 3, { tuplet3: [4, 4, 4] }]
      ]
    },
    // 6/8 (36 slots = two dotted-quarter beats of 18 slots each)
    "6/8": {
      4: [
        [12, 6, 12, 6],
        [6, 6, 6, 12, 6],
        [18, 6, 6, 6],
        [6, 6, 6, 18]
      ],
      5: [
        [12, 6, 6, 6, 6],
        [9, 3, 6, 12, 6],
        [6, 6, 6, 9, 3, 6],
        [18, 9, 3, 6]
      ],
      7: [
        [9, 3, 6, 6, 3, 3, 6],
        [6, 3, 3, 6, 9, 3, 6],
        [12, 6, 3, 3, 6, 6]
      ]
    },
    // 2/4 (24 slots)
    "2/4": {
      8: [
        [3, 3, 3, 3, { tuplet3: [4, 4, 4] }],
        [{ tuplet6: [2, 2, 2, 2, 2, 2] }, 6, 6],
        [9, 3, 3, 3, 3, 3]
      ]
    }
  };

  function cadenceRhythmForMeter(meter, level) {
    const key = `${meter.numerator}/${meter.denominator}`;
    if (key === "4/4") return level <= 2 ? [24, 24] : [12, 12, 24];
    if (key === "3/4") return [36];
    if (key === "6/8") return [18, 18];
    if (key === "2/4") return [24];
    return [meter.numerator * (4 / meter.denominator) * SLOTS_PER_QUARTER];
  }

  function pickRhythmPattern(meter, level, rng) {
    const key = `${meter.numerator}/${meter.denominator}`;
    const meterMap = MELODY_RHYTHMS[key] || MELODY_RHYTHMS["4/4"];
    // Find exact level or nearest available <= level
    let chosenLevel = level;
    while (chosenLevel >= 1 && !meterMap[chosenLevel]) chosenLevel -= 1;
    const pool = meterMap[chosenLevel] || Object.values(meterMap)[0];
    return pick(pool, rng);
  }

  /**
   * Expand a rhythm pattern into flat onset entries:
   * [{ slot, durSlots, rest, isTuplet, tupletRole, tupletGroupId, tieStart, tieStop }]
   */
  function expandRhythmPattern(pattern, tieIdPrefix) {
    const out = [];
    let cursor = 0;
    let tupletCounter = 0;
    let tieCounter = 0;

    pattern.forEach((item) => {
      if (typeof item === "number") {
        if (item < 0) {
          out.push({ slot: cursor, durSlots: -item, rest: true });
          cursor += -item;
        } else {
          out.push({ slot: cursor, durSlots: item, rest: false });
          cursor += item;
        }
      } else if (item.tie) {
        const tieId = `${tieIdPrefix}:t${tieCounter += 1}`;
        const [a, b] = item.tie;
        out.push({ slot: cursor, durSlots: a, rest: false, tieStartId: tieId });
        cursor += a;
        out.push({ slot: cursor, durSlots: b, rest: false, tieStopId: tieId });
        cursor += b;
      } else if (item.tuplet3) {
        tupletCounter += 1;
        const gid = tupletCounter;
        item.tuplet3.forEach((d, idx) => {
          out.push({
            slot: cursor,
            durSlots: d,
            rest: false,
            isTuplet: true,
            tupletGroupId: gid,
            tupletRole: idx === 0 ? "start" : idx === item.tuplet3.length - 1 ? "stop" : null
          });
          cursor += d;
        });
      } else if (item.tuplet6) {
        tupletCounter += 1;
        const gid = tupletCounter;
        item.tuplet6.forEach((d, idx) => {
          out.push({
            slot: cursor,
            durSlots: d,
            rest: false,
            isTuplet: true,
            tupletGroupId: gid,
            tupletRole: idx === 0 ? "start" : idx === item.tuplet6.length - 1 ? "stop" : null
          });
          cursor += d;
        });
      }
    });
    return out;
  }

  /**
   * Choose the next melodic pitch smoothly:
   * - On strong beats, prefers chord tones within a small interval of prevPitch
   * - On weak beats, uses stepwise passing/neighbor tones from the active scale
   * - Follows a gentle contour direction (arch/wave) and respects hand range!
   */
  function chooseNextMelodyPitch(
    prevPitch,
    realizedChord,
    scalePool,
    isStrongBeat,
    contourBias,
    level,
    minMidi,
    maxMidi,
    allowChromatic,
    rng
  ) {
    const chordPool = realizedChord.pool.filter((p) => p.midi >= minMidi && p.midi <= maxMidi);
    const activePool = isStrongBeat && chordPool.length ? chordPool : scalePool;

    if (!prevPitch) {
      const mid = (minMidi + maxMidi) / 2;
      const startPool = chordPool.length ? chordPool : scalePool;
      return startPool.reduce((best, p) => (
        Math.abs(p.midi - mid) < Math.abs(best.midi - mid) ? p : best
      ));
    }

    const maxLeap = level === 1 ? 4 : level === 2 ? 5 : level <= 4 ? 7 : level <= 6 ? 9 : 12;

    // Optional chromatic lower neighbor / passing tone on weak beats for Level 5+
    if (allowChromatic && !isStrongBeat && level >= 5 && rng() < (level >= 7 ? 0.18 : 0.09)) {
      const targetChordTone = chordPool.reduce((best, p) => (
        Math.abs(p.midi - prevPitch.midi) < Math.abs(best.midi - prevPitch.midi) ? p : best
      ), chordPool[0] || prevPitch);
      const neighborMidi = targetChordTone.midi - 1;
      if (neighborMidi >= minMidi && neighborMidi <= maxMidi && neighborMidi !== prevPitch.midi) {
        return respellMidiForKey(neighborMidi, realizedChord.keyId);
      }
    }

    let candidates = activePool.filter((p) => {
      const dist = Math.abs(p.midi - prevPitch.midi);
      return dist > 0 && dist <= maxLeap;
    });
    if (!candidates.length) {
      candidates = activePool.filter((p) => p.midi !== prevPitch.midi);
    }
    if (!candidates.length) return prevPitch;

    // Score each candidate for musicality: favor stepwise motion, contour continuity, staying near center
    const center = (minMidi + maxMidi) / 2;
    const weighted = candidates.map((p) => {
      const diff = p.midi - prevPitch.midi;
      const dist = Math.abs(diff);
      let weight = dist <= 2 ? 6 : dist <= 4 ? 4 : dist <= 7 ? 1.8 : 0.7;
      if (contourBias !== 0 && Math.sign(diff) === Math.sign(contourBias)) weight *= 1.8;
      // Gently pull back toward center near range edges
      if (prevPitch.midi > maxMidi - 3 && diff < 0) weight *= 2.5;
      if (prevPitch.midi < minMidi + 3 && diff > 0) weight *= 2.5;
      // Bonus for chord tone even on weak beat
      if (chordPool.some((c) => c.midi === p.midi)) weight *= isStrongBeat ? 2.0 : 1.15;
      // Small preference for staying close to register center
      weight *= Math.max(0.4, 1.2 - (Math.abs(p.midi - center) / 24));
      return { p, weight };
    });

    const total = weighted.reduce((sum, w) => sum + w.weight, 0);
    let roll = rng() * total;
    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) return item.p;
    }
    return weighted[weighted.length - 1].p;
  }

  /**
   * Generate a smooth 1-measure melody voice given harmony, rhythm, and motivic hints.
   */
  function generateMelodyMeasure(options) {
    const {
      realizedChord,
      meter,
      level,
      staff,
      voice,
      stemDirection,
      minMidi,
      maxMidi,
      rhythmPattern,
      prevPitch,
      contourBias,
      isCadenceBar,
      isFinalBar,
      addHarmonyIntervals,
      measureIndex,
      rng
    } = options;

    const spec = keySpec(realizedChord.keyId);
    const raisedLeading = spec.mode === "minor" && (realizedChord.chord.degree === 4 || realizedChord.chord.degree === 6);
    const scalePool = scalePoolInRange(realizedChord.keyId, minMidi, maxMidi, raisedLeading);
    const expanded = expandRhythmPattern(rhythmPattern, `m${measureIndex}:${staff}:${voice}`);

    const events = [];
    let currentPitch = prevPitch;
    let dir = contourBias;

    for (let idx = 0; idx < expanded.length; idx += 1) {
      const item = expanded[idx];
      const meta = durationMetaFromSlots(item.durSlots, item.isTuplet);

      if (item.rest) {
        events.push({
          slot: item.slot,
          rest: true,
          staff,
          voice,
          stemDirection: stemDirection || "",
          ...meta,
          beams: [],
          tuplets: []
        });
        continue;
      }

      let chosenPitch;
      if (item.tieStopId && currentPitch) {
        // Tied continuation holds the exact same pitch
        chosenPitch = currentPitch;
      } else if (isFinalBar && idx === expanded.length - 1) {
        // Resolve cleanly to tonic!
        const tonicPitch = spellDegree(realizedChord.keyId, 0, 4, 0);
        chosenPitch = placePitchInRange(tonicPitch, minMidi, maxMidi, currentPitch ? currentPitch.midi : (minMidi + maxMidi) / 2);
      } else if (isCadenceBar && idx === expanded.length - 1) {
        // Land on a stable chord tone (preferring gentle stepwise motion rather than exact repetition)
        const chordPool = realizedChord.pool.filter((p) => p.midi >= minMidi && p.midi <= maxMidi);
        const nonRepeat = currentPitch ? chordPool.filter((p) => p.midi !== currentPitch.midi) : chordPool;
        const targetPool = nonRepeat.length ? nonRepeat : chordPool;
        chosenPitch = targetPool.reduce((best, p) => (
          Math.abs(p.midi - (currentPitch?.midi ?? (minMidi + maxMidi) / 2))
            < Math.abs(best.midi - (currentPitch?.midi ?? (minMidi + maxMidi) / 2))
            ? p : best
        ), targetPool[0] || scalePool[0]);
      } else {
        const beatSlots = meter.denominator === 8 ? 18 : 12;
        const isStrong = item.slot % beatSlots === 0;
        chosenPitch = chooseNextMelodyPitch(
          currentPitch,
          realizedChord,
          scalePool,
          isStrong,
          dir,
          level,
          minMidi,
          maxMidi,
          level >= 5,
          rng
        );
        if (currentPitch && chosenPitch.midi !== currentPitch.midi) {
          dir = Math.sign(chosenPitch.midi - currentPitch.midi);
          // Occasional arch reversal so melodies don't hit ceilings monotonically
          if (rng() < 0.35) dir = -dir;
        }
      }

      currentPitch = chosenPitch;

      // Optional harmonic dyads / chords in RH on strong beats at higher levels
      let pitches = [chosenPitch];
      if (
        addHarmonyIntervals
        && !item.tieStopId
        && !item.tieStartId
        && !item.isTuplet
        && item.durSlots >= 12
        && (item.slot === 0 || (isFinalBar && idx === expanded.length - 1))
      ) {
        const chordPoolBelow = realizedChord.pool.filter(
          (p) => p.midi < chosenPitch.midi && p.midi >= chosenPitch.midi - 12 && p.midi >= Math.max(60, minMidi)
        );
        if (level >= 7 && rng() < 0.45 && chordPoolBelow.length >= 2) {
          // 3-note RH chord (or octave + inner chord tone), strictly <= 12 semitones span
          const octaveBelow = shiftPitchOctaves(chosenPitch, -1);
          if (level >= 7 && octaveBelow.midi >= 60 && rng() < 0.4) {
            const inner = chordPoolBelow.find((p) => p.midi > octaveBelow.midi + 2 && p.midi < chosenPitch.midi - 2);
            pitches = inner ? [octaveBelow, inner, chosenPitch] : [octaveBelow, chosenPitch];
          } else {
            pitches = [chordPoolBelow[chordPoolBelow.length - 2], chordPoolBelow[chordPoolBelow.length - 1], chosenPitch];
          }
        } else if (chordPoolBelow.length && (isFinalBar || rng() < (level >= 6 ? 0.55 : 0.35))) {
          // Pleasant 3rd or 6th below melody
          const preferred = chordPoolBelow.find(
            (p) => chosenPitch.midi - p.midi >= 3 && chosenPitch.midi - p.midi <= 9
          ) || chordPoolBelow[chordPoolBelow.length - 1];
          pitches = [preferred, chosenPitch];
        }
      }

      const ties = [];
      if (item.tieStartId) ties.push({ id: item.tieStartId, type: "start" });
      if (item.tieStopId) ties.push({ id: item.tieStopId, type: "stop" });

      const tuplets = [];
      if (item.isTuplet && item.tupletRole) {
        tuplets.push({
          type: item.tupletRole,
          number: "1",
          bracketed: false,
          showNumber: true
        });
      }

      events.push({
        slot: item.slot,
        rest: false,
        pitches,
        staff,
        voice,
        stemDirection: stemDirection || "",
        ...meta,
        tupletGroupId: item.tupletGroupId || 0,
        beams: [],
        tuplets,
        ties
      });
    }

    assignBeamsToVoiceEvents(events, meter.numerator, meter.denominator);
    return { events, endPitch: currentPitch, contourBias: dir };
  }

  /**
   * Generate pianistic left-hand accompaniment for a measure matching the harmony, meter, and level.
   */
  function generateAccompanimentMeasure(options) {
    const {
      realizedChord,
      meter,
      level,
      texture,
      isFinalBar,
      measureIndex,
      rng
    } = options;

    const measureSlots = meter.numerator * (4 / meter.denominator) * SLOTS_PER_QUARTER;
    const voicing = realizedChord.lhVoicing; // [bass, mid, top, (7th)]
    const bass = voicing[0];
    const mid = voicing[1] || shiftPitchOctaves(bass, 1);
    const top = voicing[2] || shiftPitchOctaves(bass, 1);
    const seventh = voicing[3] || null;
    const upperBlock = seventh ? [mid, top, seventh] : [mid, top];

    const events = [];
    const pushNote = (slot, durSlots, pitches, extra = {}) => {
      const meta = durationMetaFromSlots(durSlots, Boolean(extra.isTuplet));
      events.push({
        slot,
        rest: false,
        pitches: Array.isArray(pitches) ? pitches : [pitches],
        staff: "bass",
        voice: extra.voice || "2",
        stemDirection: extra.stemDirection || "",
        ...meta,
        tupletGroupId: extra.tupletGroupId || 0,
        beams: [],
        tuplets: extra.tuplets || [],
        ties: extra.ties || []
      });
    };

    // Final bar: clean grounded chord/octave
    if (isFinalBar) {
      const chordPitches = level <= 3 ? [bass, top] : voicing.slice(0, 3);
      if (measureSlots === 48) {
        pushNote(0, 48, chordPitches);
      } else if (measureSlots === 36) {
        pushNote(0, 36, chordPitches);
      } else {
        pushNote(0, measureSlots, chordPitches);
      }
      assignBeamsToVoiceEvents(events, meter.numerator, meter.denominator);
      return events;
    }

    const meterKey = `${meter.numerator}/${meter.denominator}`;

    // Texture: sustained whole / dotted-half / half notes (Level 3)
    if (texture === "sustained") {
      if (meterKey === "4/4") {
        if (rng() < 0.5) {
          pushNote(0, 48, [bass, top]);
        } else {
          pushNote(0, 24, [bass]);
          pushNote(24, 24, [mid, top]);
        }
      } else if (meterKey === "3/4") {
        pushNote(0, 36, [bass, top]);
      } else {
        pushNote(0, measureSlots, [bass, top]);
      }
    }
    // Texture: Alberti bass (low-high-mid-high) — classic Mozart/Clementi!
    else if (texture === "alberti") {
      const pattern = [bass, top, mid, top];
      const stepSlots = meterKey === "6/8" ? 6 : 6; // eighth notes
      const count = Math.floor(measureSlots / stepSlots);
      for (let i = 0; i < count; i += 1) {
        pushNote(i * stepSlots, stepSlots, pattern[i % pattern.length]);
      }
    }
    // Texture: Waltz (bass on beat 1, chord on beats 2 & 3)
    else if (texture === "waltz") {
      const lowBass = bass.midi > 45 ? shiftPitchOctaves(bass, -1) : bass;
      if (meterKey === "3/4") {
        pushNote(0, 12, lowBass);
        pushNote(12, 12, upperBlock);
        pushNote(24, 12, upperBlock);
      } else if (meterKey === "4/4") {
        // Stride / Chopin ballad feel: bass - chord - bass5th - chord
        pushNote(0, 12, lowBass);
        pushNote(12, 12, upperBlock);
        pushNote(24, 12, top.midi > 52 ? shiftPitchOctaves(top, -1) : top);
        pushNote(36, 12, upperBlock);
      } else {
        // 6/8 barcarolle: bass (quarter) + chord (eighth) x2
        pushNote(0, 12, lowBass);
        pushNote(12, 6, upperBlock);
        pushNote(18, 12, mid);
        pushNote(30, 6, upperBlock);
      }
    }
    // Texture: Broken chord wave (ascending/descending arpeggio)
    else if (texture === "broken") {
      const octTop = shiftPitchOctaves(bass, 1);
      const wave = level >= 6 && octTop.midi <= 59
        ? [bass, top, octTop, mid, top, octTop, mid, top]
        : [bass, mid, top, mid, bass, mid, top, mid];
      if (meterKey === "6/8") {
        const wave6 = [bass, mid, top, octTop.midi <= 59 ? octTop : top, top, mid];
        for (let i = 0; i < 6; i += 1) pushNote(i * 6, 6, wave6[i]);
      } else if (meterKey === "3/4") {
        const wave6 = [bass, mid, top, mid, top, mid];
        for (let i = 0; i < 6; i += 1) pushNote(i * 6, 6, wave6[i]);
      } else if (meterKey === "2/4") {
        const wave4 = [bass, top, mid, top];
        for (let i = 0; i < 4; i += 1) pushNote(i * 6, 6, wave4[i]);
      } else {
        for (let i = 0; i < 8; i += 1) pushNote(i * 6, 6, wave[i % wave.length]);
      }
    }
    // Texture: Rolling triplet accompaniment (Moonlight / Nocturne style)
    else if (texture === "triplets") {
      const tripPattern = [bass, mid, top];
      const beats = Math.floor(measureSlots / 12);
      for (let b = 0; b < beats; b += 1) {
        for (let k = 0; k < 3; k += 1) {
          pushNote((b * 12) + (k * 4), 4, tripPattern[k], {
            isTuplet: true,
            tupletGroupId: b + 1,
            tuplets: k === 0
              ? [{ type: "start", number: "1", bracketed: false, showNumber: true }]
              : k === 2
              ? [{ type: "stop", number: "1", bracketed: false, showNumber: true }]
              : []
          });
        }
      }
    }
    // Texture: Two-voice LH (held bass pedal + moving inner voice within 1 octave!)
    else if (texture === "polyphonic") {
      const innerNotes = [mid, top, seventh || mid, top].filter((p) => p.midi - bass.midi <= 11);
      const safeInner = innerNotes.length ? innerNotes : [mid];
      // Voice 3: sustained bass stem down
      if (meterKey === "4/4") {
        pushNote(0, 24, bass, { voice: "3", stemDirection: "down" });
        pushNote(24, 24, bass, { voice: "3", stemDirection: "down" });
      } else if (meterKey === "3/4") {
        pushNote(0, 36, bass, { voice: "3", stemDirection: "down" });
      } else {
        pushNote(0, measureSlots, bass, { voice: "3", stemDirection: "down" });
      }
      // Voice 2: moving upper LH voice stem up
      const beatCount = Math.floor(measureSlots / 12);
      const voice2Events = [];
      for (let b = 0; b < beatCount; b += 1) {
        if (b === 0) {
          // Quarter rest on beat 1 so bass speaks clearly, then upper chord tones enter!
          voice2Events.push({
            slot: 0,
            rest: true,
            staff: "bass",
            voice: "2",
            stemDirection: "up",
            ...durationMetaFromSlots(12),
            beams: [],
            tuplets: [],
            displayKey: "f/3"
          });
        } else {
          voice2Events.push({
            slot: b * 12,
            rest: false,
            pitches: [safeInner[b % safeInner.length]],
            staff: "bass",
            voice: "2",
            stemDirection: "up",
            ...durationMetaFromSlots(12),
            beams: [],
            tuplets: [],
            ties: []
          });
        }
      }
      assignBeamsToVoiceEvents(voice2Events, meter.numerator, meter.denominator);
      events.push(...voice2Events);
      return events;
    }
    // Texture: Romantic wide rolling arpeggios / lush chords
    else if (texture === "romantic") {
      const lowBass = bass.midi > 44 ? shiftPitchOctaves(bass, -1) : bass;
      const fifth = top.midi - lowBass.midi > 12 ? shiftPitchOctaves(top, -1) : top;
      const rawTenth = shiftPitchOctaves(mid, mid.midi - lowBass.midi < 7 ? 1 : 0);
      const tenth = rawTenth.midi > 59 ? mid : rawTenth;
      if (meterKey === "4/4") {
        pushNote(0, 6, lowBass);
        pushNote(6, 6, fifth);
        pushNote(12, 6, tenth);
        pushNote(18, 6, upperBlock);
        pushNote(24, 6, lowBass);
        pushNote(30, 6, fifth);
        pushNote(36, 12, upperBlock);
      } else if (meterKey === "3/4") {
        pushNote(0, 6, lowBass);
        pushNote(6, 6, fifth);
        pushNote(12, 12, upperBlock);
        pushNote(24, 12, upperBlock);
      } else {
        pushNote(0, 6, lowBass);
        pushNote(6, 6, fifth);
        pushNote(12, 6, tenth);
        if (measureSlots >= 36) {
          pushNote(18, 6, lowBass);
          pushNote(24, 6, fifth);
          pushNote(30, 6, upperBlock);
        } else {
          pushNote(18, 6, upperBlock);
        }
      }
    }
    // Default fallback: steady quarter/half chords
    else {
      const beatCount = Math.floor(measureSlots / 12);
      for (let b = 0; b < beatCount; b += 1) {
        pushNote(b * 12, 12, b % 2 === 0 ? [bass] : upperBlock);
      }
    }

    assignBeamsToVoiceEvents(events, meter.numerator, meter.denominator);
    return events;
  }

  function chooseAccompanimentTexture(level, meter, rng) {
    const meterKey = `${meter.numerator}/${meter.denominator}`;
    if (level <= 3) return meterKey === "3/4" ? pick(["sustained", "waltz"], rng) : "sustained";
    if (level === 4) {
      if (meterKey === "3/4") return pick(["waltz", "broken"], rng);
      if (meterKey === "6/8") return pick(["broken", "waltz"], rng);
      return pick(["alberti", "broken"], rng);
    }
    if (level === 5) {
      if (meterKey === "3/4") return pick(["waltz", "broken", "romantic"], rng);
      if (meterKey === "6/8") return pick(["broken", "waltz"], rng);
      return pick(["alberti", "broken", "waltz"], rng);
    }
    if (level === 6) {
      if (meterKey === "3/4") return pick(["waltz", "polyphonic", "broken"], rng);
      return pick(["polyphonic", "triplets", "broken", "alberti"], rng);
    }
    if (level === 7) {
      if (meterKey === "6/8") return pick(["romantic", "broken", "waltz"], rng);
      return pick(["romantic", "polyphonic", "triplets", "broken"], rng);
    }
    if (meterKey === "6/8") return pick(["romantic", "broken", "polyphonic"], rng);
    return pick(["romantic", "polyphonic", "triplets", "broken"], rng);
  }

  // ============================================================================
  // CURATED PUBLIC-DOMAIN CLASSICAL REPERTOIRE FRAGMENTS (4-8 bar excerpts)
  // Encoded as scale-degree events so they can be transposed cleanly to any key!
  // Event tuple: [slot, durSlots, degreesOrRest, optAltersOrFlags]
  //   degreesOrRest: null (rest), number (single degree), or array of [deg, alt?]
  // ============================================================================
  const CLASSICAL_FRAGMENTS = [
    // --- LEVEL 1 (1 Hand, Treble, C Major, 4/4, quarters & halves) ---
    {
      id: "beethoven-ode",
      title: "Ode to Joy (Theme)",
      composer: "Beethoven",
      minLevel: 1,
      maxLevel: 2,
      mode: "major",
      hands: 1,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      bars: [
        { rh: [[0,12,2],[12,12,2],[24,12,3],[36,12,4]] },
        { rh: [[0,12,4],[12,12,3],[24,12,2],[36,12,1]] },
        { rh: [[0,12,0],[12,12,0],[24,12,1],[36,12,2]] },
        { rh: [[0,12,2],[12,12,1],[24,24,1]] },
        { rh: [[0,12,2],[12,12,2],[24,12,3],[36,12,4]] },
        { rh: [[0,12,4],[12,12,3],[24,12,2],[36,12,1]] },
        { rh: [[0,12,0],[12,12,0],[24,12,1],[36,12,2]] },
        { rh: [[0,12,1],[12,12,0],[24,24,0]] }
      ]
    },
    {
      id: "mozart-twinkle",
      title: "Ah! vous dirai-je, maman (K.265)",
      composer: "Mozart",
      minLevel: 1,
      maxLevel: 2,
      mode: "major",
      hands: 1,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      bars: [
        { rh: [[0,12,0],[12,12,0],[24,12,4],[36,12,4]] },
        { rh: [[0,12,5],[12,12,5],[24,24,4]] },
        { rh: [[0,12,3],[12,12,3],[24,12,2],[36,12,2]] },
        { rh: [[0,12,1],[12,12,1],[24,24,0]] }
      ]
    },
    {
      id: "dvorak-largo",
      title: "New World Symphony (Largo Theme)",
      composer: "Dvořák",
      minLevel: 1,
      maxLevel: 2,
      mode: "major",
      hands: 1,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      bars: [
        { rh: [[0,12,2],[12,12,4],[24,24,4]] },
        { rh: [[0,12,2],[12,12,1],[24,24,0]] },
        { rh: [[0,12,1],[12,12,2],[24,12,4],[36,12,2]] },
        { rh: [[0,48,1]] }
      ]
    },

    // --- LEVEL 2 (1 Hand, eighths, 3/4 & 4/4) ---
    {
      id: "petzold-minuet-rh",
      title: "Minuet in G (Melody)",
      composer: "Petzold / Bach",
      minLevel: 2,
      maxLevel: 2,
      mode: "major",
      hands: 1,
      meter: { numerator: 3, denominator: 4 },
      rhOctave: 4,
      bars: [
        { rh: [[0,12,4],[12,6,0],[18,6,1],[24,6,2],[30,6,3]] },
        { rh: [[0,12,4],[12,12,0],[24,12,0]] },
        { rh: [[0,12,5],[12,6,3],[18,6,4],[24,6,5],[30,6,6]] },
        { rh: [[0,12,7],[12,12,0],[24,12,0]] },
        { rh: [[0,12,3],[12,6,4],[18,6,3],[24,6,2],[30,6,1]] },
        { rh: [[0,12,2],[12,6,3],[18,6,2],[24,6,1],[30,6,0]] },
        { rh: [[0,12,-1],[12,6,0],[18,6,1],[24,6,2],[30,6,0]] },
        { rh: [[0,36,1]] }
      ]
    },
    {
      id: "schumann-melody-rh",
      title: "Melody (Op. 68 No. 1)",
      composer: "Schumann",
      minLevel: 2,
      maxLevel: 2,
      mode: "major",
      hands: 1,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      bars: [
        { rh: [[0,12,2],[12,12,1],[24,12,0],[36,12,1]] },
        { rh: [[0,12,2],[12,12,3],[24,24,4]] },
        { rh: [[0,12,5],[12,12,4],[24,12,3],[36,12,2]] },
        { rh: [[0,12,1],[12,12,2],[24,24,0]] }
      ]
    },

    // --- LEVEL 3 (2 Hands Basics) ---
    {
      id: "petzold-minuet-2h",
      title: "Minuet in G (2 Hands)",
      composer: "Petzold / Bach",
      minLevel: 3,
      maxLevel: 4,
      mode: "major",
      hands: 2,
      meter: { numerator: 3, denominator: 4 },
      rhOctave: 4,
      lhOctave: 3,
      bars: [
        { rh: [[0,12,4],[12,6,0],[18,6,1],[24,6,2],[30,6,3]], lh: [[0,24,[0,2]],[24,12,5]] },
        { rh: [[0,12,4],[12,12,0],[24,12,0]], lh: [[0,36,2]] },
        { rh: [[0,12,5],[12,6,3],[18,6,4],[24,6,5],[30,6,6]], lh: [[0,36,3]] },
        { rh: [[0,12,7],[12,12,0],[24,12,0]], lh: [[0,36,2]] },
        { rh: [[0,12,3],[12,6,4],[18,6,3],[24,6,2],[30,6,1]], lh: [[0,36,1]] },
        { rh: [[0,12,2],[12,6,3],[18,6,2],[24,6,1],[30,6,0]], lh: [[0,36,0]] },
        { rh: [[0,12,-1],[12,6,0],[18,6,1],[24,6,2],[30,6,0]], lh: [[0,24,-3],[24,12,-1]] },
        { rh: [[0,36,1]], lh: [[0,12,-3],[12,12,-1],[24,12,1]] }
      ]
    },
    {
      id: "beethoven-ode-2h",
      title: "Ode to Joy (Harmonized)",
      composer: "Beethoven",
      minLevel: 3,
      maxLevel: 3,
      mode: "major",
      hands: 2,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      lhOctave: 3,
      bars: [
        { rh: [[0,12,2],[12,12,2],[24,12,3],[36,12,4]], lh: [[0,24,[0,4]],[24,24,[0,4]]] },
        { rh: [[0,12,4],[12,12,3],[24,12,2],[36,12,1]], lh: [[0,24,[-3,4]],[24,24,[-3,4]]] },
        { rh: [[0,12,0],[12,12,0],[24,12,1],[36,12,2]], lh: [[0,24,[0,4]],[24,24,[0,4]]] },
        { rh: [[0,18,1],[18,6,0],[24,24,0]], lh: [[0,24,[-3,1]],[24,24,[0,4]]] }
      ]
    },

    // --- LEVEL 4 (Alberti bass, Waltz, Inversions) ---
    {
      id: "mozart-k545",
      title: "Sonata in C (K.545 Opening)",
      composer: "Mozart",
      minLevel: 4,
      maxLevel: 5,
      mode: "major",
      hands: 2,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 5,
      lhOctave: 3,
      bars: [
        {
          rh: [[0,24,0],[24,12,2],[36,12,4]],
          lh: [[0,6,0],[6,6,4],[12,6,2],[18,6,4],[24,6,0],[30,6,4],[36,6,2],[42,6,4]]
        },
        {
          rh: [[0,18,-1],[18,6,0],[24,12,0],[36,12,null]],
          lh: [[0,6,1],[6,6,4],[12,6,3],[18,6,4],[24,6,0],[30,6,4],[36,6,2],[42,6,4]]
        },
        {
          rh: [[0,24,5],[24,12,4],[36,12,0]],
          lh: [[0,6,0],[6,6,5],[12,6,3],[18,6,5],[24,6,0],[30,6,4],[36,6,2],[42,6,4]]
        },
        {
          rh: [[0,18,4],[18,6,3],[24,12,2],[36,12,null]],
          lh: [[0,6,-1],[6,6,4],[12,6,1],[18,6,4],[24,6,0],[30,6,4],[36,6,2],[42,6,4]]
        }
      ]
    },
    {
      id: "satie-gymnopedie",
      title: "Gymnopédie No. 1 (Phrase)",
      composer: "Satie",
      minLevel: 4,
      maxLevel: 5,
      mode: "major",
      hands: 2,
      meter: { numerator: 3, denominator: 4 },
      rhOctave: 4,
      lhOctave: 2,
      bars: [
        { rh: [[0,36,null]], lh: [[0,12,3],[12,24,[8,10,12]]] },
        { rh: [[0,36,null]], lh: [[0,12,0],[12,24,[6,9,11]]] },
        { rh: [[0,12,null],[12,12,2],[24,12,4]], lh: [[0,12,3],[12,24,[8,10,12]]] },
        { rh: [[0,12,3],[12,12,2],[24,12,0]], lh: [[0,12,0],[12,24,[6,9,11]]] },
        { rh: [[0,12,-1],[12,12,0],[24,12,1]], lh: [[0,12,3],[12,24,[8,10,12]]] },
        { rh: [[0,36,-2]], lh: [[0,12,0],[12,24,[6,9,11]]] },
        { rh: [[0,36,2]], lh: [[0,12,3],[12,24,[8,10,12]]] },
        { rh: [[0,36,0]], lh: [[0,12,0],[12,24,[6,9,11]]] }
      ]
    },
    {
      id: "clementi-sonatina",
      title: "Sonatina Op. 36 No. 1",
      composer: "Clementi",
      minLevel: 4,
      maxLevel: 5,
      mode: "major",
      hands: 2,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 5,
      lhOctave: 3,
      bars: [
        { rh: [[0,12,0],[12,6,2],[18,6,0],[24,12,4],[36,12,4]], lh: [[0,24,[0,2]],[24,24,[0,4]]] },
        { rh: [[0,12,7],[12,6,5],[18,6,4],[24,12,3],[36,12,2]], lh: [[0,24,[3,5]],[24,24,[0,4]]] },
        { rh: [[0,6,1],[6,6,2],[12,6,3],[18,6,1],[24,6,0],[30,6,1],[36,6,2],[42,6,0]], lh: [[0,24,[-1,3]],[24,24,[0,2]]] },
        { rh: [[0,12,1],[12,12,-3],[24,24,0]], lh: [[0,24,[-3,-1]],[24,24,[0,4]]] }
      ]
    },

    // --- LEVEL 5 (Expressive Harmony, Accidentals, 7ths, Syncopation) ---
    {
      id: "bach-prelude-c",
      title: "Prelude in C (BWV 846 Texture)",
      composer: "J. S. Bach",
      minLevel: 5,
      maxLevel: 6,
      mode: "major",
      hands: 2,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      lhOctave: 4,
      bars: [
        {
          rh: [[0,6,null],[6,6,4],[12,6,7],[18,6,9],[24,6,4],[30,6,7],[36,6,9],[42,6,7]],
          lh: [[0,48,[0,2]]]
        },
        {
          rh: [[0,6,null],[6,6,5],[12,6,8],[18,6,10],[24,6,5],[30,6,8],[36,6,10],[42,6,8]],
          lh: [[0,48,[0,1]]]
        },
        {
          rh: [[0,6,null],[6,6,4],[12,6,8],[18,6,10],[24,6,4],[30,6,8],[36,6,10],[42,6,8]],
          lh: [[0,48,[-1,1]]]
        },
        {
          rh: [[0,6,null],[6,6,4],[12,6,7],[18,6,9],[24,6,4],[30,6,7],[36,6,9],[42,6,7]],
          lh: [[0,48,[0,2]]]
        }
      ]
    },
    {
      id: "chopin-prelude-em",
      title: "Prelude in E minor (Op. 28 No. 4 Texture)",
      composer: "Chopin",
      minLevel: 5,
      maxLevel: 6,
      mode: "minor",
      hands: 2,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      lhOctave: 3,
      bars: [
        {
          rh: [[0,36,4],[36,12,5]],
          lh: [[0,6,[2,4,7]],[6,6,[2,4,7]],[12,6,[2,4,7]],[18,6,[2,4,7]],[24,6,[2,4,7]],[30,6,[2,4,7]],[36,6,[2,4,7]],[42,6,[2,4,7]]]
        },
        {
          rh: [[0,48,4]],
          lh: [[0,6,[[1,1],4,6]],[6,6,[[1,1],4,6]],[12,6,[[1,1],4,6]],[18,6,[[1,1],4,6]],[24,6,[1,4,6]],[30,6,[1,4,6]],[36,6,[1,4,6]],[42,6,[1,4,6]]]
        },
        {
          rh: [[0,36,4],[36,12,5]],
          lh: [[0,6,[1,3,6]],[6,6,[1,3,6]],[12,6,[1,3,6]],[18,6,[1,3,6]],[24,6,[0,3,6]],[30,6,[0,3,6]],[36,6,[0,3,6]],[42,6,[0,3,6]]]
        },
        {
          rh: [[0,36,3],[36,12,4]],
          lh: [[0,6,[0,3,5]],[6,6,[0,3,5]],[12,6,[0,3,5]],[18,6,[0,3,5]],[24,6,[-1,3,4]],[30,6,[-1,3,4]],[36,6,[[-1,1],3,4]],[42,6,[[-1,1],3,4]]]
        }
      ]
    },

    // --- LEVEL 6 (Tuplets, Polyphony) ---
    {
      id: "beethoven-moonlight",
      title: "Moonlight Sonata (Triplet Texture)",
      composer: "Beethoven",
      minLevel: 6,
      maxLevel: 7,
      mode: "minor",
      hands: 2,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      lhOctave: 2,
      bars: [
        {
          rh: [
            [0,4,-3,{tuplet:"start"}],[4,4,0,{tuplet:"mid"}],[8,4,2,{tuplet:"stop"}],
            [12,4,-3,{tuplet:"start"}],[16,4,0,{tuplet:"mid"}],[20,4,2,{tuplet:"stop"}],
            [24,4,-3,{tuplet:"start"}],[28,4,0,{tuplet:"mid"}],[32,4,2,{tuplet:"stop"}],
            [36,4,-3,{tuplet:"start"}],[40,4,0,{tuplet:"mid"}],[44,4,2,{tuplet:"stop"}]
          ],
          lh: [[0,48,[0,7]]]
        },
        {
          rh: [
            [0,4,-3,{tuplet:"start"}],[4,4,0,{tuplet:"mid"}],[8,4,2,{tuplet:"stop"}],
            [12,4,-3,{tuplet:"start"}],[16,4,0,{tuplet:"mid"}],[20,4,2,{tuplet:"stop"}],
            [24,4,-3,{tuplet:"start"}],[28,4,0,{tuplet:"mid"}],[32,4,2,{tuplet:"stop"}],
            [36,4,-3,{tuplet:"start"}],[40,4,0,{tuplet:"mid"}],[44,4,2,{tuplet:"stop"}]
          ],
          lh: [[0,48,[-1,6]]]
        },
        {
          rh: [
            [0,4,-2,{tuplet:"start"}],[4,4,0,{tuplet:"mid"}],[8,4,2,{tuplet:"stop"}],
            [12,4,-2,{tuplet:"start"}],[16,4,0,{tuplet:"mid"}],[20,4,2,{tuplet:"stop"}],
            [24,4,-2,{tuplet:"start"}],[28,4,1,{tuplet:"mid"}],[32,4,3,{tuplet:"stop"}],
            [36,4,-2,{tuplet:"start"}],[40,4,1,{tuplet:"mid"}],[44,4,3,{tuplet:"stop"}]
          ],
          lh: [[0,24,[-2,5]],[24,24,[-4,3]]]
        },
        {
          rh: [
            [0,4,-3,{tuplet:"start"}],[4,4,0,{tuplet:"mid"}],[8,4,2,{tuplet:"stop"}],
            [12,4,-3,{tuplet:"start"}],[16,4,1,{tuplet:"mid"}],[20,4,3,{tuplet:"stop"}],
            [24,4,-3,{tuplet:"start"}],[28,4,[-1,1],{tuplet:"mid"}],[32,4,1,{tuplet:"stop"}],
            [36,4,-3,{tuplet:"start"}],[40,4,0,{tuplet:"mid"}],[44,4,2,{tuplet:"stop"}]
          ],
          lh: [[0,24,[-3,4]],[24,24,[-3,4]]]
        }
      ]
    },
    {
      id: "bach-invention-1",
      title: "Two-Part Invention No. 1 (Motif)",
      composer: "J. S. Bach",
      minLevel: 6,
      maxLevel: 7,
      mode: "major",
      hands: 2,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      lhOctave: 3,
      bars: [
        {
          rh: [[0,3,null],[3,3,0],[6,3,1],[9,3,2],[12,3,3],[15,3,1],[18,3,2],[21,3,0],[24,6,4],[30,6,7],[36,6,6],[42,6,7]],
          lh: [[0,24,null],[24,3,null],[27,3,0],[30,3,1],[33,3,2],[36,3,3],[39,3,1],[42,3,2],[45,3,0]]
        },
        {
          rh: [[0,3,8],[3,3,7],[6,3,6],[9,3,5],[12,3,4],[15,3,5],[18,3,4],[21,3,3],[24,6,2],[30,6,4],[36,6,3],[42,6,1]],
          lh: [[0,6,4],[6,6,2],[12,6,4],[18,6,0],[24,6,2],[30,6,0],[36,6,1],[42,6,-3]]
        },
        {
          rh: [[0,3,0],[3,3,1],[6,3,2],[9,3,3],[12,3,4],[15,3,2],[18,3,3],[21,3,1],[24,6,2],[30,6,4],[36,6,1],[42,6,-1]],
          lh: [[0,6,0],[6,6,2],[12,6,4],[18,6,2],[24,6,3],[30,6,1],[36,6,4],[42,6,-3]]
        },
        {
          rh: [[0,12,0],[12,6,2],[18,6,4],[24,24,7]],
          lh: [[0,12,0],[12,6,-3],[18,6,-5],[24,24,0]]
        }
      ]
    },

    // --- LEVEL 7-8 (Concert / Romantic / Polyphonic) ---
    {
      id: "chopin-nocturne-9-2",
      title: "Nocturne Op. 9 No. 2 (Lyrical Phrase)",
      composer: "Chopin",
      minLevel: 7,
      maxLevel: 8,
      mode: "major",
      hands: 2,
      meter: { numerator: 6, denominator: 8 },
      rhOctave: 5,
      lhOctave: 2,
      bars: [
        {
          rh: [[0,12,2],[12,6,1],[18,12,2],[30,6,1]],
          lh: [[0,6,0],[6,6,[7,11]],[12,6,[9,11]],[18,6,0],[24,6,[7,11]],[30,6,[9,11]]]
        },
        {
          rh: [[0,12,0],[12,6,-1],[18,18,0]],
          lh: [[0,6,4],[6,6,[8,10,12]],[12,6,[8,10,12]],[18,6,0],[24,6,[7,9,11]],[30,6,[7,9,11]]]
        },
        {
          rh: [[0,9,4],[9,3,3],[12,6,2],[18,6,1],[24,6,2],[30,6,0]],
          lh: [[0,6,5],[6,6,[10,12]],[12,6,[10,12]],[18,6,1],[24,6,[8,10,12]],[30,6,[7,9,11]]]
        },
        {
          rh: [[0,12,1],[12,6,-1],[18,18,0]],
          lh: [[0,6,4],[6,6,[6,8,10]],[12,6,[6,8,10]],[18,18,[0,4,7]]]
        }
      ]
    },
    {
      id: "bach-chorale-poly",
      title: "Chorale Prelude (4-Part Texture)",
      composer: "J. S. Bach (Style)",
      minLevel: 7,
      maxLevel: 8,
      mode: "major",
      hands: 2,
      meter: { numerator: 4, denominator: 4 },
      rhOctave: 4,
      lhOctave: 3,
      bars: [
        {
          rh: [[0,12,[2,4]],[12,12,[2,4]],[24,12,[3,5]],[36,12,[4,6]]],
          lh: [[0,12,[0,4]],[12,12,[-1,4]],[24,12,[-2,4]],[36,12,[-3,4]]]
        },
        {
          rh: [[0,12,[4,7]],[12,6,[3,6]],[18,6,[2,5]],[24,12,[2,4]],[36,12,[[3,1],5]]],
          lh: [[0,12,[0,4]],[12,12,[1,5]],[24,12,[2,4]],[36,12,[1,5]]]
        },
        {
          rh: [[0,12,[4,7]],[12,12,[3,5]],[24,12,[2,4]],[36,12,[1,3]]],
          lh: [[0,12,[4,6]],[12,12,[3,5]],[24,12,[2,4]],[36,12,[1,5]]]
        },
        {
          rh: [[0,12,[2,4]],[12,12,[1,3]],[24,24,[2,4,7]]],
          lh: [[0,12,[0,4]],[12,12,[-3,4]],[24,24,[0,4]]]
        }
      ]
    }
  ];

  function spellFragmentDegreeItem(keyId, item, baseOctave) {
    if (Array.isArray(item)) {
      // Could be [deg, alt] OR chord of degrees/pairs
      if (item.length === 2 && typeof item[0] === "number" && typeof item[1] === "number" && Math.abs(item[1]) <= 1) {
        // Distinguish [deg, alt] vs 2-note chord: we encode altered single note as [[deg, alt]] inside chord or pass flag?
        // Convention in CLASSICAL_FRAGMENTS:
        // - Single note: number (e.g. 4)
        // - Chord: array of elements where each element is number OR [deg, alt]
        // EXCEPT if first element is a number and second is a number, in our fragments e.g. [0, 4] is a 2-note chord!
        // Single altered note in a chord is [[1, 1], 4, 6]. Single altered melody note is [[-1, 1]]!
      }
      return item.map((el) => (
        Array.isArray(el)
          ? spellDegree(keyId, el[0], baseOctave, el[1] || 0)
          : spellDegree(keyId, el, baseOctave, 0)
      ));
    }
    return [spellDegree(keyId, item, baseOctave, 0)];
  }

  function realizeClassicalFragment(fragment, keyId, staffMode, startMeasureIndex) {
    const meter = fragment.meter;
    const measureSlots = meter.numerator * (4 / meter.denominator) * SLOTS_PER_QUARTER;
    const measures = [];

    // Keep transposition comfortable on the staff
    const spec = keySpec(keyId);
    const tonicStepIdx = DIATONIC_STEPS.indexOf(spec.tonicStep);
    const octaveAdjust = tonicStepIdx >= 5 ? -1 : 0; // A/B tonics sit better an octave lower in treble

    fragment.bars.forEach((bar, barIdx) => {
      const voiceEvents = [];
      const rhBase = (fragment.rhOctave ?? 4) + octaveAdjust;
      const lhBase = (fragment.lhOctave ?? 3) + octaveAdjust;

      const buildHand = (entries, staff, voice, baseOct) => {
        if (!entries || !entries.length) return;
        const handEvents = [];
        let tupletGroupId = 0;

        entries.forEach(([slot, durSlots, degSpec, flags = {}]) => {
          const isTuplet = Boolean(flags.tuplet);
          if (flags.tuplet === "start") tupletGroupId += 1;
          const meta = durationMetaFromSlots(durSlots, isTuplet);
          if (degSpec === null) {
            handEvents.push({
              slot,
              rest: true,
              staff,
              voice,
              stemDirection: "",
              ...meta,
              beams: [],
              tuplets: []
            });
          } else {
            // If degSpec is [deg, alt] inside single note, our convention uses [deg, alt] ONLY inside array;
            // wait: in moonlight bar 4 we wrote [-1, 1] directly for a single altered note — let's handle that explicitly:
            let pitches;
            if (Array.isArray(degSpec) && flags.altered) {
              pitches = [spellDegree(keyId, degSpec[0], baseOct, degSpec[1])];
            } else if (
              Array.isArray(degSpec)
              && degSpec.length === 2
              && typeof degSpec[0] === "number"
              && typeof degSpec[1] === "number"
              && degSpec[0] === -1 && degSpec[1] === 1 && staff === "treble" && fragment.id === "beethoven-moonlight"
            ) {
              pitches = [spellDegree(keyId, degSpec[0], baseOct, degSpec[1])];
            } else {
              pitches = spellFragmentDegreeItem(keyId, degSpec, baseOct);
            }
            const tuplets = [];
            if (flags.tuplet === "start") {
              tuplets.push({ type: "start", number: "1", bracketed: false, showNumber: true });
            } else if (flags.tuplet === "stop") {
              tuplets.push({ type: "stop", number: "1", bracketed: false, showNumber: true });
            }
            handEvents.push({
              slot,
              rest: false,
              pitches,
              staff,
              voice,
              stemDirection: "",
              ...meta,
              tupletGroupId: isTuplet ? tupletGroupId : 0,
              beams: [],
              tuplets,
              ties: []
            });
          }
        });
        assignBeamsToVoiceEvents(handEvents, meter.numerator, meter.denominator);
        voiceEvents.push(...handEvents);
      };

      if (fragment.hands === 1) {
        const activeStaff = staffMode === "bass" ? "bass" : "treble";
        const baseOct = activeStaff === "bass" ? 3 + octaveAdjust : rhBase;
        buildHand(bar.rh, activeStaff, "1", baseOct);
      } else {
        buildHand(bar.rh, "treble", "1", rhBase);
        buildHand(bar.lh, "bass", "2", lhBase);
      }

      measures.push({
        measureIndex: startMeasureIndex + barIdx,
        keyId,
        keySignature: spec.keySignature,
        keyName: spec.name,
        timeSignature: `${meter.numerator}/${meter.denominator}`,
        numerator: meter.numerator,
        denominator: meter.denominator,
        slotsPerQuarter: SLOTS_PER_QUARTER,
        targetsPerMeasure: measureSlots,
        targets: compileMeasureTargets(measureSlots, voiceEvents),
        sectionLabel: barIdx === 0 ? `${fragment.title} — ${fragment.composer}` : "",
        chordLabel: ""
      });
    });

    return measures;
  }

  /**
   * Generate a full musical sight-reading score for any difficulty level (1-8).
   * Options:
   *   level: 1..8
   *   measureCount: 8 | 16 | 32
   *   sourceMode: "mixed" | "procedural" | "repertoire"
   *   keyId: "auto" | keyId from KEY_SPECS
   *   handMode: "treble" | "bass" (used for 1-hand levels 1-2)
   *   seed: optional integer for deterministic generation
   */
  function generateSightreadingScore(options = {}) {
    const levelNum = clamp(Number(options.level) || 1, 1, DIFFICULTY_LEVELS.length);
    const levelDef = DIFFICULTY_LEVELS[levelNum - 1];
    const measureCount = [8, 16, 32].includes(Number(options.measureCount)) ? Number(options.measureCount) : 8;
    const sourceMode = ["mixed", "procedural", "repertoire"].includes(options.sourceMode) ? options.sourceMode : "mixed";
    const rng = createRng(options.seed);

    const initialKeyId = (options.keyId && options.keyId !== "auto" && KEY_SPECS[options.keyId])
      ? options.keyId
      : pick(levelDef.keys, rng);
    const staffMode = levelDef.hands === 1
      ? (options.handMode === "bass" ? "bass" : "treble")
      : "grand";

    const measures = [];
    let currentKeyId = initialKeyId;
    let currentMeter = pick(levelDef.meters, rng);
    let prevMelodyPitch = null;
    let prevBassMidi = 46;
    let contourBias = rng() < 0.5 ? 1 : -1;
    let usedFragments = [];

    const matchingFragments = (modeFilter) => CLASSICAL_FRAGMENTS.filter((f) => (
      levelNum >= f.minLevel
      && levelNum <= f.maxLevel
      && (levelDef.hands === f.hands)
      && (!modeFilter || f.mode === modeFilter)
    ));

    // Decide how many phrases (4 bars each) to build
    const totalPhrases = Math.max(1, Math.floor(measureCount / 4));
    let phraseIdx = 0;

    while (measures.length < measureCount) {
      const barsRemaining = measureCount - measures.length;
      const isFirstPhrase = measures.length === 0;
      const isLastPhrase = barsRemaining <= 4;

      // Determine whether this phrase uses a curated classical fragment
      const wantFragment = (
        sourceMode === "repertoire"
        || (sourceMode === "mixed" && rng() < 0.42)
      );

      if (wantFragment && barsRemaining >= 4) {
        const spec = keySpec(currentKeyId);
        let candidates = matchingFragments(spec.mode).filter((f) => f.bars.length <= barsRemaining);
        if (!candidates.length && options.keyId === "auto") {
          candidates = matchingFragments(null).filter((f) => f.bars.length <= barsRemaining);
        }
        if (candidates.length) {
          const frag = pick(candidates, rng);
          // Match key mode if needed
          let fragKey = currentKeyId;
          if (keySpec(fragKey).mode !== frag.mode) {
            const matchingKeys = levelDef.keys.filter((k) => keySpec(k).mode === frag.mode);
            fragKey = matchingKeys.length ? pick(matchingKeys, rng) : (frag.mode === "minor" ? "Am" : "C");
          }
          const fragMeasures = realizeClassicalFragment(frag, fragKey, staffMode, measures.length);
          measures.push(...fragMeasures);
          usedFragments.push(`${frag.title} (${frag.composer})`);
          currentKeyId = fragKey;
          currentMeter = frag.meter;
          phraseIdx += Math.ceil(fragMeasures.length / 4);
          prevMelodyPitch = null;
          continue;
        }
      }

      // Procedural musical phrase (4 bars)
      let modulatedHere = false;
      let meterChangedHere = false;

      // Mid-piece key signature modulation for Level 6+
      if (!isFirstPhrase && levelNum >= 6 && (phraseIdx % 2 === 1 || levelNum >= 8)) {
        const shouldModulate = levelNum >= 8 ? rng() < 0.75 : levelNum === 7 ? rng() < 0.65 : rng() < 0.6;
        if (shouldModulate) {
          if (isLastPhrase && currentKeyId !== initialKeyId && rng() < 0.65) {
            // Return home to tonic key for satisfying formal closure!
            currentKeyId = initialKeyId;
            modulatedHere = true;
          } else {
            const targets = modulationTargetsForKey(currentKeyId, levelNum);
            const nextKey = pick(targets, rng);
            if (nextKey !== currentKeyId) {
              currentKeyId = nextKey;
              modulatedHere = true;
            }
          }
        }
      }

      // Optional mid-piece meter change for Level 7+
      if (!isFirstPhrase && levelNum >= 7 && levelDef.meters.length > 1 && rng() < 0.35) {
        const otherMeters = levelDef.meters.filter(
          (m) => m.numerator !== currentMeter.numerator || m.denominator !== currentMeter.denominator
        );
        if (otherMeters.length) {
          currentMeter = pick(otherMeters, rng);
          meterChangedHere = true;
        }
      }

      const phraseBars = Math.min(4, barsRemaining);
      const chords = choosePhraseChords(currentKeyId, levelNum, isLastPhrase, rng);
      const texture = chooseAccompanimentTexture(levelNum, currentMeter, rng);
      // Motivic coherence: reuse the same rhythmic motif in bars 1 & 2 (or 1 & 3) of the phrase!
      const motifRhythmA = pickRhythmPattern(currentMeter, levelNum, rng);
      const motifRhythmB = pickRhythmPattern(currentMeter, levelNum, rng);

      const spec = keySpec(currentKeyId);
      const measureSlots = currentMeter.numerator * (4 / currentMeter.denominator) * SLOTS_PER_QUARTER;

      // Pitch range per level & staff
      let melodyMin;
      let melodyMax;
      if (staffMode === "bass") {
        melodyMin = levelNum === 1 ? 48 : 43;
        melodyMax = levelNum === 1 ? 57 : 60;
      } else {
        melodyMin = 60;
        melodyMax = levelNum === 1 ? 69 : levelNum === 2 ? 74 : levelNum <= 4 ? 77 : levelNum <= 6 ? 81 : 84;
      }

      for (let b = 0; b < phraseBars; b += 1) {
        const barNumber = measures.length;
        const isCadenceBar = b === phraseBars - 1;
        const isFinalBar = barNumber === measureCount - 1;
        const chord = chords[b % chords.length];

        const realized = realizeChord(currentKeyId, chord, {
          bassRange: levelNum >= 7 ? [36, 48] : [38, 49],
          trebleRange: [melodyMin, melodyMax],
          prevBassMidi
        });
        prevBassMidi = realized.bassPitch.midi;

        const barRhythm = isFinalBar
          ? cadenceRhythmForMeter(currentMeter, levelNum)
          : isCadenceBar
          ? (rng() < 0.6 ? cadenceRhythmForMeter(currentMeter, levelNum) : motifRhythmB)
          : (b === 0 || b === 2 ? motifRhythmA : (rng() < 0.5 ? motifRhythmA : motifRhythmB));

        const melodyStaff = staffMode === "bass" ? "bass" : "treble";
        const useRhPolyphony = staffMode === "grand" && levelNum >= 6 && texture !== "polyphonic" && b < 3 && rng() < 0.35;

        const melodyResult = generateMelodyMeasure({
          realizedChord: realized,
          meter: currentMeter,
          level: levelNum,
          staff: melodyStaff,
          voice: "1",
          stemDirection: useRhPolyphony ? "up" : "",
          minMidi: melodyMin,
          maxMidi: melodyMax,
          rhythmPattern: barRhythm,
          prevPitch: prevMelodyPitch,
          contourBias,
          isCadenceBar,
          isFinalBar,
          addHarmonyIntervals: staffMode === "grand" && levelNum >= 4 && !useRhPolyphony,
          measureIndex: barNumber,
          rng
        });

        prevMelodyPitch = melodyResult.endPitch;
        contourBias = melodyResult.contourBias;

        const allEvents = [...melodyResult.events];

        // Optional RH inner voice (2-voice treble counterpoint for Level 6+)
        if (useRhPolyphony) {
          const rhMidis = melodyResult.events
            .filter((e) => !e.rest && e.pitches?.length)
            .map((e) => Math.min(...e.pitches.map((p) => p.midi)));
          const minRhMidi = rhMidis.length ? Math.min(...rhMidis) : 67;
          const maxRhMidi = rhMidis.length ? Math.max(...rhMidis) : 72;
          const innerCandidate = realized.pool.find(
            (p) => p.midi >= 60 && p.midi <= minRhMidi - 3 && maxRhMidi - p.midi <= 11
          );
          if (innerCandidate) {
            const innerSlots = measureSlots === 48 ? [24, 24] : [measureSlots];
            let slotCur = 0;
            innerSlots.forEach((ds) => {
              allEvents.push({
                slot: slotCur,
                rest: false,
                pitches: [innerCandidate],
                staff: "treble",
                voice: "1b",
                stemDirection: "down",
                ...durationMetaFromSlots(ds),
                beams: [],
                tuplets: [],
                ties: []
              });
              slotCur += ds;
            });
          }
        }

        // Accompaniment for 2-hand levels
        if (staffMode === "grand") {
          const lhEvents = generateAccompanimentMeasure({
            realizedChord: realized,
            meter: currentMeter,
            level: levelNum,
            texture,
            isFinalBar,
            measureIndex: barNumber,
            rng
          });
          allEvents.push(...lhEvents);
        }

        const labelParts = [];
        if (b === 0 && modulatedHere) labelParts.push(`Modulation → ${spec.name}`);
        if (b === 0 && meterChangedHere) labelParts.push(`${currentMeter.numerator}/${currentMeter.denominator}`);

        measures.push({
          measureIndex: barNumber,
          keyId: currentKeyId,
          keySignature: spec.keySignature,
          keyName: spec.name,
          timeSignature: `${currentMeter.numerator}/${currentMeter.denominator}`,
          numerator: currentMeter.numerator,
          denominator: currentMeter.denominator,
          slotsPerQuarter: SLOTS_PER_QUARTER,
          targetsPerMeasure: measureSlots,
          targets: compileMeasureTargets(measureSlots, allEvents),
          sectionLabel: labelParts.join(" · "),
          chordLabel: chord.label
        });
      }

      phraseIdx += 1;
    }

    // Mark barlines: double barline before any key/meter change, END barline on final measure
    for (let i = 0; i < measures.length; i += 1) {
      const m = measures[i];
      const next = measures[i + 1];
      if (!next) {
        m.barlineEnd = "end";
      } else if (next.keySignature !== m.keySignature || next.timeSignature !== m.timeSignature) {
        m.barlineEnd = "double";
      } else {
        m.barlineEnd = "single";
      }
    }

    const totalQuarterNoteBeats = measures.reduce(
      (sum, m) => sum + (m.numerator * (4 / m.denominator)),
      0
    );

    const uniqueFragments = [...new Set(usedFragments)];
    const initialSpec = keySpec(measures[0]?.keyId || initialKeyId);
    const hasKeyChange = measures.some((m) => m.keySignature !== measures[0].keySignature);
    const subtitleParts = [
      `Level ${levelDef.level}: ${levelDef.name}`,
      initialSpec.name + (hasKeyChange ? " (modulating)" : ""),
      `${measures.length} bars`
    ];

    return {
      id: `sightreading:L${levelDef.level}:${Date.now()}`,
      title: uniqueFragments.length === 1 && sourceMode === "repertoire"
        ? uniqueFragments[0]
        : `Level ${levelDef.level} — ${levelDef.name}`,
      subtitle: subtitleParts.join(" · "),
      level: levelDef.level,
      levelDef,
      staffMode,
      initialKeyId: measures[0]?.keyId || initialKeyId,
      hasKeyChange,
      usedFragments: uniqueFragments,
      measureCount: measures.length,
      totalQuarterNoteBeats,
      measures
    };
  }

  // ============================================================================
  // SCORING & RATING SYSTEM
  // ============================================================================
  const RANKS = [
    { minRating: 0,    name: "Novice I" },
    { minRating: 150,  name: "Novice II" },
    { minRating: 300,  name: "Apprentice I" },
    { minRating: 500,  name: "Apprentice II" },
    { minRating: 750,  name: "Reader I" },
    { minRating: 1050, name: "Reader II" },
    { minRating: 1400, name: "Fluent I" },
    { minRating: 1800, name: "Fluent II" },
    { minRating: 2250, name: "Skilled Pianist" },
    { minRating: 2800, name: "Proficient Reader" },
    { minRating: 3500, name: "Concert Reader" },
    { minRating: 4500, name: "Virtuoso" }
  ];

  function rankForRating(rating) {
    let current = RANKS[0];
    for (const r of RANKS) {
      if (rating >= r.minRating) current = r;
    }
    return current.name;
  }

  function streakMultiplier(streak) {
    if (streak >= 40) return 4.0;
    if (streak >= 25) return 3.0;
    if (streak >= 14) return 2.25;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.25;
    return 1.0;
  }

  function gradeForRun(noteAccuracyPct, cleanMeasurePct, bpm, targetBpm) {
    const blended = (noteAccuracyPct * 0.65) + (cleanMeasurePct * 0.35);
    const tempoRatio = targetBpm > 0 ? bpm / targetBpm : 1;
    if (noteAccuracyPct >= 97 && cleanMeasurePct >= 88 && tempoRatio >= 0.72) {
      return { grade: "S", stars: 3, label: "Masterful" };
    }
    if (blended >= 90) return { grade: "A", stars: 3, label: "Excellent" };
    if (blended >= 80) return { grade: "B", stars: 2, label: "Solid" };
    if (blended >= 68) return { grade: "C", stars: 1, label: "Developing" };
    return { grade: "D", stars: 0, label: "Keep Practicing" };
  }

  function computeFinalRunSummary({
    level,
    basePoints,
    cleanMeasures,
    totalMeasures,
    cleanTargets,
    totalTargets,
    mistakes,
    bestStreak,
    elapsedMs,
    totalQuarterNoteBeats,
    currentRating
  }) {
    const levelDef = DIFFICULTY_LEVELS[clamp(level, 1, DIFFICULTY_LEVELS.length) - 1];
    const noteAccuracyPct = totalTargets > 0 ? (cleanTargets / totalTargets) * 100 : 0;
    const cleanMeasurePct = totalMeasures > 0 ? (cleanMeasures / totalMeasures) * 100 : 0;
    const bpm = elapsedMs > 0 && totalQuarterNoteBeats > 0
      ? totalQuarterNoteBeats / (elapsedMs / 60000)
      : 0;

    const cleanMeasureBonus = Math.round(cleanMeasures * 45 * levelDef.scoreMultiplier);
    // Fluency bonus rewards comfortable reading pace without penalizing slow, accurate reading
    const paceFactor = clamp(bpm / Math.max(levelDef.targetBpm, 40), 0, 1.35);
    const flowBonus = Math.round(
      (noteAccuracyPct / 100) * paceFactor * totalMeasures * 30 * levelDef.scoreMultiplier
    );
    const totalScore = Math.round(basePoints + cleanMeasureBonus + flowBonus);

    const { grade, stars, label } = gradeForRun(
      noteAccuracyPct,
      cleanMeasurePct,
      bpm,
      levelDef.targetBpm
    );

    // Skill rating update: scales with level difficulty & accuracy, gentle downward adjustment only if rating is much higher than level
    const levelTargetRating = levelDef.level * 520;
    const perfQuality = (noteAccuracyPct * 0.7 + cleanMeasurePct * 0.3) / 100;
    let ratingDelta;
    if (perfQuality >= 0.85) {
      const bonus = currentRating < levelTargetRating ? 1.35 : 0.75;
      ratingDelta = Math.round((20 + (levelDef.level * 9)) * perfQuality * bonus);
    } else if (perfQuality >= 0.65) {
      ratingDelta = Math.round((8 + (levelDef.level * 4)) * (perfQuality - 0.55));
    } else {
      ratingDelta = currentRating > levelTargetRating - 200 ? -Math.round(12 + levelDef.level * 2) : 0;
    }

    const newRating = Math.max(0, Math.round(currentRating + ratingDelta));
    const xpGained = Math.max(15, Math.round(totalScore / 18));

    return {
      level: levelDef.level,
      levelName: levelDef.name,
      totalScore,
      basePoints: Math.round(basePoints),
      cleanMeasureBonus,
      flowBonus,
      noteAccuracyPct: Math.round(noteAccuracyPct),
      cleanMeasurePct: Math.round(cleanMeasurePct),
      cleanMeasures,
      totalMeasures,
      totalTargets,
      mistakes,
      bestStreak,
      bpm: Math.round(bpm),
      elapsedMs,
      grade,
      stars,
      gradeLabel: label,
      ratingDelta,
      newRating,
      newRank: rankForRating(newRating),
      xpGained,
      recommendLevelUp: (grade === "S" || grade === "A") && levelDef.level < DIFFICULTY_LEVELS.length
    };
  }

  return {
    DIFFICULTY_LEVELS,
    KEY_SPECS,
    CLASSICAL_FRAGMENTS,
    SLOTS_PER_QUARTER,
    keySpec,
    keySignatureAlters,
    spellDegree,
    generateSightreadingScore,
    streakMultiplier,
    rankForRating,
    computeFinalRunSummary
  };
}));
