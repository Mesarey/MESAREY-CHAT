// A12 · Alaira, tu guía principal (se llega con «Saltar» en A11).
// Escenario propio: el jardín lunar de Alaira (fondo sin ella) y Alaira recortada encima, animada al estilo Live2D
// con WebGL sobre una sola imagen:
//   · un mapa de pesos (assets/a12/pesos.png: R cabello, G falda (solo de la cadera hacia abajo, sin piernas), B cabeza) dice cuánto se mueve cada zona;
//   · el cabello y las capas translúcidas de la falda ondean, el torso respira y la cabeza se balancea un poco;
//   · parpadeo con párpados generados con Higgsfield sobre su propia cara (a medio y cerrados), a ritmo natural;
//   · la poción de su mano late con una luz suave.
// Paralaje con cursor o giroscopio (el fondo lejos, Alaira más cerca; la cabeza sigue un poco la mirada).
// Sin WebGL o con «Reducir efectos», queda la ilustración quieta.
import { makeRig, makeSky, load } from './rig.js';

const ESC = {
  camara: [18, 11],
  fondo: { src: 'assets/a12/fondo.webp', box: [-50, -31, 1011, 1788], d: [0.08, 0.05] },
  alaira: { src: 'assets/a12/alaira.webp', box: [8, 70, 895, 1541], d: [0.3, 0.16], tex: [1000, 1722] },
  pesos: 'assets/a12/pesos.png',
  parpados: { medio: 'assets/a12/parpadeo-medio.png', cerrado: 'assets/a12/parpadeo-cerrado.png', rect: [0.4012, 0.0788, 0.1752, 0.0374] },
  pocion: [0.248, 0.122], // centro de la luz de la poción (proporción de la capa de Alaira)
};
const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
const depth = ([dx, dy]) => `--dx:${dx};--dy:${dy}`;

export function mountA12({ stage, motion }) {
  let root = null, built = false, active = false, rig = null, raf = 0, ready = null, last = 0, sky = null;
  let blinkT0 = 0, blinkNext = 0, blinkLen = 260, held = null;
  const lookN = [0, 0];

  function build() {
    if (built) return;
    built = true;
    const F = ESC.fondo, A = ESC.alaira, [px, py] = ESC.pocion;
    root = document.createElement('div');
    root.className = 'scene12'; root.id = 'scene-a12'; root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `<div class="a6-layer a12-fondo" style="${box(F.box)};${depth(F.d)}"><img src="${F.src}" alt="" decoding="async" draggable="false"><canvas class="a12-estrellas"></canvas></div>
      <div class="a6-layer a12-alaira" style="${box(A.box)};${depth(A.d)}">
        <img class="a12-alaira-img" src="${A.src}" alt="" decoding="async" draggable="false">
        <canvas class="a12-rig"></canvas>
        <i class="a12-sombra" aria-hidden="true"></i>
        <i class="a12-pocion" style="left:${px * 100}%;top:${py * 100}%"></i>
      </div>`;
    stage.querySelector('#scene').after(root);
    sky = makeSky(root.querySelector('.a12-estrellas'), 'data/estrellas-a12.json');
    new ResizeObserver(() => { rig?.fit(); sky.fit(); }).observe(root);
  }
  function prefetch() { const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500)); idle(() => build(), { timeout: 9000 }); }
  function prepare() {
    build();
    ready ??= Promise.all([load(ESC.alaira.src), load(ESC.pesos), load(ESC.parpados.medio), load(ESC.parpados.cerrado), load(ESC.fondo.src)])
      .then(([tex, wts, lidH, lidC]) => {
        try { rig = makeRig(root.querySelector('.a12-rig'), { tex, wts, lidH, lidC }, { eye: ESC.parpados.rect, tex: ESC.alaira.tex }); } catch { rig = null; }
        if (rig) { root.classList.add('has-rig'); rig.fit(); rig.draw(0, 0, [0, 0]); }
      }).catch(() => {});
    return ready;
  }

  // parpadeo: cierra rápido, sostiene un instante y abre despacio; a veces doble
  const schedule = (now) => { blinkNext = now + 2200 + Math.random() * 3800; };
  function blinkAmount(now) {
    if (!blinkT0) { if (now >= blinkNext) { blinkT0 = now; blinkLen = Math.random() < 0.2 ? 420 : 260; } else return 0; }
    const e = (now - blinkT0) / blinkLen;
    if (e >= 1) { blinkT0 = 0; schedule(now); if (Math.random() < 0.15) blinkNext = now + 180; return 0; }
    return e < 0.32 ? (e / 0.32) * 2 : e < 0.45 ? 2 : 2 * (1 - (e - 0.45) / 0.55);
  }

  function frame(now) {
    raf = 0;
    if (!active || document.hidden) return;
    if (now - last >= 32) { last = now; sky?.draw(motion.reduced ? 0 : now); rig?.draw(now / 1000, held ?? (motion.reduced ? 0 : blinkAmount(now)), lookN); }
    if (!motion.reduced) raf = requestAnimationFrame(frame);
  }
  const run = () => { if (!raf && active && !document.hidden) raf = requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
  motion.onChange?.((r) => { if (r) { look([0, 0]); rig?.draw(0, 0, [0, 0]); sky?.draw(0); } else run(); });

  function look([x, y]) {
    if (!root) return;
    const r = motion.reduced, nx = r ? 0 : Math.max(-1, Math.min(1, x)), ny = r ? 0 : Math.max(-1, Math.min(1, y));
    root.style.setProperty('--cx', (-nx * ESC.camara[0]).toFixed(3));
    root.style.setProperty('--cy', (-ny * ESC.camara[1]).toFixed(3));
    lookN[0] = nx; lookN[1] = ny;
  }

  // tocar a Alaira: parpadea
  stage.addEventListener('pointerdown', (e) => {
    if (!active || e.target.closest('button, a, .panel')) return;
    const r = root.querySelector('.a12-alaira').getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.top + r.height * 0.3) { blinkNext = performance.now(); run(); }
  });

  return {
    prepare, prefetch, look,
    get el() { return root; },
    get active() { return active; },
    get animated() { return !!rig; },
    enter() { sky?.fit(); prepare().then(() => { rig?.fit(); sky?.fit(); run(); }); active = true; root.classList.add('is-on'); schedule(performance.now()); run(); },
    leave() { active = false; root?.classList.remove('is-on'); if (raf) cancelAnimationFrame(raf); raf = 0; },
    _debug: { blink: () => { blinkNext = performance.now(); run(); }, hold: (b) => { held = b; run(); } },
  };
}
