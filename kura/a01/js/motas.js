// A08 · Partículas que salen de «Tu edad»: motas doradas y lilas, y estrellitas del adorno (assets/a08/chispa.webp).
// Se dibujan en un lienzo pequeño FUERA del panel de cristal: así el teléfono no vuelve a desenfocar el cristal
// en cada cuadro (las motas como elementos de la página dentro del panel trababan la app).
// El lienzo solo trabaja mientras hay motas; en reposo no dibuja nada.

const PAD_UP = 110, PAD_SIDE = 40, PAD_DOWN = 20; // px de margen alrededor del número (las motas suben)
const COLORES = ['255,226,160', '255,240,205', '226,200,255'];

export function makeMotes({ motion }) {
  const cv = document.createElement('canvas');
  cv.className = 'fx-motas'; cv.setAttribute('aria-hidden', 'true');
  document.body.append(cv);
  const g = cv.getContext('2d');
  const chispa = new Image(); chispa.src = 'assets/a08/chispa.webp';
  let parts = [], raf = 0, last = 0, box = null, target = null, ambient = false, nextAmbient = 0, dpr = 1;

  function fit() {
    if (!target) return;
    const r = target.getBoundingClientRect();
    box = { x: r.left - PAD_SIDE, y: r.top - PAD_UP, w: r.width + PAD_SIDE * 2, h: r.height + PAD_UP + PAD_DOWN, r };
    dpr = Math.min(2, devicePixelRatio || 1);
    const W = Math.round(box.w * dpr), H = Math.round(box.h * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    cv.style.cssText = `left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px`;
  }
  function spawn(n, burst) {
    const { r } = box, ox = r.left - box.x, oy = r.top - box.y;
    for (let i = 0; i < n; i++) {
      const star = Math.random() < .28;
      parts.push({
        x: ox + Math.random() * r.width, y: oy + r.height * (.3 + Math.random() * .5),
        vx: (Math.random() - .5) * (burst ? 70 : 30), vy: -(burst ? 45 + Math.random() * 70 : 22 + Math.random() * 30),
        life: 0, max: 1100 + Math.random() * 900, delay: burst ? i * 30 : 0,
        s: star ? 9 + Math.random() * 6 : 1.6 + Math.random() * 1.8, star, c: COLORES[i % 3],
      });
    }
    run();
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(50, now - (last || now)); last = now;
    if (ambient && now >= nextAmbient) { spawn(1, false); nextAmbient = now + 420 + Math.random() * 260; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, box.w, box.h);
    g.globalCompositeOperation = 'lighter';
    parts = parts.filter((p) => {
      if (p.delay > 0) { p.delay -= dt; return true; }
      p.life += dt;
      if (p.life >= p.max) return false;
      const t = dt / 1000, k = p.life / p.max;
      p.x += p.vx * t; p.y += p.vy * t; p.vx *= 1 - .9 * t; p.vy *= 1 - .4 * t;
      const a = k < .15 ? k / .15 : 1 - (k - .15) / .85;
      g.globalAlpha = Math.max(0, a);
      if (p.star && chispa.complete && chispa.naturalWidth) {
        const s = p.s * (1 - k * .4); g.drawImage(chispa, p.x - s * .87, p.y - s, s * 1.74, s * 2);
      } else {
        const s = p.s * (1 - k * .5);
        g.fillStyle = `rgba(${p.c},.35)`; g.beginPath(); g.arc(p.x, p.y, s * 2.4, 0, 7); g.fill(); // halo
        g.fillStyle = `rgb(${p.c})`; g.beginPath(); g.arc(p.x, p.y, s, 0, 7); g.fill();
      }
      return true;
    });
    g.globalAlpha = 1;
    if (parts.length || ambient) run(); else { g.clearRect(0, 0, box.w, box.h); last = 0; }
  }
  function run() { if (!raf && box && !document.hidden) raf = requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && (parts.length || ambient)) run(); });
  addEventListener('resize', fit);

  return {
    /** Estallido desde el número (al cambiar la fecha). */
    pop(el) { if (motion.reduced) return; target = el; fit(); spawn(16, true); },
    /** Motas suaves que siguen subiendo mientras la edad está a la vista. */
    ambient(el, on) {
      if (on && !motion.reduced) { target = el; fit(); if (!ambient) nextAmbient = performance.now() + 500; ambient = true; run(); }
      else ambient = false;
    },
    /** Al salir de A08 se apaga y se borra todo. */
    stop() { ambient = false; parts = []; if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; if (box) g.clearRect(0, 0, cv.width, cv.height); },
  };
}
