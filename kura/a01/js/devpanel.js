// Panel de ajustes para desarrollo. No forma parte de la experiencia final:
// se abre con Mayús + D, o con #dev en la dirección.
import { config } from './config.js';
import { applySceneConfig } from './scene.js';
import { motion } from './motion.js';

export function devPanel({ stars, button, hud }) {
  let panel = null;
  const rows = [
    ['Estrellas', [
      ['Intensidad', 0, 2, .05, () => config.stars.intensity, (v) => { config.stars.intensity = v; stars && (stars.uniforms.uIntensity.value = v); }],
      ['Velocidad de destellos', .2, 3, .05, () => config.stars.twinkleSpeed, (v) => { config.stars.twinkleSpeed = v; stars && (stars.uniforms.uTwinkle.value = v); }],
    ]],
    ['Bordes luminosos', [
      ['Botón principal', 0, 1.5, .05, () => config.button.border, (v) => { config.button.border = v; button.setIntensity(v); }],
      ['HUD de cristal', 0, 1.5, .05, () => config.hud.border, (v) => { config.hud.border = v; hud.setIntensity(v); }],
      ['Destellos ópticos (cristal)', 0, 2, .05, () => config.flares.hud.intensity, (v) => { config.flares.hud.intensity = v; }],
      ['Destellos ópticos (botón)', 0, 2, .05, () => config.flares.button.intensity, (v) => { config.flares.button.intensity = v; }],
    ]],
    ['Luces', [
      ['Aura violeta', 0, 1, .01, () => config.lights.violet, (v) => { config.lights.violet = v; applySceneConfig(); }],
      ['Dorada izquierda', 0, 1, .01, () => config.lights.goldLeft, (v) => { config.lights.goldLeft = v; applySceneConfig(); }],
      ['Dorada derecha', 0, 1, .01, () => config.lights.goldRight, (v) => { config.lights.goldRight = v; applySceneConfig(); }],
      ['Azul superior', 0, 1, .01, () => config.lights.blueTop, (v) => { config.lights.blueTop = v; applySceneConfig(); }],
      ['Resplandor del HUD', 0, 1, .01, () => config.lights.hudGlow, (v) => { config.lights.hudGlow = v; applySceneConfig(); }],
    ]],
    ['Nubes', Object.entries(config.clouds).flatMap(([name, c]) => [
      [`${name} · opacidad`, 0, 1, .01, () => c.opacity, (v) => { c.opacity = v; applySceneConfig(); }],
      [`${name} · desenfoque`, 0, 8, .1, () => c.blur, (v) => { c.blur = v; applySceneConfig(); }],
    ])],
  ];
  const open = () => {
    if (panel) { panel.remove(); panel = null; return; }
    panel = document.createElement('aside');
    panel.className = 'dev'; panel.setAttribute('aria-label', 'Ajustes de desarrollo');
    for (const [title, items] of rows) {
      panel.insertAdjacentHTML('beforeend', `<h3>${title}</h3>`);
      for (const [label, min, max, step, get, set] of items) {
        const row = document.createElement('label');
        row.innerHTML = `<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${get()}"><output>${(+get()).toFixed(2)}</output>`;
        const input = row.querySelector('input'), out = row.querySelector('output');
        input.addEventListener('input', () => { set(+input.value); out.textContent = (+input.value).toFixed(2); });
        panel.appendChild(row);
      }
    }
    panel.insertAdjacentHTML('beforeend', `<h3>Movimiento</h3><label><span>Movimiento reducido</span><input type="checkbox" ${motion.reduced ? 'checked' : ''}><output></output></label>
      <div class="row"><button type="button" data-copy>Copiar config</button><button type="button" data-close>Cerrar</button></div>`);
    panel.querySelector('input[type=checkbox]').addEventListener('change', (e) => motion.set(e.target.checked));
    panel.querySelector('[data-close]').addEventListener('click', open);
    panel.querySelector('[data-copy]').addEventListener('click', () => navigator.clipboard?.writeText(JSON.stringify(config, null, 2)).catch(() => {}));
    document.body.appendChild(panel);
  };
  addEventListener('keydown', (e) => { if (e.shiftKey && e.key.toLowerCase() === 'd' && !(e.target instanceof HTMLInputElement)) open(); });
  if (location.hash === '#dev') open();
}
