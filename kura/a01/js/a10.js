// A10 · ¿Qué te motiva a cambiar tu Aura? — escenario propio: Alaira sentada en la luna creciente sobre el lago.
// Capas con paralaje (cursor o giroscopio): cielo y lago al fondo, los dos planetas de KURA muy lejos, Alaira con
// su luna en medio y la bruma delante; el HUD también se mueve (js/scene.js).
// Vivo y ligero:
//   · cielo en WebGL (aurora que ondula, estrellas que titilan, lago que brilla, halo de la luna): js/a10-cielo.js
//   · partículas doradas que suben del brote con elegancia (lienzo pequeño, solo en esa zona)
//   · todo se detiene al salir de A10, con la pestaña oculta o con «Reducir efectos».
import { CAMARA, FONDO, PLANETAS, ALAIRA, BRUMA } from './a10-capas.js';

const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
const depth = ([dx, dy]) => `--dx:${dx};--dy:${dy}`;
const rel = ([x, y, w, h], [ox, oy]) => [x - ox, y - oy, w, h];

function sceneHTML() {
  const img = (src, b, cls = '') => `<img class="${cls}" src="${src}" alt="" decoding="async" draggable="false" style="${box(b)}">`;
  const F = FONDO, A = ALAIRA, o = A.box;
  const fondo = `<div class="a6-layer a10-fondo" style="${box(F.box)};${depth(F.d)}">${img(F.src, [0, 0, F.box[2], F.box[3]])}<canvas class="a10-cielo" style="${box([0, 0, F.box[2], F.box[3]])}"></canvas></div>`;
  const planetas = PLANETAS.map((p, i) => `<div class="a6-layer a6-planet${i ? ' a6-planet-s' : ''} a10-planeta" style="${box(p.box)};${depth(p.d)}">${img(p.src, [0, 0, p.box[2], p.box[3]])}</div>`).join('');
  const [bx, by] = A.brote;
  const alaira = `<div class="a6-layer a10-alaira" style="${box(o)};${depth(A.d)}">
      ${img(A.brillo.src, rel(A.brillo.box, o), 'a10-brillo')}
      ${img(A.src, [0, 0, o[2], o[3]], 'a10-alaira-img')}
      <i class="a10-luz" style="left:calc(${bx - o[0]} * var(--v));top:calc(${by - o[1]} * var(--v))"></i>
      <canvas class="a10-chispas" style="${box(rel(A.particulas, o))}"></canvas>
    </div>`;
  const bruma = BRUMA.map((n) => `<div class="a6-layer a6-cloud" style="${box(n.box)};${depth(n.d)};opacity:${n.o}"><div class="a6-push"><img src="${n.src}" alt="" decoding="async" draggable="false" style="--tx:${n.drift[0]};--ty:${n.drift[1]};--per:${n.drift[2]}s;--w:${(-Math.random() * n.drift[2]).toFixed(2)}s"></div></div>`).join('');
  return fondo + planetas + alaira + '<div class="a10-pie"></div>' + bruma;
}

/* ---------- Partículas doradas del brote ---------- */
// Motas que suben meciéndose y se apagan despacio; a veces una estrellita del adorno. Se dibujan con
// sprites ya preparados (un círculo con halo por color), sin degradados por cuadro.
const COLORES = ['255,224,150', '255,240,205', '255,206,120'];
function makeSparks(canvas) {
  const g = canvas.getContext('2d');
  const sprite = (c) => {
    const s = document.createElement('canvas'); s.width = s.height = 32;
    const x = s.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,255,250,1)'); gr.addColorStop(.16, `rgba(${c},1)`); gr.addColorStop(.42, `rgba(${c},.36)`); gr.addColorStop(1, `rgba(${c},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return s;
  };
  const dots = COLORES.map(sprite);
  const chispa = new Image(); chispa.src = 'assets/a08/chispa.webp';
  const [, , BW, BH] = ALAIRA.particulas;
  const [ex, ey] = [ALAIRA.brote[0] - ALAIRA.particulas[0], ALAIRA.brote[1] - ALAIRA.particulas[1]]; // origen dentro de la zona
  let parts = [], acc = 0, k = 1;

  function fit() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const q = Math.min(2, devicePixelRatio || 1);
    const W = Math.round(r.width * q), H = Math.round(r.height * q);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    k = W / BW; // px del lienzo por unidad del diseño
  }
  function spawn(burst) {
    const star = Math.random() < (burst ? .3 : .16);
    const a = burst ? -Math.PI / 2 + (Math.random() - .5) * 2.2 : -Math.PI / 2 + (Math.random() - .5) * .5;
    const sp = burst ? 46 + Math.random() * 60 : 22 + Math.random() * 20;
    parts.push({
      x: ex + (Math.random() - .5) * (burst ? 10 : 26), y: ey + (Math.random() - .2) * 14,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, sway: 5 + Math.random() * 9, f: .5 + Math.random() * .7, ph: Math.random() * 6.3,
      life: 0, max: (burst ? 1700 : 2800) + Math.random() * 1600, s: star ? 9 + Math.random() * 6 : 3.2 + Math.random() * 3.4,
      star, c: dots[Math.floor(Math.random() * dots.length)], rot: Math.random() * 6.3, vr: (Math.random() - .5) * 1.2,
    });
  }
  function step(dt, on) {
    if (on) { acc += dt; while (acc > 125) { acc -= 125 + Math.random() * 50; spawn(false); } }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, canvas.width, canvas.height);
    if (!parts.length) return false;
    g.globalCompositeOperation = 'lighter';
    const t = dt / 1000;
    parts = parts.filter((p) => {
      p.life += dt; if (p.life >= p.max) return false;
      const u = p.life / p.max;
      p.vx *= 1 - .8 * t; p.vy = p.vy * (1 - .35 * t) - 4 * t; // suben cada vez más lento, con un leve empuje
      p.x += p.vx * t; p.y += p.vy * t; p.rot += p.vr * t;
      const x = (p.x + Math.sin(p.life / 1000 * p.f * 6.283 + p.ph) * p.sway * Math.min(1, u * 3)) * k, y = p.y * k;
      const al = (u < .15 ? u / .15 : u > .55 ? 1 - (u - .55) / .45 : 1) * (.75 + .25 * Math.sin(p.life / 140 + p.ph));
      g.globalAlpha = Math.max(0, al);
      if (p.star && chispa.complete && chispa.naturalWidth) {
        const s = p.s * k * (1 - u * .35); g.setTransform(1, 0, 0, 1, x, y); g.rotate(p.rot * .3); g.drawImage(chispa, -s * .87, -s, s * 1.74, s * 2); g.setTransform(1, 0, 0, 1, 0, 0);
      } else { const s = p.s * k * (1 - u * .4) * 3; g.drawImage(p.c, x - s / 2, y - s / 2, s, s); }
      return true;
    });
    g.globalAlpha = 1;
    return true;
  }
  return { fit, step, burst(n = 16) { for (let i = 0; i < n; i++) spawn(true); }, clear() { parts = []; acc = 0; g.clearRect(0, 0, canvas.width, canvas.height); }, get count() { return parts.length; } };
}

export function mountA10({ stage, motion }) {
  let root = null, built = false, active = false, sky = null, skyReady = null, sparks = null, raf = 0, last = 0, skyLast = 0;

  function build() {
    if (built) return;
    built = true;
    root = document.createElement('div');
    root.className = 'scene10'; root.id = 'scene-a10'; root.setAttribute('aria-hidden', 'true');
    root.innerHTML = sceneHTML();
    stage.querySelector('#scene').after(root);
    sparks = makeSparks(root.querySelector('.a10-chispas'));
    new ResizeObserver(() => { sky?.size(); sparks.fit(); if (!active && sky) sky.draw(performance.now()); }).observe(root);
  }
  function prefetch() {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    idle(() => build(), { timeout: 9000 });
  }
  // El cielo WebGL se crea la primera vez que se entra (o al prepararse); sin WebGL queda la imagen quieta.
  function prepare() {
    build();
    if (!skyReady) {
      const canvas = root.querySelector('.a10-cielo');
      skyReady = import('./a10-cielo.js')
        .then(({ createSky }) => createSky({ canvas, fondo: FONDO.src, mapas: FONDO.mapas, estrellas: FONDO.estrellas, luna: FONDO.luna }))
        .then((s) => { sky = s; s.size(); s.draw(performance.now()); root.classList.add('sky-on'); return s; })
        .catch((err) => { console.warn('A10: el cielo animado no está disponible; queda la ilustración.', err); return null; });
    }
    return skyReady;
  }

  /* ---------- Un solo ciclo para el cielo (30 cuadros/s) y las partículas ---------- */
  function frame(now) {
    raf = 0;
    if (!active || document.hidden) return;
    const dt = Math.min(64, now - (last || now)); last = now;
    const moving = !motion.reduced;
    if (sky && moving && now - skyLast >= 32) { if (skyLast) sky.adapt(now - skyLast); skyLast = now; sky.draw(now); }
    sparks.step(dt, moving);
    if (moving || sparks.count) raf = requestAnimationFrame(frame);
  }
  const run = () => { if (!raf && active && !document.hidden) { last = 0; skyLast = 0; raf = requestAnimationFrame(frame); } };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
  motion.onChange?.((r) => { if (r) { look([0, 0]); sparks?.clear(); sky?.draw(performance.now()); } else run(); });

  /* ---------- Paralaje ---------- */
  function look([x, y]) {
    if (!root) return;
    const r = motion.reduced, nx = r ? 0 : Math.max(-1, Math.min(1, x)), ny = r ? 0 : Math.max(-1, Math.min(1, y));
    root.style.setProperty('--cx', (-nx * CAMARA[0]).toFixed(3));
    root.style.setProperty('--cy', (-ny * CAMARA[1]).toFixed(3));
  }

  /** El brote se ilumina y suelta un puñado de chispas (al elegir una opción o tocarlo). */
  function bloom(n = 16) {
    if (!root || motion.reduced) return;
    sparks.burst(n); run();
    root.classList.remove('is-bloom'); void root.offsetWidth; root.classList.add('is-bloom');
  }
  // tocar a Alaira o su brote: florece
  stage.addEventListener('pointerdown', (e) => {
    if (!active || e.target.closest('button, a, input, label, .panel, .sound-menu')) return;
    const r = root.querySelector('.a10-alaira').getBoundingClientRect(), kk = r.width / ALAIRA.box[2];
    const x = (e.clientX - r.left) / kk + ALAIRA.box[0], y = (e.clientY - r.top) / kk + ALAIRA.box[1];
    if (Math.hypot(x - ALAIRA.brote[0], y - ALAIRA.brote[1]) < 120) bloom(12);
  });

  return {
    prepare, prefetch, look, bloom,
    get el() { return root; },
    get active() { return active; },
    get sky() { return sky; },
    get sparks() { return sparks?.count ?? 0; },
    enter() { prepare(); active = true; root.classList.add('is-on'); sparks.fit(); sky?.size(); run(); },
    leave() { active = false; root?.classList.remove('is-on'); if (raf) cancelAnimationFrame(raf); raf = 0; sparks?.clear(); },
  };
}
