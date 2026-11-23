// A06 · Bienvenida con Alaira.
// Escena por capas del paquete de parallax (lienzo 911 × 1726; --v = 1 px de ese lienzo en pantalla).
// Cada plano se desplaza según su profundidad con el cursor o el giroscopio (recorrido de cámara ±18 × ±11 px):
// cielo, planetas, ciudad, arcos, puentes y Alaira van a distinta velocidad; la estrella va unida a su mano.
// Encima: parpadeo de Alaira, la estrella 3D con polvo de oro y nubes limpias que derivan.
import { CAMARA, ESCENA, ALAIRA, BANCO, BANCO_A07, NUBES } from './a06-capas.js';

const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
const depth = ([dx, dy]) => `--dx:${dx};--dy:${dy}`;
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const rand = (a, b) => a + Math.random() * (b - a);

function sceneHTML() {
  const img = (src, b, cls = '') => `<img class="${cls}" src="${src}" alt="" decoding="async" draggable="false" style="${box(b)}">`;
  const [ax, ay] = ALAIRA.box;
  const rel = ([x, y, w, h]) => [x - ax, y - ay, w, h]; // coordenadas dentro de la capa de Alaira
  const layers = ESCENA.map((L) => `<div class="a6-layer ${L.cls || ''}" data-id="${L.id}" style="${box(L.box)};${depth(L.d)}">${img(L.src, [0, 0, L.box[2], L.box[3]])}</div>`).join('');
  const a = ALAIRA, e = a.estrella;
  const alaira = `<div class="a6-layer a6-alaira" style="${box(a.box)};${depth(a.d)}">
      ${img(a.src, [0, 0, a.box[2], a.box[3]])}
      ${a.ojos.ojos.map((o) => `<i class="a6-eye" hidden style="${box(rel(o.box))};background-image:url(${a.ojos.src});background-size:calc(${a.ojos.atlas[0]} * var(--v)) calc(${a.ojos.atlas[1]} * var(--v))"></i>`).join('')}
      <div class="a6-front" hidden>${a.frente.map((f) => img(f.src, rel(f.box))).join('')}</div>
      ${img(e.respaldo.src, rel(e.respaldo.box), 'a6-star2d')}
      <canvas class="a6-star" style="${box(rel(e.vista))}"></canvas>
    </div>`;
  const place = (n) => (n.abajo == null ? box(n.box) : box(n.box).replace(/top:calc\([^)]*\)\)/, `bottom:calc(${n.abajo} * var(--v))`));
  const clouds = NUBES.map((n) => `<div class="a6-layer a6-cloud" data-id="${n.id}" style="${place(n)};${depth(n.d)};opacity:${n.o}"><div class="a6-push"><img src="${n.src}" alt="" decoding="async" draggable="false" style="--tx:${n.drift[0]};--ty:${n.drift[1]};--per:${n.drift[2]}s;--w:${(-rnd() * n.drift[2]).toFixed(2)}s"></div></div>`);
  // la nube cercana va delante de Alaira; la bruma del pie, al fondo de la pantalla (el HUD va encima)
  const bank = (B, cls) => `<div class="a6-layer ${cls}" style="${box(B.box)};${depth(B.d)}">${img(B.src, [0, 0, B.box[2], B.box[3]])}</div>`;
  const banco = bank(BANCO, 'a6-banco-a06') + bank(BANCO_A07, 'a6-banco-a07');
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
    // nubes de las esquinas de abajo del panel (del HUD de referencia, sin la línea del borde): siguen el borde inferior del panel
    if (mist) mist.innerHTML = '<img class="a6-mist-img" src="assets/a06/nubes/panel-pie.webp" alt="" decoding="async">';
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
        .then(({ createStar3D }) => createStar3D({ canvas, motion, centro: e.centro, vista: e.vista, escala: e.escala }))
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

  /* ---------- Parpadeo (parche del kit) ----------
     Cada ojo tiene 32 poses: el párpado baja sobre el iris (cerrar 76 ms, pausa 18 ms, abrir 136 ms, con
     suavizado) y el ojo derecho va 5 ms detrás. Los descansos siguen el ritmo del parche (variados, con
     algún parpadeo doble). Pose 0 = ojos abiertos: se ocultan las piezas y queda la ilustración tal cual. */
  const T = ALAIRA.parpadeoMs, O = ALAIRA.ojos, R = ALAIRA.ritmoMs;
  const DUR = T.cerrar + T.sostener + T.abrir + 5;
  const gaps = R.inicios.map((s, i, a) => (i ? s - a[i - 1] : s + R.ciclo - a[a.length - 1]));
  let gapIdx = Math.floor(Math.random() * gaps.length);
  let blinkRaf = 0, blinkT0 = 0, blinkNext = 0, last = '';
  const smooth = (v) => { const a = Math.max(0, Math.min(1, v)); return a * a * (3 - 2 * a); };
  const pose = (t) => {
    const n = O.poses - 1;
    if (t < 0 || t >= T.cerrar + T.sostener + T.abrir) return 0;
    if (t < T.cerrar) return Math.round(n * smooth(t / T.cerrar));
    if (t < T.cerrar + T.sostener) return n;
    return Math.round(n * (1 - smooth((t - T.cerrar - T.sostener) / T.abrir)));
  };
  function setEyes(t) {
    const poses = O.ojos.map((o) => pose(t - o.retraso));
    const key = poses.join(','); if (key === last) return; last = key;
    const els = root.querySelectorAll('.a6-eye');
    poses.forEach((f, i) => {
      els[i].hidden = !f;
      if (f) { const [ox, oy] = O.ojos[i].origen, sx = (f % O.columnas) * O.baldosa[0] + ox, sy = Math.floor(f / O.columnas) * O.baldosa[1] + oy; els[i].style.backgroundPosition = `calc(${-sx} * var(--v)) calc(${-sy} * var(--v))`; }
    });
    root.querySelector('.a6-front').hidden = !poses.some(Boolean); // el fleco y las hebras van delante del párpado
  }
  const setEye = (f) => setEyes(f ? T.cerrar : -1); // pruebas: cerrado o abierto
  function blinkLoop(now) {
    blinkRaf = requestAnimationFrame(blinkLoop);
    if (motion.reduced) { setEyes(-1); return; }
    if (!blinkT0 && now >= blinkNext) blinkT0 = now;
    if (!blinkT0) return;
    const e = now - blinkT0;
    if (e >= DUR) { blinkT0 = 0; setEyes(-1); blinkNext = now + gaps[gapIdx++ % gaps.length]; return; }
    setEyes(e);
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
    if (Math.hypot(x - sx, y - sy) < 85) star?.shine();
    else if (x > 180 && x < 720 && y > 140 && y < 1100) blink();
  });

  document.addEventListener('visibilitychange', () => {
    if (!active) return;
    if (document.hidden) { star?.stop(); cancelAnimationFrame(blinkRaf); } else { star?.start(); blinkRaf = requestAnimationFrame(blinkLoop); }
  });

  return {
    prepare, prefetch, look,
    /** Pantalla de la introducción que se ve (a06 | a07): cambia el banco de nubes del título. */
    screen(name) { build(); root.classList.toggle('is-a07', name === 'a07'); },
    get el() { return root; },
    get star() { return star; },
    get active() { return active; },
    /** Muestra la escena (la transición la coordina main.js). */
    enter() {
      prepare(); active = true; root.classList.add('is-on'); star?.start();
      cancelAnimationFrame(blinkRaf); blinkNext = performance.now() + rand(1400, 2600); blinkRaf = requestAnimationFrame(blinkLoop);
    },
    leave() { active = false; root?.classList.remove('is-on'); star?.stop(); cancelAnimationFrame(blinkRaf); if (root) setEye(0); },
    _debug: { setEye: (f) => setEye(f), blink },
  };
}
