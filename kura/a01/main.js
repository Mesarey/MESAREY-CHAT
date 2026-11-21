// KURA · A01 Inicio de sesión
// Escena: fondo + grupo + partículas (Three.js), panel de cristal y formulario funcional.
import * as THREE from 'three';

const gsap = window.gsap;
// Si un cuadro tarda, las animaciones avanzan con el reloj real en vez de quedarse atrás.
gsap.ticker.lagSmoothing(0);
const REF_W = 899;
const REF_H = 1750;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

const $ = (s, root = document) => root.querySelector(s);
const stage = $('#stage');
const unit = () => stage.clientWidth / REF_W;

/* =========================================================
   1. Partículas con Three.js
   Cámara ortográfica en coordenadas del lienzo de referencia (0..899, 0..1750),
   así cada luz se coloca exactamente donde está en el arte.
   ========================================================= */
function createParticles() {
  const canvas = $('#fx');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  } catch {
    return null; // Sin WebGL la página funciona igual, solo sin partículas.
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, REF_W, 0, -REF_H, -10, 10);

  const rand = (a, b) => a + Math.random() * (b - a);
  const pos = [], size = [], col = [], seed = [], kind = [];
  const add = (x, y, s, c, k) => { pos.push(x, -y, 0); size.push(s); col.push(c.r, c.g, c.b); seed.push(Math.random() * 1000); kind.push(k); };
  const ivory = new THREE.Color('#fff4e0'), gold = new THREE.Color('#ffd58a'), lilac = new THREE.Color('#e3b8ff'), violet = new THREE.Color('#b47bff'), warm = new THREE.Color('#ffb85c');

  // 0 · estrellas que titilan, solo donde se ve cielo
  for (let i = 0; i < 150; i++) {
    let x = rand(0, REF_W), y = rand(0, 235);
    if (y > 100 && x > 70 && x < 735) y = rand(0, 100);
    add(x, y, rand(1.6, 4.2), Math.random() < .25 ? lilac : ivory, 0);
  }
  // 1 · motas de luz que flotan hacia arriba (bokeh)
  for (let i = 0; i < 120; i++) add(rand(0, REF_W), rand(120, REF_H), rand(4, 13), [gold, lilac, ivory, violet][i % 4], 1);
  // 2 · halo cálido de los faroles
  [[62, 336, 130], [40, 642, 150], [862, 716, 150]].forEach(([x, y, s]) => add(x, y, s, warm, 2));
  // 3 · luciérnagas que deambulan cerca de los faroles y del piso
  for (let i = 0; i < 26; i++) {
    const base = [[62, 340], [40, 640], [862, 716], [rand(0, REF_W), rand(1050, 1700)]][i % 4];
    add(base[0] + rand(-60, 60), base[1] + rand(-60, 60), rand(5, 9), gold, 3);
  }
  // 4 · destellos sobre el agua y el piso mojado
  for (let i = 0; i < 40; i++) add(rand(0, REF_W), rand(1180, 1740), rand(2, 5), ivory, 4);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
  geo.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  geo.setAttribute('aKind', new THREE.Float32BufferAttribute(kind, 1));

  const uniforms = {
    uTime: { value: 0 },
    uScale: { value: 1 },
    uMouse: { value: new THREE.Vector2(-9999, -9999) },
    uBurst: { value: 0 },
    uBurstAt: { value: new THREE.Vector2(0, 0) },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aSize; attribute vec3 aColor; attribute float aSeed; attribute float aKind;
      uniform float uTime, uScale, uBurst; uniform vec2 uMouse, uBurstAt;
      varying vec3 vColor; varying float vAlpha; varying float vSoft;
      void main() {
        vec3 p = position;
        float t = uTime;
        float s = aSize;
        float a = 1.0;
        vSoft = 1.0;
        if (aKind < 0.5) {                       // estrellas
          a = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * (1.2 + fract(aSeed) * 2.5) + aSeed), 3.0);
          vSoft = 2.6;
        } else if (aKind < 1.5) {                // motas
          float speed = 9.0 + fract(aSeed * 1.7) * 16.0;
          float y = mod(-p.y + 1750.0 - t * speed, 1750.0 + 200.0) - 100.0;
          p.y = -y;
          p.x += sin(t * 0.35 + aSeed) * 22.0 + sin(t * 0.13 + aSeed * 3.0) * 30.0;
          a = 0.22 + 0.45 * (0.5 + 0.5 * sin(t * 0.8 + aSeed));
          vSoft = 1.6;
        } else if (aKind < 2.5) {                // faroles
          a = 0.20 + 0.10 * sin(t * 2.3 + aSeed) + 0.05 * sin(t * 7.1 + aSeed);
          vSoft = 1.2;
        } else if (aKind < 3.5) {                // luciérnagas
          p.x += sin(t * 0.6 + aSeed) * 34.0 + sin(t * 1.3 + aSeed * 2.0) * 10.0;
          p.y += cos(t * 0.5 + aSeed * 1.3) * 26.0;
          a = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(t * 1.7 + aSeed), 4.0);
          vSoft = 2.0;
        } else {                                 // destellos del piso
          a = pow(0.5 + 0.5 * sin(t * 2.0 + aSeed * 5.0), 12.0);
          s *= 1.0 + a;
          vSoft = 3.0;
        }
        // las luces se apartan suavemente del dedo o el cursor
        if (aKind > 0.5 && aKind < 3.5 && aKind != 2.0) {
          vec2 d = p.xy - vec2(uMouse.x, -uMouse.y);
          float dist = length(d);
          p.xy += normalize(d + 0.0001) * smoothstep(160.0, 0.0, dist) * 60.0;
        }
        // impulso al tocar el botón principal
        if (uBurst > 0.0 && aKind > 0.5 && aKind < 1.5) {
          vec2 d = p.xy - vec2(uBurstAt.x, -uBurstAt.y);
          float dist = length(d);
          p.xy += normalize(d + 0.0001) * uBurst * smoothstep(520.0, 0.0, dist) * 120.0;
          a += uBurst * smoothstep(520.0, 0.0, dist);
        }
        vColor = aColor; vAlpha = a;
        gl_PointSize = s * uScale;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying float vAlpha; varying float vSoft;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c) * 2.0;
        float glow = pow(max(0.0, 1.0 - d), vSoft);
        // pequeño destello en cruz para las estrellas más brillantes
        float cross = max(0.0, 1.0 - abs(c.x) * 18.0) * max(0.0, 1.0 - abs(c.y) * 2.2)
                    + max(0.0, 1.0 - abs(c.y) * 18.0) * max(0.0, 1.0 - abs(c.x) * 2.2);
        float a = (glow + cross * 0.35 * step(2.5, vSoft)) * vAlpha;
        if (a < 0.003) discard;
        gl_FragColor = vec4(vColor * a, a);
      }`,
  });
  scene.add(new THREE.Points(geo, mat));

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    const u = w / REF_W;
    camera.top = 0; camera.bottom = -h / u; camera.right = REF_W;
    camera.updateProjectionMatrix();
    uniforms.uScale.value = u * renderer.getPixelRatio();
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  const timer = new THREE.Timer();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });
  function loop() {
    if (!running) return;
    timer.update();
    uniforms.uTime.value += Math.min(timer.getDelta(), 0.05) * (reduceMotion ? 0.25 : 1);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  return {
    pointer(xRef, yRef) { uniforms.uMouse.value.set(xRef, yRef); },
    burst(xRef, yRef) {
      uniforms.uBurstAt.value.set(xRef, yRef);
      gsap.fromTo(uniforms.uBurst, { value: 1 }, { value: 0, duration: 1.6, ease: 'expo.out' });
    },
  };
}

const fx = createParticles();

/* =========================================================
   2. Título: letras que despiertan y un brillo que las recorre
   ========================================================= */
const lines = [...document.querySelectorAll('[data-split]')];
const chars = [];
lines.forEach((line) => {
  const text = line.textContent;
  line.textContent = '';
  for (const c of text) {
    const span = document.createElement('span');
    if (c === ' ') { span.className = 'sp'; } else { span.className = 'ch'; span.textContent = c; chars.push(span); }
    line.appendChild(span);
  }
  line.setAttribute('aria-label', text);
});

// Cada letra recibe la posición de su renglón para que el brillo sea continuo.
function layoutShine() {
  lines.forEach((line) => {
    const lw = line.getBoundingClientRect().width;
    const left = line.querySelector('.ch')?.offsetLeft ?? 0;
    line.querySelectorAll('.ch').forEach((ch) => {
      ch.style.backgroundSize = `${lw * 2.4}px 100%`;
      ch.dataset.x = String(ch.offsetLeft - left);
      ch.dataset.lw = String(lw);
    });
  });
}
const shine = { p: 0 };
function paintShine() {
  for (const ch of chars) {
    const lw = +ch.dataset.lw, x = +ch.dataset.x;
    ch.style.backgroundPosition = `${-(x) - lw * 1.4 * shine.p}px 0`;
  }
}

/* =========================================================
   3. Entrada de la escena
   ========================================================= */
function intro() {
  layoutShine(); paintShine();
  const u = unit();
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (reduceMotion) { gsap.set('.scene, .logo, .sound, .panel', { opacity: 1 }); return; }
  tl.from('.layer-bg', { scale: 1.12, opacity: 0, duration: 2.6, ease: 'power2.out' }, 0)
    .from('.fx', { opacity: 0, duration: 2 }, .4)
    .from('.layer-family', { y: 60 * u, opacity: 0, filter: 'blur(14px)', duration: 2.2 }, .35)
    .from('.logo', { opacity: 0, scale: .86, filter: 'blur(10px)', duration: 1.8 }, .8)
    .from('.sound', { opacity: 0, x: 20 * u, duration: 1.2 }, 1)
    .from('.panel', { y: 140 * u, opacity: 0, duration: 1.6 }, 1.0)
    .from(chars, { opacity: 0, yPercent: 60, rotateX: -70, filter: 'blur(10px)', stagger: .035, duration: 1.3 }, 1.45)
    .from('.welcome .rule', { scaleX: 0, duration: 1.4, ease: 'power3.inOut' }, 1.9)
    .from('.welcome-text', { opacity: 0, letterSpacing: `${12 * u}px`, duration: 1.6 }, 1.9)
    .from('.field, .forgot', { opacity: 0, y: 24 * u, stagger: .1, duration: 1.1 }, 2.0)
    .from('.cta', { opacity: 0, scale: .9, duration: 1.4, ease: 'elastic.out(1, .7)' }, 2.25)
    .from('.or, .google, .first, .legal', { opacity: 0, y: 18 * u, stagger: .08, duration: 1 }, 2.4)
    .add(() => fx?.burst(449, 1400), 2.4);

  // Brillo del título y destellos de luz que pasan cada pocos segundos.
  gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 2.6 })
    .fromTo(shine, { p: 0 }, { p: 1, duration: 2.6, ease: 'sine.inOut', onUpdate: paintShine });
  gsap.to(chars, { y: (i) => Math.sin(i) * 1.5 * u, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: .08, from: 'random' }, delay: 3 });
}

/* =========================================================
   4. Paralaje con el cursor o la inclinación del teléfono
   ========================================================= */
function parallax() {
  if (reduceMotion) return;
  const layers = [...document.querySelectorAll('.layer')].map((el) => ({
    depth: +el.dataset.depth,
    x: gsap.quickTo(el, 'x', { duration: 1.6, ease: 'power3.out' }),
    y: gsap.quickTo(el, 'y', { duration: 1.6, ease: 'power3.out' }),
  }));
  const panelX = gsap.quickTo('.panel', 'x', { duration: 2, ease: 'power3.out' });
  const panelY = gsap.quickTo('.panel', 'y', { duration: 2, ease: 'power3.out' });
  const move = (nx, ny) => {
    const u = unit();
    layers.forEach((l) => { l.x(-nx * l.depth * u); l.y(-ny * l.depth * u); });
    panelX(nx * 4 * u); panelY(ny * 4 * u);
  };
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    move(x * 2 - 1, y * 2 - 1);
    fx?.pointer(x * REF_W, (e.clientY - r.top) / unit());
  });
  stage.addEventListener('pointerleave', () => { move(0, 0); fx?.pointer(-9999, -9999); });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    move(Math.max(-1, Math.min(1, e.gamma / 25)), Math.max(-1, Math.min(1, (e.beta - 45) / 25)));
  });
}

/* =========================================================
   5. Botón principal: luz que sigue al dedo, imán y estallido
   ========================================================= */
const cta = $('#cta');
function lightFollow(el) {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}
lightFollow(cta);
lightFollow($('#google'));

if (!reduceMotion && !coarse) {
  const mx = gsap.quickTo(cta, 'x', { duration: .6, ease: 'power3.out' });
  const my = gsap.quickTo(cta, 'y', { duration: .6, ease: 'power3.out' });
  cta.addEventListener('pointermove', (e) => {
    const r = cta.getBoundingClientRect();
    mx((e.clientX - (r.left + r.width / 2)) * .06);
    my((e.clientY - (r.top + r.height / 2)) * .18);
  });
  cta.addEventListener('pointerleave', () => { mx(0); my(0); });
}

function burstAt(clientX, clientY, el) {
  const s = stage.getBoundingClientRect();
  const x = clientX - s.left, y = clientY - s.top;
  const u = unit();
  fx?.burst(x / u, y / u);
  if (reduceMotion) return;
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('i');
    p.className = 'spark';
    stage.appendChild(p);
    const ang = Math.random() * Math.PI * 2, dist = (60 + Math.random() * 170) * u * 1.6;
    gsap.fromTo(p, { left: x, top: y, scale: Math.random() * 1.4 + .6, opacity: 1 },
      { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist * .6, opacity: 0, scale: 0, duration: .9 + Math.random() * .7, ease: 'expo.out', onComplete: () => p.remove() });
  }
  const r = el.getBoundingClientRect();
  const ring = document.createElement('i');
  ring.className = 'ring';
  Object.assign(ring.style, { left: `${r.left - s.left}px`, top: `${r.top - s.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  stage.appendChild(ring);
  gsap.fromTo(ring, { opacity: .9, scale: 1 }, { opacity: 0, scaleX: 1.12, scaleY: 1.6, duration: .9, ease: 'expo.out', onComplete: () => ring.remove() });
  gsap.fromTo(el, { scale: .96 }, { scale: 1, duration: .8, ease: 'elastic.out(1.1, .45)' });
}

/* =========================================================
   6. Formulario: validación, error y estado de carga
   ========================================================= */
const form = $('#form');
const email = $('#email'), pass = $('#pass');
const fEmail = $('#field-email'), fPass = $('#field-pass');
const err = $('#err-email');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function showError(fields, message) {
  err.textContent = message;
  err.classList.add('is-on');
  fields.forEach((f) => {
    f.classList.add('is-error');
    if (!reduceMotion) gsap.fromTo(f, { x: 0 }, { keyframes: { x: [-10, 9, -7, 5, -3, 0] }, duration: .5, ease: 'none' });
  });
  fields[0]?.querySelector('input')?.focus();
}
function clearError() {
  err.classList.remove('is-on');
  err.textContent = '';
  fEmail.classList.remove('is-error');
  fPass.classList.remove('is-error');
}
[email, pass].forEach((i) => i.addEventListener('input', clearError));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (cta.classList.contains('is-loading')) return;
  const rect = cta.getBoundingClientRect();
  burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, cta);
  clearError();
  const badEmail = !EMAIL_RE.test(email.value.trim());
  const badPass = pass.value.length < 6;
  if (badEmail || badPass) {
    const msg = badEmail && badPass ? 'Revisa tu correo y tu contraseña.' : badEmail ? 'Escribe un correo válido.' : 'Tu contraseña necesita al menos 6 caracteres.';
    showError([badEmail && fEmail, badPass && fPass].filter(Boolean), msg);
    return;
  }
  cta.classList.add('is-loading');
  cta.setAttribute('aria-busy', 'true');
  setTimeout(() => {
    cta.classList.remove('is-loading');
    cta.removeAttribute('aria-busy');
    toast('Todo listo. La conexión con tu cuenta llegará en el siguiente paso.');
  }, 1600);
});

$('#google').addEventListener('click', (e) => { burstAt(e.clientX || 0, e.clientY || 0, e.currentTarget); });

// Mostrar u ocultar contraseña
$('#eye').addEventListener('click', (e) => {
  const on = pass.type === 'password';
  pass.type = on ? 'text' : 'password';
  e.currentTarget.setAttribute('aria-pressed', String(on));
  e.currentTarget.setAttribute('aria-label', on ? 'Ocultar contraseña' : 'Mostrar contraseña');
  pass.focus();
});

// Teclado abierto: el formulario sube por encima de la ilustración.
form.addEventListener('focusin', (e) => {
  if (!(e.target instanceof HTMLInputElement) || !coarse) return;
  stage.classList.add('is-typing');
  setTimeout(() => e.target.closest('.field')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
});
form.addEventListener('focusout', () => setTimeout(() => {
  if (!form.contains(document.activeElement)) stage.classList.remove('is-typing');
}, 50));

/* =========================================================
   7. Enlaces de pantallas que aún no existen
   ========================================================= */
const toastEl = $('#toast');
let toastTimer;
function toast(text) {
  toastEl.textContent = text;
  gsap.killTweensOf(toastEl);
  gsap.to(toastEl, { opacity: 1, y: 0, duration: .6, ease: 'expo.out' });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => gsap.to(toastEl, { opacity: 0, y: 30, duration: .5, ease: 'power2.in' }), 2600);
}
document.querySelectorAll('[data-soon]').forEach((el) => el.addEventListener('click', (e) => {
  e.preventDefault();
  toast(`${el.dataset.soon}: próximamente`);
}));

/* =========================================================
   8. Sonido ambiente generado en el navegador (sin archivos)
   ========================================================= */
const soundBtn = $('#sound');
let audio;
function startAmbient() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;
  // Reverberación: respuesta de impulso de ruido que se desvanece.
  const verb = ctx.createConvolver();
  const len = ctx.sampleRate * 4.5, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  verb.buffer = ir;
  const wet = ctx.createGain(); wet.gain.value = .75;
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900; filter.Q.value = .4;
  filter.connect(master); filter.connect(verb); verb.connect(wet); wet.connect(master); master.connect(ctx.destination);
  // Pad: acorde suave (Re mayor con novena) con osciladores desafinados.
  [146.83, 220, 277.18, 329.63, 440].forEach((f, i) => {
    for (const det of [-6, 6]) {
      const o = ctx.createOscillator(); o.type = i < 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = det;
      const g = ctx.createGain(); g.gain.value = .035 / (i + 1);
      const lfo = ctx.createOscillator(); lfo.frequency.value = .05 + i * .02;
      const lg = ctx.createGain(); lg.gain.value = .015 / (i + 1);
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      o.connect(g); g.connect(filter); o.start();
    }
  });
  // Campanitas aleatorias en una escala pentatónica.
  const scale = [587.33, 659.25, 739.99, 880, 987.77, 1174.66];
  const bell = () => {
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = scale[Math.floor(Math.random() * scale.length)];
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 3.5);
    o.connect(g); g.connect(verb); g.connect(master); o.start(t); o.stop(t + 3.6);
    audio.bellTimer = setTimeout(bell, 1800 + Math.random() * 4200);
  };
  audio = { ctx, master };
  bell();
}
// El sonido está encendido por defecto (como en la referencia). Los navegadores solo
// permiten reproducir audio tras un gesto, así que empieza con el primer toque.
let wantSound = true;
async function applySound() {
  if (wantSound && !audio) startAmbient();
  if (!audio) return;
  await audio.ctx.resume();
  const t = audio.ctx.currentTime;
  audio.master.gain.cancelScheduledValues(t);
  audio.master.gain.setValueAtTime(audio.master.gain.value, t);
  audio.master.gain.linearRampToValueAtTime(wantSound ? .9 : 0, t + 1.4);
}
const firstGesture = (e) => {
  if (e.target.closest?.('#sound')) return;
  removeEventListener('pointerdown', firstGesture);
  removeEventListener('keydown', firstGesture);
  applySound();
};
addEventListener('pointerdown', firstGesture);
addEventListener('keydown', firstGesture);
soundBtn.addEventListener('click', () => {
  removeEventListener('pointerdown', firstGesture);
  removeEventListener('keydown', firstGesture);
  wantSound = !(audio && soundBtn.getAttribute('aria-pressed') === 'true');
  soundBtn.setAttribute('aria-pressed', String(wantSound));
  soundBtn.setAttribute('aria-label', wantSound ? 'Silenciar' : 'Activar sonido');
  applySound();
});

/* ========================================================= */
document.fonts.ready.then(() => { intro(); parallax(); });
addEventListener('resize', () => { layoutShine(); paintShine(); });
