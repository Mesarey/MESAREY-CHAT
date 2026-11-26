// L01 · Hoy con Alaira (portada del mundo de Alaira; se llega con «Entrar al mundo de Alaira» en A12).
// Escenario propio: el jardín lunar (fondo sin ella, con cielo estrellado vivo como el de A01) y Alaira encima,
// animada al estilo Live2D con WebGL (js/rig.js):
//   · el cabello suelto y las capas de la falda ondean; la cabeza se balancea apenas y sigue la mirada;
//   · parpadeo muy suave: los párpados bajan y suben con aceleración y frenado (abierto → medio → cerrado → medio);
//   · la estrella de sus manos es una capa aparte: gira despacio, flota y le ilumina las palmas.
// Paralaje con cursor o giroscopio (el fondo lejos, Alaira más cerca). Sin WebGL o con «Reducir efectos» queda quieta.
import { makeRig, makeSky, load } from './rig.js';

const ESC = {
  camara: [18, 11],
  fondo: { src: 'assets/l01/fondo.webp', box: [-24, -14, 959, 1696], d: [0.08, 0.05] },
  alaira: { src: 'assets/l01/alaira.webp', box: [22, 112, 820, 1450], d: [0.26, 0.14], tex: [1080, 1910] },
  pesos: 'assets/l01/pesos.png',
  parpados: { medio: 'assets/l01/parpadeo-medio.png', cerrado: 'assets/l01/parpadeo-cerrado.png', rect: [0.4211, 0.1469, 0.2303, 0.0539] },
  estrella: { src: 'assets/l01/estrella.webp', at: [0.584, 0.333] }, // sobre las palmas (proporción de la capa de Alaira)
  cielo: 'data/estrellas-l01.json',
};
const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
const depth = ([dx, dy]) => `--dx:${dx};--dy:${dy}`;
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x))); // seno: arranca y frena suave

export function mountL01({ stage, motion }) {
  let root = null, built = false, active = false, rig = null, raf = 0, ready = null, last = 0, sky = null;
  let blinkT0 = 0, blinkNext = 0, blinkLen = 420, held = null;
  const lookN = [0, 0];

  function build() {
    if (built) return;
    built = true;
    const F = ESC.fondo, A = ESC.alaira, [sx, sy] = ESC.estrella.at;
    root = document.createElement('div');
    root.className = 'scene-l01'; root.id = 'scene-l01'; root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `<div class="a6-layer l01-fondo" style="${box(F.box)};${depth(F.d)}"><img src="${F.src}" alt="" decoding="async" draggable="false"><canvas class="l01-cielo"></canvas></div>
      <div class="a6-layer l01-alaira" style="${box(A.box)};${depth(A.d)}">
        <img class="l01-alaira-img" src="${A.src}" alt="" decoding="async" draggable="false">
        <canvas class="l01-rig"></canvas>
        <div class="l01-estrella" style="left:${sx * 100}%;top:${sy * 100}%">
          <i class="l01-palmas"></i><i class="l01-halo"></i>
          <img src="${ESC.estrella.src}" alt="" decoding="async" draggable="false">
          <i class="l01-chispa"></i><i class="l01-chispa"></i><i class="l01-chispa"></i>
        </div>
      </div>`;
    stage.querySelector('#scene').after(root);
    sky = makeSky(root.querySelector('.l01-cielo'), ESC.cielo);
    new ResizeObserver(() => { rig?.fit(); sky.fit(); }).observe(root);
  }
  function prefetch() { const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500)); idle(() => build(), { timeout: 9000 }); }
  function prepare() {
    build();
    ready ??= Promise.all([load(ESC.alaira.src), load(ESC.pesos), load(ESC.parpados.medio), load(ESC.parpados.cerrado), load(ESC.fondo.src)])
      .then(([tex, wts, lidH, lidC]) => {
        try { rig = makeRig(root.querySelector('.l01-rig'), { tex, wts, lidH, lidC }, { eye: ESC.parpados.rect, tex: ESC.alaira.tex }); } catch { rig = null; }
        if (rig) { root.classList.add('has-rig'); rig.fit(); rig.draw(0, 0, [0, 0]); }
      }).catch(() => {});
    return ready;
  }

  // Parpadeo suave: baja los párpados con aceleración y frenado, se queda cerrado un instante y abre más despacio.
  // Duración natural (380–520 ms) y a veces doble.
  const schedule = (now) => { blinkNext = now + 2600 + Math.random() * 3600; };
  function blinkAmount(now) {
    if (!blinkT0) { if (now >= blinkNext) { blinkT0 = now; blinkLen = 380 + Math.random() * 140; } else return 0; }
    const e = (now - blinkT0) / blinkLen;
    if (e >= 1) { blinkT0 = 0; schedule(now); if (Math.random() < 0.12) blinkNext = now + 220; return 0; }
    return e < 0.38 ? 2 * ease(e / 0.38) : e < 0.5 ? 2 : 2 * (1 - ease((e - 0.5) / 0.5));
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

  return {
    prepare, prefetch, look,
    get el() { return root; },
    get active() { return active; },
    get animated() { return !!rig; },
    blink() { blinkNext = performance.now(); run(); },
    // la estrella brilla más un momento (al guardar, al cambiar de afirmación…)
    glow() { const s = root?.querySelector('.l01-estrella'); if (!s) return; s.classList.remove('is-glow'); void s.offsetWidth; s.classList.add('is-glow'); },
    enter() { sky?.fit(); prepare().then(() => { rig?.fit(); sky?.fit(); run(); }); active = true; root.classList.add('is-on'); schedule(performance.now()); run(); },
    leave() { active = false; root?.classList.remove('is-on'); if (raf) cancelAnimationFrame(raf); raf = 0; },
    _debug: { blink: () => { blinkNext = performance.now(); run(); }, hold: (b) => { held = b; run(); } },
  };
}
