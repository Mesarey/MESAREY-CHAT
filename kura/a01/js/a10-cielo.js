// A10 · Cielo vivo en WebGL (sin librerías): la ilustración del fondo con
//   · la aurora boreal ondulando y con luz que recorre sus cortinas,
//   · las estrellas titilando cada una a su ritmo (y algunas grandes con destello en cruz),
//   · el lago con ondas suaves y reflejos que chispean,
//   · el halo de la luna llena que respira.
// Un mapa (assets/a10/mapas.png) dice dónde está cada cosa: rojo = aurora, verde = lago, azul = estrellas.
// Ligero: un solo dibujo por cuadro, a 30 cuadros por segundo, y la resolución baja sola si el teléfono va lento.

const VS = `attribute vec2 p; varying vec2 vUv;
void main() { vUv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;

const FS = (n) => `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uP, uM;
uniform float uT;
uniform vec4 uS[${n}];
uniform vec3 uMoon;
const vec2 PX = vec2(944., 755.);
float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  vec4 m = texture2D(uM, uv);
  float a = m.r, l = m.g, t = uT;
  // aurora: las cortinas ondulan despacio (dos ondas que se cruzan)
  vec2 d = vec2(sin(uv.y * 16. + t * .55 + sin(uv.x * 5. + t * .2) * 1.5) * .0045 + sin(uv.y * 41. - t * .9) * .0015,
                sin(uv.x * 12. + t * .45) * .003) * a;
  // lago: ondas finas horizontales
  d.x += l * (sin(uv.y * 260. + t * 1.3) * .0011 + sin(uv.y * 97. - t * .8) * .0009);
  vec3 c = texture2D(uP, uv + d).rgb;
  // luz que recorre la aurora
  float w1 = .5 + .5 * sin(uv.x * 9. - uv.y * 4. + t * .7), w2 = .5 + .5 * sin(uv.x * 23. + uv.y * 7. - t * 1.1);
  c += c * a * (w1 * .3 + w2 * .12 - .13);
  // reflejos del lago que chispean
  float lum = dot(c, vec3(.299, .587, .114));
  c += l * smoothstep(.5, .9, lum) * max(0., sin(uv.y * 420. + t * 2.2 + sin(uv.x * 30.) * 3.)) * .22;
  // estrellas pequeñas: cada una titila con su propia fase
  vec2 cell = floor(uv * vec2(118., 94.));
  float tw = .5 + .5 * sin(t * (.6 + hash(cell + 7.) * 1.8) + hash(cell) * 6.283);
  c *= 1. + m.b * (tw * tw * 1.1 - .38); // nunca más oscuras que el cielo
  // halo de la luna que respira
  float md = length((uv - uMoon.xy) * PX), mr = uMoon.z * PX.x;
  c += vec3(1., .92, .76) * smoothstep(mr * 3., mr * .95, md) * (.06 + .045 * sin(t * .8));
  // estrellas grandes: destello en cruz
  for (int i = 0; i < ${n}; i++) {
    vec4 s = uS[i];
    vec2 q = (uv - s.xy) * PX;
    float r = length(q), k = .5 + .5 * sin(t * (.7 + s.w * 1.3) + s.w * 40.);
    float cr = exp(-abs(q.x) * 1.1 - abs(q.y) * .16) + exp(-abs(q.y) * 1.1 - abs(q.x) * .16);
    c += vec3(1., .96, .9) * s.z * k * k * (exp(-r * .75) * .8 + cr * .32);
  }
  gl_FragColor = vec4(c, 1.);
}`;

const load = (src) => new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src; });

/**
 * @param {{ canvas: HTMLCanvasElement, fondo: string, mapas: string, estrellas: number[][], luna: number[] }} o
 */
export async function createSky({ canvas, fondo, mapas, estrellas, luna }) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) throw new Error('sin WebGL');
  const [imgP, imgM] = await Promise.all([load(fondo), load(mapas)]);
  const N = estrellas.length;
  let prog, uT, ready = false;

  function init() {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS(N)));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = (im, unit) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    };
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE); // el mapa son datos, no colores
    tex(imgP, 0); tex(imgM, 1);
    gl.uniform1i(gl.getUniformLocation(prog, 'uP'), 0); gl.uniform1i(gl.getUniformLocation(prog, 'uM'), 1);
    gl.uniform4fv(gl.getUniformLocation(prog, 'uS'), new Float32Array(estrellas.flatMap(([x, y, b], i) => [x, y, b * .9, ((i * 0.6180339) % 1)])));
    gl.uniform3f(gl.getUniformLocation(prog, 'uMoon'), ...luna);
    uT = gl.getUniformLocation(prog, 'uT');
    ready = true;
  }
  init();

  // Resolución: como mucho 1.5 por píxel de pantalla y nunca más que la textura del fondo.
  let quality = Math.min(1.5, devicePixelRatio || 1);
  function size() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return false;
    const q = Math.min(quality, 1260 / r.width);
    const W = Math.max(2, Math.round(r.width * q)), H = Math.max(2, Math.round(r.height * q));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H); }
    return true;
  }
  function draw(now) {
    if (!ready || gl.isContextLost()) return;
    gl.uniform1f(uT, (now / 1000) % 3600);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // Si el teléfono se atrasa (cuadros de más de 50 ms seguidos), se baja la resolución un paso.
  let slow = 0;
  function adapt(dt) {
    if (dt > 50 && dt < 400) slow++; else slow = Math.max(0, slow - 0.5);
    if (slow > 24 && quality > 0.75) { quality = Math.max(0.75, quality - 0.25); slow = 0; size(); }
  }

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); ready = false; canvas.style.opacity = 0; });
  canvas.addEventListener('webglcontextrestored', () => { try { init(); size(); canvas.style.opacity = ''; } catch (err) { console.warn('A10: cielo sin WebGL', err); } });

  return { size, draw, adapt, get quality() { return quality; } };
}
