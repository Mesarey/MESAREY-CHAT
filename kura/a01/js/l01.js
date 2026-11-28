// L01 · Hoy con Alaira (portada del mundo de Alaira; se llega con «Entrar al mundo de Alaira» en A12).
// Escenario de videojuego en capas:
//   · paisaje HD (una sola ilustración) vivo con WebGL: las glicinas se mecen, el lago ondula y destella, los faroles
//     y ventanas del templo titilan (js/rig.js · makeScenery, con un mapa de zonas);
//   · cielo estrellado como el de A01 y luciérnagas que flotan junto a las glicinas y sobre el agua;
//   · Alaira animada en video (hecho con Higgsfield: respira, parpadea con naturalidad, el cabello y la falda se
//     mueven; primer y último cuadro iguales, así el bucle no se nota), sin fondo: el MP4 trae color y transparencia
//     apilados y WebGL los combina (makeAlphaVideo). Mientras carga, o sin WebGL / con «Reducir efectos», se ve su
//     ilustración HD quieta;
//   · la estrella de sus manos es una capa aparte: gira, flota, late y le ilumina las palmas.
// Paralaje con cursor o giroscopio (el paisaje lejos, Alaira más cerca).
import { makeSky, makeScenery, makeAlphaVideo, load } from './rig.js';

const ESC = {
  camara: [18, 11],
  fondo: { src: 'assets/l01/fondo.webp', zonas: 'assets/l01/fondo-zonas.png', box: [-24, -14, 959, 1705], d: [0.08, 0.05] },
  alaira: { src: 'assets/l01/alaira.webp', video: 'assets/l01/alaira.mp4', box: [22, 112, 820, 1458], d: [0.26, 0.14] },
  estrella: { src: 'assets/l01/estrella.webp', at: [0.538, 0.338] }, // sobre las palmas (proporción de la capa de Alaira)
  cielo: 'data/estrellas-l01.json',
};
const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
const depth = ([dx, dy]) => `--dx:${dx};--dy:${dy}`;

/* Luciérnagas: pocas, cálidas, con vuelo lento y errático; aparecen y se apagan. */
function makeFireflies(canvas) {
  const g = canvas.getContext('2d');
  let W = 1, H = 1;
  const zonas = [[0.02, 0.28, 0.3, 0.5], [0.72, 0.98, 0.3, 0.48], [0.15, 0.85, 0.47, 0.62]]; // glicinas izq., der. y sobre el agua
  const flies = Array.from({ length: 18 }, (_, i) => {
    const [x0, x1, y0, y1] = zonas[i % 3];
    return { x0, x1, y0, y1, x: x0 + Math.random() * (x1 - x0), y: y0 + Math.random() * (y1 - y0), a: Math.random() * 6.3, s: 0.6 + Math.random() * 0.8, ph: Math.random() * 6.3, f: 0.3 + Math.random() * 0.5 };
  });
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d');
    const r = x.createRadialGradient(24, 24, 0, 24, 24, 24); r.addColorStop(0, 'rgba(255,250,220,1)'); r.addColorStop(.15, 'rgba(255,226,150,.9)'); r.addColorStop(.45, 'rgba(255,200,110,.25)'); r.addColorStop(1, 'rgba(255,190,100,0)');
    x.fillStyle = r; x.fillRect(0, 0, 48, 48); return c; })();
  let last = 0;
  return {
    fit() { const r = canvas.getBoundingClientRect(); if (!r.width) return; const q = Math.min(2, devicePixelRatio || 1); const w = Math.round(r.width * q), h = Math.round(r.height * q); if (canvas.width !== w || canvas.height !== h) { canvas.width = W = w; canvas.height = H = h; } },
    draw(now) {
      const t = now / 1000, dt = Math.min(0.1, last ? t - last : 0); last = t;
      g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      for (const f of flies) {
        f.a += (Math.sin(t * 0.7 + f.ph) * 0.9) * dt;
        f.x += Math.cos(f.a) * 0.012 * f.s * dt; f.y += Math.sin(f.a) * 0.008 * f.s * dt;
        if (f.x < f.x0 || f.x > f.x1) f.a = Math.PI - f.a; if (f.y < f.y0 || f.y > f.y1) f.a = -f.a;
        f.x = Math.max(f.x0, Math.min(f.x1, f.x)); f.y = Math.max(f.y0, Math.min(f.y1, f.y));
        const k = Math.pow(0.5 + 0.5 * Math.sin(t * f.f * 2 + f.ph), 2), s = (10 + 10 * f.s) * (W / 1000) * (0.7 + 0.5 * k);
        g.globalAlpha = 0.1 + 0.9 * k; g.drawImage(dot, f.x * W - s / 2, f.y * H - s / 2, s, s);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    },
  };
}

export function mountL01({ stage, motion }) {
  let root = null, built = false, active = false, raf = 0, ready = null, last = 0;
  let sky = null, flies = null, scenery = null, vid = null, video = null;

  function build() {
    if (built) return;
    built = true;
    const F = ESC.fondo, A = ESC.alaira, [sx, sy] = ESC.estrella.at;
    root = document.createElement('div');
    root.className = 'scene-l01'; root.id = 'scene-l01'; root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `<div class="a6-layer l01-fondo" style="${box(F.box)};${depth(F.d)}">
        <img class="l01-fondo-img" src="${F.src}" alt="" decoding="async" draggable="false">
        <canvas class="l01-paisaje"></canvas><canvas class="l01-cielo"></canvas><canvas class="l01-luciernagas"></canvas>
      </div>
      <div class="a6-layer l01-alaira" style="${box(A.box)};${depth(A.d)}">
        <img class="l01-alaira-img" src="${A.src}" alt="" decoding="async" draggable="false">
        <canvas class="l01-video"></canvas>
        <div class="l01-estrella" style="left:${sx * 100}%;top:${sy * 100}%">
          <i class="l01-palmas"></i><i class="l01-halo"></i>
          <img src="${ESC.estrella.src}" alt="" decoding="async" draggable="false">
          <i class="l01-chispa"></i><i class="l01-chispa"></i><i class="l01-chispa"></i>
        </div>
      </div>`;
    stage.querySelector('#scene').after(root);
    sky = makeSky(root.querySelector('.l01-cielo'), ESC.cielo);
    flies = makeFireflies(root.querySelector('.l01-luciernagas'));
    new ResizeObserver(() => { scenery?.fit(); vid?.fit(); sky.fit(); flies.fit(); }).observe(root);
  }
  function prefetch() { const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500)); idle(() => build(), { timeout: 9000 }); }
  function startVideo() {
    if (video || motion.reduced) return;
    video = document.createElement('video');
    Object.assign(video, { muted: true, loop: true, playsInline: true, preload: 'auto', src: ESC.alaira.video });
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.className = 'l01-video-src';
    root.appendChild(video); // en el DOM (iOS solo reproduce así), invisible
    try { vid = makeAlphaVideo(root.querySelector('.l01-video'), video); } catch { vid = null; }
    if (!vid) return;
    vid.fit();
    video.play().catch(() => {});
  }
  function prepare() {
    build();
    ready ??= Promise.all([load(ESC.fondo.src), load(ESC.fondo.zonas), load(ESC.alaira.src)])
      .then(([img, zon]) => {
        try { scenery = makeScenery(root.querySelector('.l01-paisaje'), img, zon); } catch { scenery = null; }
        if (scenery) { root.classList.add('has-paisaje'); scenery.fit(); scenery.draw(0); }
      }).catch(() => {});
    return ready;
  }

  function frame(now) {
    raf = 0;
    if (!active || document.hidden) return;
    if (now - last >= 32) {
      last = now;
      const r = motion.reduced, t = r ? 0 : now / 1000;
      scenery?.draw(t); sky?.draw(r ? 0 : now); if (!r) flies?.draw(now);
      if (vid && !r && vid.draw()) root.classList.add('has-video'); // la ilustración HD se cambia por el video al primer cuadro real
    }
    if (!motion.reduced) raf = requestAnimationFrame(frame);
  }
  const run = () => { if (!raf && active && !document.hidden) raf = requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (active) video?.play().catch(() => {}); run(); } else video?.pause(); });
  motion.onChange?.((r) => {
    if (r) { look([0, 0]); video?.pause(); root?.classList.remove('has-video'); scenery?.draw(0); sky?.draw(0); }
    else { startVideo(); if (active) video?.play().catch(() => {}); run(); }
  });

  function look([x, y]) {
    if (!root) return;
    const r = motion.reduced, nx = r ? 0 : Math.max(-1, Math.min(1, x)), ny = r ? 0 : Math.max(-1, Math.min(1, y));
    root.style.setProperty('--cx', (-nx * ESC.camara[0]).toFixed(3));
    root.style.setProperty('--cy', (-ny * ESC.camara[1]).toFixed(3));
  }

  return {
    prepare, prefetch, look,
    get el() { return root; },
    get active() { return active; },
    get animated() { return !!vid?.ready; },
    // la estrella brilla más un momento (al guardar, al cambiar de categorías, al abrir el ritual…)
    glow() { const s = root?.querySelector('.l01-estrella'); if (!s) return; s.classList.remove('is-glow'); void s.offsetWidth; s.classList.add('is-glow'); },
    enter() {
      build(); prepare().then(() => { scenery?.fit(); sky?.fit(); flies?.fit(); run(); });
      active = true; root.classList.add('is-on'); startVideo(); video?.play().catch(() => {}); run();
    },
    leave() { active = false; root?.classList.remove('is-on'); video?.pause(); if (raf) cancelAnimationFrame(raf); raf = 0; },
    _debug: { video: () => video },
  };
}
