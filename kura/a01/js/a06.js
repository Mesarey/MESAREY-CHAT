// A06 · Bienvenida con Alaira — escenario por capas, nubes vivas y la Alaira animada.
// Todo se mide en px del lienzo de A06 (911 × 1726); --v es el tamaño en pantalla de 1 px.
import { A06 } from './a06-capas.js';
import { TWINKLES } from './a06-estrellas.js';

const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

// Profundidad de cada capa para el paralaje (mismo sistema que A01: cursor en PC, giroscopio en teléfono).
// El escenario es UNA placa (cielo, arcos, ciudad y puentes juntos, sin Alaira): así al moverse nada se duplica.
const DEPTH = { cielo: .9, planetas: .45, alaira: 1.6, bancos: 2.1, piso: 1.4 };
const EXT = 150; // las nubes del pie se prolongan 150 px hacia abajo (teléfonos altos: nunca se ve su orilla)
const PLANETS = ['planeta-grande', 'planeta-pequeno'].map((id) => A06[id].box); // ya van en la placa

/** Capas del escenario de A06, de atrás hacia adelante. */
function sceneHTML() {
  const L = (id, cls = '', extra = '') => `<img class="a6-l ${cls}" src="${A06[id].src}" alt="" decoding="async" style="${box(A06[id].box)}${extra}">`;
  // estrellas que titilan: puntos de luz suaves y algunas con destello en cruz (solo sobre cielo abierto)
  const near = (x, y) => PLANETS.some(([px, py, pw, ph]) => x > px - 10 && x < px + pw + 10 && y > py - 10 && y < py + ph + 10);
  const twinkles = TWINKLES.filter(([x, y]) => !near(x, y)).map(([x, y, s, cross]) => {
    const tint = rnd() < .22 ? 'rgba(255, 214, 150, .55)' : 'rgba(206, 178, 255, .5)';
    return `<i class="a6-tw${cross ? ' is-cross' : ''}" style="left:calc(${x - s / 2} * var(--v));top:calc(${y - s / 2} * var(--v));width:calc(${s} * var(--v));height:calc(${s} * var(--v));--d:${(3 + rnd() * 4.5).toFixed(2)}s;--w:${(-rnd() * 8).toFixed(2)}s;--c:${tint}"></i>`;
  }).join('');
  // nubes largas: con margen a los lados, así ni el paralaje ni la deriva dejan ver una orilla
  const cloud = (src, b, depth, { dx, dy, per }) => `<div class="a6-cloud" data-px="${depth}" style="${box(b)}"><div class="a6-push"><img src="${src}" alt="" decoding="async" style="--tx:${dx};--ty:${dy};--per:${per}s;--w:${(-rnd() * per).toFixed(2)}s"></div></div>`;
  return `
    <div class="a6-group" data-px="${DEPTH.cielo}">
      <img class="a6-l a6-fondo" src="assets/a06/escena/placa.webp" alt="" decoding="async" style="${box([-24, -24, 959, 1176])}">
      ${L('nebulosa', 'a6-nebula')}
      ${twinkles}
      ${L('luz_sol', 'a6-glow a6-sun')}${L('luz_palacio', 'a6-glow a6-palace')}${L('reflejo_piso_der', 'a6-glow a6-floor')}
      ${L('bruma-media-izq', 'a6-haze')}${L('bruma-media-der', 'a6-haze a6-haze-r')}
    </div>
    <div class="a6-deck" data-px="${DEPTH.piso}" style="top:calc(${A06['00_fondo_violeta_limpio'].box[1]} * var(--v))"></div>
    <div class="a6-group a6-alaira" data-px="${DEPTH.alaira}">
      <canvas class="a6-canvas" id="alaira-canvas" style="${box([0, 0, 911, 1128])}"></canvas>
      <div class="a6-fallback" hidden></div>
    </div>
    ${cloud('assets/a06/nubes/01-velo-ext.webp', [-64, 1060, 1039, 174], 1.9, { dx: 14, dy: 3, per: 22 })}
    <div class="a6-pie" data-px="${DEPTH.bancos + .4}"><i class="a6-pie-a"></i><i class="a6-pie-b"></i></div>
    ${cloud('assets/a06/nubes/bancos-largo.webp', [-48, 1078, 1007, 189], DEPTH.bancos, { dx: 12, dy: 3, per: 19 })}`;
}

/** Nubes del HUD: 05–06 detrás del vidrio; 07–09 delante del vidrio y debajo de los textos. */
function panelMist(ids) {
  const PB = 1687, PL = 23; // borde inferior e izquierdo del panel en el lienzo
  return ids.map((id) => {
    const c = A06[id], [x0, y, w0, h] = c.box, low = y + h >= 1726; // las que tocaban el borde del lienzo vienen prolongadas
    const H = low ? h + EXT : h, src = low ? c.src.replace('.webp', '-ext.webp') : c.src;
    // 07 y 08 traen 64 px reflejados del lado de la orilla de la pantalla (05 y 06 se desvanecen hacia ella)
    const side = SIDE[id] || 0, x = side < 0 ? x0 - 64 : x0, w = side ? w0 + 64 : w0;
    const { dx, dy, per } = drift(c);
    return `<div class="a6-cloud a6-cloud-hud" style="left:calc(${x - PL} * var(--v));bottom:calc(${PB - (y + h) - (H - h)} * var(--v));width:calc(${w} * var(--v));height:calc(${H} * var(--v));--o:${(14 + rnd() * 10).toFixed(1)}s;--ow:${(-rnd() * 20).toFixed(1)}s"><div class="a6-push"><img src="${src}" alt="" decoding="async" style="--tx:${dx};--ty:${dy};--per:${per}s;--w:${(-rnd() * per).toFixed(2)}s"></div></div>`;
  }).join('');
}

/** Deriva de cada nube: el kit trae valores muy pequeños; aquí se nota (sutil, pero visible en un teléfono). */
function drift(c) {
  return { dx: Math.min(30, Math.round((c.travelX ?? 10) * 1.6)), dy: Math.round((c.travelY ?? 2) * 1.6), per: Math.round((c.periodSeconds ?? 20) * .6) };
}
const SIDE = { '07_bruma_frontal_izq': -1, '08_bruma_frontal_der': 1 };

export function mountA06({ stage, motion, onLayers = () => {} }) {
  const gsap = window.gsap;
  let root = null, alaira = null, alairaReady = null, built = false, active = false;

  function build() {
    if (built) return;
    built = true;
    root = document.createElement('div');
    root.className = 'scene6'; root.id = 'scene-a06'; root.setAttribute('aria-hidden', 'true');
    root.innerHTML = sceneHTML();
    stage.querySelector('#scene').after(root);
    document.getElementById('a6-mist-back').innerHTML = panelMist(['05_bruma_detras_panel_izq', '06_bruma_detras_panel_der']);
    document.getElementById('a6-mist-front').innerHTML = panelMist(['07_bruma_frontal_izq', '08_bruma_frontal_der', '09_neblina_pie_hud']);
    onLayers(root.querySelectorAll('[data-px]'));
    wireClouds();
  }

  // Alaira se crea aparte (WebGL + modelo 3D); si no hay WebGL, se muestra la ilustración fija.
  // El escenario (imágenes) se arma enseguida; Alaira (WebGL + modelo 3D) cuando el navegador está libre o al entrar.
  function prefetch() {
    build();
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    idle(() => prepare(), { timeout: 9000 });
  }
  function prepare() {
    build();
    if (!alairaReady) {
      alairaReady = import('./alaira.js')
        .then(({ createAlaira }) => createAlaira({ canvas: root.querySelector('#alaira-canvas'), motion }))
        .catch((err) => { console.warn('A06: Alaira sin WebGL, se muestra la ilustración fija.', err); return null; })
        .then((a) => {
          alaira = a;
          if (!a) showFallback();
          else { if (active) a.start(); else a.renderOnce(); root.querySelector('#alaira-canvas').classList.add('is-ready'); }
          return a;
        });
    }
    return alairaReady;
  }
  function showFallback() {
    const f = root.querySelector('.a6-fallback');
    root.querySelector('#alaira-canvas').hidden = true;
    const img = (src, b) => `<img src="${src}" alt="" style="position:absolute;${box(b)}">`;
    f.innerHTML = img('assets/a06/alaira/cuerpo.webp', [0, 0, 911, 1128])
      + `<i class="a6-eyes" style="position:absolute;${box(A06.ojos.box)};background:url(${A06.ojos.src}) calc(-2 * var(--v)) calc(-2 * var(--v)) / calc(920 * var(--v)) calc(470 * var(--v)) no-repeat"></i>`
      + ['fleco-oclusor', 'hebra-izq-sobre-pestana', 'hebra-central-luz', 'hebra-der-sobre-ojo', 'hebra-der-mejilla'].map((id) => img(A06[id].src, A06[id].box)).join('')
      + img('assets/a06/fx/estrella-2d.webp', A06.estrella_2d_opcional.box);
    f.hidden = false;
  }

  /* ---------- Nubes que se apartan al paso del dedo o del cursor ---------- */
  function wireClouds() {
    const clouds = [...document.querySelectorAll('.a6-cloud')].map((el) => {
      const push = el.querySelector('.a6-push');
      return {
        el, push,
        qx: gsap ? gsap.quickTo(push, 'x', { duration: 1.6, ease: 'power3.out' }) : () => {},
        qy: gsap ? gsap.quickTo(push, 'y', { duration: 1.6, ease: 'power3.out' }) : () => {},
      };
    });
    const v = () => stage.clientWidth / 911;
    const stir = (x, y, strength) => {
      if (motion.reduced || !active) return;
      const R = 260 * v(), max = 16 * v() * strength;
      for (const c of clouds) {
        const r = c.el.getBoundingClientRect();
        const cx = Math.max(r.left, Math.min(x, r.right)), cy = Math.max(r.top, Math.min(y, r.bottom)); // punto más cercano de la nube
        const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy);
        const k = Math.max(0, 1 - d / R);
        const ax = d > 1 ? dx / d : (x < r.left + r.width / 2 ? 1 : -1), ay = d > 1 ? dy / d : .3;
        c.qx(ax * max * k); c.qy(ay * max * k * .45);
      }
    };
    const settle = () => clouds.forEach((c) => { c.qx(0); c.qy(0); });
    stage.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch' || e.buttons) stir(e.clientX, e.clientY, 1); }, { passive: true });
    stage.addEventListener('pointerdown', (e) => stir(e.clientX, e.clientY, 1.4), { passive: true });
    stage.addEventListener('pointerup', () => setTimeout(settle, 900));
    stage.addEventListener('pointerleave', settle);
    let idle;
    stage.addEventListener('pointermove', () => { clearTimeout(idle); idle = setTimeout(settle, 1400); }, { passive: true });
  }

  /* ---------- Toques sobre Alaira y la estrella ---------- */
  stage.addEventListener('pointerdown', (e) => {
    if (!active || !alaira || e.target.closest('button, a, input, .panel, .sound-menu')) return;
    const r = root.querySelector('#alaira-canvas').getBoundingClientRect(), k = r.width / 911;
    const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
    const s = alaira.starPoint();
    if (Math.hypot(x - s.x, y - s.y) < 70) alaira.shine();
    else if (x > 180 && x < 720 && y > 140 && y < 1100) alaira.poke();
  });

  document.addEventListener('visibilitychange', () => {
    if (!alaira) return;
    if (document.hidden) alaira.stop(); else if (active) alaira.start();
  });

  return {
    prepare, prefetch,
    get el() { return root; },
    get alaira() { return alaira; },
    /** Muestra la escena (la transición la coordina main.js). */
    enter() { prepare(); active = true; root.classList.add('is-on'); alaira?.start(); },
    leave() { active = false; root?.classList.remove('is-on'); alaira?.stop(); },
    look(n) { alaira?.look(n); },
    get active() { return active; },
  };
}
