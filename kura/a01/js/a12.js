// A12 · Alaira, tu guía principal (se llega con «Saltar» en A11).
// Escenario propio: el jardín lunar de Alaira (fondo sin ella) y Alaira recortada encima, animada al estilo Live2D
// con WebGL sobre una sola imagen:
//   · un mapa de pesos (assets/a12/pesos.png: R cabello, G tela, B cabeza) dice cuánto se mueve cada zona;
//   · el cabello y las capas translúcidas de la falda ondean, el torso respira y la cabeza se balancea un poco;
//   · parpadeo con párpados generados con Higgsfield sobre su propia cara (a medio y cerrados), a ritmo natural;
//   · la poción de su mano late con una luz suave.
// Paralaje con cursor o giroscopio (el fondo lejos, Alaira más cerca; la cabeza sigue un poco la mirada).
// Sin WebGL o con «Reducir efectos», queda la ilustración quieta.
const ESC = {
  camara: [18, 11],
  fondo: { src: 'assets/a12/fondo.webp', box: [-50, -31, 1011, 1788], d: [0.08, 0.05] },
  alaira: { src: 'assets/a12/alaira.webp', box: [330, 96, 616, 1060], d: [0.3, 0.16], tex: [1000, 1722] },
  pesos: 'assets/a12/pesos.png',
  parpados: { medio: 'assets/a12/parpadeo-medio.png', cerrado: 'assets/a12/parpadeo-cerrado.png', rect: [0.4012, 0.0788, 0.1752, 0.0374] },
  pocion: [0.248, 0.122], // centro de la luz de la poción (proporción de la capa de Alaira)
};
const box = ([x, y, w, h]) => `left:calc(${x} * var(--v));top:calc(${y} * var(--v));width:calc(${w} * var(--v));height:calc(${h} * var(--v))`;
const depth = ([dx, dy]) => `--dx:${dx};--dy:${dy}`;

const VS = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
const FS = `precision mediump float;
varying vec2 uv;
uniform sampler2D tex,wts,lidH,lidC;
uniform float t,blink;
uniform vec4 eye;
uniform vec2 px,look;
void main(){
  vec3 w=texture2D(wts,uv).rgb;
  vec2 d=vec2(0.);
  d.x+=w.r*(5.5*sin(t*1.15+uv.y*9.)+1.8*sin(t*2.3+uv.y*17.));
  d.y+=w.r*1.4*sin(t*.9+uv.x*7.);
  d.x+=w.g*(6.5*sin(t*1.25+uv.y*7.+uv.x*4.)+1.5*sin(t*2.1+uv.y*13.));
  d.y+=w.g*2.2*cos(t*1.05+uv.x*6.);
  d+=w.b*vec2(1.5*sin(t*.55)+look.x*3.,.9*sin(t*.8)+look.y*1.6);
  float br=smoothstep(.12,.22,uv.y)*(1.-smoothstep(.38,.52,uv.y));
  d.y+=br*1.5*sin(t*1.6);
  vec2 s=uv-d*px;
  vec4 c=texture2D(tex,s);
  vec2 e=(s-eye.xy)/eye.zw;
  if(blink>.01&&e.x>0.&&e.x<1.&&e.y>0.&&e.y<1.){
    vec4 h=texture2D(lidH,e);
    if(blink<=1.){c=c*(1.-h.a*blink)+h*blink;}
    else{vec4 k=texture2D(lidC,e);float b=blink-1.;c=c*(1.-h.a)+h;c=c*(1.-k.a*b)+k*b;}
  }
  gl_FragColor=c;
}`;

function makeRig(canvas, imgs) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const texture = (img, unit, name) => {
    const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    gl.uniform1i(gl.getUniformLocation(prog, name), unit);
  };
  texture(imgs.tex, 0, 'tex'); texture(imgs.wts, 1, 'wts'); texture(imgs.lidH, 2, 'lidH'); texture(imgs.lidC, 3, 'lidC');
  const U = (n) => gl.getUniformLocation(prog, n);
  const uT = U('t'), uBlink = U('blink'), uLook = U('look');
  gl.uniform4fv(U('eye'), ESC.parpados.rect);
  gl.uniform2f(U('px'), 1 / ESC.alaira.tex[0], 1 / ESC.alaira.tex[1]);
  gl.clearColor(0, 0, 0, 0);
  return {
    fit() {
      const r = canvas.getBoundingClientRect(); if (!r.width) return;
      const q = Math.min(2, devicePixelRatio || 1), W = Math.round(r.width * q), H = Math.round(r.height * q);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H); }
    },
    draw(t, blink, look) {
      gl.uniform1f(uT, t); gl.uniform1f(uBlink, blink); gl.uniform2f(uLook, look[0], look[1]);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

const load = (src) => new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src; });

export function mountA12({ stage, motion }) {
  let root = null, built = false, active = false, rig = null, raf = 0, ready = null, last = 0;
  let blinkT0 = 0, blinkNext = 0, blinkLen = 260, held = null;
  const lookN = [0, 0];

  function build() {
    if (built) return;
    built = true;
    const F = ESC.fondo, A = ESC.alaira, [px, py] = ESC.pocion;
    root = document.createElement('div');
    root.className = 'scene12'; root.id = 'scene-a12'; root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `<div class="a6-layer a12-fondo" style="${box(F.box)};${depth(F.d)}"><img src="${F.src}" alt="" decoding="async" draggable="false"></div>
      <div class="a6-layer a12-alaira" style="${box(A.box)};${depth(A.d)}">
        <img class="a12-alaira-img" src="${A.src}" alt="" decoding="async" draggable="false">
        <canvas class="a12-rig"></canvas>
        <i class="a12-sombra" aria-hidden="true"></i>
        <i class="a12-pocion" style="left:${px * 100}%;top:${py * 100}%"></i>
      </div>`;
    stage.querySelector('#scene').after(root);
    new ResizeObserver(() => rig?.fit()).observe(root);
  }
  function prefetch() { const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500)); idle(() => build(), { timeout: 9000 }); }
  function prepare() {
    build();
    ready ??= Promise.all([load(ESC.alaira.src), load(ESC.pesos), load(ESC.parpados.medio), load(ESC.parpados.cerrado), load(ESC.fondo.src)])
      .then(([tex, wts, lidH, lidC]) => {
        try { rig = makeRig(root.querySelector('.a12-rig'), { tex, wts, lidH, lidC }); } catch { rig = null; }
        if (rig) { root.classList.add('has-rig'); rig.fit(); rig.draw(0, 0, [0, 0]); }
      }).catch(() => {});
    return ready;
  }

  // parpadeo: cierra rápido, sostiene un instante y abre despacio; a veces doble
  const schedule = (now) => { blinkNext = now + 2200 + Math.random() * 3800; };
  function blinkAmount(now) {
    if (!blinkT0) { if (now >= blinkNext) { blinkT0 = now; blinkLen = Math.random() < 0.2 ? 420 : 260; } else return 0; }
    const e = (now - blinkT0) / blinkLen;
    if (e >= 1) { blinkT0 = 0; schedule(now); if (Math.random() < 0.15) blinkNext = now + 180; return 0; }
    return e < 0.32 ? (e / 0.32) * 2 : e < 0.45 ? 2 : 2 * (1 - (e - 0.45) / 0.55);
  }

  function frame(now) {
    raf = 0;
    if (!active || document.hidden || !rig) return;
    if (now - last >= 32) { last = now; rig.draw(now / 1000, held ?? (motion.reduced ? 0 : blinkAmount(now)), lookN); }
    if (!motion.reduced) raf = requestAnimationFrame(frame);
  }
  const run = () => { if (!raf && active && !document.hidden) raf = requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
  motion.onChange?.((r) => { if (r) { look([0, 0]); rig?.draw(0, 0, [0, 0]); } else run(); });

  function look([x, y]) {
    if (!root) return;
    const r = motion.reduced, nx = r ? 0 : Math.max(-1, Math.min(1, x)), ny = r ? 0 : Math.max(-1, Math.min(1, y));
    root.style.setProperty('--cx', (-nx * ESC.camara[0]).toFixed(3));
    root.style.setProperty('--cy', (-ny * ESC.camara[1]).toFixed(3));
    lookN[0] = nx; lookN[1] = ny;
  }

  // tocar a Alaira: parpadea
  stage.addEventListener('pointerdown', (e) => {
    if (!active || e.target.closest('button, a, .panel')) return;
    const r = root.querySelector('.a12-alaira').getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom * 0.5 + r.top * 0.5) { blinkNext = performance.now(); run(); }
  });

  return {
    prepare, prefetch, look,
    get el() { return root; },
    get active() { return active; },
    get animated() { return !!rig; },
    enter() { prepare().then(() => { rig?.fit(); run(); }); active = true; root.classList.add('is-on'); schedule(performance.now()); run(); },
    leave() { active = false; root?.classList.remove('is-on'); if (raf) cancelAnimationFrame(raf); raf = 0; },
    _debug: { blink: () => { blinkNext = performance.now(); run(); }, hold: (b) => { held = b; run(); } },
  };
}
