// A07 · Fuegos artificiales sencillos sobre el HUD al decir tu nombre: varios estallidos de chispas doradas,
// lilas y rosadas que se abren, caen un poco con estela y se apagan (unos 2 s). Un lienzo temporal encima
// de todo, sin tocar; se quita al terminar.

const COLORES = [[255, 226, 160], [255, 246, 220], [222, 190, 255], [255, 190, 225], [200, 170, 255]];

/**
 * @param {DOMRect} r       zona donde estallan (el panel del HUD)
 * @param {{ spots?: number[][], scale?: number }} [o]  spots: posiciones [x, y] de 0 a 1 dentro de r
 */
export function fireworks(r, { spots = [[.22, .3], [.76, .22], [.5, .12], [.3, .64], [.8, .6], [.56, .42], [.12, .5], [.66, .78]], scale = 1 } = {}) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const cv = document.createElement('canvas');
  cv.className = 'fx-fuegos'; cv.setAttribute('aria-hidden', 'true');
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  document.body.append(cv);
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const unit = Math.min(r.width, innerHeight * .6) / 400 * scale; // tamaño según el HUD: igual en cualquier teléfono
  const parts = [];
  const t0 = performance.now();
  // cada estallido arranca un poco después del anterior
  const bursts = spots.map(([fx, fy], i) => ({ at: i * 170 + Math.random() * 60, x: r.left + r.width * (fx + (Math.random() - .5) * .08), y: r.top + r.height * (fy + (Math.random() - .5) * .08), done: false }));
  function explode(b) {
    const c = COLORES[Math.floor(Math.random() * COLORES.length)], c2 = COLORES[Math.floor(Math.random() * COLORES.length)];
    const n = 26 + Math.floor(Math.random() * 10), sp = (70 + Math.random() * 40) * unit;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * .2, v = sp * (.75 + Math.random() * .35);
      parts.push({ x: b.x, y: b.y, px: b.x, py: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 900 + Math.random() * 600, c: Math.random() < .7 ? c : c2, s: (1.2 + Math.random() * 1.1) * unit });
    }
    parts.push({ x: b.x, y: b.y, flash: true, life: 0, max: 260, s: 26 * unit, c }); // destello del centro
  }
  let last = t0, raf = 0;
  function frame(now) {
    const dt = Math.min(40, now - last) / 1000; last = now;
    const el = now - t0;
    for (const b of bursts) if (!b.done && el >= b.at) { b.done = true; explode(b); }
    g.clearRect(0, 0, innerWidth, innerHeight);
    g.globalCompositeOperation = 'lighter';
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt * 1000;
      if (p.life >= p.max) { parts.splice(i, 1); continue; }
      const k = 1 - p.life / p.max;
      if (p.flash) {
        const rad = p.s * (.6 + (1 - k) * .8), gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        gr.addColorStop(0, `rgba(255,255,255,${.85 * k})`); gr.addColorStop(.4, `rgba(${p.c},${.4 * k})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, rad, 0, 7); g.fill();
        continue;
      }
      p.px = p.x; p.py = p.y;
      p.vx *= 1 - 1.6 * dt; p.vy = p.vy * (1 - 1.6 * dt) + 70 * unit * dt; // frenan y caen
      p.x += p.vx * dt; p.y += p.vy * dt;
      const al = Math.min(1, k * 1.4) * (k < .35 && Math.random() < .25 ? .3 : 1); // al final titilan
      g.strokeStyle = `rgba(${p.c},${al * .55})`; g.lineWidth = p.s * .8; g.lineCap = 'round';
      g.beginPath(); g.moveTo(p.px - p.vx * .05, p.py - p.vy * .05); g.lineTo(p.x, p.y); g.stroke(); // estela
      g.fillStyle = `rgba(${p.c},${al})`; g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill();
    }
    if (el < 400 || parts.length || bursts.some((b) => !b.done)) raf = requestAnimationFrame(frame);
    else cv.remove();
  }
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); cv.remove(); };
}
