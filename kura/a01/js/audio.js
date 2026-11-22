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
let musicOn = true, sfxOn = true;   // preferencias del usuario (selector del botón de sonido)
try { const p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); if (typeof p.music === 'boolean') musicOn = p.music; if (typeof p.sfx === 'boolean') sfxOn = p.sfx; } catch {}
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify({ music: musicOn, sfx: sfxOn })); } catch {} };
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
  loadTrack(0);
  // Al terminar una canción empieza la siguiente; la lista se repite.
  el.addEventListener('ended', () => nextTrack());
  // Si una canción falta o no carga, se salta sin errores; si ninguna carga, no hay música.
  el.addEventListener('error', () => { badTracks.add(track); if (badTracks.size >= playlist().length) { musicOk = false; emit(); } else nextTrack(); });
  try { ctx.createMediaElementSource(el).connect(musicGain); } catch { musicOk = false; }
  // Archivos opcionales de SFX
  for (const [name, url] of Object.entries(config.audio.sfxFiles)) {
    fetch(resolve(url)).then((r) => (r.ok ? r.arrayBuffer() : null)).then((b) => b && ctx.decodeAudioData(b)).then((buf) => { if (buf) samples[name] = buf; }).catch(() => {});
  }
  return true;
}

// Visor: si la app corre dentro de visor.html y ahí se cargaron audios desde el dispositivo,
// se usan esos archivos (mismo nombre) en lugar de los de la carpeta audio/.
function viewerAudio() { try { return window.parent !== window ? window.parent.__kuraAudio || null : null; } catch { return null; } }
const resolve = (url) => viewerAudio()?.files?.[url.split('/').pop()] || url;
function playlist() { return [...config.audio.playlist, ...(viewerAudio()?.extraTracks || [])]; }

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

async function start() {
  if (!ensureContext()) return;
  started = true;
  try { await ctx.resume(); } catch {}
  if (musicOk && el.paused) { try { await el.play(); } catch { /* el navegador puede negarse: se reintenta en el siguiente gesto */ started = false; } }
  apply();
}

function apply() {
  if (!ctx) return;
  ramp(musicGain.gain, musicOn ? config.audio.musicVolume : 0, musicOn ? config.audio.fadeIn : config.audio.fadeOut);
  ramp(sfxGain.gain, sfxOn ? config.audio.sfxVolume : 0, .2);
  emit();
}
const emit = () => listeners.forEach((fn) => fn({ music: musicOn, sfx: sfxOn, musicAvailable: musicOk }));

// Pestaña oculta: se pausa todo; al volver, sigue desde el mismo punto.
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) { ctx.suspend().catch(() => {}); } else if (started) { ctx.resume().catch(() => {}); }
});

export const audio = {
  /** Llamar en el primer gesto del usuario (toque o tecla). */
  unlock() { if (!started) start(); },
  setMusic(on) { musicOn = on; savePrefs(); if (!started) start(); else apply(); },
  setSfx(on) { sfxOn = on; savePrefs(); if (!started) start(); else apply(); },
  get musicEnabled() { return musicOn; },
  get sfxEnabled() { return sfxOn; },
  get on() { return musicOn || sfxOn; },
  onChange(fn) { listeners.add(fn); },
  /** Para la transición al mundo de Alaira: desvanece y detiene la música de A01. */
  fadeOutMusic(seconds = 4) { if (ctx) ramp(musicGain.gain, 0, seconds); },
  sfx: (name) => playSfx(name),
  /** Estado para pruebas y depuración. */
  debug: () => ({ started, musicOn, sfxOn, musicOk, track, src: el?.src ?? '', playing: !!el && !el.paused, time: el?.currentTime ?? 0, gain: musicGain?.gain.value ?? 0, state: ctx?.state, samples: Object.keys(samples), lastSfx, history: [...history] }),
};

/* ---------- Sonidos de interfaz ---------- */
function out(dry = 1, wet = .6) {
  const g = ctx.createGain(); g.gain.value = dry; g.connect(sfxGain);
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
  if (samples[name]) { const s = ctx.createBufferSource(); s.buffer = samples[name]; s.connect(out(1, 0)); s.start(t); return; }
  SYNTH[name]?.(t); // «acceso concedido» y «acceso fallido» solo suenan con sus archivos
}
