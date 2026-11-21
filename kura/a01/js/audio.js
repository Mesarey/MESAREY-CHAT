// AudioControl · SFX
// Música: la pista sigue sonando aunque se silencie (solo baja su volumen poco a poco),
// así que al volver a activarla continúa donde va, como si nunca se hubiera detenido.
// Sonidos de interfaz: sintetizados con Web Audio. Si existen archivos en audio/sfx/
// (por ejemplo, generados con ElevenLabs) se usan en su lugar.
import { config } from './config.js';

let ctx = null, master, musicGain, sfxGain, reverb, el = null, musicOk = true;
let lastSfx = '';
let wanted = true;          // el usuario quiere sonido (estado del botón)
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
  el.src = config.audio.music; el.loop = true; el.preload = 'auto'; el.crossOrigin = 'anonymous';
  el.addEventListener('error', () => { musicOk = false; emit(); }); // sin archivo: no hay excepción sin capturar
  try { ctx.createMediaElementSource(el).connect(musicGain); } catch { musicOk = false; }
  // Archivos opcionales de SFX
  for (const [name, url] of Object.entries(config.audio.sfxFiles)) {
    fetch(url).then((r) => (r.ok ? r.arrayBuffer() : null)).then((b) => b && ctx.decodeAudioData(b)).then((buf) => { if (buf) samples[name] = buf; }).catch(() => {});
  }
  return true;
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
  ramp(musicGain.gain, wanted ? config.audio.musicVolume : 0, wanted ? config.audio.fadeIn : config.audio.fadeOut);
  ramp(sfxGain.gain, wanted ? config.audio.sfxVolume : 0, .2);
  emit();
}
const emit = () => listeners.forEach((fn) => fn({ on: wanted, music: musicOk }));

// Pestaña oculta: se pausa todo; al volver, sigue desde el mismo punto.
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) { ctx.suspend().catch(() => {}); } else if (started) { ctx.resume().catch(() => {}); }
});

export const audio = {
  /** Llamar en el primer gesto del usuario (toque o tecla). */
  unlock() { if (!started) start(); },
  toggle() { wanted = !wanted; if (!started) start(); else apply(); return wanted; },
  get on() { return wanted; },
  onChange(fn) { listeners.add(fn); },
  /** Para la transición al mundo de Alaira: desvanece y detiene la música de A01. */
  fadeOutMusic(seconds = 4) { if (ctx) ramp(musicGain.gain, 0, seconds); },
  sfx: (name) => playSfx(name),
  /** Estado para pruebas y depuración. */
  debug: () => ({ started, wanted, musicOk, playing: !!el && !el.paused, time: el?.currentTime ?? 0, gain: musicGain?.gain.value ?? 0, state: ctx?.state, samples: Object.keys(samples), lastSfx }),
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
  if (!ctx || !started || !wanted || ctx.state !== 'running') return;
  const t = ctx.currentTime + .005;
  lastSfx = samples[name] ? `${name}:archivo` : SYNTH[name] ? `${name}:sintetizado` : `${name}:sin-sonido`;
  if (samples[name]) { const s = ctx.createBufferSource(); s.buffer = samples[name]; s.connect(out(1, 0)); s.start(t); return; }
  SYNTH[name]?.(t); // «acceso concedido» y «acceso fallido» solo suenan con sus archivos
}
