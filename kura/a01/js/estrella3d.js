// Estrella de la mano de Alaira (A06): modelo 3D del kit que reposa de frente, gira 0° → 180° → 0°
// sobre su eje y vuelve; con su órbita dorada (mitad detrás y mitad delante), halo, rayos finos,
// chispas que recorren la órbita y polvo de oro que sube en espiral.
// Todo viene de js/estrella-datos.js (dentro del código): no se lee ningún archivo aparte.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SPRITES, GLB_BASE64 } from './estrella-datos.js';

const rand = (a, b) => a + Math.random() * (b - a);
const easeInOut = (t) => t * t * (3 - 2 * t);
const ORBITA = [91, 581, 142, 66];     // caja de las dos mitades de la órbita (px del lienzo de A06)
const PALMA = [63, 642, 198, 82];      // reflejo dorado en la palma

/**
 * @param {object} o
 * @param {HTMLCanvasElement} o.canvas  lienzo transparente colocado sobre la mano
 * @param {{reduced: boolean}} o.motion  preferencia de movimiento reducido
 * @param {number[]} o.centro  centro de la estrella [x, y]
 * @param {number[]} o.vista  recorte del lienzo de A06 que cubre el canvas [x, y, ancho, alto]
 */
export async function createStar3D({ canvas, motion, centro: [sx, sy], vista: [vx, vy, vw, vh] }) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NoToneMapping; // el oro conserva su saturación
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(vx, vx + vw, -vy, -(vy + vh), -2000, 2000);
  camera.position.z = 1000;

  const loader = new THREE.TextureLoader();
  const tex = async (uri) => { const t = await loader.loadAsync(uri); t.colorSpace = THREE.SRGBColorSpace; t.premultiplyAlpha = true; return t; };
  const [tChispa, tDestello, tHalo, tAtras, tDelante, tPalma] = await Promise.all(
    ['chispa', 'destello', 'halo', 'orbitaAtras', 'orbitaDelante', 'reflejoPalma'].map((k) => tex(SPRITES[k])));

  const spriteMat = (map, opacity = 1) => new THREE.SpriteMaterial({ map, transparent: true, depthTest: false, depthWrite: false, opacity, premultipliedAlpha: true, blending: THREE.AdditiveBlending, toneMapped: false });
  const sprite = (map, size, order, opacity = 1, [x, y] = [sx, sy]) => {
    const s = new THREE.Sprite(spriteMat(map, opacity)); s.scale.set(size, size, 1); s.position.set(x, -y, 0); s.renderOrder = order; scene.add(s); return s;
  };
  const plane = (map, [x, y, w, h], order, tint) => {
    const m = new THREE.MeshBasicMaterial({ map, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true, blending: THREE.AdditiveBlending, toneMapped: false });
    if (tint) m.color.setRGB(...tint);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x + w / 2, -(y + h / 2), 0); p.renderOrder = order; scene.add(p); return p;
  };

  const palm = plane(tPalma, PALMA, 1);
  const orbitBack = plane(tAtras, ORBITA, 2, [2.9, 2.1, 1.1]);   // la órbita brilla dorada como en la referencia
  const halo = sprite(tHalo, 130, 4, .38);
  const flare = sprite(tDestello, 150, 30, .6);                   // rayos largos y finos
  const core = sprite(tChispa, 36, 31, .9);                       // núcleo encendido
  const orbitFront = plane(tDelante, ORBITA, 32, [2.9, 2.1, 1.1]);
  const glint1 = sprite(tDestello, 34, 33, 0, [240, 534]);
  const glint2 = sprite(tDestello, 22, 33, 0, [104, 566]);

  // chispas que recorren la órbita: delante o detrás de la estrella según su ángulo
  const [ox, oy] = [ORBITA[0] + ORBITA[2] / 2, ORBITA[1] + ORBITA[3] / 2];
  const sparks = Array.from({ length: 22 }, (_, i) => ({
    s: sprite(tChispa, 10, 33, 0, [ox, oy]),
    a: (i / 22) * Math.PI * 2 + rand(-.12, .12), speed: rand(.14, .26), size: rand(7, 15), tw: rand(0, 6), twf: rand(.8, 2.2),
  }));

  // polvo de oro: motas finas que nacen junto a la estrella, suben en espiral lenta, titilan y se apagan
  const DUST = 180;
  const seeds = new Float32Array(DUST * 4);
  for (let i = 0; i < DUST; i++) seeds.set([Math.random(), rand(3.2, 6.5), rand(1.3, 4), Math.random()], i * 4);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(DUST * 3), 3));
  dustGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 4));
  const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uC: { value: new THREE.Vector2(sx, sy) }, uGlow: { value: 1 } },
    vertexShader: /* glsl */`
      attribute vec4 aSeed; // fase, vida (s), tamaño (px), tipo
      uniform float uTime, uScale; uniform vec2 uC;
      varying float vA; varying float vHot;
      void main() {
        float life = aSeed.y, age = fract(uTime / life + aSeed.x);
        float lap = floor(uTime / life + aSeed.x);                     // cada vuelta nace en otro lugar
        float h = fract(sin((aSeed.x + lap * .618) * 91.7) * 4375.85);
        float h2 = fract(sin((aSeed.w + lap * .377) * 47.3) * 2731.17);
        float r0 = mix(6., 74., h * h), dir = aSeed.w > .5 ? 1. : -1.;
        float ang = h2 * 6.2832 + age * dir * (.9 + aSeed.w * 1.4);
        float r = r0 * (.75 + age * .55);
        vec2 p = uC + vec2(cos(ang) * r, sin(ang) * r * .42 - age * mix(26., 92., h2) + 8.);
        float tw = .55 + .45 * sin(uTime * (3. + aSeed.w * 5.) + aSeed.x * 40.);
        vA = smoothstep(0., .18, age) * (1. - smoothstep(.55, 1., age)) * tw;
        vHot = step(.86, aSeed.w);                                     // unas pocas, más brillantes
        gl_PointSize = aSeed.z * (1. + vHot * .9) * (.75 + .45 * tw) * uScale;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p.x, -p.y, 0., 1.);
      }`,
    fragmentShader: /* glsl */`
      uniform float uGlow; varying float vA; varying float vHot;
      void main() {
        vec2 q = gl_PointCoord - .5; float d = length(q) * 2.;
        float core = exp(-d * d * 9.), halo = exp(-d * d * 2.6) * .45;
        float rays = vHot * (exp(-abs(q.x) * 40.) + exp(-abs(q.y) * 40.)) * (1. - d) * .5; // destello en cruz
        vec3 c = mix(vec3(1., .66, .28), vec3(1., .95, .82), core);
        gl_FragColor = vec4(c, min((core + halo + rays) * vA * uGlow, 1.));
      }`,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  dust.renderOrder = 34; dust.frustumCulled = false; scene.add(dust);

  // el modelo 3D: GLB del kit decodificado en memoria
  const raw = atob(GLB_BASE64), bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer, '');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  pmrem.dispose();
  const key = new THREE.PointLight(0xffd49a, 2.4, 0, 0); key.position.set(sx - 40, -sy + 60, 160); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffe2c0, .5));
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3());
  model.position.sub(box.getCenter(new THREE.Vector3()));
  const holder = new THREE.Group(); holder.add(model);
  holder.scale.setScalar(72 / Math.max(size.x, size.y)); // alto de la estrella en px del lienzo, como en la referencia
  const seen = new Set(); // los materiales se comparten entre piezas: se ajustan una sola vez
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.renderOrder = 25;
    const mt = o.material;
    if (mt && !seen.has(mt)) { seen.add(mt); mt.envMapIntensity = .8; mt.emissiveIntensity *= 1.6; mt.transparent = true; }
  });
  const star = new THREE.Group(); star.position.set(sx, -sy, 0); star.add(holder); scene.add(star);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 3));
    renderer.setSize(w, h, false);
    dust.material.uniforms.uScale.value = (w * renderer.getPixelRatio()) / vw;
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  let running = false, raf = 0, last = performance.now(), t = rand(0, 20), pulse = 0;
  const tick = (now) => {
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = Math.max(last, now);
    const still = motion.reduced;
    if (!still) t += dt;
    // 0° → 180° → 0° en 5.2 s: reposa de frente, gira suave y vuelve
    const cyc = (t % 5.2) / 5.2, turn = (a, b) => easeInOut(Math.min(1, Math.max(0, (cyc - a) / (b - a))));
    holder.rotation.y = still ? 0 : (turn(.2, .5) - turn(.7, 1)) * Math.PI;
    const bob = still ? 0 : Math.sin(t * 1.1) * 1.6;
    const glow = .82 + .18 * Math.sin(t * 1.7) + pulse;
    star.position.y = -sy + bob;
    halo.position.y = flare.position.y = core.position.y = -sy + bob;
    halo.material.opacity = .3 * glow; halo.scale.setScalar(130 * (.96 + .06 * Math.sin(t * 1.7)) * (1 + pulse * .3));
    flare.material.opacity = .5 + .2 * Math.sin(t * 1.7) + pulse * .4;
    flare.material.rotation = Math.sin(t * .4) * .05; flare.scale.setScalar(150 * (.94 + .08 * Math.sin(t * 1.7)) * (1 + pulse * .25));
    core.material.opacity = .75 + .25 * Math.sin(t * 2.1);
    glint1.material.opacity = Math.max(0, Math.sin(t * .9)) ** 3 * .9; glint1.material.rotation = t * .2;
    glint2.material.opacity = Math.max(0, Math.sin(t * .7 + 2)) ** 3 * .7;
    orbitBack.material.opacity = .78 + .2 * Math.sin(t * 1.3);
    orbitFront.material.opacity = .82 + .18 * Math.sin(t * 1.3 + 1.2);
    palm.material.opacity = .32 + .18 * glow - bob * .03;
    for (const sp of sparks) {
      if (!still) sp.a += sp.speed * dt;
      const cx = Math.cos(sp.a), sn = Math.sin(sp.a);
      sp.s.position.set(ox + cx * 66, -(oy + sn * 15) + bob * .5, 0);
      sp.s.renderOrder = sn > 0 ? 33 : 3; // abajo de la elipse = delante de la estrella
      const tw = .5 + .5 * Math.sin(t * sp.twf * 6.283 + sp.tw);
      sp.s.material.opacity = (sn > 0 ? .95 : .45) * tw * tw;
      sp.s.scale.setScalar(sp.size * (.6 + .5 * tw));
    }
    dust.visible = !still;
    dust.material.uniforms.uTime.value = t;
    dust.material.uniforms.uGlow.value = 1 + pulse * .8;
    dust.position.y = bob * .3;
    pulse *= Math.exp(-dt * 2.5);
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(tick);
  };

  return {
    start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce() { tick(performance.now()); },
    /** Toque sobre la estrella: brilla un instante. */
    shine() { pulse = 1; },
    get angle() { return holder.rotation.y; },
    dispose() { this.stop(); ro.disconnect(); renderer.dispose(); },
  };
}
