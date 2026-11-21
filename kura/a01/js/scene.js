// SceneBackground · CloudLayers · AmbientLighting
// Escena unificada (cielo, arquitectura y grupo en una sola ilustración) con capas
// de nubes y luces encima. La silueta del grupo se usa como máscara para que las
// nubes posteriores queden detrás de los personajes.
import { config } from './config.js';

const LIGHTS = [
  // nombre, clave de config, color, cx, cy, rx, ry (lienzo de referencia)
  ['violet', 'violet', '177,140,255', 450, 780, 470, 540],
  ['gold-left', 'goldLeft', '255,205,137', 40, 550, 240, 500],
  ['gold-right', 'goldRight', '255,216,152', 860, 660, 240, 450],
  ['blue-top', 'blueTop', '169,196,255', 500, 180, 420, 300],
  ['hud', 'hudGlow', '214,151,255', 450, 1350, 470, 430],
];

export function buildScene(root) {
  const html = [];
  html.push('<div class="layer scene-art" data-depth="1"><img src="assets/img/escena.webp" alt="" decoding="async" fetchpriority="high" /></div>');
  for (const name of ['back', 'mist', 'front', 'bottom']) {
    const masked = name === 'back' ? 'mask-behind' : name === 'mist' ? 'mask-mist' : '';
    html.push(`<div class="cloud-wrap ${masked}" data-cloud="${name}"><div class="cloud" data-depth="${name === 'back' ? 1.4 : name === 'mist' ? 1.8 : 2.4}"></div></div>`);
  }
  html.push('<div class="lights">');
  for (const [name, , rgb, cx, cy, rx, ry] of LIGHTS) {
    html.push(`<i class="light light-${name}" style="--c:${rgb};--cx:${cx};--cy:${cy};--rx:${rx};--ry:${ry}"></i>`);
  }
  html.push('</div>');
  root.insertAdjacentHTML('afterbegin', html.join(''));
  applySceneConfig();
}

/** Lleva los valores de config a variables CSS. Se llama otra vez desde el panel de ajustes. */
export function applySceneConfig() {
  const s = document.documentElement.style;
  for (const [name, c] of Object.entries(config.clouds)) {
    s.setProperty(`--cloud-${name}-y`, c.y);
    s.setProperty(`--cloud-${name}-h`, c.h);
    s.setProperty(`--cloud-${name}-o`, c.opacity);
    s.setProperty(`--cloud-${name}-flip`, c.flip ? -1 : 1);
    s.setProperty(`--cloud-${name}-blur`, c.blur);
    s.setProperty(`--cloud-${name}-drift`, c.drift);
    s.setProperty(`--cloud-${name}-dur`, `${c.duration}s`);
  }
  for (const [name, key] of LIGHTS) s.setProperty(`--light-${name}`, config.lights[key]);
  s.setProperty('--light-breathe', `${config.lights.breathe}s`);
}

/** Paralaje leve con el cursor. La escena es una sola ilustración: se mueve completa, sin deformar personajes. */
export function parallax(stage, motion, unit) {
  const layers = [...stage.querySelectorAll('[data-depth]')];
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const step = () => {
    x += (tx - x) * 0.06; y += (ty - y) * 0.06;
    const u = unit();
    for (const el of layers) el.style.translate = `${(-x * config.parallax * +el.dataset.depth * u).toFixed(2)}px ${(-y * config.parallax * +el.dataset.depth * u).toFixed(2)}px`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
  stage.addEventListener('pointermove', (e) => {
    if (motion.reduced || e.pointerType === 'touch') return;
    const r = stage.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    kick();
  });
  stage.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  motion.onChange((reduced) => { if (reduced) { tx = ty = 0; kick(); } });
}
