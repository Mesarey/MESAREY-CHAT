// KURA · A01 — coordina escena, efectos, formulario y audio.
import { CANVAS, config } from './config.js';
import { applyLanguage, currentLang, t } from './i18n.js';
import { motion } from './motion.js';
import { buildScene, parallax } from './scene.js';
import { createStarField } from './starfield.js';
import { luminousBorder } from './border.js';
import { loginForm } from './form.js';
import { audio } from './audio.js';
import { devPanel } from './devpanel.js';

const gsap = window.gsap;
gsap?.ticker.lagSmoothing(0);
const $ = (id) => document.getElementById(id);
const stage = $('stage');
const unit = () => stage.clientWidth / CANVAS.width;
const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 600;

/* ---------- Escena ---------- */
buildScene($('scene'));
let stars = null;
parallax(stage, motion, unit, (x, y) => stars?.shift(x, y));

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

/* ---------- Bordes luminosos ---------- */
const COLORS = { core: '#fff6ee', glow: '#d9a6ff', base1: '#cfa8f5', base2: '#fff1dc' };
const cta = $('cta');
const button = luminousBorder(cta, {
  radius: (w, h) => h / 2,
  intensity: config.button.border,
  loop: config.button.loop,
  breathe: config.button.breathe,
  segments: [],   // sin líneas que giran: la luz del botón son destellos ópticos lentos (Three.js)
  sparkles: [],
  colors: COLORS,
  widths: { base: 1.5, near: 7, wide: 22 },
});
const hud = luminousBorder($('panel'), {
  radius: () => 70 * unit(),
  intensity: config.hud.border,
  loop: config.hud.loop,
  breathe: 6,
  segments: [],   // sin líneas que viajan: la luz del cristal son destellos ópticos (Three.js)
  sparkles: [],
  colors: { core: '#fff6ee', glow: '#c99bff', base1: '#d6b4f2', base2: '#f4dcc0' },
  widths: { base: 1.1, near: 4, wide: 18 },
});
const setReduced = (r) => { button.setReduced(r); hud.setReduced(r); };
setReduced(motion.reduced);
motion.onChange((r) => { setReduced(r); $('fx-toggle').textContent = t(r ? 'fullFx' : 'reduceFx'); $('fx-toggle').setAttribute('aria-pressed', String(r)); });

const brighten = (on) => button.setIntensity(config.button.border * (on ? 1.3 : 1), 300);
cta.addEventListener('pointerenter', () => brighten(true));
cta.addEventListener('pointerleave', () => brighten(false));
cta.addEventListener('focus', () => brighten(true));
cta.addEventListener('blur', () => brighten(false));

/* ---------- Estrellas y chispas ---------- */
createStarField({ canvas: $('fx'), stage, motion, isMobile }).then((s) => {
  stars = s;
  if (!s) return devPanel({ stars, button, hud });
  // El destello óptico sigue el contorno real del panel (se recalcula al cambiar de tamaño).
  const panel = $('panel');
  const sync = () => {
    const u = unit(), sr = stage.getBoundingClientRect();
    const rect = (el, r) => { const b = el.getBoundingClientRect(); return { x: (b.left - sr.left) / u, y: (b.top - sr.top) / u, w: b.width / u, h: b.height / u, r }; };
    s.setRect('hud', rect(panel, 70));
    const c = rect(cta, 0); c.r = c.h / 2; s.setRect('button', c);
  };
  new ResizeObserver(sync).observe(panel); new ResizeObserver(sync).observe(stage); sync();
  setTimeout(sync, 2600); // tras la animación de entrada
  devPanel({ stars, button, hud });
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
  onPrimary: (e) => {
    // Sin sonido propio: suena «acceso fallido» si faltan datos y «acceso concedido» al entrar.
    button.pulse();
    const r = cta.getBoundingClientRect();
    stars?.burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 1.3);
  },
});
document.querySelectorAll('[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  audio.sfx('tap');
  toast(`${a.textContent}: ${t('soon').toLowerCase()}`);
}));

// Chispas finas en cada toque sobre un control.
stage.addEventListener('pointerdown', (e) => {
  const target = e.target.closest('button, a, .field');
  if (!target || target === cta) return;
  stars?.burst(e.clientX, e.clientY, .45);
});

/* ---------- Audio ---------- */
const soundBtn = $('sound');
function updateSoundButton() {
  soundBtn.setAttribute('aria-pressed', String(audio.on));
  soundBtn.setAttribute('aria-label', t(audio.on ? 'soundOn' : 'soundOff'));
}
let unlocked = false;
const firstGesture = (e) => {
  if (e.target.closest?.('#sound')) return;
  unlocked = true;
  removeEventListener('pointerdown', firstGesture, true);
  removeEventListener('keydown', firstGesture, true);
  audio.unlock();
};
addEventListener('pointerdown', firstGesture, true);
addEventListener('keydown', firstGesture, true);
soundBtn.addEventListener('click', () => {
  if (!unlocked) { // primer toque en el botón: se interpreta como «quiero escuchar»
    unlocked = true;
    removeEventListener('pointerdown', firstGesture, true);
    removeEventListener('keydown', firstGesture, true);
    audio.unlock();
  } else {
    audio.toggle();
  }
  updateSoundButton();
  audio.sfx('toggle');
});
audio.onChange(updateSoundButton);
window.__kura = { audio };

/* ---------- Preferencias ---------- */
$('lang').addEventListener('click', () => { audio.sfx('tap'); applyLanguage(currentLang() === 'es' ? 'en' : 'es'); });
$('fx-toggle').addEventListener('click', () => { audio.sfx('toggle'); motion.set(!motion.reduced); });
$('fx-toggle').setAttribute('aria-pressed', String(motion.reduced));

/* ---------- Invitación del botón principal (solo visual, en reposo) ---------- */
// Si nadie toca ni mueve nada por unos segundos, un reflejo cruza el botón, el halo se
// enciende un poco y la flecha da dos pasos hacia la derecha: «aquí está».
let lastActivity = performance.now();
for (const ev of ['pointermove', 'pointerdown', 'keydown', 'input', 'scroll', 'focusin']) addEventListener(ev, () => { lastActivity = performance.now(); }, { passive: true, capture: true });
const sheen = cta.querySelector('.cta-sheen'), arrow = cta.querySelector('.cta-arrow');
function invite() {
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
  const u = unit();
  if (!gsap || motion.reduced) { setTimeout(invite, 3500); return; }
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.scene-art', { opacity: 0, scale: 1.06, duration: 2.4, ease: 'power2.out' }, 0)
    .from('.cloud-wrap', { opacity: 0, duration: 2.4, stagger: .2 }, .3)
    .from('.lights', { opacity: 0, duration: 2.6 }, .6)
    .from('.logo', { opacity: 0, scale: .9, filter: 'blur(8px)', duration: 1.6 }, .7)
    .from('.sound', { opacity: 0, duration: 1.2 }, .9)
    .from(chars, { opacity: 0, yPercent: 50, filter: 'blur(8px)', stagger: .03, duration: 1.3 }, 1.0)
    .from('.welcome .rule', { scaleX: 0, duration: 1.4, ease: 'power3.inOut' }, 1.5)
    .from('.welcome-text', { opacity: 0, duration: 1.4 }, 1.6)
    .from('.panel', { opacity: 0, y: 60 * u, duration: 1.5 }, 1.4)
    .from('.field, .row-msg, .cta, .or, .google, .first, .legal, .prefs', { opacity: 0, y: 14 * u, stagger: .07, duration: 1 }, 1.8)
    .add(() => setTimeout(invite, 1200), 2.6);
  gsap.timeline({ repeat: -1, repeatDelay: 7, delay: 3.2 }).fromTo(shine, { p: 0 }, { p: 1, duration: 2.8, ease: 'sine.inOut', onUpdate: paintShine });
}

document.fonts.ready.then(() => { splitTitle(); intro(); });
addEventListener('resize', layoutShine);
