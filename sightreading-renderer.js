(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SightreadingRenderer = factory();
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DIATONIC_STEPS = ["C", "D", "E", "F", "G", "A", "B"];
  const LEDGER_LINE_OVERHANG = 0.0;
  const REST_NOTE_CLEARANCE_STEPS = 5;
  const REST_NOTE_OVERLAP_STEPS = 5;
  const DYNAMIC_REST_Y_OFFSET_STEPS = -1;
  const MULTI_VOICE_REST_FLOOR_KEYS = {
    treble: "a/4",
    bass: "c/3"
  };

  const SHARP_ORDER = ["F", "C", "G", "D", "A", "E", "B"];
  const FLAT_ORDER = ["B", "E", "A", "D", "G", "C", "F"];
  const KEY_SIG_FIFTHS = {
    C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, "F#": 6, "C#": 7,
    F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7
  };

  function keyAccidentalForStep(keySignature, step) {
    const fifths = KEY_SIG_FIFTHS[keySignature] ?? 0;
    if (fifths > 0) return SHARP_ORDER.slice(0, fifths).includes(step) ? "#" : "";
    if (fifths < 0) return FLAT_ORDER.slice(0, -fifths).includes(step) ? "b" : "";
    return "";
  }

  function targetNotes(target) {
    if (!target || target.rest) return [];
    return Array.isArray(target.notes) ? target.notes : [target];
  }

  function isTieContinuation(note) {
    return Boolean(note?.ties?.some((tie) => tie.type === "stop" || tie.type === "continue"));
  }

  function requiredTargetNotes(target) {
    return targetNotes(target).filter((note) => !isTieContinuation(note));
  }

  function vexKey(note) {
    const accidental = note.accidental === "n" ? "" : note.accidental || note.keyAccidental || "";
    return `${note.step.toLowerCase()}${accidental}/${note.octave}`;
  }

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
    return Math.round(nearestPositions.reduce((sum, p) => sum + p, 0) / nearestPositions.length);
  }

  function collisionAwareRestKey(measureTargets, slot, staff, voiceId, rest) {
    const staffDefaultKey = staff === "bass" ? "d/3" : "b/4";
    const sourcePosition = diatonicPositionForVexKey(rest.displayKey);
    const voicePosition = nearestVoicePosition(measureTargets, slot, staff, voiceId);
    const basePosition = voicePosition ?? sourcePosition ?? diatonicPositionForVexKey(staffDefaultKey);
    const otherVoicePositions = targetNotes(measureTargets[slot])
      .filter((note) => note.staff === staff && note.voice !== voiceId)
      .map((note) => diatonicPosition(note.step, note.octave))
      .filter(Number.isFinite);

    if (!otherVoicePositions.some((pos) => Math.abs(basePosition - pos) < REST_NOTE_OVERLAP_STEPS)) {
      return clampMultiVoiceRestKey(vexKeyForDiatonicPosition(basePosition), staff);
    }

    const upperPos = Math.max(...otherVoicePositions) + REST_NOTE_CLEARANCE_STEPS;
    const lowerPos = Math.min(...otherVoicePositions) - REST_NOTE_CLEARANCE_STEPS;
    const otherCenter = otherVoicePositions.reduce((s, p) => s + p, 0) / otherVoicePositions.length;

    let chosen;
    if (basePosition > otherCenter) chosen = upperPos - DYNAMIC_REST_Y_OFFSET_STEPS;
    else if (basePosition < otherCenter) chosen = lowerPos - DYNAMIC_REST_Y_OFFSET_STEPS;
    else if (sourcePosition > otherCenter) chosen = upperPos - DYNAMIC_REST_Y_OFFSET_STEPS;
    else if (sourcePosition < otherCenter) chosen = lowerPos - DYNAMIC_REST_Y_OFFSET_STEPS;
    else chosen = (upperPos - basePosition <= basePosition - lowerPos ? upperPos : lowerPos) - DYNAMIC_REST_Y_OFFSET_STEPS;

    return clampMultiVoiceRestKey(vexKeyForDiatonicPosition(chosen), staff);
  }

  function vexDurationForType(type) {
    return ({ whole: "w", half: "h", quarter: "q", eighth: "8", "16th": "16" })[type] || "q";
  }

  function noteStyleForTarget(target, isCurrent, isPast) {
    if (target?.corrected) {
      return { fillStyle: "#177245", strokeStyle: "#177245" };
    }
    if (target?.missed) {
      return { fillStyle: "#b23a34", strokeStyle: "#b23a34" };
    }
    if (isCurrent) {
      return { fillStyle: "#e09f1f", strokeStyle: "#5c3f05" };
    }
    if (isPast) {
      return { fillStyle: "#177245", strokeStyle: "#177245" };
    }
    return { fillStyle: "#11191d", strokeStyle: "#11191d" };
  }

  /**
   * Compute accidental signs to render for every note in a measure,
   * supporting measure-scoped accidental persistence AND courtesy accidentals
   * after chromatic alterations in the previous bar.
   */
  function accidentalDisplayForMeasure(measureTargets, keySignature, prevBarAlteredPitches) {
    const displays = new WeakMap();
    const activeAccidentals = new Map();
    const alteredInThisBar = new Set();

    measureTargets.forEach((target) => {
      targetNotes(target).forEach((note) => {
        const keyAcc = keyAccidentalForStep(keySignature, note.step);
        const writtenAcc = note.accidental === "n"
          ? ""
          : (note.accidental || note.keyAccidental || keyAcc);
        const pitchKey = `${note.staff}:${note.step}:${note.octave}`;
        const activeAcc = activeAccidentals.has(pitchKey)
          ? activeAccidentals.get(pitchKey)
          : keyAcc;

        let display = "";
        if (writtenAcc !== activeAcc) {
          display = writtenAcc || "n";
        } else if (!activeAccidentals.has(pitchKey) && prevBarAlteredPitches?.has(pitchKey)) {
          // Courtesy accidental when returning to the key signature after an alteration in the previous bar
          display = writtenAcc || "n";
        }

        if (writtenAcc !== keyAcc) {
          alteredInThisBar.add(pitchKey);
        }

        displays.set(note, display);
        activeAccidentals.set(pitchKey, writtenAcc);
      });
    });

    return { displays, alteredInThisBar };
  }

  function groupCandidatesByVoice(candidates) {
    const groups = new Map();
    candidates.forEach((c) => {
      const list = groups.get(c.voiceId) || [];
      list.push(c);
      groups.set(c.voiceId, list);
    });
    return groups;
  }

  function makeTuplets(tupletCandidates) {
    const VF = window.VexFlow;
    const tuplets = [];
    const byVoice = groupCandidatesByVoice(tupletCandidates);

    byVoice.forEach((voiceCandidates) => {
      let group = [];
      let ratioKey = "";

      const finishGroup = () => {
        if (!group.length) return;
        const { actualNotes, normalNotes } = group[0].event.timeModification;
        if (group.length === actualNotes) {
          const start = group
            .flatMap(({ event }) => event.tuplets || [])
            .find((t) => t.type === "start");
          const tuplet = new VF.Tuplet(group.map(({ staveNote }) => staveNote), {
            numNotes: actualNotes,
            notesOccupied: normalNotes,
            bracketed: start?.bracketed ?? false
          });
          if (start?.showNumber === false && tuplet.textElement) {
            tuplet.textElement.setText("");
          }
          tuplets.push(tuplet);
        }
        group = [];
        ratioKey = "";
      };

      voiceCandidates
        .sort((a, b) => a.slot - b.slot)
        .forEach((candidate) => {
          const mod = candidate.event.timeModification;
          if (!mod) {
            finishGroup();
            return;
          }
          const key = `${mod.actualNotes}:${mod.normalNotes}`;
          if (ratioKey && key !== ratioKey) finishGroup();
          ratioKey = key;
          group.push(candidate);
          if (group.length === mod.actualNotes) finishGroup();
        });
      finishGroup();
    });

    return tuplets;
  }

  function makeBeams(beamCandidates) {
    const VF = window.VexFlow;
    const beams = [];
    const byVoice = groupCandidatesByVoice(beamCandidates);

    byVoice.forEach((voiceCandidates) => {
      let group = [];
      const finishGroup = () => {
        if (group.length > 1) {
          beams.push(new VF.Beam(group.map(({ staveNote }) => staveNote)));
        }
        group = [];
      };

      voiceCandidates
        .sort((a, b) => a.slot - b.slot)
        .forEach((candidate) => {
          const primary = (candidate.event.beams || []).find((b) => b.number === "1");
          if (!primary) {
            finishGroup();
            return;
          }
          if (primary.type === "begin") finishGroup();
          group.push(candidate);
          if (primary.type === "end") finishGroup();
        });
      finishGroup();
    });

    return beams;
  }

  function drawTies(context, endpoints) {
    const VF = window.VexFlow;
    const pendingTies = new Map();

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
        if (tie.type === "start") {
          pendingTies.set(tie.id, endpoint);
        }
      });
    });

    pendingTies.forEach((endpoint) => drawTie(endpoint, null));
  }

  function computeBeamGroupStemDirections(measureTargets, staff, voiceId, slotsPerQuarter) {
    // Middle staff line diatonic position: B4 (34) for treble, D3 (22) for bass.
    const middleLinePos = staff === "bass" ? diatonicPosition("D", 3) : diatonicPosition("B", 4);
    const slotDirections = new Map();

    const voiceEntries = [];
    let slot = 0;
    while (slot < measureTargets.length) {
      const target = measureTargets[slot];
      const notes = targetNotes(target)
        .filter((n) => n.staff === staff && n.voice === voiceId)
        .sort((a, b) => a.midi - b.midi);
      const rest = (target?.notationRests || [])
        .find((r) => r.staff === staff && r.voice === voiceId);
      const event = notes[0] || rest;
      if (!event) {
        slot += 1;
        continue;
      }
      voiceEntries.push({ slot, notes, rest, event });
      const durSlots = Math.max(
        1,
        Math.round((event.duration || (1 / slotsPerQuarter)) * slotsPerQuarter)
      );
      slot += durSlots;
    }

    let group = [];
    const finishGroup = () => {
      if (group.length > 1) {
        const explicit = group.find((e) => e.event.stemDirection === "up" || e.event.stemDirection === "down");
        let dir;
        if (explicit) {
          dir = explicit.event.stemDirection;
        } else {
          const positions = group
            .flatMap((e) => e.notes)
            .map((n) => diatonicPosition(n.step, n.octave))
            .filter(Number.isFinite);
          if (positions.length) {
            const maxPos = Math.max(...positions);
            const minPos = Math.min(...positions);
            const distAbove = maxPos - middleLinePos;
            const distBelow = middleLinePos - minPos;
            if (distAbove > distBelow) {
              dir = "down";
            } else if (distBelow > distAbove) {
              dir = "up";
            } else {
              const avgPos = positions.reduce((s, p) => s + p, 0) / positions.length;
              dir = avgPos >= middleLinePos ? "down" : "up";
            }
          }
        }
        if (dir) {
          group.forEach((e) => slotDirections.set(e.slot, dir));
        }
      }
      group = [];
    };

    voiceEntries.forEach((entry) => {
      const primary = (!entry.rest && (entry.event.beams || []).find((b) => b.number === "1")) || null;
      if (!primary) {
        finishGroup();
        return;
      }
      if (primary.type === "begin") finishGroup();
      group.push(entry);
      if (primary.type === "end") finishGroup();
    });
    finishGroup();

    return slotDirections;
  }

  function makeStaffVoices(
    measure,
    staff,
    stave,
    currentGlobalIndex,
    renderedTargetNotes,
    notationEndpoints,
    systemIndex,
    accidentalDisplays
  ) {
    const VF = window.VexFlow;
    const measureTargets = measure.targets;
    const slotsPerQuarter = measure.slotsPerQuarter || 12;

    const voicesInMeasure = new Set();
    measureTargets.forEach((target) => {
      targetNotes(target)
        .filter((n) => n.staff === staff && n.voice)
        .forEach((n) => voicesInMeasure.add(n.voice));
      (target?.notationRests || [])
        .filter((r) => r.staff === staff)
        .forEach((r) => voicesInMeasure.add(r.voice));
    });

    if (!voicesInMeasure.size) {
      // Empty staff in this measure: draw a clean full-measure rest
      const restKey = staff === "bass" ? "d/3" : "b/4";
      const restNote = new VF.StaveNote({
        clef: staff,
        keys: [restKey],
        duration: "wr"
      });
      return [{
        stave,
        staveNotes: [restNote],
        notationCandidates: [],
        staff
      }];
    }

    const hasMultipleVoices = voicesInMeasure.size > 1;

    return [...voicesInMeasure].map((voiceId) => {
      const staveNotes = [];
      const notationCandidates = [];
      const beamGroupStemDirs = computeBeamGroupStemDirections(
        measureTargets,
        staff,
        voiceId,
        slotsPerQuarter
      );
      let slot = 0;

      const eventAtSlot = (targetSlot) => {
        const target = measureTargets[targetSlot];
        const notes = targetNotes(target)
          .filter((n) => n.staff === staff && n.voice === voiceId)
          .sort((a, b) => a.midi - b.midi);
        const rest = (target?.notationRests || [])
          .find((r) => r.staff === staff && r.voice === voiceId);
        return { target, notes, rest, event: notes[0] || rest };
      };

      while (slot < measureTargets.length) {
        const { target, notes, rest, event } = eventAtSlot(slot);

        if (!event) {
          let gapEnd = slot + 1;
          while (gapEnd < measureTargets.length && !eventAtSlot(gapEnd).event) gapEnd += 1;
          const ghostNote = new VF.GhostNote("q");
          ghostNote.setDuration(new VF.Fraction(gapEnd - slot, slotsPerQuarter * 4));
          staveNotes.push(ghostNote);
          slot = gapEnd;
          continue;
        }

        const dots = event.dots || 0;
        const duration = `${vexDurationForType(event.type)}${"d".repeat(dots)}${rest ? "r" : ""}`;
        const resolvedStemDir = event.stemDirection || beamGroupStemDirs.get(slot) || "";
        const stemDirection = resolvedStemDir === "down"
          ? VF.Stem.DOWN
          : resolvedStemDir === "up"
          ? VF.Stem.UP
          : null;
        const restKey = rest && hasMultipleVoices
          ? collisionAwareRestKey(measureTargets, slot, staff, voiceId, rest)
          : rest?.displayKey || (staff === "bass" ? "d/3" : "b/4");

        const staveNote = new VF.StaveNote({
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
            if (accidental) {
              staveNote.addModifier(new VF.Accidental(accidental), noteIndex);
            }
            if (note.ties?.length) {
              notationEndpoints.push({
                staveNote,
                stave,
                systemIndex,
                noteIndex,
                ties: note.ties
              });
            }
          });

          const gIdx = target._globalIndex;
          const isCurrent = gIdx !== undefined && gIdx === currentGlobalIndex;
          const isPast = gIdx !== undefined && currentGlobalIndex >= 0 && gIdx < currentGlobalIndex;
          staveNote.setStyle(noteStyleForTarget(target, isCurrent, isPast));

          if (gIdx !== undefined && renderedTargetNotes) {
            const list = renderedTargetNotes.get(gIdx) || [];
            list.push(staveNote);
            renderedTargetNotes.set(gIdx, list);
          }
        }

        for (let d = 0; d < dots; d += 1) {
          VF.Dot.buildAndAttach([staveNote], { all: true });
        }

        staveNotes.push(staveNote);
        notationCandidates.push({
          staveNote,
          event,
          resolvedStemDir,
          slot,
          voiceId,
          staff,
          restLine: rest ? staveNote.getKeyProps()[0].line : null
        });

        const durationSlots = Math.max(
          1,
          Math.round((event.duration || (1 / slotsPerQuarter)) * slotsPerQuarter)
        );
        slot += durationSlots;
      }

      return { stave, staveNotes, notationCandidates, staff };
    });
  }

  function measureSymbolWidth(VF, staffList, systemWidth, opts) {
    return Math.max(...staffList.map((clef) => {
      const plain = new VF.Stave(0, 0, systemWidth);
      const decorated = new VF.Stave(0, 0, systemWidth);
      if (opts.addClef) decorated.addClef(clef);
      if (opts.addKeySig) {
        if (opts.cancelKeySig && opts.cancelKeySig !== opts.keySig) {
          decorated.addKeySignature(opts.keySig, opts.cancelKeySig);
        } else {
          decorated.addKeySignature(opts.keySig);
        }
      }
      if (opts.addTimeSig) decorated.addTimeSignature(opts.timeSig);
      return decorated.getNoteStartX() - plain.getNoteStartX();
    }));
  }

  function applyEndBarline(VF, stave, barlineEnd) {
    if (barlineEnd === "end") {
      stave.setEndBarType(VF.Barline.type.END);
    } else if (barlineEnd === "double") {
      stave.setEndBarType(VF.Barline.type.DOUBLE);
    }
  }

  /**
   * Render a page (or preview system) of measures using VexFlow 5.
   * Returns a Map<globalTargetIndex, StaveNote[]> for fast in-place style updates.
   */
  function drawScorePage(container, measures, options = {}) {
    const VF = window.VexFlow;
    if (!VF) {
      container.textContent = "VexFlow failed to load";
      return new Map();
    }

    const staffMode = options.staffMode || "grand"; // "grand" | "treble" | "bass"
    const staffList = staffMode === "grand" ? ["treble", "bass"] : [staffMode];
    const measuresPerSystem = options.measuresPerSystem || 2;
    const systemCount = options.systemCount || Math.max(1, Math.ceil(measures.length / measuresPerSystem));
    const currentGlobalIndex = options.currentGlobalIndex ?? -1;
    const showLabels = options.showLabels !== false;
    const prevPageLastMeasure = options.prevPageLastMeasure || null;

    const renderedTargetNotes = new Map();
    const isGrand = staffMode === "grand";
    const topMargin = 42;
    const bassOffset = 104;
    const systemSpacing = isGrand ? 258 : 148;
    const defaultHeight = topMargin
      + ((systemCount - 1) * systemSpacing)
      + (isGrand ? (bassOffset + 84) : 84)
      + 26;
    const height = options.height || defaultHeight;

    const containerWidth = container.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 800) || 800;
    const containerHeight = container.clientHeight || (typeof window !== "undefined" ? window.innerHeight : height) || height;
    const minEngravingWidth = measuresPerSystem === 1 ? 420 : 800;
    const maxEngravingWidth = measuresPerSystem === 1 ? 760 : 1380;

    let width;
    if (Number.isFinite(options.logicalWidth)) {
      width = options.logicalWidth;
    } else if (options.fitViewport) {
      const aspectWidth = Math.round(height * (containerWidth / Math.max(containerHeight, 1)));
      width = Math.max(minEngravingWidth, Math.min(maxEngravingWidth, aspectWidth));
    } else {
      width = Math.max(containerWidth, minEngravingWidth);
    }

    const pageMargin = width < 880 ? 12 : 18;
    const systemWidth = width - (pageMargin * 2);

    container.innerHTML = "";
    if (options.fitViewport) {
      container.style.minHeight = "";
    } else {
      const displayScale = Math.min(1, containerWidth / width);
      container.style.minHeight = `${Math.round(height * displayScale)}px`;
    }

    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);

    const svg = container.querySelector ? container.querySelector("svg") : null;
    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("preserveAspectRatio", options.fitViewport ? "xMidYMid meet" : "xMidYMin meet");
      svg.removeAttribute("width");
      svg.removeAttribute("height");
    }

    const context = renderer.getContext();
    context.setBackgroundFillStyle("#fffdf8");
    const notationEndpoints = [];

    let prevMeasure = prevPageLastMeasure;
    let prevBarAlteredPitches = new Set();

    for (let systemIndex = 0; systemIndex < systemCount; systemIndex += 1) {
      const startIdx = systemIndex * measuresPerSystem;
      const systemMeasures = measures.slice(startIdx, startIdx + measuresPerSystem);
      if (!systemMeasures.length) break;

      const baseY = topMargin + (systemIndex * systemSpacing);
      const trebleY = baseY;
      const bassY = isGrand ? baseY + bassOffset : baseY;

      // Pre-compute prefix symbol widths for every measure in this system
      let simPrev = prevMeasure;
      const measureConfigs = systemMeasures.map((m, idxInSystem) => {
        const isSystemStart = idxInSystem === 0;
        const isScoreStart = m.measureIndex === 0;
        const keyChanged = Boolean(simPrev && simPrev.keySignature !== m.keySignature);
        const timeChanged = Boolean(simPrev && simPrev.timeSignature !== m.timeSignature);
        const addClef = isSystemStart;
        const addKeySig = isSystemStart || keyChanged;
        const addTimeSig = isScoreStart || timeChanged;
        const cancelKeySig = keyChanged ? simPrev.keySignature : null;
        const symWidth = measureSymbolWidth(VF, staffList, systemWidth, {
          addClef,
          addKeySig,
          addTimeSig,
          keySig: m.keySignature,
          cancelKeySig,
          timeSig: m.timeSignature
        });
        simPrev = m;
        return {
          measure: m,
          isSystemStart,
          isScoreStart,
          keyChanged,
          timeChanged,
          addClef,
          addKeySig,
          addTimeSig,
          cancelKeySig,
          symWidth
        };
      });

      const totalSymWidth = measureConfigs.reduce((sum, c) => sum + c.symWidth, 0);
      const slotDivisor = Math.max(1, measuresPerSystem);
      const noteSpaceWidth = Math.max(160, (systemWidth - totalSymWidth) / slotDivisor);
      let measureX = pageMargin;

      for (const cfg of measureConfigs) {
        const m = cfg.measure;
        const measureWidth = noteSpaceWidth + cfg.symWidth;

        const staves = staffList.map((clef) => {
          const y = clef === "bass" ? bassY : trebleY;
          const stave = new VF.Stave(measureX, y, measureWidth);
          if (cfg.addClef) stave.addClef(clef);
          if (cfg.addKeySig) {
            if (cfg.cancelKeySig && cfg.cancelKeySig !== m.keySignature) {
              stave.addKeySignature(m.keySignature, cfg.cancelKeySig);
            } else {
              stave.addKeySignature(m.keySignature);
            }
          }
          if (cfg.addTimeSig) stave.addTimeSignature(m.timeSignature);
          applyEndBarline(VF, stave, m.barlineEnd);
          stave.setContext(context).draw();
          return { clef, stave };
        });

        // Draw connectors for grand staff
        if (isGrand && VF.StaveConnector) {
          const trebleStave = staves[0].stave;
          const bassStave = staves[1].stave;
          const connectors = [];
          if (cfg.isSystemStart) {
            connectors.push(VF.StaveConnector.type.BRACE, VF.StaveConnector.type.SINGLE_LEFT);
          }
          if (m.barlineEnd === "end") {
            connectors.push(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
          } else if (m.barlineEnd === "double") {
            connectors.push(VF.StaveConnector.type.THIN_DOUBLE);
          } else {
            connectors.push(VF.StaveConnector.type.SINGLE_RIGHT);
          }
          connectors.forEach((type) => {
            try {
              new VF.StaveConnector(trebleStave, bassStave)
                .setType(type)
                .setContext(context)
                .draw();
            } catch {
              new VF.StaveConnector(trebleStave, bassStave)
                .setType(VF.StaveConnector.type.SINGLE_RIGHT)
                .setContext(context)
                .draw();
            }
          });
        }

        // Measure number at start of system (bar 2+)
        const displayMeasureNum = m.measureIndex + 1;
        if (cfg.isSystemStart && displayMeasureNum > 1) {
          context.save();
          context.setFont("Arial", 11, "normal");
          context.setFillStyle("#64748b");
          context.fillText(String(displayMeasureNum), measureX + 2, trebleY + 12);
          context.restore();
        }

        // Section / modulation / chord annotation
        if (showLabels) {
          const topLabel = m.sectionLabel || "";
          if (topLabel) {
            context.save();
            context.setFont("Arial", 11, "bold");
            context.setFillStyle("#0f766e");
            context.fillText(topLabel, measureX + (cfg.isSystemStart ? 26 : 6), trebleY - 12);
            context.restore();
          } else if (m.chordLabel && options.showChords) {
            context.save();
            context.setFont("Arial", 10, "normal");
            context.setFillStyle("#64748b");
            context.fillText(m.chordLabel, measureX + cfg.symWidth + 10, trebleY - 8);
            context.restore();
          }
        }

        // Reset courtesy accidental tracking on key change
        if (cfg.keyChanged) prevBarAlteredPitches = new Set();

        const { displays: accidentalDisplays, alteredInThisBar } = accidentalDisplayForMeasure(
          m.targets,
          m.keySignature,
          prevBarAlteredPitches
        );
        prevBarAlteredPitches = alteredInThisBar;

        const voices = staves.flatMap(({ clef, stave }) => (
          makeStaffVoices(
            m,
            clef,
            stave,
            currentGlobalIndex,
            renderedTargetNotes,
            notationEndpoints,
            systemIndex,
            accidentalDisplays
          )
        ));

        const notationCandidates = voices.flatMap((v) => v.notationCandidates);
        // Tuplets MUST be constructed before voices & Formatter so ticks reflect tuplet ratios!
        const tuplets = makeTuplets(notationCandidates);

        voices.forEach((entry) => {
          entry.voice = new VF.Voice({ num_beats: m.numerator, beat_value: m.denominator })
            .setStrict(false)
            .addTickables(entry.staveNotes);
        });

        const vexVoices = voices.map((v) => v.voice);
        const noteAreaWidth = Math.max(
          90,
          Math.min(...staves.map(({ stave }) => stave.getNoteEndX() - stave.getNoteStartX())) - 16
        );

        const formatter = new VF.Formatter();
        staves.forEach(({ clef }) => {
          const staffVoices = voices.filter((v) => v.staff === clef).map((v) => v.voice);
          if (staffVoices.length) formatter.joinVoices(staffVoices);
        });
        formatter.format(vexVoices, noteAreaWidth);

        notationCandidates.forEach(({ staveNote, resolvedStemDir, restLine }) => {
          if (Number.isFinite(restLine)) staveNote.setKeyLine(0, restLine);
          if (resolvedStemDir === "up") staveNote.setStemDirection(VF.Stem.UP);
          if (resolvedStemDir === "down") staveNote.setStemDirection(VF.Stem.DOWN);
        });

        const beams = makeBeams(notationCandidates);
        voices.forEach(({ voice, stave }) => voice.draw(context, stave));
        beams.forEach((beam) => beam.setContext(context).draw());
        tuplets.forEach((tuplet) => tuplet.setContext(context).draw());

        measureX += measureWidth;
        prevMeasure = m;
      }
    }

    drawTies(context, notationEndpoints);
    return renderedTargetNotes;
  }

  function refreshRenderedTargetStyle(renderedTargetNotes, globalIndex, target, currentGlobalIndex) {
    if (!renderedTargetNotes || !target) return;
    const isCurrent = globalIndex === currentGlobalIndex;
    const isPast = currentGlobalIndex >= 0 && globalIndex < currentGlobalIndex;
    const style = noteStyleForTarget(target, isCurrent, isPast);

    (renderedTargetNotes.get(globalIndex) || []).forEach((staveNote) => {
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

  return {
    targetNotes,
    isTieContinuation,
    requiredTargetNotes,
    drawScorePage,
    refreshRenderedTargetStyle
  };
}));
