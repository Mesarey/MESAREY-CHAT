// A06 · Alaira «viva» (estilo Live2D, hecho con Three.js).
//
// Una sola ilustración del cuerpo se dibuja sobre una malla fina; cada vértice se desplaza según
// mapas de peso (assets/a06/alaira/pesos-*.png, 15 canales): mechones, melena, telas, aretes,
// cabeza y pecho. Así el cabello se mece desde la raíz, el pecho respira y la cabeza sigue al
// dedo o al giroscopio, sin recortes ni capas duplicadas. Encima van los ojos (atlas de parpadeo),
// el fleco y las hebras finas, con la misma deformación. En la mano, la estrella 3D (GLB) gira
// 0° → 180° → 0° sobre su eje con halos, órbita y chispas doradas.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { A06 } from './a06-capas.js';

const W = 911, H = 1128;               // región del lienzo que ocupa Alaira (px de referencia)
const CH = A06.rig.names.length;       // 15 canales de deformación
const IDX = Object.fromEntries(A06.rig.names.map((n, i) => [n, i]));

// Cómo se mueve cada canal: amplitud del viento (rad), frecuencia (Hz), respuesta al movimiento
// del teléfono/cursor y rigidez del resorte. Se nota a simple vista, sin romper la ilustración.
const TUNE = {
  'cabello-izq-aire':    { wind: .042, f: .21, push: .060, k: 8 },
  'cabello-izq-rizo':    { wind: .036, f: .25, push: .052, k: 9 },
  'cabello-izq-largo':   { wind: .026, f: .18, push: .040, k: 6 },
  'cabello-der-alto':    { wind: .030, f: .23, push: .048, k: 8 },
  'cabello-der-cascada': { wind: .028, f: .2, push: .044, k: 7 },
  'cabello-der-puntas':  { wind: .032, f: .22, push: .048, k: 7 },
  'melena-izq':          { wind: .009, f: .15, push: .013, k: 5, wave: .008 },
  'melena-der':          { wind: .009, f: .16, push: .013, k: 5, wave: .008 },
  'tela-borde-manga':    { wind: .016, f: .19, push: .022, k: 7 },
  'tela-faldon':         { wind: .013, f: .17, push: .020, k: 7 },
  'arete-izq':           { wind: .07, f: .48, push: .24, k: 20 },
  'arete-der':           { wind: .07, f: .44, push: .24, k: 20 },
};

const DEFORM = /* glsl */`
  uniform sampler2D uW0, uW1, uW2, uW3, uW4;
  uniform vec2 uPiv[${CH}];
  uniform float uAng[${CH}];
  uniform float uWave[${CH}];
  uniform float uTime, uBreath, uSway;
  uniform vec2 uHead;
  uniform vec2 uSelfPiv; uniform float uSelfAng, uSelfLen;
  vec2 rot(vec2 r, float a) { float c = cos(a), s = sin(a); return vec2(c * r.x - s * r.y, s * r.x + c * r.y); }
  vec2 deform(vec2 p) {
    vec2 uv = p / vec2(${W}., ${H}.);
    vec3 a = texture2D(uW0, uv).rgb, b = texture2D(uW1, uv).rgb, c = texture2D(uW2, uv).rgb, d = texture2D(uW3, uv).rgb, e = texture2D(uW4, uv).rgb;
    float w[${CH}];
    w[0] = a.r; w[1] = a.g; w[2] = a.b; w[3] = b.r; w[4] = b.g; w[5] = b.b; w[6] = c.r; w[7] = c.g; w[8] = c.b;
    w[9] = d.r; w[10] = d.g; w[11] = d.b; w[12] = e.r; w[13] = e.g; w[14] = e.b;
    vec2 off = vec2(0.);
    for (int i = 0; i < ${CH}; i++) {
      if (w[i] < .002) continue;
      vec2 r = p - uPiv[i];
      // la onda recorre el mechón de la raíz a la punta (fase según la distancia)
      float ang = uAng[i] + uWave[i] * sin(uTime * 1.3 - length(r) * .011 + float(i) * 1.7);
      off += (rot(r, ang * w[i]) - r);
    }
    off += uHead * w[12];                                                     // la cabeza sigue la mirada
    off += w[13] * vec2((p.x - 436.) * uBreath * .008, -uBreath * 3.4);       // respiración
    off.y -= uBreath * 1.8 * w[12];
    // propia (fleco y hebras): punta suelta, raíz fija
    float sw = smoothstep(0., uSelfLen, length(p - uSelfPiv));
    vec2 rs = p + off - uSelfPiv;
    off += (rot(rs, uSelfAng * sw) - rs);
    vec2 q = p + off;
    vec2 base = vec2(455., ${H}.);                                            // balanceo de todo el cuerpo desde los pies
    return rot(q - base, uSway) + base;
  }
`;
const VERT = /* glsl */`
  attribute vec2 aPos;  // posición en px del lienzo
  varying vec2 vUv;
  ${DEFORM}
  void main() {
    vUv = uv;
    vec2 q = deform(aPos);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(q.x, -q.y, 0., 1.);
  }
`;
const FRAG = /* glsl */`
  uniform sampler2D map; uniform float uOpacity; uniform vec4 uCell; // celda del atlas: offset (px) y tamaño de textura
  varying vec2 vUv;
  void main() {
    vec2 uv = uCell.z > 0. ? (uCell.xy + vUv * vec2(180., 90.)) / uCell.zw : vUv;
    gl_FragColor = texture2D(map, uv) * uOpacity; // textura premultiplicada
  }
`;

/** Malla rectangular subdividida para una capa en (x, y, w, h). */
function grid(x, y, w, h, step) {
  const nx = Math.max(2, Math.ceil(w / step)), ny = Math.max(2, Math.ceil(h / step));
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    pos.push(x + (w * i) / nx, y + (h * j) / ny); uv.push(i / nx, j / ny);
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('aPos', new THREE.Float32BufferAttribute(pos, 2));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 2) * 3), 3)); // no se usa
  g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5); // la deformación ocurre en la GPU
  return g;
}

const rand = (a, b) => a + Math.random() * (b - a);

/** Estrella 3D: el glTF en JSON trae su geometría como data: URI. La web app no deja que fetch lea data: URIs
 *  (política de seguridad), así que aquí se decodifica a mano y se arma un GLB en memoria: nada sale a la red. */
async function loadStar(url) {
  const json = await (await fetch(url)).json();
  const bins = json.buffers.map((b) => {
    const m = /^data:[^,]*;base64,(.*)$/.exec(b.uri || '');
    if (!m) throw new Error('buffer externo no esperado');
    const raw = atob(m[1]), out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  });
  // un solo bloque binario (GLB admite uno): se concatenan y se recolocan las vistas
  const starts = []; let total = 0;
  for (const b of bins) { starts.push(total); total += (b.length + 3) & ~3; }
  const bin = new Uint8Array(total); bins.forEach((b, i) => bin.set(b, starts[i]));
  for (const v of json.bufferViews) { v.byteOffset = (v.byteOffset || 0) + starts[v.buffer]; v.buffer = 0; }
  json.buffers = [{ byteLength: total }];
  let text = new TextEncoder().encode(JSON.stringify(json));
  const pad = (4 - (text.length % 4)) % 4;
  const jsonChunk = new Uint8Array(text.length + pad).fill(0x20); jsonChunk.set(text);
  const glb = new ArrayBuffer(12 + 8 + jsonChunk.length + 8 + bin.length), dv = new DataView(glb), u8 = new Uint8Array(glb);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, glb.byteLength, true);
  dv.setUint32(12, jsonChunk.length, true); dv.setUint32(16, 0x4E4F534A, true); u8.set(jsonChunk, 20);
  const o = 20 + jsonChunk.length;
  dv.setUint32(o, bin.length, true); dv.setUint32(o + 4, 0x004E4942, true); u8.set(bin, o + 8);
  return new GLTFLoader().parseAsync(glb, '');
}
const easeInOut = (t) => t * t * (3 - 2 * t);

export async function createAlaira({ canvas, motion, view = [0, 0, W, H] }) {
  // view: recorte del lienzo que se dibuja (estrella.html lo usa para ver la estrella de cerca)
  const [vx, vy, vw, vh] = view;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  } catch { return null; }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NoToneMapping; // el oro conserva su saturación (como en la ilustración)
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(vx, vx + vw, -vy, -(vy + vh), -2000, 2000);
  camera.position.z = 1000;

  const tl = new THREE.TextureLoader();
  const tex = (src, { premul = true, mip = true } = {}) => new Promise((res, rej) => tl.load(src, (t) => {
    t.flipY = false; t.premultiplyAlpha = premul; t.colorSpace = THREE.NoColorSpace; // colores tal cual
    t.anisotropy = 4;
    if (!mip) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }
    res(t);
  }, undefined, rej));

  const [body, eyes, maps] = await Promise.all([
    tex('assets/a06/alaira/cuerpo.webp'),
    tex('assets/a06/alaira/ojos-atlas.webp'),
    Promise.all(A06.rig.maps.map((m) => tex(m, { premul: false, mip: false }))),
  ]);

  // ---------- Uniformes compartidos del «rig» ----------
  const rig = {
    uW0: { value: maps[0] }, uW1: { value: maps[1] }, uW2: { value: maps[2] }, uW3: { value: maps[3] }, uW4: { value: maps[4] },
    uPiv: { value: A06.rig.pivots.map(([x, y]) => new THREE.Vector2(x, y)) },
    uAng: { value: new Array(CH).fill(0) },
    uWave: { value: A06.rig.names.map((n) => TUNE[n]?.wave ?? 0) },
    uTime: { value: 0 }, uBreath: { value: 0 }, uSway: { value: 0 },
    uHead: { value: new THREE.Vector2() },
  };
  const layer = (map, [x, y, w, h], { step = 8, order = 0, selfPivot = null, cell = null } = {}) => {
    const self = { uSelfPiv: { value: new THREE.Vector2(...(selfPivot || [0, 0])) }, uSelfAng: { value: 0 }, uSelfLen: { value: selfPivot ? Math.hypot(w, h) * .8 : 1 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...rig, ...self, map: { value: map }, uOpacity: { value: 1 }, uCell: { value: new THREE.Vector4(0, 0, cell ? 920 : 0, cell ? 470 : 0) } },
      vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthTest: false, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const m = new THREE.Mesh(grid(x, y, w, h, step), mat);
    m.renderOrder = order; m.frustumCulled = false;
    scene.add(m);
    return { mesh: m, mat, self };
  };

  // cuerpo → ojos → fleco → hebras (los pelos tapan los párpados)
  layer(body, [0, 0, W, H], { step: 6, order: 0 });
  const eyeLayer = layer(eyes, A06.ojos.box, { step: 10, order: 1, cell: true });
  // Piezas articuladas, en su orden del kit: en el cuerpo están borradas, así que al moverse no dejan copia debajo.
  const PARTS = ['cabello-izq-aire', 'cabello-izq-rizo', 'cabello-izq-largo', 'cabello-der-alto', 'cabello-der-cascada', 'cabello-der-puntas', 'tela-borde-manga', 'tela-faldon', 'arete-izq', 'arete-der'];
  const partTex = await Promise.all(PARTS.map((id) => tex(A06[id].src)));
  PARTS.forEach((id, i) => layer(partTex[i], A06[id].box, { step: 5, order: 2 + i }));
  const strands = [];
  const front = [['fleco-oclusor', 2, .01], ['hebra-izq-sobre-pestana', 3, .05], ['hebra-central-luz', 3, .06], ['hebra-der-sobre-ojo', 3, .055], ['hebra-der-mejilla', 3, .065]];
  const frontTex = await Promise.all(front.map(([id]) => tex(A06[id].src)));
  front.forEach(([id, order, amp], i) => {
    const L = layer(frontTex[i], A06[id].box, { step: 6, order: 20 + order, selfPivot: A06[id].pivot });
    strands.push({ ...L, amp, phase: rand(0, 6), f: rand(.2, .32) });
  });

  // ---------- Estrella de la palma ----------
  const [sx, sy] = A06.anchors.star;
  const star = new THREE.Group();
  star.position.set(sx, -sy, 0);
  scene.add(star);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  const key = new THREE.PointLight(0xffd49a, 2.4, 0, 0); key.position.set(sx - 40, -sy + 60, 160); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffe2c0, .5));

  const sprite = async (src, w, h, order, { add = true, x = sx, y = sy, opacity = 1 } = {}) => {
    const t = await tex(src); t.colorSpace = THREE.SRGBColorSpace; t.flipY = true; t.needsUpdate = true; // los sprites usan v hacia arriba
    const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, opacity, premultipliedAlpha: true,
      blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false });
    const s = new THREE.Sprite(m); s.scale.set(w, h, 1); s.position.set(x, -y, 0); s.renderOrder = order; s.center.set(.5, .5);
    scene.add(s); return s;
  };
  const plane = async (src, [x, y, w, h], order, add = false) => {
    const t = await tex(src); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
      blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    // PlaneGeometry tiene v hacia arriba; con flipY=false se invierte la textura: se corrige con la escala
    p.scale.y = -1; p.position.set(x + w / 2, -(y + h / 2), 0); p.renderOrder = order;
    scene.add(p); return p;
  };
  const [haloViolet, orbitBack, haloGold, orbitFront, palm, flare, core, glint1, glint2] = await Promise.all([
    sprite('assets/a06/fx/halo-violeta.webp', 230, 230, 20, { add: true, opacity: 0 }),
    plane('assets/a06/fx/orbita-atras.webp', A06.orbita_atras.box, 21, true),
    sprite('assets/a06/fx/halo-oro.webp', 120, 120, 24, { add: true, opacity: .38 }),
    plane('assets/a06/fx/orbita-delante.webp', A06.orbita_delante.box, 32, true),
    plane('assets/a06/fx/reflejo-palma.webp', A06.reflejo_palma.box, 5, true),
    sprite('assets/a06/fx/destello-marfil.webp', 150, 150, 30, { add: true, opacity: .6 }), // rayos largos y finos
    sprite('assets/a06/fx/chispa-oro.webp', 36, 36, 31, { add: true, opacity: .9 }),         // núcleo encendido
    sprite('assets/a06/fx/destello-marfil.webp', 34, 34, 33, { add: true, x: 240, y: 534, opacity: 0 }),
    sprite('assets/a06/fx/destello-marfil.webp', 22, 22, 33, { add: true, x: 104, y: 566, opacity: 0 }),
  ]);
  for (const o of [orbitBack, orbitFront]) o.material.color.setRGB(2.9, 2.1, 1.1); // la órbita dorada brilla como en la referencia

  // chispas doradas que recorren la órbita (delante o detrás de la estrella según su ángulo)
  const sparkTex = await tex('assets/a06/fx/chispa-oro.webp'); sparkTex.colorSpace = THREE.SRGBColorSpace;
  const [ox, oy] = A06.anchors.orbit;
  const sparks = Array.from({ length: 22 }, (_, i) => {
    const m = new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, premultipliedAlpha: true });
    const s = new THREE.Sprite(m); scene.add(s);
    return { s, a: (i / 22) * Math.PI * 2 + rand(-.12, .12), speed: rand(.14, .26), size: rand(7, 15), tw: rand(0, 6), twf: rand(.8, 2.2) };
  });

  // polvo de oro: motas finas que nacen junto a la estrella, suben en espiral lenta, titilan y se apagan
  const DUST = 180;
  const dustGeo = new THREE.BufferGeometry();
  const seeds = new Float32Array(DUST * 4);
  for (let i = 0; i < DUST; i++) seeds.set([Math.random(), rand(3.2, 6.5), rand(1.3, 4), Math.random()], i * 4);
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
        float lap = floor(uTime / life + aSeed.x);                       // cada vuelta nace en otro lugar
        float h = fract(sin((aSeed.x + lap * .618) * 91.7) * 4375.85);
        float h2 = fract(sin((aSeed.w + lap * .377) * 47.3) * 2731.17);
        float r0 = mix(6., 74., h * h), dir = aSeed.w > .5 ? 1. : -1.;
        float ang = h2 * 6.2832 + age * dir * (.9 + aSeed.w * 1.4);
        float r = r0 * (.75 + age * .55);
        vec2 p = uC + vec2(cos(ang) * r, sin(ang) * r * .42 - age * mix(26., 92., h2) + 8.);
        float tw = .55 + .45 * sin(uTime * (3. + aSeed.w * 5.) + aSeed.x * 40.);
        vA = smoothstep(0., .18, age) * (1. - smoothstep(.55, 1., age)) * tw;
        vHot = step(.86, aSeed.w);                                       // unas pocas, más brillantes
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
        float a = (core + halo + rays) * vA * uGlow;
        gl_FragColor = vec4(c, min(a, 1.));
      }`,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  dust.renderOrder = 34; dust.frustumCulled = false; scene.add(dust);

  let model = null;
  try {
    const gltf = await loadStar('assets/a06/fx/estrella.json'); // el GLB del kit, mismo modelo
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    model.position.sub(c);
    const holder = new THREE.Group(); holder.add(model);
    const target = 72; // alto de la estrella en px del lienzo (rayo vertical largo, como en la referencia)
    holder.scale.setScalar(target / Math.max(size.x, size.y));
    const seen = new Set(); // los materiales se comparten entre piezas: se ajustan una sola vez
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.renderOrder = 25;
      const mt = o.material; if (mt && !seen.has(mt)) { seen.add(mt); mt.envMapIntensity = .8; mt.emissiveIntensity *= 1.6; mt.depthWrite = true; mt.depthTest = true; mt.transparent = true; } // en la cola transparente: se dibuja después del cuerpo
    });
    star.add(holder);
    model = holder;
  } catch (err) { console.warn('A06: estrella 3D no disponible, se usa la 2D.', err); }
  if (!model) await sprite('assets/a06/fx/estrella-2d.webp', 112, 112, 25, { add: false });
  pmrem.dispose();

  // ---------- Estado ----------
  const spring = A06.rig.names.map(() => ({ a: 0, v: 0 }));
  const look = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0 };
  const head = { x: 0, y: 0, a: 0, vx: 0, vy: 0, va: 0 };
  let blink = { t0: 0, next: performance.now() + rand(1200, 2600), double: false };
  const T = A06.eyeTimingMs; // cerrar 82 ms, sostener 19 ms, abrir 125 ms
  let poke = 0, starPulse = 0, eyeOverride = null;

  function eyeFrame(now) {
    if (now >= blink.next && !blink.t0) blink.t0 = now;
    if (!blink.t0) return 0;
    const e = now - blink.t0, total = T.close + T.hold + T.open;
    if (e >= total) {
      blink.t0 = 0;
      const again = !blink.double && Math.random() < .18; // a veces, doble parpadeo
      blink.double = again;
      blink.next = now + (again ? rand(140, 220) : rand(2400, 5600));
      return 0;
    }
    if (e < T.close) return Math.round((e / T.close) * 24);
    if (e < T.close + T.hold) return 24;
    return Math.round((1 - (e - T.close - T.hold) / T.open) * 24);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, vw < W ? 3 : 2));
    renderer.setSize(w, h, false);
    dust.material.uniforms.uScale.value = (w * renderer.getPixelRatio()) / vw; // tamaño de las motas en px del lienzo
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  let running = false, raf = 0, last = performance.now(), t = rand(0, 50);
  const tick = (now) => {
    // la marca de requestAnimationFrame puede ser anterior a performance.now(): nunca un paso negativo
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = Math.max(last, now);
    const still = motion.reduced;
    if (!still) t += dt;
    rig.uTime.value = t;

    // velocidad de la mirada (dedo, cursor o giroscopio) → impulso al cabello y aretes
    look.vx = dt > 0 ? (look.x - look.px) / dt : 0; look.vy = dt > 0 ? (look.y - look.py) / dt : 0;
    look.px = look.x; look.py = look.y;
    const vx = THREE.MathUtils.clamp(look.vx, -4, 4);

    A06.rig.names.forEach((n, i) => {
      const c = TUNE[n]; if (!c) return;
      const s = spring[i];
      const target = still ? 0 : c.wind * (Math.sin(t * c.f * 6.283 + i * 1.3) * .7 + Math.sin(t * c.f * 2.9 + i) * .3) - look.x * c.push * .35;
      const k = c.k, damp = 2 * Math.sqrt(k) * .55;
      s.v += ((target - s.a) * k - s.v * damp - vx * c.push * .9 - poke * c.push * 2) * dt;
      s.a += s.v * dt;
      rig.uAng.value[i] = s.a;
    });
    // cabeza: sigue la mirada con suavidad y un vaivén mínimo
    const tx = still ? 0 : look.x * 6 + Math.sin(t * .31) * 2.2, ty = still ? 0 : look.y * 3 + Math.sin(t * .23 + 1) * 1.2;
    const ta = still ? 0 : look.x * .03 + Math.sin(t * .27) * .014 + Math.sin(t * .11 + 2) * .008; // inclina la cabeza con calma
    head.vx += ((tx - head.x) * 14 - head.vx * 6.5) * dt; head.x += head.vx * dt;
    head.vy += ((ty - head.y) * 14 - head.vy * 6.5) * dt; head.y += head.vy * dt;
    head.va += ((ta - head.a) * 12 - head.va * 6) * dt; head.a += head.va * dt;
    rig.uHead.value.set(head.x, head.y + poke * 1.5);
    rig.uAng.value[IDX.cabeza] = head.a;
    rig.uBreath.value = still ? .5 : .5 + .5 * Math.sin(t * (6.283 / 4.4));
    rig.uSway.value = still ? 0 : Math.sin(t * .37) * .0042 + Math.sin(t * .13) * .002;
    poke *= Math.exp(-dt * 3);

    // fleco y hebras: un poco más sueltos que la cabeza
    for (const s of strands) s.self.uSelfAng.value = still ? 0 : s.amp * Math.sin(t * s.f * 6.283 + s.phase) - vx * s.amp * .25;

    // parpadeo (atlas 5×5)
    const f = eyeOverride ?? (still ? 0 : eyeFrame(now));
    eyeLayer.mat.uniforms.uCell.value.x = (f % 5) * 184 + 2;
    eyeLayer.mat.uniforms.uCell.value.y = Math.floor(f / 5) * 94 + 2;

    // estrella: 0° → 180° → 0° en 5.2 s (reposa de frente, gira suave y vuelve), flota apenas y brilla
    const cyc = (t % 5.2) / 5.2, turn = (a, b) => easeInOut(Math.min(1, Math.max(0, (cyc - a) / (b - a))));
    if (model) model.rotation.y = still ? 0 : (turn(.2, .5) - turn(.7, 1)) * Math.PI;
    const bob = still ? 0 : Math.sin(t * 1.1) * 1.6;
    star.position.y = -sy + bob;
    const glow = .82 + .18 * Math.sin(t * 1.7) + starPulse;
    haloGold.material.opacity = .3 * glow; haloGold.scale.setScalar(130 * (.96 + .06 * Math.sin(t * 1.7)) * (1 + starPulse * .3));
    haloGold.position.y = -sy + bob;
    haloViolet.visible = false;
    flare.material.opacity = .5 + .2 * Math.sin(t * 1.7) + starPulse * .4;
    flare.material.rotation = Math.sin(t * .4) * .05; flare.position.y = -sy + bob;
    flare.scale.setScalar(150 * (.94 + .08 * Math.sin(t * 1.7)) * (1 + starPulse * .25));
    core.material.opacity = .75 + .25 * Math.sin(t * 2.1); core.position.y = -sy + bob;
    glint1.material.opacity = Math.max(0, Math.sin(t * .9)) ** 3 * .9; glint1.material.rotation = t * .2;
    glint2.material.opacity = Math.max(0, Math.sin(t * .7 + 2)) ** 3 * .7;
    orbitBack.material.opacity = .78 + .2 * Math.sin(t * 1.3);
    orbitFront.material.opacity = .82 + .18 * Math.sin(t * 1.3 + 1.2);
    palm.material.opacity = .32 + .18 * glow - bob * .03;
    for (const sp of sparks) {
      if (!still) sp.a += sp.speed * dt;
      const cx = Math.cos(sp.a), sn = Math.sin(sp.a);
      sp.s.position.set(ox + cx * 66, -(oy + sn * 15) + bob * .5, 0);
      sp.s.renderOrder = sn > 0 ? 33 : 19; // abajo de la elipse = delante de la estrella
      const tw = .5 + .5 * Math.sin(t * sp.twf * 6.283 + sp.tw);
      sp.s.material.opacity = (sn > 0 ? .95 : .45) * tw * tw;
      sp.s.scale.setScalar(sp.size * (.6 + .5 * tw));
    }
    dust.material.uniforms.uTime.value = t;
    dust.material.uniforms.uGlow.value = still ? .6 : 1 + starPulse * .8;
    dust.position.y = bob * .3;
    starPulse *= Math.exp(-dt * 2.5);

    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(tick);
  };

  const api = {
    renderer,
    start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
    /** Mirada normalizada (-1…1), la misma del paralaje. */
    look([x, y]) { look.x = x; look.y = y; },
    /** Toque sobre Alaira: el cabello reacciona y parpadea. */
    poke() { poke = 1; blink.next = performance.now(); },
    /** Toque sobre la estrella: brilla un instante. */
    shine() { starPulse = 1; },
    starPoint: () => ({ x: sx, y: sy }),
    renderOnce() { tick(performance.now()); },
    dispose() { api.stop(); ro.disconnect(); renderer.dispose(); },
    _debug: { rig, spring, head, scene, camera, eyeLayer, draw: () => renderer.render(scene, camera), setEye: (f) => { eyeOverride = f; } },
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) api.stop(); });
  return api;
}
