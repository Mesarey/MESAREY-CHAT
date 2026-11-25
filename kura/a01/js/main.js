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
import { mountA06 } from './a06.js';
import { mountA10 } from './a10.js';
import { mountA11 } from './a11.js';
import { GUIAS } from './a11-capas.js';
import { makeCombo } from './fecha.js';
import { fireworks as launchFireworks } from './fuegos.js';
import { TWINKLES as A06_STARS } from './a06-estrellas.js';

const gsap = window.gsap;
gsap?.ticker.lagSmoothing(0);
gsap?.config({ nullTargetWarn: false }); // algunas vistas no tienen todas las piezas de la transición
const $ = (id) => document.getElementById(id);
const stage = $('stage');
const unit = () => stage.clientWidth / CANVAS.width;
const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 600;

/* ---------- Escena ---------- */
buildScene($('scene'));
const wind = mountWind($('scene'), motion);
let stars = null;
// Estado de aparición del lienzo de Three.js (estrellas y destellos), animado junto con la escena.
const reveal = { stars: motion.reduced ? 1 : 0, flares: motion.reduced ? 1 : 0, zoom: motion.reduced ? 1 : 1.06, sky6: 0 }; // sky6: estrellas del cielo de A06
let a06 = null, a10 = null, a11 = null;
const tilt = parallax(stage, motion, unit, (o) => { stars?.shift(o); a06?.look(o.n); a10?.look(o.n); a11?.look(o.n); });
// A06 · Bienvenida con Alaira: su escenario se arma la primera vez que hace falta (o en segundo plano).
a06 = mountA06({ stage, motion, onLayers: (els) => tilt.addLayers(els) });
// A10 · ¿Qué te motiva a cambiar tu Aura?: escenario propio (Alaira en la luna creciente sobre el lago).
a10 = mountA10({ stage, motion });
// A11 · ¿Listo para KURA?: escenario propio (Alaira en el barandal del templo señala a los demás guías).
a11 = mountA11({ stage, motion });
// En teléfono, el primer toque activa el giroscopio (en iPhone el sistema pide permiso).
if (matchMedia('(pointer: coarse)').matches) addEventListener('click', () => tilt.enableGyro(), { once: true, capture: true });
document.addEventListener('visibilitychange', () => { if (!document.hidden) tilt.recenter(); });

/* ---------- Idioma y título ---------- */
let chars = [];
function splitTitle() {
  chars = [];
  document.querySelectorAll('[data-split]').forEach((line) => {
    const text = line.querySelector(':scope > .sr')?.textContent ?? line.textContent; // ya partido: se reparte de nuevo sin duplicar
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
for (const [name, panelId, ctaId] of [['a01', 'panel', 'cta'], ['a02', 'panel-a02', 'cta-a02'], ['a03', 'panel-a03', 'cta-a03'], ['a04', 'panel-a04', 'cta-a04'], ['a06', 'panel-a06', 'cta-a06'], ['a07', 'panel-a07', 'cta-a07'], ['a08', 'panel-a08', 'cta-a08'], ['a09', 'panel-a09', 'cta-a09'], ['a10', 'panel-a10', 'cta-a10'], ['a11', 'panel-a11', 'cta-a11']]) {
  const el = $(`view-${name}`), panel = $(panelId), c = $(ctaId);
  VIEWS[name] = { name, el, panel, cta: c, button: makeButton(c), hud: makeHud(panel) };
}
VIEWS.a11.hud.setIntensity(0, 0); // A11 no tiene panel de cristal: sus banners van sobre la terraza, sin contorno
let view = VIEWS[location.hash.slice(1)] || VIEWS.a01;
// Pantallas de la introducción con Alaira: comparten su escenario (A06 Bienvenida, A07 ¿Cómo te llamo?).
const ALAIRA_VIEWS = new Set(['a06', 'a07', 'a08', 'a09']);
const inAlaira = (n) => ALAIRA_VIEWS.has(n);
// Escenario de cada pantalla: Observatorio (A01–A05), Alaira (A06–A09), la luna sobre el lago (A10) o el templo (A11).
const sceneOf = (n) => (ALAIRA_VIEWS.has(n) ? 'a06' : n === 'a10' || n === 'a11' ? n : 'obs');
const inIntro = (n) => sceneOf(n) !== 'obs';
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
  s.setSky6(A06_STARS); // el cielo de A06 usa las mismas estrellas nítidas y destellantes que A01
  // El destello óptico sigue el contorno real del panel (se recalcula al cambiar de tamaño).
  // El destello se coloca con la posición del panel SIN el paralaje (el shader ya lo suma con uHud) y
  // solo cuando nada entre el panel y el HUD está animado (entradas, salidas, hover del botón).
  // Antes se medía en cualquier momento: si el HUD estaba desplazado o a media transición, el
  // destello quedaba corrido. Si en ese instante algo se mueve, se espera a la siguiente medición.
  const content = document.querySelector('.content');
  const moved = (e) => {
    const cs = getComputedStyle(e);
    const still = cs.transform === 'none' || new DOMMatrixReadOnly(cs.transform).isIdentity; // GSAP puede dejar translate(0,0)
    return !still || !/^(none|0px( 0px)?)$/.test(cs.translate) || !/^(none|1( 1)?)$/.test(cs.scale);
  };
  const xy = (v) => (v === 'none' ? [0, 0] : [...v.split(' ').map(parseFloat), 0].slice(0, 2));
  const rectOf = (el, r) => {
    if (!el.offsetWidth) return null; // vista oculta
    for (let n = el; n && n !== content; n = n.parentElement) if (moved(n)) return null;
    const u = unit(), sr = stage.getBoundingClientRect(), b = el.getBoundingClientRect();
    const [tx, ty] = xy(getComputedStyle(content).translate);
    return { x: (b.left - sr.left - tx) / u, y: (b.top - sr.top - ty) / u, w: b.width / u, h: b.height / u, r };
  };
  let lastKey = '';
  syncFlares = () => {
    if (switchTl) return; // a media transición: se mide al terminar
    const hudR = rectOf(view.panel, 70), btnR = rectOf(view.cta, 0);
    if (!hudR || !btnR) return;
    btnR.r = btnR.h / 2;
    const key = JSON.stringify([hudR, btnR], (k, v) => (typeof v === 'number' ? +v.toFixed(2) : v));
    if (key === lastKey) return;
    lastKey = key;
    s.setRect('hud', hudR); s.setRect('button', btnR);
  };
  const sync = () => syncFlares();
  for (const v of Object.values(VIEWS)) new ResizeObserver(sync).observe(v.panel);
  new ResizeObserver(sync).observe(stage);
  new ResizeObserver(sync).observe(document.querySelector('.content')); // si algo arriba del panel cambia de alto
  document.fonts?.ready.then(sync);
  sync();
  // Red de seguridad: dos veces por segundo se confirma que el destello sigue al panel (barato: solo lee medidas).
  setInterval(() => { if (!document.hidden) sync(); }, 500);
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
  onGranted: () => enterIntro(),
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
  swMusic.checked = audio.musicEnabled; swSfx.checked = audio.sfxEnabled; $('sw-voice').checked = audio.voiceEnabled;
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
$('sw-voice').addEventListener('change', (e) => { audio.setVoice(e.target.checked); audio.sfx('toggle'); });
swSfx.addEventListener('change', () => { audio.setSfx(swSfx.checked); if (swSfx.checked) setTimeout(() => audio.sfx('toggle'), 250); });
addEventListener('pointerdown', (e) => { if (!soundMenu.hidden && !e.target.closest('#sound-menu, #sound')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !soundMenu.hidden) { setMenu(false); soundBtn.focus(); } });
audio.onChange(updateSoundButton);
updateSoundButton();
window.__kura = { audio, view: () => view.name, tilt,
  /** Visor: idioma de la app ('es' | 'en'), o null para seguir el del teléfono. */
  setLang: (l) => { if (l) applyLanguage(l, { manual: true }); else { try { sessionStorage.removeItem('kura.lang'); } catch {} location.reload(); } }, flares: () => stars?.rects?.(), a06: () => a06, a10: () => a10, a11: () => a11 };

/* ---------- Términos y privacidad ---------- */
const legal = legalDialog({ t, sfx: (n) => audio.sfx(n), lang: currentLang });
const signup = signupForm({ stage, motion, legal, sfx: (n) => audio.sfx(n), onPrimary: (e) => primaryFx(VIEWS.a02, e), onGranted: () => enterIntro() });

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
  const sceneChange = sceneOf(name) !== sceneOf(prev.name);
  const swap = () => {
    prev.el.hidden = true; prev.el.classList.remove('is-active');
    next.el.hidden = false; next.el.classList.add('is-active');
    stage.classList.toggle('in-a06', inAlaira(name)); // escenario y HUD de Alaira
    stage.classList.toggle('in-a07', name === 'a07');
    stage.classList.toggle('in-a10', name === 'a10');
    stage.classList.toggle('in-a11', name === 'a11');
    reveal.flareless = name === 'a11'; // sin panel de cristal no hay destellos de contorno
    $('voice-row').hidden = !inIntro(name); // la voz de Alaira solo aparece en la introducción
    if (name === 'a01') { signup.reset(); recover.reset(); }
    if (name === 'a07') { nameInput.value = ''; nameError(false); } // A07 siempre empieza con el campo vacío
    if (name === 'a08') resetBirth();                                // A08 también empieza vacía
    if (name === 'a09') { resetIdentity(); a10.prefetch(); }         // A09 empieza sin opción elegida; A10 se descarga mientras
    if (name === 'a10') { resetMotives(); a11.prefetch(); }          // A10 también; A11 se descarga mientras
    if (name === 'a11') prepareA11();                                // título según la identidad y banners
    layoutShine(); syncFlares();
  };
  if (sceneChange) switchScene(sceneOf(prev.name), sceneOf(name), animate);
  if (!animate || !gsap || motion.reduced) { swap(); reveal.flares = 1; return; }
  const u = unit();
  // A06 ⇄ A07: mismo marco (título, nube y panel en el mismo lugar): el panel se queda quieto y solo
  // cambian el título y el contenido de adentro. Nada sale ni entra, así no se cruzan capas.
  if (inAlaira(name) && inAlaira(prev.name)) {
    const inner = (v) => [...v.el.querySelectorAll('.title .ch'), ...v.el.querySelectorAll('.form > *')];
    const nextIn = next.el.querySelectorAll('.form > *');
    reveal.flares = 0;
    switchTl = gsap.timeline({ onComplete: () => { switchTl = null; syncFlares(); gsap.to(reveal, { flares: 1, duration: 1, ease: 'sine.inOut' }); } })
      .to(inner(prev), { opacity: 0, y: -6 * u, filter: 'blur(4px)', duration: .32, stagger: .008, ease: 'power2.in' }, 0)
      .add(() => { swap(); gsap.set(inner(prev), { clearProps: 'opacity,transform,filter' }); })
      .fromTo(next.el.querySelectorAll('.title .ch'), { opacity: 0, yPercent: 30, filter: 'blur(6px)' }, { opacity: 1, yPercent: 0, filter: 'blur(0px)', stagger: .022, duration: .8, ease: 'expo.out', clearProps: 'filter' })
      .fromTo(nextIn, { opacity: 0, y: 10 * u }, { opacity: 1, y: 0, stagger: .06, duration: .6, ease: 'expo.out', clearProps: 'transform' }, '<.1');
    return;
  }
  const parts = next.el.querySelectorAll('.field, .row-msg, .cta, .or, .google, .first, .back-link, .sent-icon, .sent-text, .sent-demo:not([hidden]), .a06-guide, .a06-question, .a07-info, .a07-field-wrap, .a08-date, .a08-age, .a09-opts, .a10-opts, .a10-actions, .a11-eyebrow, .a11-filete, .a11-sub, .a11-card, .a11-actions');
  reveal.flares = 0; // apagados de inmediato: ningún destello se queda en el panel que sale
  switchTl = gsap.timeline({
    onComplete: () => { switchTl = null; syncFlares(); gsap.to(reveal, { flares: 1, duration: 1.2, ease: 'sine.inOut' }); },
  })
    .to(prev.el, { opacity: 0, y: -14 * u, filter: 'blur(6px)', duration: .4, ease: 'power2.in' }, 0)
    .add(swap)
    .set(prev.el, { clearProps: 'opacity,transform,filter' })
    .fromTo(next.el.querySelectorAll('.ch'), { opacity: 0, yPercent: 40, filter: 'blur(6px)' }, { opacity: 1, yPercent: 0, filter: 'blur(0px)', stagger: .025, duration: .9, ease: 'expo.out', clearProps: 'filter' })
    .fromTo(next.el.querySelector('.welcome') || [], { opacity: 0 }, { opacity: 1, duration: .8 }, '<')
    .fromTo(next.el.querySelector('.panel'), { y: 26 * u }, { y: 0, duration: .8, ease: 'expo.out', clearProps: 'transform' }, '<.1')
    .fromTo(next.el.querySelector('.panel').children, { opacity: 0 }, { opacity: 1, duration: .8, ease: 'expo.out', clearProps: 'opacity' }, '<') // vidrio con su desenfoque desde el inicio
    .fromTo(parts, { opacity: 0, y: 10 * u }, { opacity: 1, y: 0, stagger: .05, duration: .6, ease: 'expo.out', clearProps: 'transform' }, '<.15');
}
/* ---------- Cambio de escenario: Observatorio (A01–A05) ⇄ Alaira (A06–A09) ⇄ Luna sobre el lago (A10) ---------- */
// La escena nueva aparece encima con un leve acercamiento mientras la anterior se desvanece. Las estrellas del
// Observatorio solo se ven en A01–A05 y las del cielo de A06 solo en A06–A09 (A10 trae su propio cielo vivo).
const a01Scene = $('scene');
const sceneMod = { a06: () => a06, a10: () => a10, a11: () => a11 };
function switchScene(from, to, animate = true) {
  gsap?.killTweensOf([a01Scene, reveal]);
  for (const k of ['a06', 'a10', 'a11']) if (sceneMod[k]().el) gsap?.killTweensOf(sceneMod[k]().el);
  const soft = animate && gsap && !motion.reduced;
  audio.loop('starFloat', to === 'a06'); // la estrella de Alaira suena muy suave mientras se ve A06–A09
  const starsTo = to === 'obs' ? 1 : 0, sky6To = to === 'a06' ? 1 : 0;
  const out = from === 'obs' ? null : sceneMod[from]();
  if (to !== 'obs') sceneMod[to]().enter();
  if (!soft) {
    if (to === 'obs') { a01Scene.style.visibility = ''; a01Scene.style.opacity = 1; } else { a01Scene.style.visibility = 'hidden'; sceneMod[to]().el.style.opacity = 1; }
    if (out?.el) { out.el.style.opacity = 0; out.leave(); }
    reveal.stars = starsTo; reveal.sky6 = sky6To;
    return;
  }
  if (to === 'obs') {
    a01Scene.style.visibility = '';
    gsap.to(a01Scene, { opacity: 1, duration: 1.2, ease: 'sine.inOut' });
  } else {
    gsap.fromTo(sceneMod[to]().el, { opacity: 0, scale: 1.07 }, { opacity: 1, scale: 1.02, duration: 2, ease: 'power2.out' });
  }
  gsap.to(reveal, { stars: starsTo, duration: starsTo ? 1.6 : .9, ease: 'sine.inOut' });
  gsap.to(reveal, { sky6: sky6To, duration: sky6To ? 2.4 : .8, delay: sky6To ? .6 : 0, ease: 'sine.inOut' }); // se encienden una a una con el cielo de A06
  if (from === 'obs') gsap.to(a01Scene, { opacity: 0, duration: 1.4, ease: 'sine.inOut', onComplete: () => { a01Scene.style.visibility = 'hidden'; } });
  else gsap.to(out.el, { opacity: 0, duration: 1.1, ease: 'sine.inOut', onComplete: () => out.leave() });
}
// Acceso concedido (iniciar sesión, Google o cuenta nueva) → introducción con Alaira.
function enterIntro() {
  // deja oír el «acceso concedido» y espera a que Alaira esté lista (máximo 2.5 s) antes del cambio
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  Promise.all([wait(650), Promise.race([a06.prepare(), wait(2500)])]).then(() => go('a06'));
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
if (inIntro(view.name)) { stage.classList.toggle('in-a06', inAlaira(view.name)); stage.classList.toggle('in-a07', view.name === 'a07'); stage.classList.toggle('in-a10', view.name === 'a10'); stage.classList.toggle('in-a11', view.name === 'a11'); reveal.flareless = view.name === 'a11'; if (view.name === 'a11') queueMicrotask(prepareA11); $('voice-row').hidden = false; switchScene('obs', sceneOf(view.name), false); }

/* ---------- A06: Empezar (obligatorio: no hay «Saltar por ahora») ---------- */
$('cta-a06').addEventListener('click', (e) => { audio.sfx('start'); primaryFx(VIEWS.a06, e); setTimeout(() => go('a07'), 420); });

/* ---------- Campos vacíos al abrir ----------
   El navegador vuelve a poner lo escrito antes al recargar (o al regresar a la página): todos los
   campos de texto empiezan vacíos. El gestor de contraseñas del teléfono puede seguir ofreciendo los suyos. */
const clearFields = () => document.querySelectorAll('.content input:not([type=checkbox]):not([type=radio])').forEach((i) => { i.value = ''; });
clearFields();
addEventListener('pageshow', clearFields);

/* ---------- A07: ¿Cómo te llamo? ----------
   El nombre (o apodo) se guarda solo en este dispositivo y se usa en saludos y en las afirmaciones
   que admiten personalización. */
const NAME_KEY = 'kura.nombre';
const nameInput = $('nombre'), nameField = $('field-name'), nameMsg = $('msg-a07');
const nameError = (on) => { nameField.classList.toggle('is-error', on); nameMsg.textContent = on ? t('a07Empty') : ''; nameMsg.classList.toggle('is-on', on); nameInput.setAttribute('aria-invalid', String(on)); };
let quietFocus = false; // al volver al campo tras «falta un dato» no suena el enfoque encima
nameInput.addEventListener('focus', () => { if (!quietFocus) audio.sfx('focus'); quietFocus = false; });
nameInput.addEventListener('input', () => { if (nameInput.value.trim()) nameError(false); });
document.addEventListener('kura:lang', () => { if (nameMsg.classList.contains('is-on')) nameMsg.textContent = t('a07Empty'); });
$('form-a07').addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = nameInput.value.replace(/\s+/g, ' ').trim();
  if (!nombre) { audio.sfx('decline'); nameError(true); quietFocus = document.activeElement !== nameInput; nameInput.focus(); return; } // falta un dato: mismo sonido en A07 y las siguientes
  nameError(false);
  try { localStorage.setItem(NAME_KEY, nombre); } catch {}
  audio.sfx('tap'); primaryFx(VIEWS.a07, {});
  nameInput.blur();
  fireworks();
  a06.smile(2900);
  greet(nombre).then(() => { if (view.name === 'a07') go('a08'); });
});

// Saludo grande (cristal como el HUD) entre la estrella y el título; Alaira sonríe mientras tanto.
const greetEl = $('greet');
function greet(nombre) {
  greetEl.querySelector('.greet-a').textContent = t('a07Hello1');
  greetEl.querySelector('.greet-b').textContent = t('a07Hello2').replace('{nombre}', nombre);
  greetEl.hidden = false;
  audio.sfx('greet');
  if (!gsap || motion.reduced) return new Promise((r) => setTimeout(() => { greetEl.hidden = true; r(); }, 2600));
  const u = unit();
  return new Promise((done) => gsap.timeline({ onComplete: () => { greetEl.hidden = true; done(); } })
    .fromTo(greetEl, { opacity: 0, scale: .86, y: 24 * u, filter: 'blur(8px)' }, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: .7, ease: 'back.out(1.6)' })
    .fromTo(greetEl.querySelector('.greet-b'), { backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0', duration: 1.6, ease: 'sine.inOut' }, .2)
    .to(greetEl, { opacity: 0, y: -16 * u, filter: 'blur(6px)', duration: .55, ease: 'power2.in' }, '+=1.4'));
}
// Fuegos artificiales sencillos sobre el HUD al poner el nombre (chispas finas del motor de estrellas).
function fireworks() {
  if (motion.reduced) return;
  audio.sfx('fireworks');
  launchFireworks(VIEWS.a07.panel.getBoundingClientRect()); // estallidos sobre el HUD (js/fuegos.js)
}

/* ---------- A08: ¿Cuál es tu fecha de nacimiento? ----------
   Día, mes y año en cajas propias que se pueden escribir (la lista se acorta al escribir; js/fecha.js).
   Los días se ajustan al mes y al año (30, 31 o febrero bisiesto). La edad se calcula al momento. La fecha se guarda solo en
   este dispositivo. Sin edad mínima: los textos legales piden no añadirla sin una decisión posterior. */
const BIRTH_KEY = 'kura.nacimiento';
const ageOut = $('age-value'), birthMsg = $('msg-a08');
const daysIn = (m, y) => new Date(y || 2000, m, 0).getDate(); // sin año: 29 días en febrero
const sfxBirth = (n) => audio.sfx(n);
const birth = {};
birth.m = makeCombo($('field-mes'), { sfx: sfxBirth, next: () => $('anio'), options: () => t('a08Months').split(',').map((label, i) => ({ v: i + 1, label })), onCommit: () => dateChanged() });
birth.y = makeCombo($('field-anio'), { sfx: sfxBirth, next: () => [$('dia'), $('mes')].find((i) => !i.value) || null, options: () => { const Y = new Date().getFullYear(); return Array.from({ length: 121 }, (_, i) => ({ v: Y - i, label: String(Y - i) })); }, onCommit: () => dateChanged() });
birth.d = makeCombo($('field-dia'), { sfx: sfxBirth, next: () => $('mes'), options: () => Array.from({ length: birth.m.value ? daysIn(+birth.m.value, +birth.y.value) : 31 }, (_, i) => ({ v: i + 1, label: String(i + 1) })), onCommit: () => dateChanged() });
function birthAge() {
  const d = +birth.d.value, m = +birth.m.value, y = +birth.y.value;
  if (!d || !m || !y) return null;
  const now = new Date();
  return now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0);
}
const ageText = (a) => (a === 1 ? t('a08Year1') : t('a08Years').replace('{n}', a));
let shownAge = null;
function showAge({ celebrate = false } = {}) {
  const a = birthAge(), ok = a != null && a >= 0;
  ageOut.classList.toggle('is-set', ok);
  $('age-a08').classList.toggle('is-set', ok);
  if (!ok) { ageOut.textContent = '—'; shownAge = null; return; }
  if (celebrate && a !== shownAge && gsap && !motion.reduced) {
    // la edad «cuenta» hasta su valor y el número brilla una vez
    const c = { n: Math.max(0, a - 12) };
    gsap.to(c, { n: a, duration: .7, ease: 'power2.out', onUpdate: () => { ageOut.textContent = ageText(Math.round(c.n)); } });
    ageOut.classList.remove('is-shine'); void ageOut.offsetWidth; ageOut.classList.add('is-shine'); // brillo una sola vez
  } else ageOut.textContent = ageText(a);
  shownAge = a;
}
function dateChanged() {
  // 31 de abril → 30; 29 de febrero en año no bisiesto → 28
  const m = +birth.m.value, d = +birth.d.value;
  if (m && d) { const max = daysIn(m, +birth.y.value); if (d > max) birth.d.set(max); }
  birth.d.refresh();
  if (birthMsg.dataset.key) birthError(null);
  showAge({ celebrate: true });
}
const birthError = (key) => {
  birthMsg.textContent = key ? t(key) : ''; birthMsg.classList.toggle('is-on', !!key); birthMsg.dataset.key = key || '';
  for (const c of [birth.d, birth.m, birth.y]) c.input.closest('.a08-sel').classList.toggle('is-error', key === 'a08Empty' ? !c.value : !!key);
};
function resetBirth() { for (const c of [birth.d, birth.m, birth.y]) { c.set(''); c.close(); } shownAge = null; showAge(); birthError(null); }
document.addEventListener('kura:lang', () => { birth.m.refresh(); birth.d.refresh(); birth.y.refresh(); showAge(); if (birthMsg.dataset.key) birthMsg.textContent = t(birthMsg.dataset.key); });
resetBirth();

$('form-a08').addEventListener('submit', (e) => {
  e.preventDefault();
  for (const c of [birth.d, birth.m, birth.y]) c.close();
  const a = birthAge();
  if (a == null) { audio.sfx('decline'); birthError('a08Empty'); return; } // falta un dato
  if (a < 0) { audio.sfx('decline'); birthError('a08Future'); return; }
  birthError(null);
  const iso = `${birth.y.value}-${String(birth.m.value).padStart(2, '0')}-${String(birth.d.value).padStart(2, '0')}`;
  try { localStorage.setItem(BIRTH_KEY, iso); } catch {}
  audio.sfx('tap'); primaryFx(VIEWS.a08, {});
  go('a09');
});

/* ---------- A09 · ¿Cómo te identificas? ----------
   Mujer, Hombre, Otra identidad o Prefiero no decirlo (radios nativos con aspecto de KURA). Al elegir suena un
   toque y salen chispas de la opción. Se guarda solo en este dispositivo (localStorage, clave kura.identidad). */
const ID_KEY = 'kura.identidad';
const idOpts = $('form-a09').querySelector('.a09-opts'), idMsg = $('msg-a09');
const idRadios = [...idOpts.querySelectorAll('input[type=radio]')];
const idError = (on) => { idMsg.textContent = on ? t('a09Empty') : ''; idMsg.classList.toggle('is-on', on); idOpts.classList.toggle('is-error', on); };
function resetIdentity() { for (const r of idRadios) r.checked = false; idError(false); }
idOpts.addEventListener('change', (e) => {
  const opt = e.target.closest('.a09-opt'); if (!opt) return;
  audio.sfx('tap'); idError(false);
  const r = opt.querySelector('.a09-ico').getBoundingClientRect();
  if (!motion.reduced) stars?.burst(r.left + r.width / 2, r.top + r.height / 2, .9);
});
document.addEventListener('kura:lang', () => { if (idMsg.classList.contains('is-on')) idMsg.textContent = t('a09Empty'); });
$('form-a09').addEventListener('submit', (e) => {
  e.preventDefault();
  const sel = idRadios.find((r) => r.checked);
  if (!sel) { audio.sfx('decline'); idError(true); return; } // falta elegir
  try { localStorage.setItem(ID_KEY, sel.value); } catch {}
  audio.sfx('tap'); primaryFx(VIEWS.a09, {});
  go('a10');
});
/* ---------- A10 · ¿Qué te motiva a cambiar tu Aura? ----------
   Siete opciones; se pueden marcar varias. «No sé todavía. Quiero descubrirlo» es exclusiva: al marcarla se
   desmarcan las demás (y al marcar otra se desmarca ella). Al elegir, el brote de Alaira florece y suelta chispas.
   Se guarda solo en este dispositivo (localStorage, clave kura.motivos). «Omitir» sigue sin guardar nada. */
const MOT_KEY = 'kura.motivos';
const motOpts = $('form-a10').querySelector('.a10-opts'), motMsg = $('msg-a10');
const motBoxes = [...motOpts.querySelectorAll('input[type=checkbox]')];
const motNone = motBoxes.find((b) => b.value === 'no-se-todavia');
const motError = (on) => { motMsg.textContent = on ? t('a10Empty') : ''; motMsg.classList.toggle('is-on', on); motOpts.classList.toggle('is-error', on); };
function resetMotives() { for (const b of motBoxes) b.checked = false; motError(false); }
motOpts.addEventListener('change', (e) => {
  const box = e.target; if (!box.matches('input[type=checkbox]')) return;
  if (box.checked) { if (box === motNone) motBoxes.forEach((b) => { if (b !== motNone) b.checked = false; }); else motNone.checked = false; }
  audio.sfx(box.checked ? 'tap' : 'toggle'); motError(false);
  if (box.checked && !motion.reduced) {
    const r = box.closest('.a10-opt').querySelector('.a10-ico').getBoundingClientRect();
    stars?.burst(r.left + r.width / 2, r.top + r.height / 2, .8);
    a10.bloom(20);
  }
});
document.addEventListener('kura:lang', () => { if (motMsg.classList.contains('is-on')) motMsg.textContent = t('a10Empty'); });
$('form-a10').addEventListener('submit', (e) => {
  e.preventDefault();
  const sel = motBoxes.filter((b) => b.checked).map((b) => b.value);
  if (!sel.length) { audio.sfx('decline'); motError(true); return; } // falta elegir
  try { localStorage.setItem(MOT_KEY, JSON.stringify(sel)); } catch {}
  audio.sfx('tap'); primaryFx(VIEWS.a10, e); a10.bloom(28);
  setTimeout(() => go('a11'), 520); // deja ver el brote florecer
});
$('skip-a10').addEventListener('click', () => {
  audio.sfx('tap'); motError(false);
  try { localStorage.removeItem(MOT_KEY); } catch {}
  go('a11');
});
resetMotives();

/* ---------- A11 · ¿Listo para KURA? ----------
   Alaira señala los banners de los otros cuatro guías. «Iniciar el tour» abre el recorrido por los mundos (A13–A17,
   aún no existe) y «Saltar» entra a KURA. Tocar un banner deja anotado por quién empezar el tour (kura.tourInicio).
   El título se adapta a la identidad elegida en A09: «¿Lista para KURA?», «¿Listo para KURA?» o «¿Todo listo para KURA?». */
const guiasEl = $('guias-a11');
guiasEl.innerHTML = GUIAS.map((g, i) => `<li><button class="a11-card" type="button" data-guia="${g.id}" style="--i:${i};--fy:${g.fy}%"><img class="a11-card-img" data-src="${g.src}" alt="" decoding="async" draggable="false"><span class="a11-name">${g.nombre}<svg class="a11-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.5 15.5 12 9 18.5" /></svg></span></button></li>`).join('');
const guiaCards = [...guiasEl.querySelectorAll('.a11-card')];
const labelGuides = () => guiaCards.forEach((b) => b.setAttribute('aria-label', t('a11Meet').replace('{nombre}', b.querySelector('.a11-name').textContent)));
labelGuides();
document.addEventListener('kura:lang', labelGuides);
const loadGuides = () => guiaCards.forEach((b) => { const im = b.querySelector('img'); if (!im.src) im.src = im.dataset.src; });
function prepareA11() {
  loadGuides();
  let id = ''; try { id = localStorage.getItem(ID_KEY) || ''; } catch {}
  const v = id === 'mujer' ? 'F' : id === 'hombre' ? '' : 'N';
  const l1 = $('titulo-a11-1'), l2 = $('titulo-a11-2');
  if (l1.dataset.i18n !== 'a11Title1' + v) { l1.dataset.i18n = 'a11Title1' + v; l2.dataset.i18n = 'a11Title2' + v; applyLanguage(currentLang()); }
}
guiasEl.addEventListener('click', (e) => {
  const card = e.target.closest('.a11-card'); if (!card) return;
  audio.sfx('tap'); a11.sparkle(16);
  if (!motion.reduced) { const r = card.getBoundingClientRect(); stars?.burst(r.left + r.width * .3, r.top + r.height / 2, .8); }
  try { localStorage.setItem('kura.tourInicio', card.dataset.guia); } catch {}
  toast(t('a11Soon'));
});
$('cta-a11').addEventListener('click', (e) => { audio.sfx('start'); primaryFx(VIEWS.a11, e); a11.sparkle(20); try { localStorage.removeItem('kura.tourInicio'); } catch {} toast(t('a11Soon')); });
$('skip-a11').addEventListener('click', () => { audio.sfx('tap'); toast(t('a07Next')); });
document.querySelectorAll('[data-legal]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); legal.open(a.dataset.legal, { sound: a.closest('.prefs') ? 'effects' : 'legal' }); }));

/* ---------- Preferencias ---------- */
$('lang').addEventListener('click', () => { audio.sfx('effects'); applyLanguage(currentLang() === 'es' ? 'en' : 'es', { manual: true }); });
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

/* ---------- Entrada ----------
   El panel nunca se desvanece entero: con opacidad en el panel, el navegador apaga el desenfoque del
   vidrio (backdrop-filter) hasta que termina la animación y luego aparece de golpe. Se desvanecen sus
   piezas (vidrio, bordes, contenido) y el panel solo se desplaza: el vidrio llega ya desenfocado. */
function intro() {
  const u = unit(), V = view.el;
  const starsTo = inIntro(view.name) ? 0 : 1, sky6To = inAlaira(view.name) ? 1 : 0;
  // Mientras se ve Iniciar sesión, la escena de A06 se prepara en segundo plano: al entrar ya está lista.
  if (inAlaira(view.name)) a06.prepare(); else if (view.name === 'a10') a10.prepare(); else if (view.name === 'a11') a11.prepare(); else setTimeout(() => a06.prefetch(), 4500);
  if (!gsap || motion.reduced) { Object.assign(reveal, { stars: starsTo, sky6: sky6To, flares: 1, zoom: 1 }); setTimeout(invite, 3500); return; }
  if (inIntro(view.name)) { introA06(); return; }
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
    .from(V.querySelector('.panel'), { y: 60 * u, duration: 1.5 }, 1.4)
    .from(V.querySelector('.panel').children, { opacity: 0, duration: 1.5 }, 1.4) // vidrio con su desenfoque desde el inicio
    .to(reveal, { flares: 1, duration: 2.2, ease: 'sine.inOut' }, 2.4)  // los destellos del cristal llegan al final
    .from([...V.querySelectorAll('.field, .row-msg, .cta, .or, .google, .first'), document.querySelector('.prefs')], { opacity: 0, y: 14 * u, stagger: .07, duration: 1 }, 1.8)
    .add(() => setTimeout(invite, 1200), 2.6);
  gsap.timeline({ repeat: -1, repeatDelay: 7, delay: 3.2 }).fromTo(shine, { p: 0 }, { p: 1, duration: 2.8, ease: 'sine.inOut', onUpdate: paintShine });
}

// Entrada directa a A06–A10 (dirección #a06… o sesión con la introducción pendiente).
function introA06() {
  const u = unit(), V = view.el, sceneEl = view.name === 'a10' ? a10.el : view.name === 'a11' ? a11.el : a06.el;
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .fromTo(sceneEl, { opacity: 0, scale: 1.07 }, { opacity: 1, scale: 1.02, duration: 2.2, ease: 'power2.out' }, 0)
    .from('.logo', { opacity: 0, scale: .9, filter: 'blur(8px)', duration: 1.6 }, .5)
    .from('.sound', { opacity: 0, duration: 1.2 }, .7)
    .from(V.querySelectorAll('.ch'), { opacity: 0, yPercent: 50, filter: 'blur(8px)', stagger: .03, duration: 1.3 }, .9)
    .from(V.querySelector('.panel'), { y: 60 * u, duration: 1.5 }, 1.2)
    .from(V.querySelector('.panel').children, { opacity: 0, duration: 1.5 }, 1.2)
    .from(V.querySelectorAll('.a06-guide, .a06-question, .a07-info, .a07-field-wrap, .a10-hint, .a10-opt, .a10-actions, .a11-eyebrow, .a11-filete, .a11-sub, .a11-card, .a11-skip, .cta'), { opacity: 0, y: 14 * u, stagger: .05, duration: 1 }, 1.5)
    .to(reveal, { sky6: inAlaira(view.name) ? 1 : 0, duration: 3, ease: 'sine.inOut' }, .6)
    .to(reveal, { flares: 1, zoom: 1, duration: 2.2, ease: 'sine.inOut' }, 2.2)
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
  if (gsap && !motion.reduced) gsap.from(boot.querySelectorAll('.boot-halo, .boot-logo, .boot-orbit, .boot-text'), { opacity: 0, y: 10 * unit(), stagger: .06, duration: .5, ease: 'power2.out' });
  // Sin tiempo mínimo: A05 solo dura lo que tarden la escena y la sesión. En un teléfono
  // rápido apenas se ve; si algo se traba, la animación de carga queda a la vista.
  const [{ session }] = await Promise.all([auth.restoreSession(), imageReady(inAlaira(view.name) ? 'assets/a06/escena/cielo.webp' : view.name === 'a10' ? 'assets/a10/fondo.webp' : view.name === 'a11' ? 'assets/a11/fondo.webp' : 'assets/img/escena.webp')]);
  if (keep) await new Promise((r) => { boot.addEventListener('pointerdown', r, { once: true }); addEventListener('hashchange', r, { once: true }); });
  if (session) { /* aquí se abriría Hoy (L01) en el mundo predeterminado */ }
  if (keep && location.hash === '#a05') history.replaceState(null, '', '#a01');
}
// El arranque se desvanece mientras la escena aparece: un solo movimiento continuo.
function hideBoot() {
  const done = () => { cancelAnimationFrame(orbitRaf); boot.hidden = true; };
  if (!gsap || motion.reduced) { done(); return; }
  gsap.to(boot, { opacity: 0, duration: .6, ease: 'power2.inOut', onComplete: done });
}
document.fonts.ready.then(async () => { splitTitle(); await runBoot(); stage.classList.remove('booting'); startStars(); intro(); hideBoot(); });
addEventListener('resize', layoutShine);
