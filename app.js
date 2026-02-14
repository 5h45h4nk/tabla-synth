const TAALS = {
  teentaal: {
    name: "Teentaal",
    bols: [
      "Dha",
      "Dhin",
      "Dhin",
      "Dha",
      "Dha",
      "Dhin",
      "Dhin",
      "Dha",
      "Dha",
      "Tin",
      "Tin",
      "Ta",
      "Ta",
      "Dhin",
      "Dhin",
      "Dha",
    ],
    sam: 0,
    taali: [4, 12],
    khali: [8],
  },
  teentaal_tika: {
    name: "Teentaal (TiKa Variant)",
    bols: [
      "Dha",
      "Dhin",
      "Dhin",
      "Dha",
      "Dha",
      "Dhin",
      "Dhin",
      "Dha",
      "Dha",
      "Tin",
      "Tin",
      "Ta",
      "TiKa",
      "Dhin",
      "Dhin",
      "Dha",
    ],
    sam: 0,
    taali: [4, 12],
    khali: [8],
  },
  keherwa: {
    name: "Keherwa",
    bols: ["Dha", "Ge", "Na", "Ti", "Na", "Ka", "Dhi", "Na"],
    sam: 0,
    taali: [],
    khali: [4],
  },
  keherwa_4: {
    name: "Keherwa (4 Beat Combined)",
    bols: ["DhaGe", "NaTi", "NaKa", "DhiNa"],
    sam: 0,
    taali: [],
    khali: [2],
  },
};

const SAMPLE_FILES = {
  tabla_na: "assets/samples/tabla_na.flac",
  tabla_na_s: "assets/samples/tabla_na_s.flac",
  tabla_tun1: "assets/samples/tabla_tun1.flac",
  tabla_te1: "assets/samples/tabla_te1.flac",
  tabla_te2: "assets/samples/tabla_te2.flac",
  tabla_te_ne: "assets/samples/tabla_te_ne.flac",
  tabla_tas1: "assets/samples/tabla_tas1.flac",
  tabla_ke1: "assets/samples/tabla_ke1.flac",
  tabla_ghe1: "assets/samples/tabla_ghe1.flac",
  tabla_ghe2: "assets/samples/tabla_ghe2.flac",
  tabla_dhec: "assets/samples/tabla_dhec.flac",
};

const BOL_SAMPLE_MAP = {
  Dha: [
    { choices: ["tabla_ghe1", "tabla_ghe2"], gain: 0.95 },
    { choices: ["tabla_na", "tabla_na_s"], gain: 0.78 },
  ],
  Dhin: [
    { choices: ["tabla_ghe2", "tabla_ghe1"], gain: 0.88 },
    { choices: ["tabla_tun1", "tabla_na"], gain: 0.68 },
  ],
  Dhi: [{ choices: ["tabla_tun1", "tabla_na"], gain: 0.78 }],
  Tin: [{ choices: ["tabla_te_ne", "tabla_te2"], gain: 0.74 }],
  Ta: [{ choices: ["tabla_tas1", "tabla_te1"], gain: 0.72 }],
  Na: [{ choices: ["tabla_na", "tabla_na_s"], gain: 0.82 }],
  Ge: [{ choices: ["tabla_ghe1", "tabla_ghe2"], gain: 0.94 }],
  Ti: [{ choices: ["tabla_te1", "tabla_te2"], gain: 0.7 }],
  Ka: [{ choices: ["tabla_ke1", "tabla_tas1"], gain: 0.7 }],
};

const COMBINED_BOLS = {
  TiKa: ["Ti", "Ka"],
  DhaGe: ["Dha", "Ge"],
  NaTi: ["Na", "Ti"],
  NaKa: ["Na", "Ka"],
  DhiNa: ["Dhi", "Na"],
};

const ui = {
  taalSelect: document.getElementById("taalSelect"),
  samplePack: document.getElementById("samplePack"),
  tempo: document.getElementById("tempo"),
  tempoInput: document.getElementById("tempoInput"),
  tempoDownBtn: document.getElementById("tempoDownBtn"),
  tempoUpBtn: document.getElementById("tempoUpBtn"),
  tempoValue: document.getElementById("tempoValue"),
  tuning: document.getElementById("tuning"),
  tuningDownBtn: document.getElementById("tuningDownBtn"),
  tuningUpBtn: document.getElementById("tuningUpBtn"),
  tuningValue: document.getElementById("tuningValue"),
  tuningSemitones: document.getElementById("tuningSemitones"),
  tuningMarkers: document.getElementById("tuningMarkers"),
  playToggleBtn: document.getElementById("playToggleBtn"),
  mobileBar: document.getElementById("mobileBar"),
  mobilePlayToggleBtn: document.getElementById("mobilePlayToggleBtn"),
  mobileBeatNumber: document.getElementById("mobileBeatNumber"),
  mobileBeatBol: document.getElementById("mobileBeatBol"),
  tapBtn: document.getElementById("tapBtn"),
  tapValue: document.getElementById("tapValue"),
  beatGrid: document.getElementById("beatGrid"),
  taalName: document.getElementById("taalName"),
  cycleMeta: document.getElementById("cycleMeta"),
  liveBeatNumber: document.getElementById("liveBeatNumber"),
  liveBeatBol: document.getElementById("liveBeatBol"),
  liveTuning: document.getElementById("liveTuning"),
  audioStatus: document.getElementById("audioStatus"),
};

const state = {
  context: null,
  master: null,
  tempo: Number(ui.tempo.value),
  playing: false,
  selectedTaal: "teentaal",
  currentStep: 0,
  nextNoteTime: 0,
  timerId: null,
  sampleBuffers: new Map(),
  loadingSamples: false,
  sampleLoadAttempted: false,
  samplesReady: false,
  soundPack: "auto",
  tapTimes: [],
  tuningSemitones: 0,
};

const LOOK_AHEAD_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.1;
const TEMPO_MIN = Number(ui.tempo.min);
const TEMPO_MAX = Number(ui.tempo.max);
const TEMPO_SLIDER_STEP = Number(ui.tempo.step) || 5;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function clampTempo(value) {
  return Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, value));
}

function nearestSliderTempo(value) {
  return clampTempo(Math.round(value / TEMPO_SLIDER_STEP) * TEMPO_SLIDER_STEP);
}

function setTempo(value) {
  const clamped = clampTempo(value);
  state.tempo = clamped;
  ui.tempoValue.textContent = String(clamped);
  ui.tempoInput.value = String(clamped);
  ui.tempo.value = String(nearestSliderTempo(clamped));
}

function changeTempo(delta) {
  setTempo(state.tempo + delta);
}

function tuningPlaybackRate() {
  return 2 ** (state.tuningSemitones / 12);
}

function semitonesToNoteName(semitones) {
  const idx = ((semitones % 12) + 12) % 12;
  return NOTE_NAMES[idx];
}

function updateTuningUI() {
  const note = semitonesToNoteName(state.tuningSemitones);
  const signed = state.tuningSemitones > 0 ? `+${state.tuningSemitones}` : `${state.tuningSemitones}`;
  ui.tuningValue.textContent = note;
  ui.tuningSemitones.textContent = signed;
  ui.liveTuning.textContent = `Tuning: ${note} (${signed})`;
}

function setTuning(semitones) {
  const clamped = Math.max(-12, Math.min(12, semitones));
  state.tuningSemitones = clamped;
  ui.tuning.value = String(clamped);
  updateTuningUI();
}

function renderTuningMarkers() {
  const labels = [];
  for (let semitone = -12; semitone <= 12; semitone += 1) {
    labels.push(semitonesToNoteName(semitone));
  }
  ui.tuningMarkers.innerHTML = labels.map((note) => `<span>${note}</span>`).join("");
}

function commitTempoInput() {
  const raw = Number(ui.tempoInput.value);
  if (!Number.isFinite(raw)) {
    ui.tempoInput.value = String(state.tempo);
    return;
  }
  setTempo(raw);
}

function ensureAudio() {
  if (!state.context) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    state.context = new AudioCtx();
    state.master = state.context.createGain();
    state.master.gain.value = 0.8;
    state.master.connect(state.context.destination);
  }
}

async function resumeAudioContext() {
  ensureAudio();
  if (state.context.state === "suspended") {
    try {
      await state.context.resume();
    } catch (_err) {
      // Ignore and let caller continue with best effort.
    }
  }
}

function unlockAudioClick() {
  if (!state.context) {
    return;
  }
  const osc = state.context.createOscillator();
  const gain = state.context.createGain();
  gain.gain.setValueAtTime(0.00001, state.context.currentTime);
  osc.connect(gain);
  gain.connect(state.master);
  osc.start();
  osc.stop(state.context.currentTime + 0.01);
}

function percussiveGain(time, attack, decay, peak = 1, end = 0.0001) {
  const g = state.context.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(peak, time + attack);
  g.gain.exponentialRampToValueAtTime(end, time + attack + decay);
  g.connect(state.master);
  return g;
}

function setAudioStatus(text, tone = "muted") {
  ui.audioStatus.textContent = text;
  ui.audioStatus.classList.remove("ok", "error");
  if (tone === "ok") {
    ui.audioStatus.classList.add("ok");
  }
  if (tone === "error") {
    ui.audioStatus.classList.add("error");
  }
}

function randomPick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function deterministicPick(items, key = 0) {
  if (!items || items.length === 0) {
    return null;
  }
  const idx = Math.abs(Number(key) || 0) % items.length;
  return items[idx];
}

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

async function loadOneSample(id, url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${id}`);
  }
  const audioData = await response.arrayBuffer();
  const decoded = await state.context.decodeAudioData(audioData.slice(0));
  state.sampleBuffers.set(id, decoded);
}

async function prepareSamples() {
  if (state.samplesReady || state.loadingSamples) {
    return;
  }
  if (state.sampleLoadAttempted && state.soundPack !== "sonicpi") {
    return;
  }
  state.loadingSamples = true;
  state.sampleLoadAttempted = true;
  setAudioStatus("Loading real tabla samples...", "muted");
  try {
    await Promise.all(Object.entries(SAMPLE_FILES).map(([id, url]) => loadOneSample(id, url)));
    state.samplesReady = true;
    setAudioStatus("Real tabla samples loaded.", "ok");
  } catch (error) {
    state.samplesReady = false;
    setAudioStatus("Could not load FLAC samples in this browser. Using synth fallback.", "error");
  } finally {
    state.loadingSamples = false;
  }
}

function shouldUseSamples() {
  if (state.soundPack === "synth") {
    return false;
  }
  return state.samplesReady;
}

function refreshStatusForPack() {
  if (state.soundPack === "synth") {
    setAudioStatus("Using synth sound pack.", "muted");
    return;
  }
  if (state.samplesReady) {
    setAudioStatus("Using Sonic Pi real tabla samples.", "ok");
    return;
  }
  if (state.soundPack === "sonicpi") {
    setAudioStatus("Sonic Pi pack selected. Samples will load on play.", "muted");
    return;
  }
  setAudioStatus("Auto mode: real samples load on first play, else synth fallback.", "muted");
}

function playSample(sampleId, time, gainValue = 1, playbackRate = 1) {
  const buffer = state.sampleBuffers.get(sampleId);
  if (!buffer) {
    return false;
  }
  const src = state.context.createBufferSource();
  const gain = state.context.createGain();
  src.buffer = buffer;
  src.playbackRate.setValueAtTime(playbackRate * tuningPlaybackRate(), time);
  gain.gain.setValueAtTime(gainValue, time);
  src.connect(gain);
  gain.connect(state.master);
  src.start(time);
  return true;
}

function playBolWithSamples(bol, time) {
  const layers = BOL_SAMPLE_MAP[bol];
  if (!layers) {
    return false;
  }
  let allPlayed = true;
  layers.forEach((layer, layerIndex) => {
    const sampleId = layer.id || deterministicPick(layer.choices, hashString(`${bol}:${layerIndex}`));
    const ok = playSample(sampleId, time, layer.gain ?? 0.8, layer.rate ?? 1);
    allPlayed = allPlayed && ok;
  });
  return allPlayed;
}

function playDayan(time, freq = 540, decay = 0.16, level = 0.34) {
  const osc = state.context.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq * tuningPlaybackRate(), time);
  const env = percussiveGain(time, 0.002, decay, level);
  osc.connect(env);
  osc.start(time);
  osc.stop(time + decay + 0.05);
}

function playBayan(time, freqStart = 170, freqEnd = 110, decay = 0.22, level = 0.48) {
  const osc = state.context.createOscillator();
  osc.type = "sine";
  const rate = tuningPlaybackRate();
  osc.frequency.setValueAtTime(freqStart * rate, time);
  osc.frequency.exponentialRampToValueAtTime(freqEnd * rate, time + 0.09);
  const env = percussiveGain(time, 0.002, decay, level);
  osc.connect(env);
  osc.start(time);
  osc.stop(time + decay + 0.06);
}

function playAttackNoise(time, decay = 0.045, level = 0.12) {
  const size = Math.floor(state.context.sampleRate * 0.08);
  const buffer = state.context.createBuffer(1, size, state.context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / size);
  }
  const src = state.context.createBufferSource();
  src.buffer = buffer;
  const hp = state.context.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1400;
  const env = percussiveGain(time, 0.001, decay, level);
  src.connect(hp);
  hp.connect(env);
  src.start(time);
  src.stop(time + 0.09);
}

function triggerBaseBol(bol, time) {
  if (shouldUseSamples() && playBolWithSamples(bol, time)) {
    return;
  }

  switch (bol) {
    case "Dha":
      playBayan(time, 180, 110, 0.22, 0.5);
      playDayan(time, 520, 0.16, 0.32);
      playAttackNoise(time, 0.03, 0.04);
      break;
    case "Dhin":
      playBayan(time, 175, 120, 0.21, 0.4);
      playDayan(time, 640, 0.2, 0.28);
      break;
    case "Dhi":
      playDayan(time, 580, 0.16, 0.3);
      break;
    case "Tin":
      playDayan(time, 760, 0.1, 0.28);
      break;
    case "Ta":
      playDayan(time, 820, 0.06, 0.22);
      playAttackNoise(time, 0.026, 0.1);
      break;
    case "Na":
      playDayan(time, 700, 0.08, 0.22);
      playAttackNoise(time, 0.028, 0.08);
      break;
    case "Ge":
      playBayan(time, 190, 115, 0.2, 0.46);
      break;
    case "Ti":
      playDayan(time, 900, 0.06, 0.2);
      break;
    case "Ka":
      playAttackNoise(time, 0.02, 0.12);
      break;
    default:
      playDayan(time, 620, 0.12, 0.22);
      break;
  }
}

function triggerBol(bol, time, beatDuration) {
  const combined = COMBINED_BOLS[bol];
  if (combined) {
    const split = Math.max(0.04, beatDuration * 0.45);
    triggerBaseBol(combined[0], time);
    triggerBaseBol(combined[1], time + split);
    return;
  }

  triggerBaseBol(bol, time);
}

function currentTaal() {
  return TAALS[state.selectedTaal];
}

function beatMarker(taal, idx) {
  if (idx === taal.sam) {
    return "Sam";
  }
  if ((taal.taali || []).includes(idx)) {
    return "Taali";
  }
  if ((taal.khali || []).includes(idx)) {
    return "Khali";
  }
  return "";
}

function renderTaalOptions() {
  Object.entries(TAALS).forEach(([key, taal]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = taal.name;
    ui.taalSelect.append(opt);
  });
}

function renderBeatGrid() {
  const taal = currentTaal();
  ui.taalName.textContent = taal.name;
  ui.cycleMeta.textContent = `${taal.bols.length} beats`;
  ui.beatGrid.innerHTML = "";

  taal.bols.forEach((bol, idx) => {
    const beat = document.createElement("div");
    beat.className = "beat";
    const marker = beatMarker(taal, idx);
    if (idx === taal.sam) {
      beat.classList.add("sam");
    }
    if ((taal.taali || []).includes(idx)) {
      beat.classList.add("taali");
    }
    if ((taal.khali || []).includes(idx)) {
      beat.classList.add("khali");
    }
    beat.dataset.index = String(idx);
    beat.innerHTML = `<button type="button" class="count-trigger" data-index="${idx}" aria-label="Play beat ${idx + 1}">${idx + 1}</button><span class="marker">${marker}</span><span class="bol">${bol}</span>`;
    ui.beatGrid.append(beat);
  });
  setActiveBeat(-1);
}

function flashBeatPreview(idx) {
  const beat = ui.beatGrid.querySelector(`.beat[data-index="${idx}"]`);
  if (!beat) {
    return;
  }
  beat.classList.add("preview");
  window.setTimeout(() => beat.classList.remove("preview"), 180);
}

async function previewBeat(idx) {
  const taal = currentTaal();
  const bol = taal.bols[idx];
  if (!bol) {
    return;
  }

  await resumeAudioContext();
  unlockAudioClick();
  if (state.soundPack !== "synth" && !state.samplesReady && !state.loadingSamples) {
    prepareSamples();
  }

  const beatDuration = 60 / state.tempo;
  triggerBol(bol, state.context.currentTime + 0.01, beatDuration);
  setActiveBeat(idx);
  flashBeatPreview(idx);
}

function setActiveBeat(idx) {
  const beats = ui.beatGrid.querySelectorAll(".beat");
  beats.forEach((el, i) => {
    el.classList.toggle("active", i === idx);
  });

  if (idx < 0) {
    ui.liveBeatNumber.textContent = "--";
    ui.liveBeatBol.textContent = "-";
    ui.mobileBeatNumber.textContent = "--";
    ui.mobileBeatBol.textContent = "-";
    return;
  }
  const taal = currentTaal();
  const bol = taal.bols[idx] || "-";
  ui.liveBeatNumber.textContent = String(idx + 1);
  ui.liveBeatBol.textContent = bol;
  ui.mobileBeatNumber.textContent = String(idx + 1);
  ui.mobileBeatBol.textContent = bol;
}

function setPlayUI(isPlaying) {
  const label = isPlaying ? "Stop" : "Play";
  if (ui.playToggleBtn) {
    ui.playToggleBtn.textContent = label;
    ui.playToggleBtn.classList.toggle("is-playing", isPlaying);
  }
  if (ui.mobilePlayToggleBtn) {
    ui.mobilePlayToggleBtn.textContent = label;
    ui.mobilePlayToggleBtn.classList.toggle("is-playing", isPlaying);
  }
}

function scheduleBeat(time, idx, beatDuration) {
  const taal = currentTaal();
  triggerBol(taal.bols[idx], time, beatDuration);

  const deltaMs = Math.max(0, (time - state.context.currentTime) * 1000);
  setTimeout(() => setActiveBeat(idx), deltaMs);
}

function scheduler() {
  const taal = currentTaal();
  const secondsPerBeat = 60 / state.tempo;
  while (state.nextNoteTime < state.context.currentTime + SCHEDULE_AHEAD_SEC) {
    scheduleBeat(state.nextNoteTime, state.currentStep, secondsPerBeat);
    state.nextNoteTime += secondsPerBeat;
    state.currentStep = (state.currentStep + 1) % taal.bols.length;
  }
}

async function start() {
  await resumeAudioContext();
  unlockAudioClick();
  if (state.playing) {
    return;
  }
  if (state.soundPack !== "synth" && !state.samplesReady) {
    prepareSamples().then(() => {
      if (!state.samplesReady && state.soundPack === "sonicpi") {
        setAudioStatus("Sonic Pi pack failed on this browser. Using synth fallback.", "error");
      }
    });
  }
  state.playing = true;
  state.currentStep = 0;
  state.nextNoteTime = state.context.currentTime + 0.06;
  setPlayUI(true);
  state.timerId = window.setInterval(scheduler, LOOK_AHEAD_MS);
}

function stop() {
  if (!state.playing) {
    return;
  }
  state.playing = false;
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  setPlayUI(false);
  setActiveBeat(-1);
}

function togglePlayback() {
  if (state.playing) {
    stop();
  } else {
    start();
  }
}

function commitTapTempo() {
  const now = performance.now();
  state.tapTimes.push(now);
  state.tapTimes = state.tapTimes.filter((t) => now - t <= 2000);

  if (state.tapTimes.length < 2) {
    ui.tapValue.textContent = "Tap x2+";
    ui.tapValue.classList.remove("live");
    return;
  }

  let sum = 0;
  for (let i = 1; i < state.tapTimes.length; i += 1) {
    sum += state.tapTimes[i] - state.tapTimes[i - 1];
  }
  const avgMs = sum / (state.tapTimes.length - 1);
  const bpm = clampTempo(Math.round(60000 / avgMs));
  setTempo(bpm);
  ui.tapValue.textContent = `${bpm} BPM`;
  ui.tapValue.classList.add("live");
}

function isTypingTarget(el) {
  if (!el) {
    return false;
  }
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function syncMobileBarVisibility() {
  if (!ui.mobileBar) {
    return;
  }
  ui.mobileBar.classList.toggle("hidden", isTypingTarget(document.activeElement));
}

function bindEvents() {
  ui.tempo.addEventListener("input", (e) => {
    const value = Number(e.target.value);
    setTempo(value);
  });

  ui.tempoInput.addEventListener("blur", () => {
    commitTempoInput();
  });

  ui.tempoInput.addEventListener("change", () => {
    commitTempoInput();
  });

  ui.tempoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      commitTempoInput();
      ui.tempoInput.blur();
    }
  });

  ui.tuning.addEventListener("input", (e) => {
    setTuning(Number(e.target.value));
  });

  ui.tempoDownBtn.addEventListener("click", () => changeTempo(-5));
  ui.tempoUpBtn.addEventListener("click", () => changeTempo(5));
  ui.tuningDownBtn.addEventListener("click", () => setTuning(state.tuningSemitones - 1));
  ui.tuningUpBtn.addEventListener("click", () => setTuning(state.tuningSemitones + 1));

  ui.taalSelect.addEventListener("change", (e) => {
    state.selectedTaal = e.target.value;
    renderBeatGrid();
  });

  if (ui.samplePack) {
    ui.samplePack.addEventListener("change", (e) => {
      state.soundPack = e.target.value;
      refreshStatusForPack();
    });
  }

  ui.beatGrid.addEventListener("click", (e) => {
    const trigger = e.target.closest(".count-trigger");
    if (!trigger) {
      return;
    }
    const idx = Number(trigger.dataset.index);
    if (!Number.isInteger(idx)) {
      return;
    }
    previewBeat(idx);
  });

  if (ui.playToggleBtn) {
    ui.playToggleBtn.addEventListener("click", togglePlayback);
  }
  if (ui.mobilePlayToggleBtn) {
    ui.mobilePlayToggleBtn.addEventListener("click", togglePlayback);
  }
  ui.tapBtn.addEventListener("click", commitTapTempo);

  window.addEventListener("keydown", (e) => {
    if (isTypingTarget(document.activeElement)) {
      return;
    }
    if (e.code === "Space") {
      e.preventDefault();
      if (state.playing) {
        stop();
      } else {
        start();
      }
      return;
    }
    if (e.code === "ArrowUp" || e.code === "ArrowRight") {
      e.preventDefault();
      changeTempo(5);
      return;
    }
    if (e.code === "ArrowDown" || e.code === "ArrowLeft") {
      e.preventDefault();
      changeTempo(-5);
    }
  });

  window.addEventListener("focusin", syncMobileBarVisibility);
  window.addEventListener("focusout", () => {
    window.setTimeout(syncMobileBarVisibility, 0);
  });
}

renderTaalOptions();
renderBeatGrid();
renderTuningMarkers();
bindEvents();
refreshStatusForPack();
setTempo(state.tempo);
setTuning(state.tuningSemitones);
setPlayUI(state.playing);
syncMobileBarVisibility();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const isLocalDev =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (isLocalDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    navigator.serviceWorker
      .register("service-worker.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => {
        // PWA install still works online if SW registration fails.
      });
  });
}
