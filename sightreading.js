(function () {
  "use strict";

  const Engine = window.SightreadingEngine;
  const Renderer = window.SightreadingRenderer;

  const STORAGE_KEY = "sightline-sightreading-profile-v1";
  const SETTINGS_KEY = "sightline-sightreading-settings-v1";
  const SYSTEMS_PER_PAGE = 4;
  const MEASURES_PER_SYSTEM = 2;
  const MEASURES_PER_PAGE = SYSTEMS_PER_PAGE * MEASURES_PER_SYSTEM;

  const GRADE_ORDER = { D: 0, C: 1, B: 2, A: 3, S: 4 };

  const els = {
    midiStatus: document.getElementById("midiStatus"),
    midiInputs: document.getElementById("midiInputs"),
    connectMidi: document.getElementById("connectMidi"),

    lobbyView: document.getElementById("lobbyView"),
    profileRank: document.getElementById("profileRank"),
    profileRating: document.getElementById("profileRating"),
    profileXp: document.getElementById("profileXp"),
    profilePieces: document.getElementById("profilePieces"),
    profileAvgAcc: document.getElementById("profileAvgAcc"),
    profileBestStreak: document.getElementById("profileBestStreak"),
    profileHighestGrade: document.getElementById("profileHighestGrade"),
    resetProgress: document.getElementById("resetProgress"),

    optMeasures: document.getElementById("optMeasures"),
    optSource: document.getElementById("optSource"),
    optKey: document.getElementById("optKey"),
    optHand: document.getElementById("optHand"),
    optShowLabels: document.getElementById("optShowLabels"),
    optShowChords: document.getElementById("optShowChords"),
    optSynthAudio: document.getElementById("optSynthAudio"),

    levelGrid: document.getElementById("levelGrid"),
    historySection: document.getElementById("historySection"),
    historyCount: document.getElementById("historyCount"),
    historyBody: document.getElementById("historyBody"),

    playerView: document.getElementById("playerView"),
    backToLobby: document.getElementById("backToLobby"),
    playerKicker: document.getElementById("playerKicker"),
    pieceTitle: document.getElementById("pieceTitle"),
    hudScore: document.getElementById("hudScore"),
    hudStreakWrap: document.getElementById("hudStreakWrap"),
    hudStreak: document.getElementById("hudStreak"),
    hudAccuracy: document.getElementById("hudAccuracy"),
    hudTimer: document.getElementById("hudTimer"),
    hudProgress: document.getElementById("hudProgress"),
    feedback: document.getElementById("feedback"),
    score: document.getElementById("score"),

    newPieceBtn: document.getElementById("newPieceBtn"),
    retryPieceBtn: document.getElementById("retryPieceBtn"),
    demoModeBtn: document.getElementById("demoModeBtn"),
    synthToggleBtn: document.getElementById("synthToggleBtn"),
    focusModeBtn: document.getElementById("focusModeBtn"),
    keyboardHint: document.getElementById("keyboardHint"),

    resultsModal: document.getElementById("resultsModal"),
    resGrade: document.getElementById("resGrade"),
    resultsTitle: document.getElementById("resultsTitle"),
    resSubtitle: document.getElementById("resSubtitle"),
    resScore: document.getElementById("resScore"),
    resNewBest: document.getElementById("resNewBest"),
    resRatingDelta: document.getElementById("resRatingDelta"),
    resNoteAcc: document.getElementById("resNoteAcc"),
    resCleanBars: document.getElementById("resCleanBars"),
    resBestStreak: document.getElementById("resBestStreak"),
    resBpm: document.getElementById("resBpm"),
    resTime: document.getElementById("resTime"),
    resMistakes: document.getElementById("resMistakes"),
    resBreakdown: document.getElementById("resBreakdown"),
    resNextPiece: document.getElementById("resNextPiece"),
    resLevelUp: document.getElementById("resLevelUp"),
    resRetry: document.getElementById("resRetry"),
    resBackLobby: document.getElementById("resBackLobby")
  };

  // ============================================================================
  // PERSISTENCE
  // ============================================================================
  function defaultProfile() {
    return {
      rating: 100,
      xp: 0,
      piecesCompleted: 0,
      totalAccuracySum: 0,
      bestStreak: 0,
      highestGrade: "",
      recommendedLevel: 1,
      levels: {},
      history: []
    };
  }

  function loadProfile() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || typeof parsed !== "object") return defaultProfile();
      return { ...defaultProfile(), ...parsed };
    } catch {
      return defaultProfile();
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota / private mode failures
    }
  }

  function defaultSettings() {
    return {
      measureCount: 8,
      sourceMode: "mixed",
      keyId: "auto",
      handMode: "treble",
      showLabels: true,
      showChords: false,
      synthAudio: false
    };
  }

  function loadSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      return { ...defaultSettings(), ...(parsed || {}) };
    } catch {
      return defaultSettings();
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }

  // ============================================================================
  // SOFT WEB AUDIO PIANO SYNTH (Optional)
  // ============================================================================
  let audioCtx = null;
  function playSynthNotes(midiList) {
    if (!state.settings.synthAudio || !midiList.length) return;
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;
      if (!audioCtx) audioCtx = new AudioContextCtor();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const now = audioCtx.currentTime;
      const gainScale = Math.min(0.18, 0.34 / Math.sqrt(midiList.length));

      midiList.forEach((midi) => {
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc1.type = "triangle";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 2, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(Math.min(4800, freq * 5), now);
        filter.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.4), now + 0.55);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(gainScale, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.85);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.9);
        osc2.stop(now + 0.9);
      });
    } catch {
      // Audio playback is optional
    }
  }

  // ============================================================================
  // APPLICATION STATE
  // ============================================================================
  const state = {
    profile: loadProfile(),
    settings: loadSettings(),
    midiAccess: null,
    midiInput: null,
    midiConnectPending: false,
    heldMidi: new Set(),

    activeScore: null,
    flatTargets: [],         // [{ target, measureIndex, globalIndex }]
    playableIndices: [],     // list of globalIndex with required notes
    currentGlobalIndex: -1,
    currentPageIndex: 0,
    totalPages: 1,
    renderedTargetNotes: new Map(),

    // Run scoring state
    startedAt: null,
    elapsedMs: 0,
    timerId: null,
    completed: false,
    points: 0,
    streak: 0,
    bestStreak: 0,
    cleanTargets: 0,
    completedTargets: 0,
    mistakes: 0,

    demoMode: false,
    focusMode: false
  };

  function formatDuration(ms) {
    if (!Number.isFinite(ms)) return "0:00.0";
    const totalSeconds = Math.max(0, ms) / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(1).padStart(4, "0");
    return `${minutes}:${seconds}`;
  }

  function midiToName(midi) {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
  }

  function setFeedback(message, kind = "") {
    els.feedback.textContent = message;
    els.feedback.classList.remove("good", "bad", "info");
    if (kind) els.feedback.classList.add(kind);
  }

  // ============================================================================
  // LOBBY RENDERING
  // ============================================================================
  function populateKeyOptions() {
    const keys = Object.entries(Engine.KEY_SPECS);
    els.optKey.innerHTML = `<option value="auto">Auto (level appropriate)</option>`;
    const majorGroup = document.createElement("optgroup");
    majorGroup.label = "Major keys";
    const minorGroup = document.createElement("optgroup");
    minorGroup.label = "Minor keys";

    keys.forEach(([id, spec]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = spec.name;
      if (spec.mode === "major") majorGroup.append(opt);
      else minorGroup.append(opt);
    });

    els.optKey.append(majorGroup, minorGroup);
  }

  function syncSettingsUI() {
    els.optMeasures.value = String(state.settings.measureCount);
    els.optSource.value = state.settings.sourceMode;
    els.optKey.value = state.settings.keyId;
    els.optHand.value = state.settings.handMode;
    els.optShowLabels.checked = Boolean(state.settings.showLabels);
    els.optShowChords.checked = Boolean(state.settings.showChords);
    els.optSynthAudio.checked = Boolean(state.settings.synthAudio);
    els.synthToggleBtn.textContent = `Synth audio: ${state.settings.synthAudio ? "On" : "Off"}`;
    els.synthToggleBtn.classList.toggle("active-toggle", Boolean(state.settings.synthAudio));
  }

  function renderProfileBanner() {
    const p = state.profile;
    els.profileRank.textContent = Engine.rankForRating(p.rating);
    els.profileRating.textContent = String(p.rating);
    els.profileXp.textContent = `${p.xp.toLocaleString()} XP · Recommended: Level ${p.recommendedLevel}`;
    els.profilePieces.textContent = String(p.piecesCompleted);
    els.profileAvgAcc.textContent = p.piecesCompleted
      ? `${Math.round(p.totalAccuracySum / p.piecesCompleted)}%`
      : "—";
    els.profileBestStreak.textContent = String(p.bestStreak);
    els.profileHighestGrade.textContent = p.highestGrade || "—";
  }

  function starsText(count) {
    if (!count) return "☆☆☆";
    return "★".repeat(count) + "☆".repeat(Math.max(0, 3 - count));
  }

  function renderLevelGrid() {
    els.levelGrid.innerHTML = "";
    const rec = state.profile.recommendedLevel || 1;

    Engine.DIFFICULTY_LEVELS.forEach((lvl) => {
      const stats = state.profile.levels[String(lvl.level)];
      const card = document.createElement("button");
      card.type = "button";
      card.className = `level-card${lvl.level === rec ? " recommended" : ""}`;
      card.innerHTML = `
        <div class="level-card-top">
          <span class="level-num">Level ${lvl.level} · x${lvl.scoreMultiplier.toFixed(2).replace(/\.00$/, ".0")} pts</span>
          ${lvl.level === rec ? `<span class="rec-pill">Recommended</span>` : ""}
        </div>
        <div>
          <h3>${lvl.name}</h3>
          <p>${lvl.subtitle}</p>
        </div>
        <div class="tag-row">
          ${lvl.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
        <div class="level-card-footer">
          ${stats ? `
            <span>Best: <strong>${stats.bestScore.toLocaleString()}</strong> · ${stats.plays} ${stats.plays === 1 ? "run" : "runs"}</span>
            <span style="display:flex;align-items:center;gap:0.4rem">
              <span class="stars">${starsText(stats.bestStars)}</span>
              <span class="grade-chip grade-${stats.bestGrade}">${stats.bestGrade}</span>
            </span>
          ` : `
            <span>Not attempted yet</span>
            <span style="color:var(--accent);font-weight:600">Play →</span>
          `}
        </div>
      `;
      card.addEventListener("click", () => startNewPiece(lvl.level));
      els.levelGrid.append(card);
    });
  }

  function renderHistory() {
    const history = state.profile.history || [];
    if (!history.length) {
      els.historySection.hidden = true;
      return;
    }
    els.historySection.hidden = false;
    els.historyCount.textContent = `Last ${history.length} completed`;
    els.historyBody.innerHTML = history.map((item) => `
      <tr>
        <td><strong>Lv. ${item.level}</strong></td>
        <td>${item.title}</td>
        <td><span class="grade-chip grade-${item.grade}">${item.grade}</span></td>
        <td><strong>${item.totalScore.toLocaleString()}</strong></td>
        <td>${item.noteAccuracyPct}%</td>
        <td>${item.cleanMeasures}/${item.totalMeasures}</td>
        <td>${item.bpm} BPM</td>
      </tr>
    `).join("");
  }

  function showLobby() {
    stopTimer();
    els.resultsModal.hidden = true;
    setFocusMode(false);
    els.playerView.hidden = true;
    els.lobbyView.hidden = false;
    renderProfileBanner();
    renderLevelGrid();
    renderHistory();
  }

  function showPlayer() {
    els.resultsModal.hidden = true;
    els.lobbyView.hidden = true;
    els.playerView.hidden = false;
  }

  function setFocusMode(enabled) {
    state.focusMode = enabled;
    document.body.classList.toggle("focus-mode", enabled);
    els.focusModeBtn.textContent = enabled ? "Exit focus view" : "Focus view";
    els.focusModeBtn.classList.toggle("active-toggle", enabled);
    if (state.activeScore && !els.playerView.hidden) {
      renderCurrentPage();
    }
  }

  // ============================================================================
  // SCORE PREPARATION & PAGINATION
  // ============================================================================
  function indexScoreTargets(score) {
    const flatTargets = [];
    const playableIndices = [];
    let globalIdx = 0;

    score.measures.forEach((measure, measureIndex) => {
      measure.targets.forEach((target) => {
        target._globalIndex = globalIdx;
        target._measureIndex = measureIndex;
        delete target.missed;
        delete target.corrected;
        if (Array.isArray(target.playedMidi)) target.playedMidi.length = 0;

        flatTargets.push({ target, measureIndex, globalIndex: globalIdx });
        if (Renderer.requiredTargetNotes(target).length > 0) {
          playableIndices.push(globalIdx);
        }
        globalIdx += 1;
      });
    });

    return { flatTargets, playableIndices };
  }

  function resetRunState() {
    stopTimer();
    state.startedAt = null;
    state.elapsedMs = 0;
    state.completed = false;
    state.points = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.cleanTargets = 0;
    state.completedTargets = 0;
    state.mistakes = 0;
    state.heldMidi.clear();

    if (state.activeScore) {
      const indexed = indexScoreTargets(state.activeScore);
      state.flatTargets = indexed.flatTargets;
      state.playableIndices = indexed.playableIndices;
      state.currentGlobalIndex = indexed.playableIndices[0] ?? -1;
      state.currentPageIndex = 0;
      state.totalPages = Math.max(1, Math.ceil(state.activeScore.measureCount / MEASURES_PER_PAGE));
    }

    updateHud();
  }

  function startNewPiece(level) {
    const score = Engine.generateSightreadingScore({
      level,
      measureCount: state.settings.measureCount,
      sourceMode: state.settings.sourceMode,
      keyId: state.settings.keyId,
      handMode: state.settings.handMode
    });

    state.activeScore = score;
    resetRunState();
    showPlayer();

    els.pieceTitle.textContent = score.title;
    setFeedback("Play the highlighted note");
    renderCurrentPage();
    updateHud();
  }

  function retryCurrentPiece() {
    if (!state.activeScore) return;
    els.resultsModal.hidden = true;
    resetRunState();
    showPlayer();
    setFeedback("Ready — play the highlighted note");
    renderCurrentPage();
    updateHud();
  }

  function pageForMeasure(measureIndex) {
    return Math.floor(measureIndex / MEASURES_PER_PAGE);
  }

  function renderCurrentPage() {
    const score = state.activeScore;
    if (!score) return;

    const startMeasure = state.currentPageIndex * MEASURES_PER_PAGE;
    const pageMeasures = score.measures.slice(startMeasure, startMeasure + MEASURES_PER_PAGE);
    const prevPageLastMeasure = startMeasure > 0 ? score.measures[startMeasure - 1] : null;

    state.renderedTargetNotes = Renderer.drawScorePage(els.score, pageMeasures, {
      staffMode: score.staffMode,
      measuresPerSystem: MEASURES_PER_SYSTEM,
      systemCount: Math.max(1, Math.ceil(pageMeasures.length / MEASURES_PER_SYSTEM)),
      currentGlobalIndex: state.currentGlobalIndex,
      showLabels: state.settings.showLabels,
      showChords: state.settings.showChords,
      prevPageLastMeasure
    });

    updateNextSystemPreview();
  }

  function updateNextSystemPreview() {
    const existing = els.score.querySelector(".next-system-preview");
    const score = state.activeScore;
    if (!score || state.currentPageIndex + 1 >= state.totalPages || state.currentGlobalIndex < 0) {
      existing?.remove();
      return;
    }

    const curEntry = state.flatTargets[state.currentGlobalIndex];
    if (!curEntry) {
      existing?.remove();
      return;
    }

    const pageStartMeasure = state.currentPageIndex * MEASURES_PER_PAGE;
    const measureInPage = curEntry.measureIndex - pageStartMeasure;
    const finalSystemStartMeasure = (SYSTEMS_PER_PAGE - 1) * MEASURES_PER_SYSTEM;

    if (measureInPage < finalSystemStartMeasure) {
      existing?.remove();
      return;
    }

    if (existing) return;

    const nextPageStart = (state.currentPageIndex + 1) * MEASURES_PER_PAGE;
    const previewMeasures = score.measures.slice(nextPageStart, nextPageStart + MEASURES_PER_SYSTEM);
    if (!previewMeasures.length) return;

    const previewHeight = score.staffMode === "grand" ? 335 : 205;
    const preview = document.createElement("div");
    preview.className = "next-system-preview";
    preview.setAttribute("aria-label", "Preview of the first system on the next page");
    els.score.append(preview);

    Renderer.drawScorePage(preview, previewMeasures, {
      staffMode: score.staffMode,
      measuresPerSystem: MEASURES_PER_SYSTEM,
      systemCount: 1,
      height: previewHeight,
      currentGlobalIndex: -1,
      showLabels: state.settings.showLabels,
      showChords: state.settings.showChords,
      prevPageLastMeasure: score.measures[nextPageStart - 1] || null
    });
  }

  // ============================================================================
  // LIVE TIMER & HUD
  // ============================================================================
  function startTimer() {
    if (state.startedAt !== null || state.completed) return;
    state.startedAt = performance.now();
    state.timerId = window.setInterval(updateTimerDisplay, 100);
    updateTimerDisplay();
  }

  function stopTimer() {
    if (state.timerId !== null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function updateTimerDisplay() {
    const elapsed = state.startedAt === null ? state.elapsedMs : performance.now() - state.startedAt;
    els.hudTimer.textContent = formatDuration(elapsed);
  }

  function updateHud() {
    const score = state.activeScore;
    if (!score) return;

    const curEntry = state.currentGlobalIndex >= 0 ? state.flatTargets[state.currentGlobalIndex] : null;
    const activeMeasureIdx = curEntry ? curEntry.measureIndex : score.measureCount - 1;
    const activeMeasure = score.measures[activeMeasureIdx] || score.measures[0];

    els.playerKicker.textContent = `Level ${score.level} · ${activeMeasure.keyName} · ${activeMeasure.timeSignature} · Page ${state.currentPageIndex + 1} of ${state.totalPages}`;
    els.hudScore.textContent = Math.round(state.points).toLocaleString();

    const mult = Engine.streakMultiplier(state.streak);
    els.hudStreak.textContent = `${state.streak} · x${mult.toFixed(mult % 1 === 0 ? 1 : 2)}`;
    els.hudStreakWrap.classList.toggle("streak-hot", state.streak >= 7);

    const accPct = state.completedTargets > 0
      ? Math.round((state.cleanTargets / state.completedTargets) * 100)
      : null;
    els.hudAccuracy.textContent = accPct === null ? "—" : `${accPct}%`;
    els.hudProgress.textContent = `Bar ${Math.min(activeMeasureIdx + 1, score.measureCount)} / ${score.measureCount}`;
    updateTimerDisplay();
  }

  // ============================================================================
  // NOTE MATCHING & SCORING LOGIC
  // ============================================================================
  function nextPlayableGlobalIndex(afterGlobalIndex) {
    for (let i = afterGlobalIndex + 1; i < state.flatTargets.length; i += 1) {
      if (Renderer.requiredTargetNotes(state.flatTargets[i].target).length > 0) {
        return i;
      }
    }
    return -1;
  }

  function countCleanMeasures() {
    if (!state.activeScore) return 0;
    return state.activeScore.measures.filter(
      (m) => !m.targets.some((t) => t.missed)
    ).length;
  }

  function completePiece() {
    if (state.completed || !state.activeScore) return;
    state.completed = true;
    state.elapsedMs = state.startedAt !== null ? performance.now() - state.startedAt : 0;
    stopTimer();

    const score = state.activeScore;
    const cleanMeasures = countCleanMeasures();
    const summary = Engine.computeFinalRunSummary({
      level: score.level,
      basePoints: state.points,
      cleanMeasures,
      totalMeasures: score.measureCount,
      cleanTargets: state.cleanTargets,
      totalTargets: state.playableIndices.length,
      mistakes: state.mistakes,
      bestStreak: state.bestStreak,
      elapsedMs: state.elapsedMs,
      totalQuarterNoteBeats: score.totalQuarterNoteBeats,
      currentRating: state.profile.rating
    });

    // Persist into profile
    const lvlKey = String(score.level);
    const prevLvl = state.profile.levels[lvlKey] || {
      plays: 0,
      bestScore: 0,
      bestGrade: "D",
      bestStars: 0,
      bestAccuracy: 0
    };
    const isNewBest = summary.totalScore > prevLvl.bestScore;
    const bestGrade = (GRADE_ORDER[summary.grade] ?? 0) >= (GRADE_ORDER[prevLvl.bestGrade] ?? 0)
      ? summary.grade
      : prevLvl.bestGrade;

    state.profile.levels[lvlKey] = {
      plays: prevLvl.plays + 1,
      bestScore: Math.max(prevLvl.bestScore, summary.totalScore),
      bestGrade,
      bestStars: Math.max(prevLvl.bestStars, summary.stars),
      bestAccuracy: Math.max(prevLvl.bestAccuracy, summary.noteAccuracyPct)
    };

    state.profile.rating = summary.newRating;
    state.profile.xp += summary.xpGained;
    state.profile.piecesCompleted += 1;
    state.profile.totalAccuracySum += summary.noteAccuracyPct;
    state.profile.bestStreak = Math.max(state.profile.bestStreak, summary.bestStreak);
    if (!state.profile.highestGrade || (GRADE_ORDER[summary.grade] > GRADE_ORDER[state.profile.highestGrade])) {
      state.profile.highestGrade = summary.grade;
    }

    if (summary.recommendLevelUp && score.level >= state.profile.recommendedLevel) {
      state.profile.recommendedLevel = Math.min(Engine.DIFFICULTY_LEVELS.length, score.level + 1);
    }

    state.profile.history.unshift({
      level: score.level,
      title: score.title,
      grade: summary.grade,
      totalScore: summary.totalScore,
      noteAccuracyPct: summary.noteAccuracyPct,
      cleanMeasures: summary.cleanMeasures,
      totalMeasures: summary.totalMeasures,
      bpm: summary.bpm,
      completedAt: new Date().toISOString()
    });
    state.profile.history = state.profile.history.slice(0, 12);
    saveProfile(state.profile);

    updateHud();
    showResultsModal(summary, isNewBest);
  }

  function showResultsModal(summary, isNewBest) {
    els.resGrade.textContent = summary.grade;
    els.resGrade.className = `big-grade grade-${summary.grade}`;
    els.resultsTitle.textContent = `${summary.gradeLabel}! ${starsText(summary.stars)}`;
    els.resSubtitle.textContent = `Level ${summary.level} — ${summary.levelName} · Rank: ${summary.newRank}`;
    els.resScore.textContent = summary.totalScore.toLocaleString();
    els.resNewBest.hidden = !isNewBest;

    const deltaSign = summary.ratingDelta >= 0 ? "+" : "";
    els.resRatingDelta.textContent = `${deltaSign}${summary.ratingDelta} Rating (+${summary.xpGained} XP)`;
    els.resRatingDelta.classList.toggle("negative", summary.ratingDelta < 0);

    els.resNoteAcc.textContent = `${summary.noteAccuracyPct}%`;
    els.resCleanBars.textContent = `${summary.cleanMeasures} / ${summary.totalMeasures}`;
    els.resBestStreak.textContent = String(summary.bestStreak);
    els.resBpm.textContent = `${summary.bpm} BPM`;
    els.resTime.textContent = formatDuration(summary.elapsedMs);
    els.resMistakes.textContent = String(summary.mistakes);

    els.resBreakdown.innerHTML = `
      <span>Notes &amp; Streak: <strong>+${summary.basePoints.toLocaleString()}</strong></span>
      <span>Clean Bars: <strong>+${summary.cleanMeasureBonus.toLocaleString()}</strong></span>
      <span>Flow Bonus: <strong>+${summary.flowBonus.toLocaleString()}</strong></span>
    `;

    const hasNextLevel = summary.level < Engine.DIFFICULTY_LEVELS.length;
    els.resLevelUp.hidden = !hasNextLevel;
    if (hasNextLevel) {
      els.resLevelUp.textContent = `Level ${summary.level + 1}: ${Engine.DIFFICULTY_LEVELS[summary.level].name} →`;
      els.resLevelUp.className = summary.recommendLevelUp ? "btn" : "btn secondary";
      els.resNextPiece.className = summary.recommendLevelUp ? "btn secondary" : "btn";
    } else {
      els.resNextPiece.className = "btn";
    }

    els.resultsModal.hidden = false;
  }

  function handlePlayedNote(midi) {
    if (!state.activeScore || state.completed || state.currentGlobalIndex < 0) return;

    const curEntry = state.flatTargets[state.currentGlobalIndex];
    if (!curEntry) return;
    const target = curEntry.target;

    startTimer();
    playSynthNotes([midi]);

    const expectedNotes = Renderer.requiredTargetNotes(target);
    const expectedMidi = expectedNotes.map((n) => n.midi);
    const isExpected = expectedMidi.includes(midi);

    if (!isExpected) {
      state.mistakes += 1;
      state.streak = 0;
      target.missed = true;
      setFeedback(`Heard ${midiToName(midi)}`, "bad");
      Renderer.refreshRenderedTargetStyle(
        state.renderedTargetNotes,
        state.currentGlobalIndex,
        target,
        state.currentGlobalIndex
      );
      updateHud();
      return;
    }

    const isComplete = expectedMidi.every((m) => state.heldMidi.has(m));
    if (!isComplete) {
      const remaining = expectedMidi.filter((m) => !state.heldMidi.has(m)).length;
      setFeedback(`${remaining} ${remaining === 1 ? "note" : "notes"} left`, "info");
      return;
    }

    // Target completed!
    const prevGlobalIdx = state.currentGlobalIndex;
    const prevMeasureIdx = curEntry.measureIndex;
    const levelMult = state.activeScore.levelDef.scoreMultiplier;
    const chordBonus = Math.max(1, expectedMidi.length * 0.45 + 0.55);
    let earnedPts;

    state.completedTargets += 1;
    if (target.missed) {
      target.corrected = true;
      earnedPts = Math.round(6 * levelMult);
      setFeedback(`Corrected (+${earnedPts})`, "good");
    } else {
      state.cleanTargets += 1;
      state.streak += 1;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      const mult = Engine.streakMultiplier(state.streak);
      earnedPts = Math.round(20 * chordBonus * levelMult * mult);
      setFeedback(state.streak >= 7 ? `Streak ${state.streak}! (+${earnedPts})` : `Correct (+${earnedPts})`, "good");
    }
    state.points += earnedPts;

    // Advance to next playable target
    state.currentGlobalIndex = nextPlayableGlobalIndex(prevGlobalIdx);

    if (state.currentGlobalIndex < 0) {
      Renderer.refreshRenderedTargetStyle(
        state.renderedTargetNotes,
        prevGlobalIdx,
        target,
        Infinity
      );
      completePiece();
      return;
    }

    const nextEntry = state.flatTargets[state.currentGlobalIndex];
    const nextMeasure = state.activeScore.measures[nextEntry.measureIndex];
    const prevMeasure = state.activeScore.measures[prevMeasureIdx];

    // Alert subtly on mid-piece key modulation!
    if (nextEntry.measureIndex !== prevMeasureIdx && nextMeasure.keyId !== prevMeasure.keyId) {
      setFeedback(`Key change → ${nextMeasure.keyName}`, "info");
    }

    const targetPage = pageForMeasure(nextEntry.measureIndex);
    if (targetPage !== state.currentPageIndex) {
      state.currentPageIndex = targetPage;
      renderCurrentPage();
    } else {
      Renderer.refreshRenderedTargetStyle(
        state.renderedTargetNotes,
        prevGlobalIdx,
        target,
        state.currentGlobalIndex
      );
      Renderer.refreshRenderedTargetStyle(
        state.renderedTargetNotes,
        state.currentGlobalIndex,
        nextEntry.target,
        state.currentGlobalIndex
      );
      updateNextSystemPreview();
    }

    updateHud();
  }

  // ============================================================================
  // WEB MIDI + COMPUTER KEYS
  // ============================================================================
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
    return Boolean(state.midiInput && state.midiInput.state !== "disconnected");
  }

  function refreshMidiInputs() {
    const inputs = state.midiAccess
      ? Array.from(state.midiAccess.inputs.values()).filter((i) => i.state !== "disconnected")
      : [];
    els.midiInputs.innerHTML = "";

    if (!inputs.length) {
      state.midiInput = null;
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No MIDI inputs";
      els.midiInputs.append(opt);
      els.midiStatus.textContent = "MIDI disconnected";
      els.midiStatus.classList.remove("connected");
      return;
    }

    inputs.forEach((input) => {
      const opt = document.createElement("option");
      opt.value = input.id;
      opt.textContent = input.name || `MIDI input ${input.id}`;
      els.midiInputs.append(opt);
    });
  }

  function selectMidiInput() {
    if (!state.midiAccess) return;
    if (state.midiInput) state.midiInput.onmidimessage = null;
    state.heldMidi.clear();

    const inputId = els.midiInputs.value;
    const inputs = Array.from(state.midiAccess.inputs.values()).filter((i) => i.state !== "disconnected");
    const chosen = (inputId ? state.midiAccess.inputs.get(inputId) : null);
    state.midiInput = (chosen && chosen.state !== "disconnected") ? chosen : (inputs[0] || null);

    if (state.midiInput) {
      state.midiInput.onmidimessage = onMidiMessage;
      els.midiStatus.textContent = "MIDI connected";
      els.midiStatus.classList.add("connected");
    } else {
      els.midiStatus.textContent = "MIDI disconnected";
      els.midiStatus.classList.remove("connected");
    }
  }

  async function connectMidi() {
    if (hasMidiConnection() || state.midiConnectPending) return;
    if (!navigator.requestMIDIAccess) {
      els.midiStatus.textContent = "Web MIDI unsupported";
      return;
    }
    state.midiConnectPending = true;
    try {
      state.midiAccess = await navigator.requestMIDIAccess();
      state.midiAccess.onstatechange = () => {
        refreshMidiInputs();
        selectMidiInput();
      };
      refreshMidiInputs();
      selectMidiInput();
    } catch {
      els.midiStatus.textContent = "MIDI blocked";
    } finally {
      state.midiConnectPending = false;
    }
  }

  function toggleDemoMode() {
    state.demoMode = !state.demoMode;
    els.keyboardHint.hidden = !state.demoMode;
    els.demoModeBtn.textContent = state.demoMode ? "Disable computer keys" : "Use computer keys";
    els.demoModeBtn.classList.toggle("active-toggle", state.demoMode);
    if (state.demoMode && !hasMidiConnection() && !state.settings.synthAudio) {
      // Conveniently turn on soft synth audio when practicing with Space bar and no MIDI piano
      state.settings.synthAudio = true;
      saveSettings(state.settings);
      syncSettingsUI();
    }
    setFeedback(state.demoMode ? "Computer keys enabled (Space)" : "Waiting for MIDI input");
  }

  function handleComputerKey(event) {
    if (event.repeat || !state.demoMode || els.playerView.hidden || !els.resultsModal.hidden) return;
    if (!state.activeScore || state.completed || state.currentGlobalIndex < 0) return;

    if (event.code === "Space") {
      event.preventDefault();
      const entry = state.flatTargets[state.currentGlobalIndex];
      if (!entry) return;
      const notes = Renderer.requiredTargetNotes(entry.target);
      if (!notes.length) return;
      const midis = notes.map((n) => n.midi);
      // Play full chord sound if synth enabled, then trigger final note while holding all
      if (state.settings.synthAudio && midis.length > 1) {
        playSynthNotes(midis.slice(0, -1));
      }
      midis.forEach((m) => state.heldMidi.add(m));
      handlePlayedNote(midis[midis.length - 1]);
      midis.forEach((m) => state.heldMidi.delete(m));
    } else if (event.code === "KeyX") {
      event.preventDefault();
      const entry = state.flatTargets[state.currentGlobalIndex];
      if (!entry) return;
      const notes = Renderer.requiredTargetNotes(entry.target);
      const wrongMidi = notes.length ? notes[0].midi + 1 : 61;
      handlePlayedNote(wrongMidi);
    }
  }

  // ============================================================================
  // EVENT WIRING
  // ============================================================================
  els.connectMidi.addEventListener("click", connectMidi);
  els.midiInputs.addEventListener("change", selectMidiInput);

  const onSettingChange = () => {
    state.settings.measureCount = Number(els.optMeasures.value) || 8;
    state.settings.sourceMode = els.optSource.value;
    state.settings.keyId = els.optKey.value;
    state.settings.handMode = els.optHand.value;
    state.settings.showLabels = els.optShowLabels.checked;
    state.settings.showChords = els.optShowChords.checked;
    state.settings.synthAudio = els.optSynthAudio.checked;
    saveSettings(state.settings);
    syncSettingsUI();
  };

  [
    els.optMeasures,
    els.optSource,
    els.optKey,
    els.optHand,
    els.optShowLabels,
    els.optShowChords,
    els.optSynthAudio
  ].forEach((el) => el.addEventListener("change", onSettingChange));

  els.resetProgress.addEventListener("click", () => {
    if (!window.confirm("Reset all sight-reading scores, rating, and history?")) return;
    state.profile = defaultProfile();
    saveProfile(state.profile);
    renderProfileBanner();
    renderLevelGrid();
    renderHistory();
  });

  els.backToLobby.addEventListener("click", showLobby);
  els.newPieceBtn.addEventListener("click", () => {
    if (state.activeScore) startNewPiece(state.activeScore.level);
  });
  els.retryPieceBtn.addEventListener("click", retryCurrentPiece);
  els.demoModeBtn.addEventListener("click", toggleDemoMode);
  els.synthToggleBtn.addEventListener("click", () => {
    state.settings.synthAudio = !state.settings.synthAudio;
    saveSettings(state.settings);
    syncSettingsUI();
  });
  els.focusModeBtn.addEventListener("click", () => setFocusMode(!state.focusMode));

  els.resNextPiece.addEventListener("click", () => {
    if (state.activeScore) startNewPiece(state.activeScore.level);
  });
  els.resLevelUp.addEventListener("click", () => {
    if (state.activeScore) {
      const nextLvl = Math.min(Engine.DIFFICULTY_LEVELS.length, state.activeScore.level + 1);
      startNewPiece(nextLvl);
    }
  });
  els.resRetry.addEventListener("click", retryCurrentPiece);
  els.resBackLobby.addEventListener("click", showLobby);

  document.addEventListener("keydown", handleComputerKey);

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (els.playerView.hidden || !state.activeScore) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderCurrentPage, 160);
  });

  window.setInterval(() => {
    if (navigator.requestMIDIAccess && !hasMidiConnection() && !state.midiConnectPending) {
      connectMidi();
    }
  }, 1500);

  // Initialize VexFlow fonts and boot UI
  populateKeyOptions();
  syncSettingsUI();

  const initReady = window.MusicAppNotation?.initializeVexFlow
    ? window.MusicAppNotation.initializeVexFlow()
    : Promise.resolve();

  initReady.then(() => {
    showLobby();
  });
}());
