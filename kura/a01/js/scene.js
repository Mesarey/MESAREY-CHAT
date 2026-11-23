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
  // (La bruma intermedia sobre los personajes se quitó: velaba la ilustración.)
  for (const name of Object.keys(config.clouds)) {
    html.push(`<div class="cloud-wrap" data-cloud="${name}"><div class="cloud" data-depth="2.4"></div></div>`);
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

/**
 * Paralaje por capas (cursor en PC, giroscopio en teléfono), suavizado con GSAP.
 * Cada capa se mueve según su profundidad: el cielo poco, las nubes cercanas más, y el HUD
 * en sentido contrario, como si estuviera flotando delante del mundo. Así, al mover el
 * cursor o inclinar el teléfono, las capas se separan y la escena se siente en 3D.
 * La ilustración es una sola imagen: se desplaza completa, sin deformar a los personajes.
 */
export function parallax(stage, motion, unit, onShift = () => {}) {
  const gsap = window.gsap;
  const D = config.depth;
  const groups = [
    [stage.querySelectorAll('.scene-art'), D.scene],
    [stage.querySelectorAll('.wind'), D.wind],
    // las nubes ya usan «translate» para su deriva: el paralaje va en «transform»
    [stage.querySelectorAll('[data-cloud="front"] .cloud'), D.front, 'transform'],
    [stage.querySelectorAll('[data-cloud="bottom"] .cloud'), D.bottom, 'transform'],
    [stage.querySelectorAll('.lights'), D.scene],
    [stage.querySelectorAll('.content'), D.hud],
    [stage.querySelectorAll('.logo, .sound, .sound-menu'), D.logo],
  ].map(([els, depth, prop = 'translate']) => ({ els: [...els], depth, prop })); // «translate» no choca con las animaciones de GSAP
  const st = { x: 0, y: 0 };
  let amp = config.parallax;
  const apply = () => {
    const u = unit(), k = amp * u;
    for (const g of groups) {
      const dx = (-st.x * k * g.depth).toFixed(2), dy = (-st.y * k * g.depth).toFixed(2);
      const v = g.prop === 'transform' ? `translate3d(${dx}px, ${dy}px, 0)` : `${dx}px ${dy}px`;
      for (const el of g.els) el.style[g.prop] = v;
    }
    onShift({ sky: [-st.x * k * D.stars, -st.y * k * D.stars], hud: [-st.x * k * D.hud, -st.y * k * D.hud], n: [st.x, st.y] });
  };
  // quickTo: cada nueva lectura reorienta la animación sin cortes (mismo suavizado que el cursor).
  const qx = gsap ? gsap.quickTo(st, 'x', { duration: 1.1, ease: 'power3.out', onUpdate: apply }) : (v) => { st.x = v; apply(); };
  const qy = gsap ? gsap.quickTo(st, 'y', { duration: 1.1, ease: 'power3.out', onUpdate: apply }) : (v) => { st.y = v; apply(); };
  const aim = (nx, ny, a) => { amp = a; qx(nx); qy(ny); };
  stage.addEventListener('pointermove', (e) => {
    if (motion.reduced || e.pointerType === 'touch') return;
    const r = stage.getBoundingClientRect();
    aim(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1, config.parallax);
  });
  stage.addEventListener('pointerleave', () => aim(0, 0, amp));
  motion.onChange((reduced) => { if (reduced) aim(0, 0, amp); });

  // Giroscopio (teléfono): inclinar el teléfono mueve la escena igual que el cursor en PC.
  // La primera lectura es la posición neutra; si el teléfono se queda en otra posición,
  // el centro se reajusta poco a poco para que la escena no quede descentrada.
  let base = null, gyroOn = false, last = 0;
  const RANGE = 18;   // grados de inclinación para llegar al borde del movimiento
  const RECENTER = 7; // segundos que tarda en reajustarse el centro si el teléfono se queda inclinado
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  const tiltTo = (gamma, beta) => {
    if (motion.reduced || gamma == null || beta == null) return;
    const now = performance.now();
    if (!base) base = { g: gamma, b: beta }; // primera lectura: posición neutra (al volver a la app se recentra con recenter())
    const k = 1 - Math.exp(-Math.min(0.1, Math.max(0, now - last) / 1000) / RECENTER); last = now; // por tiempo, no por evento
    base.g += (gamma - base.g) * k; base.b += (beta - base.b) * k;
    aim(clamp((gamma - base.g) / RANGE), clamp((beta - base.b) / RANGE), config.gyroParallax);
  };
  const onTilt = (e) => tiltTo(e.gamma, e.beta);
  return {
    /** Llamar desde un toque del usuario (iOS pide permiso para leer el giroscopio). */
    async enableGyro() {
      if (gyroOn || typeof DeviceOrientationEvent === 'undefined') return false;
      // Se escucha de inmediato: si el navegador deja la pregunta de permiso sin responder, igual funciona
      // en cuanto lleguen lecturas. Solo un «denied» explícito lo apaga. (iPhone no envía nada hasta aceptar.)
      gyroOn = true;
      addEventListener('deviceorientation', onTilt);
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          if ((await DeviceOrientationEvent.requestPermission()) === 'denied') { removeEventListener('deviceorientation', onTilt); gyroOn = false; return false; }
        } catch { /* sin gesto válido: se queda escuchando por si el sistema ya lo permite */ }
      }
      return true;
    },
    recenter() { base = null; },
    /** Capas nuevas (p. ej. A06): cada elemento trae su profundidad en data-px. */
    addLayers(els) { for (const el of els) groups.push({ els: [el], depth: parseFloat(el.dataset.px) || 1, prop: 'translate' }); apply(); },
    /** Visor: inclinación simulada (mismas lecturas que el giroscopio, sin pedir permiso al navegador). */
    simulate(gamma, beta) { tiltTo(gamma, beta); },
    _debug: () => ({ base, last, gyroOn, reduced: motion.reduced }),
  };
}
