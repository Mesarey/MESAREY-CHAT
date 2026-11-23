// A06 · Bienvenida con Alaira.
// Escena por capas del paquete de parallax (lienzo 911 × 1726; --v = 1 px de ese lienzo en pantalla).
// Cada plano se desplaza según su profundidad con el cursor o el giroscopio (recorrido de cámara ±18 × ±11 px):
// cielo, planetas, ciudad, arcos, puentes y Alaira van a distinta velocidad; la estrella va unida a su mano.
// Encima: estrellas que titilan en el cielo, parpadeo de Alaira, la estrella 3D con polvo de oro y nubes limpias que derivan.
import { CAMARA, ESCENA, ALAIRA, BANCO, NUBES } from './a06-capas.js';
import { TWINKLES } from './a06-estrellas.js';

const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
const depth = ([dx, dy]) => `--dx:${dx};--dy:${dy}`;
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const rand = (a, b) => a + Math.random() * (b - a);

/** Estrellas que titilan: punto de luz suave; algunas con destello en cruz. Coordenadas relativas a la capa del cielo. */
function twinklesHTML([ox, oy]) {
  return TWINKLES.map(([x, y, s, cross]) => {
    const tint = rnd() < .22 ? 'rgba(255, 214, 150, .55)' : 'rgba(206, 178, 255, .5)';
    return `<i class="a6-tw${cross ? ' is-cross' : ''}" style="${box([x - ox - s / 2, y - oy - s / 2, s, s])};--d:${(3 + rnd() * 4.5).toFixed(2)}s;--w:${(-rnd() * 8).toFixed(2)}s;--c:${tint}"></i>`;
  }).join('');
}

function sceneHTML() {
  const img = (src, b, cls = '') => `<img class="${cls}" src="${src}" alt="" decoding="async" draggable="false" style="${box(b)}">`;
  const [ax, ay] = ALAIRA.box;
  const rel = ([x, y, w, h]) => [x - ax, y - ay, w, h]; // coordenadas dentro de la capa de Alaira
  const layers = ESCENA.map((L) => `<div class="a6-layer ${L.cls || ''}" data-id="${L.id}" style="${box(L.box)};${depth(L.d)}">${img(L.src, [0, 0, L.box[2], L.box[3]])}${L.id === 'cielo' ? twinklesHTML(L.box) : ''}</div>`).join('');
  const a = ALAIRA, e = a.estrella;
  const alaira = `<div class="a6-layer a6-alaira" style="${box(a.box)};${depth(a.d)}">
      ${img(a.src, [0, 0, a.box[2], a.box[3]])}
      <i class="a6-eyes" hidden style="${box(rel(a.ojos.box))};background-image:url(${a.ojos.src});background-size:calc(${a.ojos.atlas[0]} * var(--v)) calc(${a.ojos.atlas[1]} * var(--v))"></i>
      <div class="a6-front" hidden>${a.frente.map((f) => img(f.src, rel(f.box))).join('')}</div>
      ${img(e.respaldo.src, rel(e.respaldo.box), 'a6-star2d')}
      <canvas class="a6-star" style="${box(rel(e.vista))}"></canvas>
    </div>`;
  const clouds = NUBES.map((n) => `<div class="a6-layer a6-cloud" data-id="${n.id}" style="${box(n.box)};${depth(n.d)};opacity:${n.o}"><div class="a6-push"><img src="${n.src}" alt="" decoding="async" draggable="false" style="--tx:${n.drift[0]};--ty:${n.drift[1]};--per:${n.drift[2]}s;--w:${(-rnd() * n.drift[2]).toFixed(2)}s"></div></div>`);
  // la nube cercana va delante de Alaira; la bruma del pie, al fondo de la pantalla (el HUD va encima)
  const banco = `<div class="a6-layer" data-id="banco" style="${box(BANCO.box)};${depth(BANCO.d)}">${img(BANCO.src, [0, 0, BANCO.box[2], BANCO.box[3]])}</div>`;
  return layers + alaira + banco + '<div class="a6-pie"></div>' + clouds.join('');
}

export function mountA06({ stage, motion }) {
  const gsap = window.gsap;
  let root = null, built = false, active = false, star = null, starReady = null;

  function build() {
    if (built) return;
    built = true;
    root = document.createElement('div');
    root.className = 'scene6'; root.id = 'scene-a06'; root.setAttribute('aria-hidden', 'true');
    root.innerHTML = sceneHTML();
    stage.querySelector('#scene').after(root);
    // bruma limpia dentro del panel (detrás del vidrio), como en el diseño
    const mist = document.getElementById('a6-mist-back');
    if (mist) mist.innerHTML = '<img class="a6-mist-img" src="assets/a06/nubes/bruma-inferior.webp" alt="" decoding="async">';
    wireClouds();
  }

  // Si no hay WebGL, queda la estrella 2D del diseño.
  // En A01 solo se arma la escena (las imágenes se descargan); la estrella 3D se crea al entrar a A06,
  // así la app (y el visor) no se traban mientras se usa otra pantalla.
  function prefetch() {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    idle(() => build(), { timeout: 9000 });
  }
  function prepare() {
    build();
    if (!starReady) {
      const canvas = root.querySelector('.a6-star'), e = ALAIRA.estrella;
      starReady = import('./estrella3d.js')
        .then(({ createStar3D }) => createStar3D({ canvas, motion, centro: e.centro, vista: e.vista }))
        .then((s) => {
          star = s;
          if (active) s.start(); else s.renderOnce();
          root.classList.add('star-3d'); // oculta la estrella 2D
          return s;
        })
        .catch((err) => { console.warn('A06: la estrella 3D no está disponible; queda la del diseño.', err); return null; });
    }
    return starReady;
  }

  /* ---------- Parallax: cada plano recibe su parte del recorrido de cámara ---------- */
  let nx = 0, ny = 0;
  function look([x, y]) {
    if (!root) return;
    const r = motion.reduced;
    nx = r ? 0 : Math.max(-1, Math.min(1, x)); ny = r ? 0 : Math.max(-1, Math.min(1, y));
    root.style.setProperty('--cx', (-nx * CAMARA[0]).toFixed(3));
    root.style.setProperty('--cy', (-ny * CAMARA[1]).toFixed(3));
  }
  motion.onChange?.((r) => { if (r) look([0, 0]); });

  /* ---------- Parpadeo (atlas 5 × 5): cerrar 86 ms, sostener 25 ms, abrir 130 ms; a veces doble ---------- */
  let blinkRaf = 0, blinkT0 = 0, blinkNext = 0, blinkDouble = false, lastFrame = -1;
  const T = ALAIRA.parpadeoMs, O = ALAIRA.ojos;
  function setEye(f) {
    if (f === lastFrame) return;
    lastFrame = f;
    const eyes = root.querySelector('.a6-eyes'), front = root.querySelector('.a6-front');
    eyes.hidden = front.hidden = f === 0; // abierto = idéntico a la ilustración
    if (f) eyes.style.backgroundPosition = `calc(${-((f % 5) * O.celda[0] + 2)} * var(--v)) calc(${-(Math.floor(f / 5) * O.celda[1] + 2)} * var(--v))`;
  }
  function blinkLoop(now) {
    blinkRaf = requestAnimationFrame(blinkLoop);
    if (motion.reduced) { setEye(0); return; }
    if (!blinkT0 && now >= blinkNext) blinkT0 = now;
    if (!blinkT0) return;
    const e = now - blinkT0, total = T.cerrar + T.sostener + T.abrir;
    if (e >= total) {
      blinkT0 = 0; setEye(0);
      const again = !blinkDouble && Math.random() < .18;
      blinkDouble = again;
      blinkNext = now + (again ? rand(140, 220) : rand(2400, 5600));
      return;
    }
    setEye(e < T.cerrar ? Math.round((e / T.cerrar) * 24) : e < T.cerrar + T.sostener ? 24 : Math.round((1 - (e - T.cerrar - T.sostener) / T.abrir) * 24));
  }
  const blink = () => { blinkNext = performance.now(); };

  /* ---------- Nubes que se apartan al paso del dedo o del cursor ---------- */
  function wireClouds() {
    const clouds = [...root.querySelectorAll('.a6-cloud')].map((el) => {
      const push = el.querySelector('.a6-push');
      return { el, qx: gsap ? gsap.quickTo(push, 'x', { duration: 1.6, ease: 'power3.out' }) : () => {}, qy: gsap ? gsap.quickTo(push, 'y', { duration: 1.6, ease: 'power3.out' }) : () => {} };
    });
    const v = () => stage.clientWidth / 911;
    const stir = (x, y, strength) => {
      if (motion.reduced || !active) return;
      const R = 260 * v(), max = 18 * v() * strength;
      for (const c of clouds) {
        const r = c.el.getBoundingClientRect();
        const cx = Math.max(r.left, Math.min(x, r.right)), cy = Math.max(r.top, Math.min(y, r.bottom));
        const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy), k = Math.max(0, 1 - d / R);
        const ax = d > 1 ? dx / d : (x < r.left + r.width / 2 ? 1 : -1), ay = d > 1 ? dy / d : .3;
        c.qx(ax * max * k); c.qy(ay * max * k * .45);
      }
    };
    const settle = () => clouds.forEach((c) => { c.qx(0); c.qy(0); });
    let idle;
    stage.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'touch' || e.buttons) stir(e.clientX, e.clientY, 1);
      clearTimeout(idle); idle = setTimeout(settle, 1400);
    }, { passive: true });
    stage.addEventListener('pointerdown', (e) => stir(e.clientX, e.clientY, 1.4), { passive: true });
    stage.addEventListener('pointerup', () => setTimeout(settle, 900));
    stage.addEventListener('pointerleave', settle);
  }

  /* ---------- Toques: la estrella brilla; Alaira parpadea ---------- */
  stage.addEventListener('pointerdown', (e) => {
    if (!active || e.target.closest('button, a, input, .panel, .sound-menu')) return;
    const r = root.querySelector('.a6-alaira').getBoundingClientRect(), k = r.width / ALAIRA.box[2];
    const x = (e.clientX - r.left) / k + ALAIRA.box[0], y = (e.clientY - r.top) / k + ALAIRA.box[1];
    const [sx, sy] = ALAIRA.estrella.centro;
    if (Math.hypot(x - sx, y - sy) < 70) star?.shine();
    else if (x > 180 && x < 720 && y > 140 && y < 1100) blink();
  });

  document.addEventListener('visibilitychange', () => {
    if (!active) return;
    if (document.hidden) { star?.stop(); cancelAnimationFrame(blinkRaf); } else { star?.start(); blinkRaf = requestAnimationFrame(blinkLoop); }
  });

  return {
    prepare, prefetch, look,
    get el() { return root; },
    get star() { return star; },
    get active() { return active; },
    /** Muestra la escena (la transición la coordina main.js). */
    enter() {
      prepare(); active = true; root.classList.add('is-on'); star?.start();
      cancelAnimationFrame(blinkRaf); blinkNext = performance.now() + rand(1200, 2600); blinkRaf = requestAnimationFrame(blinkLoop);
    },
    leave() { active = false; root?.classList.remove('is-on'); star?.stop(); cancelAnimationFrame(blinkRaf); if (root) setEye(0); },
    _debug: { setEye: (f) => setEye(f), blink },
  };
}
