// StarField · Burst — una sola instancia de WebGLRenderer.
// Estrellas lejanas solo en el cielo visible (posiciones precalculadas a partir de la
// ilustración, lejos de rostros, logo y control de audio) y chispas finas al tocar.
import * as THREE from 'three';
import { CANVAS, config } from './config.js';

const rand = (a, b) => a + Math.random() * (b - a);
// Suma color sin escribir alfa: en un lienzo transparente compuesto sobre la página,
// la luz se añade a la ilustración sin oscurecerla (sin halos cuadrados ni manchas).
const ADD = { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor };

// reveal: { stars, flares, zoom } — lo anima la entrada en main.js para que todo aparezca junto.
export async function createStarField({ canvas, stage, motion, isMobile, reveal = { stars: 1, flares: 1, zoom: 1 } }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power', premultipliedAlpha: true });
  } catch {
    document.documentElement.classList.add('no-webgl'); // estrellas CSS de respaldo
    return null;
  }
  const maxDpr = isMobile ? config.performance.maxPixelRatioMobile : config.performance.maxPixelRatioDesktop;
  renderer.setPixelRatio(Math.min(devicePixelRatio, maxDpr));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -1, 1);

  // ---------- Estrellas ----------
  let positions = [];
  try { positions = await (await fetch('data/estrellas.json')).json(); } catch { positions = []; }
  const count = Math.min(positions.length, isMobile ? config.stars.countMobile : config.stars.countDesktop);
  positions = positions.sort(() => Math.random() - 0.5).slice(0, count);
  const sPos = new Float32Array(count * 3), sSize = new Float32Array(count), sPhase = new Float32Array(count),
    sSpeed = new Float32Array(count), sInt = new Float32Array(count), sFlare = new Float32Array(count), sCol = new Float32Array(count * 3);
  const palette = [new THREE.Color('#fff3df'), new THREE.Color('#e6d6ff'), new THREE.Color('#c9d8ff')];
  positions.forEach(([x, y], i) => {
    const flare = i % config.stars.flareEvery === 0 ? 1 : 0;
    sPos.set([x, y, 0], i * 3);
    sSize[i] = flare ? rand(...config.stars.flareSize) : rand(...config.stars.size);
    sPhase[i] = Math.random() * Math.PI * 2;
    sSpeed[i] = (Math.PI * 2) / rand(...config.stars.cycle);
    sInt[i] = flare ? rand(0.75, 1) : rand(0.35, 0.9);
    sFlare[i] = flare;
    palette[Math.random() < 0.6 ? 0 : Math.random() < 0.6 ? 1 : 2].toArray(sCol, i * 3);
  });
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));
  sGeo.setAttribute('aPhase', new THREE.BufferAttribute(sPhase, 1));
  sGeo.setAttribute('aSpeed', new THREE.BufferAttribute(sSpeed, 1));
  sGeo.setAttribute('aIntensity', new THREE.BufferAttribute(sInt, 1));
  sGeo.setAttribute('aFlare', new THREE.BufferAttribute(sFlare, 1));
  sGeo.setAttribute('aColor', new THREE.BufferAttribute(sCol, 3));

  const shared = {
    uTime: { value: 0 },
    uUnit: { value: 1 },          // px CSS por px de referencia
    uDpr: { value: renderer.getPixelRatio() },
    uIntensity: { value: config.stars.intensity },
    uTwinkle: { value: config.stars.twinkleSpeed },
    uStatic: { value: motion.reduced ? 1 : 0 },
    uShift: { value: new THREE.Vector2() },
    uReveal: { value: reveal.stars },   // 0–1: aparición escalonada de las estrellas
    uZoom: { value: reveal.zoom },      // misma escala que la ilustración durante la entrada
  };
  const starMat = new THREE.ShaderMaterial({
    uniforms: shared, transparent: true, depthWrite: false, ...ADD,
    vertexShader: /* glsl */`
      attribute float aSize, aPhase, aSpeed, aIntensity, aFlare; attribute vec3 aColor;
      uniform float uTime, uUnit, uDpr, uIntensity, uTwinkle, uStatic, uReveal, uZoom; uniform vec2 uShift;
      varying vec3 vColor; varying float vAlpha; varying float vFlare;
      void main() {
        float tw = 0.5 + 0.5 * sin(uTime * aSpeed * uTwinkle + aPhase);
        tw = mix(tw, 0.75, uStatic);
        // cada estrella aparece en su propio momento dentro de la entrada
        float order = fract(aPhase * 0.1591);
        float appear = smoothstep(order * 0.65, order * 0.65 + 0.35, uReveal);
        vAlpha = aIntensity * uIntensity * mix(0.18, 1.0, tw * tw * tw) * appear;
        vColor = aColor; vFlare = aFlare;
        float s = aSize * mix(0.85, 1.12, tw);
        gl_PointSize = max(2.0, s * uUnit * uDpr * (aFlare > 0.5 ? 1.0 : 3.0));
        // misma escala y desplazamiento que la ilustración (dibujada a 915×1781 desde −8, −8)
        vec2 q = (vec2(-8.0) + position.xy * vec2(915.0 / 899.0, 1781.0 / 1750.0)) * uUnit;
        vec2 c = vec2(449.5, 875.0) * uUnit;
        q = c + (q - c) * uZoom + uShift;
        gl_Position = projectionMatrix * vec4(q.x, -q.y, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vAlpha; varying float vFlare;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float r = length(p) * 2.0;
        // núcleo definido + halo radial suave (sin bordes cuadrados)
        float core = smoothstep(0.26, 0.0, r);
        float halo = exp(-r * r * 7.0) * 0.55;
        float a = core + halo;
        if (vFlare > 0.5) {
          float rays = max(0.0, 1.0 - abs(p.x) * 26.0) * pow(max(0.0, 1.0 - abs(p.y) * 2.0), 2.0)
                     + max(0.0, 1.0 - abs(p.y) * 26.0) * pow(max(0.0, 1.0 - abs(p.x) * 2.0), 2.0);
          a = smoothstep(0.16, 0.0, r) + exp(-r * r * 9.0) * 0.5 + rays * 0.75;
        }
        a *= vAlpha * smoothstep(1.0, 0.85, r);
        if (a < 0.004) discard;
        gl_FragColor = vec4(vColor * a, a);
      }`,
  });
  scene.add(new THREE.Points(sGeo, starMat));

  // ---------- Chispas finas al tocar (búfer circular sin asignaciones por cuadro) ----------
  const POOL = 420;
  const bOrigin = new Float32Array(POOL * 3), bVel = new Float32Array(POOL * 2), bStart = new Float32Array(POOL).fill(-99),
    bLife = new Float32Array(POOL).fill(1), bSize = new Float32Array(POOL), bCol = new Float32Array(POOL * 3);
  const bGeo = new THREE.BufferGeometry();
  const attr = (arr, n) => new THREE.BufferAttribute(arr, n).setUsage(THREE.DynamicDrawUsage);
  const aOrigin = attr(bOrigin, 3), aVel = attr(bVel, 2), aStart = attr(bStart, 1), aLife = attr(bLife, 1), aSz = attr(bSize, 1), aCl = attr(bCol, 3);
  bGeo.setAttribute('position', aOrigin); bGeo.setAttribute('aVel', aVel); bGeo.setAttribute('aStart', aStart);
  bGeo.setAttribute('aLife', aLife); bGeo.setAttribute('aSize', aSz); bGeo.setAttribute('aColor', aCl);
  bGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  const burstMat = new THREE.ShaderMaterial({
    uniforms: shared, transparent: true, depthWrite: false, ...ADD,
    vertexShader: /* glsl */`
      attribute vec2 aVel; attribute float aStart, aLife, aSize; attribute vec3 aColor;
      uniform float uTime, uUnit, uDpr;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float t = uTime - aStart;
        float k = clamp(t / aLife, 0.0, 1.0);
        // arrastre: avanza rápido al principio y se frena; cae muy poco
        float travel = (1.0 - exp(-t * 3.2)) / 3.2;
        vec2 p = position.xy + aVel * travel + vec2(0.0, 26.0) * t * t;
        float twinkle = 0.75 + 0.25 * sin(t * 40.0 + aStart * 13.0);
        vAlpha = (t < 0.0 || k >= 1.0) ? 0.0 : pow(1.0 - k, 1.6) * twinkle;
        vColor = aColor;
        gl_PointSize = max(1.0, aSize * uUnit * uDpr * 2.6 * (1.0 - 0.5 * k));
        gl_Position = projectionMatrix * vec4(p.x * uUnit, -p.y * uUnit, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = (smoothstep(0.35, 0.0, r) + exp(-r * r * 6.0) * 0.35) * vAlpha;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vColor * a, a);
      }`,
  });
  scene.add(new THREE.Points(bGeo, burstMat));
  let cursor = 0;
  const burstColors = [new THREE.Color('#fff6ec'), new THREE.Color('#f1d4ff'), new THREE.Color('#d7b2ff'), new THREE.Color('#ffe2a6')];

  // ---------- Destellos ópticos horizontales (botón y cristal) ----------
  // Núcleo pequeño y cálido + estela anamórfica horizontal muy tenue. Viajan solo sobre
  // las orillas rectas superior e inferior, de ida y vuelta, lento, apareciendo y desapareciendo.
  const groups = Object.entries(config.flares).map(([name, c]) => ({ name, c, rect: null, items: Array.from({ length: c.count }, (_, i) => ({ edge: i % 2, x: Math.random(), dir: Math.random() < .5 ? -1 : 1, speed: rand(...c.speed), age: i === 0 ? 2 : -i * 3 - Math.random() * 2, life: rand(...c.life) })) }));
  const NF = groups.reduce((n, g) => n + g.c.count, 0);
  const fPos = new Float32Array(NF * 3), fAlpha = new Float32Array(NF), fSize = new Float32Array(NF);
  const fGeo = new THREE.BufferGeometry();
  const aFPos = new THREE.BufferAttribute(fPos, 3).setUsage(THREE.DynamicDrawUsage), aFAlpha = new THREE.BufferAttribute(fAlpha, 1).setUsage(THREE.DynamicDrawUsage);
  fGeo.setAttribute('position', aFPos); fGeo.setAttribute('aAlpha', aFAlpha); fGeo.setAttribute('aSize', new THREE.BufferAttribute(fSize, 1));
  fGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  { let k = 0; for (const g of groups) for (let i = 0; i < g.c.count; i++) fSize[k++] = g.c.size; }
  const flareU = { ...shared, uFlare: { value: 1 }, uFlareReveal: { value: reveal.flares }, uHud: { value: new THREE.Vector2() } };
  const flareMat = new THREE.ShaderMaterial({
    uniforms: flareU, transparent: true, depthWrite: false, ...ADD,
    vertexShader: /* glsl */`
      attribute float aAlpha, aSize;
      uniform float uUnit, uDpr, uFlare, uFlareReveal; uniform vec2 uHud;
      varying float vAlpha;
      void main() {
        vAlpha = aAlpha * uFlare * uFlareReveal;
        gl_PointSize = aSize * uUnit * uDpr;
        vec2 q = position.xy * uUnit + uHud; // los destellos se mueven con el HUD
        gl_Position = projectionMatrix * vec4(q.x, -q.y, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying float vAlpha;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float r = length(p);
        float core = exp(-r * r * 1400.0);                                   // punto de luz pequeño
        float glow = exp(-r * r * 140.0) * 0.32;                              // brillo cercano
        float streak = exp(-abs(p.y) * 200.0) * exp(-abs(p.x) * 3.6) * 0.95;  // estela horizontal
        float soft = exp(-abs(p.y) * 50.0) * exp(-abs(p.x) * 6.0) * 0.2;     // bruma de la estela
        vec3 col = vec3(1.0, 0.95, 0.9) * core + vec3(0.93, 0.8, 1.0) * glow + vec3(0.82, 0.72, 1.0) * (streak + soft);
        col *= vAlpha * smoothstep(0.5, 0.4, max(abs(p.x), abs(p.y)));
        if (max(col.r, max(col.g, col.b)) < 0.003) discard;
        gl_FragColor = vec4(col, 0.0);
      }`,
  });
  scene.add(new THREE.Points(fGeo, flareMat));
  function updateFlares(dt) {
    const still = shared.uStatic.value > .5;
    let k = 0;
    for (const g of groups) {
      for (const fl of g.items) {
        const R = g.rect;
        if (!R) { fAlpha[k++] = 0; continue; }
        if (!still) {
          fl.age += dt;
          fl.x += fl.dir * fl.speed * dt / Math.max(1, R.w - 2 * R.r);
          if (fl.x > 1) { fl.x = 1; fl.dir = -1; } else if (fl.x < 0) { fl.x = 0; fl.dir = 1; }
          if (fl.age > fl.life) { fl.age = 0; fl.life = rand(...g.c.life); fl.x = Math.random(); fl.dir = Math.random() < .5 ? -1 : 1; fl.edge = Math.random() < .6 ? 0 : 1; }
        }
        const t = Math.max(0, fl.age) / fl.life;
        const env = still ? (k % 2 ? 0 : .5) : Math.sin(Math.PI * Math.min(1, t)) ** 2;   // va y viene muy suave
        fPos[k * 3] = R.x + R.r + fl.x * (R.w - 2 * R.r);
        fPos[k * 3 + 1] = fl.edge ? R.y + R.h : R.y;
        fAlpha[k] = env * g.c.intensity;
        k++;
      }
    }
    aFPos.needsUpdate = true; aFAlpha.needsUpdate = true;
  }

  // ---------- Tamaño ----------
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = -h; camera.updateProjectionMatrix();
    shared.uUnit.value = w / CANVAS.width;
  };
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();

  // ---------- Bucle ----------
  let last = performance.now(), running = true, frames = 0, slowSum = 0, degraded = false;
  const loop = (now) => {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    shared.uTime.value += dt;
    shared.uReveal.value = reveal.stars; shared.uZoom.value = reveal.zoom; flareU.uFlareReveal.value = reveal.flares;
    updateFlares(dt);
    renderer.render(scene, camera);
    // Si el dispositivo va lento, se baja la resolución una sola vez.
    if (!degraded && frames < 90) { frames++; slowSum += dt * 1000; if (frames === 90 && slowSum / 90 > config.performance.slowFrameMs) { degraded = true; renderer.setPixelRatio(1); shared.uDpr.value = 1; resize(); } }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  const onVis = () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(loop); } };
  document.addEventListener('visibilitychange', onVis);
  motion.onChange((r) => { shared.uStatic.value = r ? 1 : 0; });

  return {
    uniforms: shared,
    flareUniform: flareU.uFlare,
    /** Rectángulo de un elemento con destellos (hud | button), en coordenadas de referencia: { x, y, w, h, r }. */
    setRect(name, rect) { const g = groups.find((x) => x.name === name); if (g) g.rect = rect; },
    /** Pruebas: rectángulos actuales de los destellos (px de referencia, relativos al escenario). */
    rects: () => Object.fromEntries(groups.map((g) => [g.name, g.rect])),
    /** Desplazamiento de paralaje en px CSS: las estrellas se mueven con la ilustración. */
    shift({ sky, hud }) { shared.uShift.value.set(...sky); flareU.uHud.value.set(...hud); },
    /** Chispas finas en un punto de la pantalla (coordenadas de cliente). */
    burst(clientX, clientY, scale = 1) {
      if (motion.reduced) return;
      const r = stage.getBoundingClientRect(), u = shared.uUnit.value;
      const ox = (clientX - r.left) / u, oy = (clientY - r.top) / u;
      const n = Math.round(config.burst.particles * scale);
      for (let i = 0; i < n; i++) {
        const j = cursor; cursor = (cursor + 1) % POOL;
        const ang = Math.random() * Math.PI * 2, sp = rand(...config.burst.speed) * (0.4 + Math.random() * 0.6);
        bOrigin[j * 3] = ox + Math.cos(ang) * 4; bOrigin[j * 3 + 1] = oy + Math.sin(ang) * 4;
        bVel[j * 2] = Math.cos(ang) * sp; bVel[j * 2 + 1] = Math.sin(ang) * sp * 0.75;
        bStart[j] = shared.uTime.value + Math.random() * 0.06;
        bLife[j] = rand(...config.burst.life);
        bSize[j] = rand(...config.burst.size);
        burstColors[i % burstColors.length].toArray(bCol, j * 3);
      }
      for (const a of [aOrigin, aVel, aStart, aLife, aSz, aCl]) a.needsUpdate = true;
    },
    dispose() {
      running = false; ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
      sGeo.dispose(); bGeo.dispose(); fGeo.dispose(); starMat.dispose(); burstMat.dispose(); flareMat.dispose(); renderer.dispose();
    },
  };
}
