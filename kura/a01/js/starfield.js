// StarField · Burst — una sola instancia de WebGLRenderer.
// Estrellas lejanas solo en el cielo visible (posiciones precalculadas a partir de la
// ilustración, lejos de rostros, logo y control de audio) y chispas finas al tocar.
import * as THREE from 'three';
import { CANVAS, config } from './config.js';

const rand = (a, b) => a + Math.random() * (b - a);

export async function createStarField({ canvas, stage, motion, isMobile }) {
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
  };
  const starMat = new THREE.ShaderMaterial({
    uniforms: shared, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float aSize, aPhase, aSpeed, aIntensity, aFlare; attribute vec3 aColor;
      uniform float uTime, uUnit, uDpr, uIntensity, uTwinkle, uStatic;
      varying vec3 vColor; varying float vAlpha; varying float vFlare;
      void main() {
        float tw = 0.5 + 0.5 * sin(uTime * aSpeed * uTwinkle + aPhase);
        tw = mix(tw, 0.75, uStatic);
        vAlpha = aIntensity * uIntensity * mix(0.25, 1.0, tw * tw);
        vColor = aColor; vFlare = aFlare;
        float s = aSize * mix(0.85, 1.12, tw);
        gl_PointSize = max(1.0, s * uUnit * uDpr * (aFlare > 0.5 ? 1.0 : 2.2));
        gl_Position = projectionMatrix * vec4(position.x * uUnit, -position.y * uUnit, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vAlpha; varying float vFlare;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float r = length(p) * 2.0;
        // núcleo definido + halo radial suave (sin bordes cuadrados)
        float core = smoothstep(0.32, 0.0, r);
        float halo = exp(-r * r * 5.0) * 0.45;
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
    uniforms: shared, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
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
      sGeo.dispose(); bGeo.dispose(); starMat.dispose(); burstMat.dispose(); renderer.dispose();
    },
  };
}
