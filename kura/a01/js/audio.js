// AudioControl · SFX
// Música y efectos se controlan por separado.
// Música: lista de canciones que se encadenan (al acabar una empieza la siguiente).
// La pista sigue sonando aunque se silencie (solo baja su volumen poco a poco),
// así que al volver a activarla continúa donde va, como si nunca se hubiera detenido.
// Sonidos de interfaz: sintetizados con Web Audio. Si existen archivos en audio/sfx/
// (por ejemplo, generados con ElevenLabs) se usan en su lugar.
import { config } from './config.js';

let ctx = null, master, musicGain, sfxGain, reverb, el = null, musicOk = true;
let lastSfx = '';
const history = [];
const PREFS_KEY = 'kura.audio';
let musicOn = true, sfxOn = true, voiceOn = true;   // preferencias del usuario (selector del botón de sonido)
try { const p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); if (typeof p.music === 'boolean') musicOn = p.music; if (typeof p.sfx === 'boolean') sfxOn = p.sfx; if (typeof p.voice === 'boolean') voiceOn = p.voice; } catch {}
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify({ music: musicOn, sfx: sfxOn, voice: voiceOn })); } catch {} };
let track = 0;
const badTracks = new Set();
let started = false;        // ya hubo un gesto que permitió iniciar el audio
const samples = {};
const listeners = new Set();

function makeReverb(seconds = 2.8, decay = 3) {
  const len = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  const conv = ctx.createConvolver(); conv.buffer = buf; return conv;
}

function ensureContext() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
  musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
  sfxGain = ctx.createGain(); sfxGain.gain.value = config.audio.sfxVolume; sfxGain.connect(master);
  reverb = makeReverb(); const wet = ctx.createGain(); wet.gain.value = .35; reverb.connect(wet); wet.connect(sfxGain);
  // Música
  el = new Audio();
  el.preload = 'auto'; el.crossOrigin = 'anonymous';
  // La música sigue donde se quedó: al recargar o volver a A05 no empieza de cero.
  const saved = readPosition();
  loadTrack(saved?.track ?? 0);
  if (saved?.time > 1) el.addEventListener('loadedmetadata', () => { if (saved.time < el.duration - 2) el.currentTime = saved.time; }, { once: true });
  setInterval(savePosition, 2000);
  addEventListener('pagehide', savePosition);
  // Al terminar una canción empieza la siguiente; la lista se repite.
  el.addEventListener('ended', () => nextTrack());
  // Si una canción falta o no carga, se salta sin errores; si ninguna carga, no hay música.
  el.addEventListener('error', () => { badTracks.add(track); if (badTracks.size >= playlist().length) { musicOk = false; emit(); } else nextTrack(); });
  try { ctx.createMediaElementSource(el).connect(musicGain); } catch { musicOk = false; }
  // Sonidos: ya se descargaron al abrir la página; aquí solo se decodifican.
  for (const [name, pending] of Object.entries(rawSfx)) {
    pending.then((b) => b && ctx.decodeAudioData(b.slice(0))).then((buf) => { if (buf) samples[name] = buf; }).catch(() => {});
  }
  return true;
}

// Visor: si la app corre dentro de visor.html y ahí se cargaron audios desde el dispositivo,
// se usan esos archivos (mismo nombre) en lugar de los de la carpeta audio/.
function viewerAudio() { try { return window.parent !== window ? window.parent.__kuraAudio || null : null; } catch { return null; } }
const resolve = (url) => viewerAudio()?.files?.[url.split('/').pop()] || url;
function playlist() { return [...config.audio.playlist, ...(viewerAudio()?.extraTracks || [])]; }

// Los sonidos se descargan desde el inicio (sin esperar el primer toque) para que el
// primero que suene ya esté listo.
const rawSfx = Object.fromEntries(Object.entries(config.audio.sfxFiles).map(([name, url]) =>
  [name, fetch(resolve(url)).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null)]));

const POS_KEY = 'kura.music';
function readPosition() {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
    return p && p.track < playlist().length ? p : null;
  } catch { return null; }
}
function savePosition() {
  if (!el || !started || el.paused || !el.currentTime) return;
  try { localStorage.setItem(POS_KEY, JSON.stringify({ track, time: Math.floor(el.currentTime) })); } catch {}
}

function loadTrack(i) {
  track = i;
  el.src = resolve(playlist()[i]);
  el.loop = playlist().length - badTracks.size <= 1; // con una sola canción, se repite sola
}
function nextTrack() {
  const n = playlist().length;
  for (let k = 1; k <= n; k++) {
    const i = (track + k) % n;
    if (!badTracks.has(i)) { loadTrack(i); if (started) el.play().catch(() => {}); return; }
  }
}

function ramp(param, to, seconds) {
  const t = ctx.currentTime;
  param.cancelScheduledValues(t);
  param.setValueAtTime(param.value, t);
  param.linearRampToValueAtTime(to, t + seconds);
}

// Se llama en cada gesto hasta que el audio quede realmente activo: algunos navegadores
// (iPhone) solo permiten reproducir al soltar el dedo, no al tocar.
async function start() {
  if (!ensureContext()) return;
  started = true;
  try { if (ctx.state !== 'running') await ctx.resume(); } catch {}
  if (musicOk && musicOn && el.paused) { try { await el.play(); } catch { /* se reintenta en el siguiente gesto */ } }
  apply();
}
const isReady = () => !!ctx && ctx.state === 'running' && (!musicOn || !musicOk || !el.paused);

function apply() {
  if (!ctx) return;
  ramp(musicGain.gain, musicOn ? config.audio.musicVolume : 0, musicOn ? config.audio.fadeIn : config.audio.fadeOut);
  ramp(sfxGain.gain, sfxOn ? config.audio.sfxVolume : 0, .2);
  emit();
}
const emit = () => listeners.forEach((fn) => fn({ music: musicOn, sfx: sfxOn, voice: voiceOn, musicAvailable: musicOk }));

// Pestaña oculta: se pausa todo; al volver, sigue desde el mismo punto.
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) { ctx.suspend().catch(() => {}); } else if (started) { ctx.resume().catch(() => {}); }
});

export const audio = {
  /** Llamar en el primer gesto del usuario (toque o tecla). */
  unlock() { if (!isReady()) start(); },
  /** true cuando el contexto de audio corre y la música (si está activa) ya suena. */
  get ready() { return isReady(); },
  setMusic(on) { musicOn = on; savePrefs(); if (!isReady()) start(); else apply(); },
  setSfx(on) { sfxOn = on; savePrefs(); if (!started) start(); else apply(); },
  get musicEnabled() { return musicOn; },
  get sfxEnabled() { return sfxOn; },
  /** Voz de Alaira (introducción). Aún no hay voz elegida: la preferencia ya se guarda y se respetará. */
  setVoice(on) { voiceOn = on; savePrefs(); emit(); },
  get voiceEnabled() { return voiceOn; },
  get on() { return musicOn || sfxOn; },
  onChange(fn) { listeners.add(fn); },
  /** Para la transición al mundo de Alaira: desvanece y detiene la música de A01. */
  fadeOutMusic(seconds = 4) { if (ctx) ramp(musicGain.gain, 0, seconds); },
  sfx: (name) => playSfx(name),
  /** Siguiente canción de la lista (para el futuro panel de música, M06). */
  next() { if (el) nextTrack(); },
  /** Auditoría de volumen: reproduce un sonido y devuelve su nivel máximo de corto plazo (dBFS, ventanas de ~43 ms). */
  async _measure(name) {
    if (!ctx) return null;
    const an = ctx.createAnalyser(); an.fftSize = 2048; sfxGain.connect(an);
    const buf = new Float32Array(an.fftSize); let peak = 0;
    playSfx(name);
    const t0 = performance.now();
    await new Promise((res) => { const tick = () => { an.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v; peak = Math.max(peak, Math.sqrt(s / buf.length)); if (performance.now() - t0 < 1800) setTimeout(tick, 15); else res(); }; tick(); });
    sfxGain.disconnect(an);
    return peak ? 20 * Math.log10(peak) : -Infinity;
  },
  /** Solo para pruebas: simula que la canción actual terminó. */
  _ended() { el?.dispatchEvent(new Event('ended')); },
  /** Estado para pruebas y depuración. */
  debug: () => ({ started, musicOn, sfxOn, voiceOn, musicOk, track, src: el?.src ?? '', playing: !!el && !el.paused, time: el?.currentTime ?? 0, gain: musicGain?.gain.value ?? 0, state: ctx?.state, samples: Object.keys(samples), lastSfx, history: [...history] }),
};

/* ---------- Sonidos de interfaz ---------- */
let level = 1; // nivel del sonido en curso (auditoría de volumen)
function out(dry = 1, wet = .6) {
  const g = ctx.createGain(); g.gain.value = dry * level; g.connect(sfxGain);
  if (wet) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(reverb); }
  return g;
}
function bell(freq, at, { gain = .05, decay = 1.2, type = 'sine', partials = [1, 2.76, 5.4], dest } = {}) {
  partials.forEach((p, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq * p;
    const a = gain / (i + 1) ** 1.4;
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(a, at + .004); g.gain.exponentialRampToValueAtTime(.0001, at + decay / (i * .6 + 1));
    o.connect(g); g.connect(dest); o.start(at); o.stop(at + decay + .05);
  });
}
function noiseSweep(at, dur, from, to, gain, dest, q = 1.2) {
  const len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
  f.frequency.setValueAtTime(from, at); f.frequency.exponentialRampToValueAtTime(to, at + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(gain, at + dur * .35); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
  src.connect(f); f.connect(g); g.connect(dest); src.start(at); src.stop(at + dur + .02);
}
const NOTE = (n) => 440 * 2 ** ((n - 69) / 12);

const SYNTH = {
  // Botones y enlaces secundarios: pulsación de cristal, breve y discreta.
  tap(t) { const d = out(1, .35); bell(NOTE(91), t, { gain: .028, decay: .35, dest: d }); bell(NOTE(98), t + .012, { gain: .012, decay: .25, dest: d }); },
  focus(t) { const d = out(1, .3); bell(NOTE(86), t, { gain: .014, decay: .3, dest: d, partials: [1, 2.01] }); },
  toggle(t) { const d = out(1, .3); bell(NOTE(84), t, { gain: .02, decay: .22, dest: d }); bell(NOTE(91), t + .06, { gain: .02, decay: .3, dest: d }); },
};

function playSfx(name) {
  if (!ctx || !started || !sfxOn || ctx.state !== 'running') return;
  const t = ctx.currentTime + .005;
  lastSfx = samples[name] ? `${name}:archivo` : SYNTH[name] ? `${name}:sintetizado` : `${name}:sin-sonido`;
  history.push(lastSfx); if (history.length > 12) history.shift();
  level = 10 ** ((config.audio.sfxLevels?.[name] ?? 0) / 20);
  if (samples[name]) { const s = ctx.createBufferSource(); s.buffer = samples[name]; s.connect(out(1, 0)); s.start(t); return; }
  SYNTH[name]?.(t); // «acceso concedido» y «acceso fallido» solo suenan con sus archivos
}
