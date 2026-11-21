// LuminousBorder: contorno luminoso que recorre exactamente el perímetro de un elemento.
// SVG superpuesto con un rectángulo redondeado (pathLength normalizado a 1000):
//   halo amplio + halo cercano + trazo base + segmentos que viajan + destellos anclados al recorrido.
// Se recalcula con ResizeObserver, así que se adapta a cualquier tamaño.
const NS = 'http://www.w3.org/2000/svg';
let uid = 0;
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  parent?.appendChild(n);
  return n;
};

/**
 * @param {HTMLElement} host
 * @param {object} o
 *   radius(w,h)  radio de las esquinas en px
 *   intensity    0–1.5
 *   loop         segundos por vuelta del segmento principal
 *   segments     [{ length (0–1000), strength (0–1), delay (fracción de vuelta) }]
 *   sparkles     [{ at (0–1 del perímetro), every: [min,max] s, size }]
 *   colors       { core, glow, base1, base2 }
 *   widths       { base, near, wide }
 */
export function luminousBorder(host, o) {
  const id = `lb${++uid}`;
  const P = 40; // margen para que los halos no se recorten
  const svg = el('svg', { class: 'lb', 'aria-hidden': 'true', focusable: 'false' });
  const defs = el('defs', {}, svg);
  const blur = (name, sd) => { const f = el('filter', { id: `${id}-${name}`, x: '-20%', y: '-50%', width: '140%', height: '200%' }, defs); el('feGaussianBlur', { stdDeviation: sd }, f); return `url(#${id}-${name})`; };
  const fWide = blur('w', o.widths.wide / 2.2), fNear = blur('n', o.widths.near / 2.4), fSeg = blur('s', 3.2);
  const grad = el('linearGradient', { id: `${id}-g`, gradientUnits: 'objectBoundingBox', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: '0', 'stop-color': o.colors.base1 }, grad);
  el('stop', { offset: '.5', 'stop-color': o.colors.base2 }, grad);
  el('stop', { offset: '1', 'stop-color': o.colors.base1 }, grad);
  const spark = el('radialGradient', { id: `${id}-sp` }, defs);
  el('stop', { offset: '0', 'stop-color': '#fffaf2', 'stop-opacity': 1 }, spark);
  el('stop', { offset: '.18', 'stop-color': o.colors.core, 'stop-opacity': .9 }, spark);
  el('stop', { offset: '.45', 'stop-color': o.colors.glow, 'stop-opacity': .35 }, spark);
  el('stop', { offset: '1', 'stop-color': o.colors.glow, 'stop-opacity': 0 }, spark);

  const all = el('g', {}, svg);
  const shape = (attrs, parent = all) => el('rect', { pathLength: 1000, fill: 'none', 'vector-effect': 'non-scaling-stroke', ...attrs }, parent);
  const halo = el('g', {}, all);
  const wide = shape({ stroke: o.colors.glow, 'stroke-width': o.widths.wide, opacity: .22, filter: fWide }, halo);
  const near = shape({ stroke: o.colors.glow, 'stroke-width': o.widths.near, opacity: .45, filter: fNear }, halo);
  const base = shape({ stroke: `url(#${id}-g)`, 'stroke-width': o.widths.base, opacity: .95 });
  const segGroup = el('g', {}, all);
  const rects = [wide, near, base];
  const segAnims = [];
  for (const s of o.segments) {
    const g = el('g', { opacity: s.strength }, segGroup);
    const dash = `${s.length} ${1000 - s.length}`;
    const glow = shape({ stroke: o.colors.glow, 'stroke-width': o.widths.near * 1.2, 'stroke-dasharray': dash, 'stroke-linecap': 'round', filter: fSeg }, g);
    const core = shape({ stroke: o.colors.core, 'stroke-width': o.widths.base * 1.4, 'stroke-dasharray': dash, 'stroke-linecap': 'round' }, g);
    rects.push(glow, core);
    for (const r of [glow, core]) {
      const a = r.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -1000 }], { duration: o.loop * 1000, iterations: Infinity, delay: -s.delay * o.loop * 1000, easing: 'linear' });
      segAnims.push(a);
    }
  }
  const sparkGroup = el('g', {}, all);
  const sparkles = (o.sparkles || []).map((s) => ({ ...s, node: el('circle', { r: s.size, fill: `url(#${id}-sp)`, opacity: 0 }, sparkGroup) }));

  // Respiración muy leve del halo.
  const breathe = halo.animate([{ opacity: .8 }, { opacity: 1 }], { duration: (o.breathe || 4) * 1000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });

  host.appendChild(svg);
  let W = 0, H = 0;
  const layout = () => {
    W = host.clientWidth; H = host.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('viewBox', `0 0 ${W + P * 2} ${H + P * 2}`);
    svg.style.cssText = `position:absolute;left:${-P}px;top:${-P}px;width:${W + P * 2}px;height:${H + P * 2}px;pointer-events:none;overflow:visible`;
    const rx = o.radius(W, H);
    for (const r of rects) { r.setAttribute('x', P); r.setAttribute('y', P); r.setAttribute('width', W); r.setAttribute('height', H); r.setAttribute('rx', rx); r.setAttribute('ry', rx); }
    const len = base.getTotalLength();
    for (const s of sparkles) { const p = base.getPointAtLength(len * s.at); s.node.setAttribute('cx', p.x); s.node.setAttribute('cy', p.y); }
  };
  const ro = new ResizeObserver(layout); ro.observe(host); layout();

  // Destellos: aparecen y desaparecen suavemente, con pausas y desfases.
  let reduced = false, timers = [];
  const schedule = (s) => {
    const [a, b] = s.every;
    timers.push(setTimeout(() => {
      if (!reduced && !document.hidden) s.node.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)', offset: .45 }, { opacity: 0, transform: 'scale(.8)' }], { duration: 700 + Math.random() * 700, easing: 'ease-in-out' });
      schedule(s);
    }, (a + Math.random() * (b - a)) * 1000));
  };
  sparkles.forEach((s) => { s.node.style.transformBox = 'fill-box'; s.node.style.transformOrigin = 'center'; schedule(s); });

  const setIntensity = (v, ms = 400) => { all.animate([{ opacity: all.getAttribute('opacity') ?? 1 }, { opacity: v }], { duration: ms, fill: 'forwards', easing: 'ease-out' }); all.setAttribute('opacity', v); };
  setIntensity(o.intensity, 0);

  return {
    svg,
    setIntensity,
    setReduced(r) {
      reduced = r;
      for (const a of segAnims) r ? a.pause() : a.play();
      r ? breathe.pause() : breathe.play();
      segGroup.style.opacity = r ? 0 : 1;
      near.setAttribute('opacity', r ? .6 : .45);
    },
    /** Pulso breve (al presionar). */
    pulse() {
      if (reduced) return;
      halo.animate([{ opacity: 1 }, { opacity: 1.8, filter: 'brightness(1.6)' }, { opacity: 1 }], { duration: 520, easing: 'ease-out' });
    },
    /** Invitación: un destello recorre el borde rápido y se encienden los puntos de luz. */
    invite(duration = 1700) {
      if (reduced) return;
      const g = el('g', {}, all);
      const mk = (attrs) => shape({ ...attrs, x: P, y: P, width: W, height: H, rx: o.radius(W, H), ry: o.radius(W, H) }, g);
      const dash = '160 840';
      const gl = mk({ stroke: o.colors.glow, 'stroke-width': o.widths.near * 1.8, 'stroke-dasharray': dash, 'stroke-linecap': 'round', filter: fSeg });
      const co = mk({ stroke: '#fffaf3', 'stroke-width': o.widths.base * 1.8, 'stroke-dasharray': dash, 'stroke-linecap': 'round' });
      const kf = [{ strokeDashoffset: 0, opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .75 }, { strokeDashoffset: -1000, opacity: 0 }];
      gl.animate(kf, { duration, easing: 'cubic-bezier(.45,.05,.3,1)' });
      co.animate(kf, { duration, easing: 'cubic-bezier(.45,.05,.3,1)' }).onfinish = () => g.remove();
      halo.animate([{ opacity: 1 }, { opacity: 1.6, offset: .5 }, { opacity: 1 }], { duration, easing: 'ease-in-out' });
      sparkles.forEach((s, i) => s.node.animate([{ opacity: 0 }, { opacity: 1, offset: .5 }, { opacity: 0 }], { duration: 900, delay: 200 + i * 180, easing: 'ease-in-out' }));
    },
    dispose() { ro.disconnect(); timers.forEach(clearTimeout); svg.remove(); },
  };
}
