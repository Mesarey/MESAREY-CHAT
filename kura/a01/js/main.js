// KURA · A01 — coordina escena, efectos, formulario y audio.
import { CANVAS, config } from './config.js';
import { applyLanguage, currentLang, t } from './i18n.js';
import { motion } from './motion.js';
import { buildScene, mountWind, parallax } from './scene.js';
import { createStarField } from './starfield.js';
import { luminousBorder } from './border.js';
import { loginForm } from './form.js';
import { audio } from './audio.js';
import { devPanel } from './devpanel.js';
import { legalDialog } from './legal.js';
import { signupForm } from './signup.js';
import { recoverForm } from './recover.js';
import { auth } from './auth.js';

const gsap = window.gsap;
gsap?.ticker.lagSmoothing(0);
const $ = (id) => document.getElementById(id);
const stage = $('stage');
const unit = () => stage.clientWidth / CANVAS.width;
const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 600;

/* ---------- Escena ---------- */
buildScene($('scene'));
const wind = mountWind($('scene'), motion);
let stars = null;
// Estado de aparición del lienzo de Three.js (estrellas y destellos), animado junto con la escena.
const reveal = { stars: motion.reduced ? 1 : 0, flares: motion.reduced ? 1 : 0, zoom: motion.reduced ? 1 : 1.06 };
const tilt = parallax(stage, motion, unit, (x, y) => stars?.shift(x, y));
// En teléfono, el primer toque activa el giroscopio (en iPhone el sistema pide permiso).
if (matchMedia('(pointer: coarse)').matches) addEventListener('click', () => tilt.enableGyro(), { once: true, capture: true });
document.addEventListener('visibilitychange', () => { if (!document.hidden) tilt.recenter(); });

/* ---------- Idioma y título ---------- */
let chars = [];
function splitTitle() {
  chars = [];
  document.querySelectorAll('[data-split]').forEach((line) => {
    const text = line.textContent;
    line.textContent = '';
    const label = document.createElement('span');
    label.className = 'sr'; label.textContent = text;
    line.appendChild(label);
    for (const c of text) {
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      if (c === ' ') s.className = 'sp'; else { s.className = 'ch'; s.textContent = c; chars.push(s); }
      line.appendChild(s);
    }
  });
  layoutShine();
}
// El brillo recorre cada renglón como una sola pieza: cada letra conoce su posición.
function layoutShine() {
  document.querySelectorAll('[data-split]').forEach((line) => {
    const lw = line.getBoundingClientRect().width || 1;
    const first = line.querySelector('.ch')?.offsetLeft ?? 0;
    line.querySelectorAll('.ch').forEach((ch) => { ch._x = ch.offsetLeft - first; ch._lw = lw; ch.style.backgroundSize = `${lw * 2.4}px 100%`; });
  });
  paintShine();
}
const shine = { p: 0 };
function paintShine() { for (const ch of chars) ch.style.backgroundPosition = `${-ch._x - ch._lw * 1.4 * shine.p}px 0`; }

applyLanguage();
document.addEventListener('kura:lang', () => {
  splitTitle();
  $('fx-toggle').textContent = t(motion.reduced ? 'fullFx' : 'reduceFx');
  updateSoundButton();
});

/* ---------- Bordes luminosos (uno por vista) ---------- */
const COLORS = { core: '#fff6ee', glow: '#d9a6ff', base1: '#cfa8f5', base2: '#fff1dc' };
const makeButton = (el) => luminousBorder(el, {
  radius: (w, h) => h / 2, intensity: config.button.border, loop: config.button.loop, breathe: config.button.breathe,
  segments: [], sparkles: [], colors: COLORS, widths: { base: 1.5, near: 7, wide: 22 },
});
const makeHud = (el) => luminousBorder(el, {
  radius: () => 70 * unit(), intensity: config.hud.border, loop: config.hud.loop, breathe: 6,
  segments: [], sparkles: [], colors: { core: '#fff6ee', glow: '#c99bff', base1: '#d6b4f2', base2: '#f4dcc0' },
  widths: { base: 1.1, near: 4, wide: 18 },
});
const VIEWS = {};
for (const [name, panelId, ctaId] of [['a01', 'panel', 'cta'], ['a02', 'panel-a02', 'cta-a02'], ['a03', 'panel-a03', 'cta-a03'], ['a04', 'panel-a04', 'cta-a04']]) {
  const el = $(`view-${name}`), panel = $(panelId), c = $(ctaId);
  VIEWS[name] = { name, el, panel, cta: c, button: makeButton(c), hud: makeHud(panel) };
}
let view = VIEWS[location.hash.slice(1)] || VIEWS.a01;
const cta = VIEWS.a01.cta, button = VIEWS.a01.button, hud = VIEWS.a01.hud; // panel de ajustes
const setReduced = (r) => Object.values(VIEWS).forEach((v) => { v.button.setReduced(r); v.hud.setReduced(r); });
setReduced(motion.reduced);
motion.onChange((r) => { setReduced(r); $('fx-toggle').textContent = t(r ? 'fullFx' : 'reduceFx'); $('fx-toggle').setAttribute('aria-pressed', String(r)); });
for (const v of Object.values(VIEWS)) {
  const brighten = (on) => v.button.setIntensity(config.button.border * (on ? 1.3 : 1), 300);
  v.cta.addEventListener('pointerenter', () => brighten(true));
  v.cta.addEventListener('pointerleave', () => brighten(false));
  v.cta.addEventListener('focus', () => brighten(true));
  v.cta.addEventListener('blur', () => brighten(false));
}

/* ---------- Estrellas y chispas ---------- */
let syncFlares = () => {};
// Se crea al terminar el arranque (A05): compilar WebGL no compite con la animación de carga.
const startStars = () => createStarField({ canvas: $('fx'), stage, motion, isMobile, reveal }).then((s) => {
  stars = s;
  if (!s) return devPanel({ stars, button, hud, wind });
  // El destello óptico sigue el contorno real del panel (se recalcula al cambiar de tamaño).
  syncFlares = () => {
    const u = unit(), sr = stage.getBoundingClientRect();
    const rect = (el, r) => { const b = el.getBoundingClientRect(); return { x: (b.left - sr.left) / u, y: (b.top - sr.top) / u, w: b.width / u, h: b.height / u, r }; };
    s.setRect('hud', rect(view.panel, 70));
    const c = rect(view.cta, 0); c.r = c.h / 2; s.setRect('button', c);
  };
  const sync = () => syncFlares();
  for (const v of Object.values(VIEWS)) new ResizeObserver(sync).observe(v.panel);
  new ResizeObserver(sync).observe(stage); sync();
  setTimeout(sync, 2600); // tras la animación de entrada
  devPanel({ stars, button, hud, wind });
});

/* ---------- Mensajes breves ---------- */
const toastEl = $('toast');
let toastTimer;
function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2800);
}

/* ---------- Formulario ---------- */
loginForm({
  stage, motion, toast,
  sfx: (n) => audio.sfx(n),
  onPrimary: (e) => primaryFx(VIEWS.a01, e),
});
// Sin sonido propio: suena «acceso fallido» si faltan datos y «acceso concedido» al entrar.
function primaryFx(v, e) {
  v.button.pulse();
  const r = v.cta.getBoundingClientRect();
  stars?.burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 1.3);
}
document.querySelectorAll('[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  audio.sfx(a.dataset.sfx || 'tap');
  toast(`${a.textContent}: ${t('soon').toLowerCase()}`);
}));

// Chispas finas en cada toque sobre un control.
stage.addEventListener('pointerdown', (e) => {
  const target = e.target.closest('button, a, .field');
  if (!target || target.classList.contains('cta')) return;
  stars?.burst(e.clientX, e.clientY, .45);
});

/* ---------- Audio: selector de música y efectos ---------- */
const soundBtn = $('sound'), soundMenu = $('sound-menu'), swMusic = $('sw-music'), swSfx = $('sw-sfx');
function updateSoundButton() {
  soundBtn.dataset.on = String(audio.on);
  swMusic.checked = audio.musicEnabled; swSfx.checked = audio.sfxEnabled;
}
// El audio se intenta activar en cada gesto (tocar, soltar, clic, tecla) hasta que de verdad
// suene; así nunca hace falta apagar y prender el sonido para que empiece.
const GESTURES = ['pointerdown', 'pointerup', 'click', 'touchend', 'keydown'];
const unlock = () => {
  audio.unlock();
  setTimeout(() => { if (audio.ready) GESTURES.forEach((g) => removeEventListener(g, unlock, true)); }, 300);
};
GESTURES.forEach((g) => addEventListener(g, unlock, true));
const setMenu = (open) => {
  soundMenu.hidden = !open;
  soundBtn.setAttribute('aria-expanded', String(open));
  if (open && gsap && !motion.reduced) gsap.fromTo(soundMenu, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' });
};
soundBtn.addEventListener('click', () => { unlock(); audio.sfx('soundIcon'); setMenu(soundMenu.hidden); });
swMusic.addEventListener('change', () => { audio.setMusic(swMusic.checked); audio.sfx('toggle'); });
swSfx.addEventListener('change', () => { audio.setSfx(swSfx.checked); if (swSfx.checked) setTimeout(() => audio.sfx('toggle'), 250); });
addEventListener('pointerdown', (e) => { if (!soundMenu.hidden && !e.target.closest('#sound-menu, #sound')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !soundMenu.hidden) { setMenu(false); soundBtn.focus(); } });
audio.onChange(updateSoundButton);
updateSoundButton();
window.__kura = { audio, view: () => view.name, tilt };

/* ---------- Términos y privacidad ---------- */
const legal = legalDialog({ t, sfx: (n) => audio.sfx(n), lang: currentLang });
const signup = signupForm({ stage, motion, legal, sfx: (n) => audio.sfx(n), onPrimary: (e) => primaryFx(VIEWS.a02, e) });

/* ---------- Cambio de vista A01 ⇄ A02: el escenario no cambia, solo el contenido del HUD ---------- */
// Una sola transición a la vez: si se toca otro botón a mitad del cambio, la anterior se
// completa al instante y empieza la nueva. Los destellos se apagan durante el cambio y solo
// vuelven cuando el panel nuevo está quieto en su lugar.
let switchTl = null;
function showView(name, { animate = true } = {}) {
  const next = VIEWS[name];
  if (!next || next === view) return;
  if (switchTl) { switchTl.progress(1).kill(); switchTl = null; }
  gsap?.killTweensOf(reveal, 'flares');
  const prev = view;
  view = next;
  const swap = () => {
    prev.el.hidden = true; prev.el.classList.remove('is-active');
    next.el.hidden = false; next.el.classList.add('is-active');
    if (name === 'a01') { signup.reset(); recover.reset(); }
    layoutShine(); syncFlares();
  };
  if (!animate || !gsap || motion.reduced) { swap(); reveal.flares = 1; return; }
  const u = unit();
  const parts = next.el.querySelectorAll('.field, .row-msg, .cta, .or, .google, .first, .back-link, .sent-icon, .sent-text, .sent-demo:not([hidden])');
  reveal.flares = 0; // apagados de inmediato: ningún destello se queda en el panel que sale
  switchTl = gsap.timeline({
    onComplete: () => { switchTl = null; syncFlares(); gsap.to(reveal, { flares: 1, duration: 1.2, ease: 'sine.inOut' }); },
  })
    .to(prev.el, { opacity: 0, y: -14 * u, filter: 'blur(6px)', duration: .4, ease: 'power2.in' }, 0)
    .add(swap)
    .set(prev.el, { clearProps: 'opacity,transform,filter' })
    .fromTo(next.el.querySelectorAll('.ch'), { opacity: 0, yPercent: 40, filter: 'blur(6px)' }, { opacity: 1, yPercent: 0, filter: 'blur(0px)', stagger: .025, duration: .9, ease: 'expo.out', clearProps: 'filter' })
    .fromTo(next.el.querySelector('.welcome') || [], { opacity: 0 }, { opacity: 1, duration: .8 }, '<')
    .fromTo(next.el.querySelector('.panel'), { opacity: 0, y: 26 * u }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out', clearProps: 'transform' }, '<.1')
    .fromTo(parts, { opacity: 0, y: 10 * u }, { opacity: 1, y: 0, stagger: .05, duration: .6, ease: 'expo.out', clearProps: 'transform' }, '<.15');
}
const go = (name) => {
  if (location.hash !== `#${name}`) location.hash = name; // el botón «atrás» del teléfono regresa
  showView(name);
};
document.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  audio.sfx(a.dataset.go === 'a02' ? 'createAccount' : 'tap');
  go(a.dataset.go);
}));
const recover = recoverForm({
  stage, motion, sfx: (n) => audio.sfx(n), onPrimary: (e) => primaryFx(VIEWS.a03, e),
  onSent: ({ demo }) => { $('sent-demo').hidden = !demo; go('a04'); },
});
addEventListener('hashchange', () => { const n = location.hash.slice(1); if (VIEWS[n]) showView(n); });
// Vista inicial según la dirección (#a02 abre directamente Crear cuenta).
for (const v of Object.values(VIEWS)) { v.el.hidden = v !== view; v.el.classList.toggle('is-active', v === view); }
document.querySelectorAll('[data-legal]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); legal.open(a.dataset.legal); }));

/* ---------- Preferencias ---------- */
$('lang').addEventListener('click', () => { audio.sfx('tap'); applyLanguage(currentLang() === 'es' ? 'en' : 'es'); });
$('fx-toggle').addEventListener('click', () => { audio.sfx('effects'); motion.set(!motion.reduced); });
$('fx-toggle').setAttribute('aria-pressed', String(motion.reduced));

/* ---------- Invitación del botón principal (solo visual, en reposo) ---------- */
// Si nadie toca ni mueve nada por unos segundos, un reflejo cruza el botón, el halo se
// enciende un poco y la flecha da dos pasos hacia la derecha: «aquí está».
let lastActivity = performance.now();
for (const ev of ['pointermove', 'pointerdown', 'keydown', 'input', 'scroll', 'focusin']) addEventListener(ev, () => { lastActivity = performance.now(); }, { passive: true, capture: true });
function invite() {
  const { cta, button } = view, sheen = cta.querySelector('.cta-sheen'), arrow = cta.querySelector('.cta-arrow');
  const idle = performance.now() - lastActivity > config.button.idleAfter * 1000;
  if (idle && !motion.reduced && !document.hidden && cta.getAttribute('aria-busy') !== 'true' && document.activeElement !== cta) {
    button.invite();
    sheen.animate([{ translate: '-130% 0' }, { translate: '330% 0' }], { duration: 1800, easing: 'cubic-bezier(.45,.05,.25,1)' });
    arrow.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(45%)', offset: .2 }, { transform: 'translateX(0)', offset: .4 }, { transform: 'translateX(45%)', offset: .6 }, { transform: 'translateX(0)', offset: .85 }, { transform: 'translateX(0)' }],
      { duration: 1300, delay: 900, easing: 'ease-in-out' },
    );
  }
  setTimeout(invite, config.button.inviteEvery * 1000);
}

/* ---------- Entrada ---------- */
function intro() {
  const u = unit(), V = view.el;
  if (!gsap || motion.reduced) { Object.assign(reveal, { stars: 1, flares: 1, zoom: 1 }); setTimeout(invite, 3500); return; }
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.scene-art', { opacity: 0, scale: 1.06, duration: 2.4, ease: 'power2.out' }, 0)
    // las estrellas siguen la misma escala que el cielo y se encienden una a una mientras aparece
    .to(reveal, { zoom: 1, duration: 2.4, ease: 'power2.out' }, 0)
    .to(reveal, { stars: 1, duration: 3.2, ease: 'sine.inOut' }, .5)
    .from('.cloud-wrap', { opacity: 0, duration: 2.4, stagger: .2 }, .3)
    .from('.lights', { opacity: 0, duration: 2.6 }, .6)
    .from('.logo', { opacity: 0, scale: .9, filter: 'blur(8px)', duration: 1.6 }, .7)
    .from('.sound', { opacity: 0, duration: 1.2 }, .9)
    .from(V.querySelectorAll('.ch'), { opacity: 0, yPercent: 50, filter: 'blur(8px)', stagger: .03, duration: 1.3 }, 1.0)
    .from(V.querySelectorAll('.welcome .rule'), { scaleX: 0, duration: 1.4, ease: 'power3.inOut' }, 1.5)
    .from(V.querySelector('.welcome-text'), { opacity: 0, duration: 1.4 }, 1.6)
    .from(V.querySelector('.panel'), { opacity: 0, y: 60 * u, duration: 1.5 }, 1.4)
    .to(reveal, { flares: 1, duration: 2.2, ease: 'sine.inOut' }, 2.4)  // los destellos del cristal llegan al final
    .from([...V.querySelectorAll('.field, .row-msg, .cta, .or, .google, .first'), document.querySelector('.prefs')], { opacity: 0, y: 14 * u, stagger: .07, duration: 1 }, 1.8)
    .add(() => setTimeout(invite, 1200), 2.6);
  gsap.timeline({ repeat: -1, repeatDelay: 7, delay: 3.2 }).fromTo(shine, { p: 0 }, { p: 1, duration: 2.8, ease: 'sine.inOut', onUpdate: paintShine });
}

/* ---------- A05 · Restaurando sesión ---------- */
// Cubre la escena mientras carga y comprueba si hay una sesión guardada.
// Con sesión se abriría Hoy en el mundo predeterminado (aún no existe); sin ella, inicio de sesión.
const boot = $('boot');
const bootStage = boot.querySelector('.boot-stage'), orbitEl = boot.querySelector('.boot-orbit');
const bu = () => bootStage.clientWidth / CANVAS.width;
// Tres luces brillantes, cada una con una estela de chispas que se desvanece detrás.
const TRAIL = 7, PHASES = [-90, 30, 150].map((d) => (d * Math.PI) / 180);
const orbs = PHASES.map(() => {
  const core = document.createElement('i'); core.className = 'orb';
  const trail = Array.from({ length: TRAIL }, () => { const t = document.createElement('i'); t.className = 'trail'; orbitEl.appendChild(t); return t; });
  orbitEl.appendChild(core);
  return { core, trail };
});
// Polvo de luz que sube despacio alrededor del logo.
{
  const dust = boot.querySelector('.boot-dust');
  let seed = 11; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('i');
    p.style.left = `${18 + rnd() * 64}%`; p.style.top = `${36 + rnd() * 34}%`;
    p.style.setProperty('--d', `${4 + rnd() * 4}s`); p.style.setProperty('--w', `${-rnd() * 6}s`);
    p.style.setProperty('--dx', `${(rnd() - .5) * 40}px`);
    p.style.scale = String(.5 + rnd() * .9);
    dust.appendChild(p);
  }
}
const placeOrbs = (a) => {
  const u = bu();
  orbs.forEach(({ core, trail }, i) => {
    const pos = (th) => { const x = Math.cos(th), y = Math.sin(th); return [x * 83 * u, y * 35 * u, (y + 1) / 2]; };
    const [x, y, front] = pos(a + PHASES[i]);
    core.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${(0.8 + front * 0.55).toFixed(3)})`;
    core.style.opacity = (0.55 + front * 0.45).toFixed(3);
    trail.forEach((t, k) => {
      const [tx, ty, tf] = pos(a + PHASES[i] - (k + 1) * 0.085);
      const fade = 1 - (k + 1) / (TRAIL + 1);
      t.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${(fade * (0.6 + tf * 0.5)).toFixed(3)})`;
      t.style.opacity = (fade * 0.7 * (0.5 + tf * 0.5)).toFixed(3);
    });
  });
};
let orbitRaf = 0;
function orbit(t0 = performance.now()) {
  const PERIOD = 1650;
  const step = (now) => { placeOrbs(((now - t0) / PERIOD) * Math.PI * 2); orbitRaf = requestAnimationFrame(step); };
  orbitRaf = requestAnimationFrame(step);
}
placeOrbs(0); // posición inicial (y fija con movimiento reducido)
const imageReady = (src) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = src; });
async function runBoot() {
  const keep = location.hash === '#a05'; // para revisar A05: se queda hasta tocar la pantalla
  if (!motion.reduced) orbit();
  if (gsap && !motion.reduced) gsap.from(boot.querySelectorAll('.boot-halo, .boot-logo, .boot-orbit, .boot-text'), { opacity: 0, y: 10 * unit(), stagger: .12, duration: 1, ease: 'power2.out' });
  const [{ session }] = await Promise.all([
    auth.restoreSession(),
    imageReady('assets/img/escena.webp'),
    new Promise((r) => setTimeout(r, motion.reduced ? 600 : 1800)),
  ]);
  if (keep) await new Promise((r) => boot.addEventListener('pointerdown', r, { once: true }));
  if (session) { /* aquí se abriría Hoy (L01) en el mundo predeterminado */ }
  if (keep) history.replaceState(null, '', '#a01');
}
// El arranque se desvanece mientras la escena aparece: un solo movimiento continuo.
function hideBoot() {
  const done = () => { cancelAnimationFrame(orbitRaf); boot.hidden = true; };
  if (!gsap || motion.reduced) { done(); return; }
  gsap.to(boot, { opacity: 0, duration: 1.1, ease: 'power2.inOut', onComplete: done });
}
document.fonts.ready.then(async () => { splitTitle(); await runBoot(); stage.classList.remove('booting'); startStars(); intro(); hideBoot(); });
addEventListener('resize', layoutShine);
