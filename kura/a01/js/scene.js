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
  // Nubes de atrás con viento: detrás del grupo gracias a su silueta como máscara.
  html.push('<div class="cloud-wrap mask-wind wind" data-depth="1"></div>');
  for (const name of ['mist', 'front', 'bottom']) {
    const masked = name === 'mist' ? 'mask-mist' : '';
    html.push(`<div class="cloud-wrap ${masked}" data-cloud="${name}"><div class="cloud" data-depth="${name === 'mist' ? 1.8 : 2.4}"></div></div>`);
  }
  html.push('<div class="lights">');
  for (const [name, , rgb, cx, cy, rx, ry] of LIGHTS) {
    html.push(`<i class="light light-${name}" style="--c:${rgb};--cx:${cx};--cy:${cy};--rx:${rx};--ry:${ry}"></i>`);
  }
  html.push('</div>');
  root.insertAdjacentHTML('afterbegin', html.join(''));
  applySceneConfig();
}

/* ---------- Viento (nubes de atrás) ---------- */
let windAnims = [];
export function mountWind(root, motion) {
  const wrap = root.querySelector('.wind');
  const build = () => {
    windAnims.forEach((a) => a.cancel()); windAnims = []; wrap.textContent = '';
    for (const [name, p] of Object.entries(config.wind.layers)) {
      for (let i = 0; i < p.count; i++) {
        const img = document.createElement('img');
        img.src = 'assets/img/nube.webp'; img.alt = ''; img.decoding = 'async'; img.draggable = false;
        img.className = `wind-sprite wind-${name}`;
        const mirror = i % 2 ? -1 : 1;
        const lift = (i % 3) * 14 - 14;               // cada trozo a una altura un poco distinta
        const scale = 1 + ((i * 37) % 10) / 60;      // y con un tamaño ligeramente distinto
        img.style.cssText = `top:calc(${p.y + lift} * var(--u));height:calc(${p.h * scale} * var(--u));width:calc(${p.width * scale} * var(--u));filter:blur(calc(${p.blur} * var(--u)));opacity:0`;
        wrap.appendChild(img);
        if (motion.reduced) { img.style.opacity = p.opacity; img.style.transform = `translateX(${(i - 1) * 30 - 30}%) scaleX(${mirror})`; continue; }
        const a = img.animate([
          { transform: `translateX(-105%) scaleX(${mirror})`, opacity: 0, offset: 0 },
          { transform: `translateX(-80%) scaleX(${mirror})`, opacity: p.opacity, offset: .12 },
          { transform: `translateX(45%) scaleX(${mirror})`, opacity: p.opacity, offset: .86 },
          { transform: `translateX(75%) scaleX(${mirror})`, opacity: 0, offset: 1 },
        ], { duration: p.duration * 1000, iterations: Infinity, easing: 'linear', fill: 'both' });
        a.currentTime = (p.duration * 1000 * (i / p.count + (name === 'near' ? .5 / p.count : .17))) % (p.duration * 1000);
        a.playbackRate = config.wind.speed;
        windAnims.push(a);
      }
    }
  };
  build();
  document.addEventListener('visibilitychange', () => windAnims.forEach((a) => (document.hidden ? a.pause() : a.play())));
  motion.onChange(build);
  return {
    setSpeed(v) { config.wind.speed = v; windAnims.forEach((a) => a.updatePlaybackRate(v)); },
    setOpacity(name, v) { config.wind.layers[name].opacity = v; build(); },
  };
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
export function parallax(stage, motion, unit, onShift = () => {}) {
  const layers = [...stage.querySelectorAll('[data-depth]')];
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const step = () => {
    x += (tx - x) * 0.06; y += (ty - y) * 0.06;
    const u = unit();
    for (const el of layers) el.style.translate = `${(-x * config.parallax * +el.dataset.depth * u).toFixed(2)}px ${(-y * config.parallax * +el.dataset.depth * u).toFixed(2)}px`;
    onShift(-x * config.parallax * u, -y * config.parallax * u); // misma profundidad que la ilustración
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

  // Giroscopio (teléfono): inclinar el teléfono mueve la escena igual que el cursor en PC.
  // La primera lectura es la posición neutra; si el teléfono se queda en otra posición,
  // el centro se reajusta poco a poco para que la escena no quede descentrada.
  let base = null, gyroOn = false;
  const RANGE = 18; // grados de inclinación para llegar al borde del movimiento
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  const onTilt = (e) => {
    if (motion.reduced || e.gamma == null || e.beta == null) return;
    if (!base) base = { g: e.gamma, b: e.beta };
    base.g += (e.gamma - base.g) * 0.004; base.b += (e.beta - base.b) * 0.004;
    tx = clamp((e.gamma - base.g) / RANGE);
    ty = clamp((e.beta - base.b) / RANGE);
    kick();
  };
  return {
    /** Llamar desde un toque del usuario (iOS pide permiso para leer el giroscopio). */
    async enableGyro() {
      if (gyroOn || typeof DeviceOrientationEvent === 'undefined') return false;
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          // iPhone responde «granted» o «denied»; Chrome puede responder «prompt»: en ese caso se escucha igual.
          if ((await DeviceOrientationEvent.requestPermission()) === 'denied') return false;
        }
      } catch { return false; }
      gyroOn = true;
      addEventListener('deviceorientation', onTilt);
      return true;
    },
    recenter() { base = null; },
  };
}
