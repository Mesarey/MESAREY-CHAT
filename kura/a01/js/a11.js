// A11 · ¿Listo para KURA? — escenario propio: Alaira asomada al barandal del templo señala con el índice los
// banners de los otros cuatro guías (Amaya, Azara, Nova y Orion).
// Capas con paralaje (cursor o giroscopio): templo y cielo al fondo (con los dos planetas de KURA), Alaira en
// medio y glicinas delante; el HUD también se mueve (js/scene.js) y cada banner mueve su retrato por dentro.
// Vivo y ligero:
//   · Alaira respira (solo CSS) y de la punta de su índice cae una estela de chispas doradas hacia los banners
//   · pétalos de glicina que caen despacio por toda la pantalla (pocos, en un lienzo a 30 cuadros por segundo)
//   · todo se detiene al salir de A11, con la pestaña oculta o con «Reducir efectos».
import { CAMARA, FONDO, ALAIRA, GLICINA } from './a11-capas.js';

const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
const depth = ([dx, dy]) => `--dx:${dx};--dy:${dy}`;
const rel = ([x, y, w, h], [ox, oy]) => [x - ox, y - oy, w, h];

function sceneHTML() {
  const F = FONDO, A = ALAIRA, o = A.box, [fx, fy] = A.dedo, G = GLICINA;
  const glicina = (lado) => `<div class="a6-layer a11-glicina a11-glicina-${lado}" style="width:calc(${G.w} * var(--v));height:calc(${G.h} * var(--v));${depth(G.d)}"><img src="${G.src}" alt="" decoding="async" draggable="false"></div>`;
  return `<div class="a6-layer a11-fondo" style="${box(F.box)};${depth(F.d)}"><img src="${F.src}" alt="" decoding="async" draggable="false"></div>
    <div class="a6-layer a11-alaira" style="${box(o)};${depth(A.d)}">
      <img class="a11-alaira-img" src="${A.src}" alt="" decoding="async" draggable="false">
      <i class="a11-dedo" style="left:calc(${fx - o[0]} * var(--v));top:calc(${fy - o[1]} * var(--v))"></i>
      <canvas class="a11-chispas" style="${box(rel(A.chispas, o))}"></canvas>
    </div>
    ${glicina('izq')}${glicina('der')}`;
}

// Sprites ya preparados (sin degradados por cuadro): puntos de luz dorados y pétalos lila.
function sprite(size, paint) { const s = document.createElement('canvas'); s.width = s.height = size; paint(s.getContext('2d'), size); return s; }
const OROS = ['255,214,128', '255,226,156', '246,196,104'];
const dot = (c) => sprite(32, (x) => {
  const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,248,226,1)'); g.addColorStop(.14, `rgba(${c},1)`); g.addColorStop(.34, `rgba(${c},.3)`); g.addColorStop(1, `rgba(${c},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 32, 32);
});
const PETALOS = ['226,190,246', '206,166,236', '240,214,250'];
const petal = (c) => sprite(32, (x) => {
  const g = x.createLinearGradient(6, 6, 26, 26);
  g.addColorStop(0, `rgba(${c},.95)`); g.addColorStop(1, `rgba(${c},.55)`);
  x.fillStyle = g; x.beginPath(); x.ellipse(16, 16, 13, 7, -0.6, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(13, 13, 5, 2, -0.6, 0, Math.PI * 2); x.fill();
});

/* ---------- Estela de chispas del índice ---------- */
// Nacen en la punta del dedo y bajan hacia la izquierda, rumbo al primer banner, titilando y apagándose despacio.
function makeTrail(canvas) {
  const g = canvas.getContext('2d'), dots = OROS.map(dot);
  const [, , BW] = ALAIRA.chispas, [ex, ey] = [ALAIRA.dedo[0] - ALAIRA.chispas[0], ALAIRA.dedo[1] - ALAIRA.chispas[1]];
  let parts = [], acc = 0, k = 1;
  function fit() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const q = Math.min(2, devicePixelRatio || 1), W = Math.round(r.width * q), H = Math.round(r.height * q);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    k = W / BW;
  }
  function spawn(burst) {
    const a = Math.PI * (burst ? .55 + Math.random() * .5 : .68 + Math.random() * .16); // hacia abajo y a la izquierda
    const sp = burst ? 40 + Math.random() * 60 : 26 + Math.random() * 22;
    parts.push({ x: ex + (Math.random() - .5) * 4, y: ey + (Math.random() - .5) * 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .7,
      ph: Math.random() * 6.3, tw: 80 + Math.random() * 110, life: 0, max: (burst ? 1500 : 2300) + Math.random() * 900, s: 1.1 + Math.random() * 1.3,
      c: dots[Math.floor(Math.random() * dots.length)] });
  }
  function step(dt, on) {
    if (on) { acc += dt; while (acc > 150) { acc -= 150 + Math.random() * 70; spawn(false); } }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, canvas.width, canvas.height);
    if (!parts.length) return;
    g.globalCompositeOperation = 'lighter';
    const t = dt / 1000;
    parts = parts.filter((p) => {
      p.life += dt; if (p.life >= p.max) return false;
      const u = p.life / p.max;
      p.vx *= 1 - .5 * t; p.vy = p.vy * (1 - .25 * t) + 9 * t; // caen suave, como polvo de luz
      p.x += p.vx * t; p.y += p.vy * t;
      g.globalAlpha = Math.max(0, (u < .12 ? u / .12 : 1 - (u - .12) / .88) * (.6 + .4 * Math.sin(p.life / p.tw + p.ph)));
      const s = p.s * k * (1 - u * .4) * 4.2; g.drawImage(p.c, p.x * k - s / 2, p.y * k - s / 2, s, s);
      return true;
    });
    g.globalAlpha = 1;
  }
  return { fit, step, burst(n = 14) { for (let i = 0; i < n; i++) spawn(true); }, clear() { parts = []; acc = 0; g.clearRect(0, 0, canvas.width, canvas.height); }, get count() { return parts.length; } };
}

/* ---------- Pétalos de glicina ---------- */
// Pocos y lentos: caen girando y meciéndose por toda la pantalla, delante de los banners.
function makePetals(canvas) {
  const g = canvas.getContext('2d'), sprites = PETALOS.map(petal);
  let W = 1, H = 1, q = 1, list = [];
  const N = 11;
  const fresh = (top) => ({ x: Math.random() * W, y: top ? -20 * q - Math.random() * H * .3 : Math.random() * H, s: (9 + Math.random() * 8) * q,
    vy: (18 + Math.random() * 20) * q, sway: (14 + Math.random() * 20) * q, f: .25 + Math.random() * .35, ph: Math.random() * 6.3,
    r: Math.random() * 6.3, vr: (Math.random() - .5) * 1.6, a: .55 + Math.random() * .35, c: sprites[Math.floor(Math.random() * sprites.length)] });
  function fit() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    q = Math.min(1.5, devicePixelRatio || 1);
    const w = Math.round(r.width * q), h = Math.round(r.height * q);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = W = w; canvas.height = H = h; list = Array.from({ length: N }, () => fresh(false)); }
  }
  function step(dt, now) {
    const t = dt / 1000;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      p.y += p.vy * t; p.r += p.vr * t;
      if (p.y > H + 30 * q) { list[i] = fresh(true); continue; }
      const x = p.x + Math.sin(now / 1000 * p.f * 6.283 + p.ph) * p.sway;
      g.globalAlpha = p.a;
      g.setTransform(Math.cos(p.r), Math.sin(p.r) * .6, -Math.sin(p.r), Math.cos(p.r) * .6 + .4, x, p.y);
      g.drawImage(p.c, -p.s / 2, -p.s / 2, p.s, p.s);
    }
    g.globalAlpha = 1;
  }
  return { fit, step, clear() { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); } };
}

export function mountA11({ stage, motion }) {
  let root = null, petalsEl = null, built = false, active = false, trail = null, petals = null, raf = 0, drawLast = 0;

  function build() {
    if (built) return;
    built = true;
    root = document.createElement('div');
    root.className = 'scene11'; root.id = 'scene-a11'; root.setAttribute('aria-hidden', 'true');
    root.innerHTML = sceneHTML();
    stage.querySelector('#scene').after(root);
    petalsEl = document.createElement('canvas');
    petalsEl.className = 'a11-petalos'; petalsEl.setAttribute('aria-hidden', 'true');
    stage.querySelector('.content').after(petalsEl);
    trail = makeTrail(root.querySelector('.a11-chispas'));
    petals = makePetals(petalsEl);
    new ResizeObserver(() => { trail.fit(); petals.fit(); }).observe(root);
  }
  function prefetch() {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    idle(() => build(), { timeout: 9000 });
  }
  const ready = (img) => (img.complete ? Promise.resolve() : img.decode?.().catch(() => {}) ?? Promise.resolve());
  function prepare() { build(); return Promise.all([...root.querySelectorAll('img')].map(ready)); }

  /* ---------- Un solo ciclo (30 cuadros/s) para la estela y los pétalos ---------- */
  function frame(now) {
    raf = 0;
    if (!active || document.hidden) return;
    const moving = !motion.reduced;
    if (now - drawLast >= 32) {
      const dt = Math.min(80, now - (drawLast || now)); drawLast = now;
      trail.step(dt, moving);
      if (moving) petals.step(dt, now);
    }
    if (moving || trail.count) raf = requestAnimationFrame(frame);
  }
  const run = () => { if (!raf && active && !document.hidden) { drawLast = 0; raf = requestAnimationFrame(frame); } };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
  motion.onChange?.((r) => { if (r) { look([0, 0]); trail?.clear(); petals?.clear(); } else run(); });

  /* ---------- Paralaje ---------- */
  function look([x, y]) {
    if (!root) return;
    const r = motion.reduced, nx = r ? 0 : Math.max(-1, Math.min(1, x)), ny = r ? 0 : Math.max(-1, Math.min(1, y));
    root.style.setProperty('--cx', (-nx * CAMARA[0]).toFixed(3));
    root.style.setProperty('--cy', (-ny * CAMARA[1]).toFixed(3));
    // dentro de cada banner, el mundo se desliza un poco al contrario (ventana con profundidad)
    stage.style.setProperty('--bx', (nx * 7).toFixed(3));
    stage.style.setProperty('--by', (ny * 3).toFixed(3));
  }

  /** La punta del índice destella y suelta un puñado de chispas (al tocar un banner o a Alaira). */
  function sparkle(n = 14) {
    if (!root || motion.reduced) return;
    trail.burst(n); run();
    root.classList.remove('is-point'); void root.offsetWidth; root.classList.add('is-point');
  }
  stage.addEventListener('pointerdown', (e) => {
    if (!active || e.target.closest('button, a, input, label, .panel, .sound-menu')) return;
    const r = root.querySelector('.a11-alaira').getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) sparkle(12);
  });

  return {
    prepare, prefetch, look, sparkle,
    get el() { return root; },
    get active() { return active; },
    get sparks() { return trail?.count ?? 0; },
    enter() { prepare(); active = true; root.classList.add('is-on'); stage.classList.add('a11-on'); trail.fit(); petals.fit(); run(); },
    leave() { active = false; root?.classList.remove('is-on'); stage.classList.remove('a11-on'); if (raf) cancelAnimationFrame(raf); raf = 0; trail?.clear(); petals?.clear(); },
  };
}
