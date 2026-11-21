// MotionSettings: decide si las animaciones van completas o reducidas.
// Respeta la preferencia del sistema y la opción «Reducir efectos» de la página.
const media = matchMedia('(prefers-reduced-motion: reduce)');
let userChoice = null;
try { const v = localStorage.getItem('kura.reduceFx'); if (v !== null) userChoice = v === '1'; } catch {}

const listeners = new Set();
export const motion = {
  get reduced() { return userChoice ?? media.matches; },
  set(reduced) {
    userChoice = reduced;
    try { localStorage.setItem('kura.reduceFx', reduced ? '1' : '0'); } catch {}
    apply();
  },
  onChange(fn) { listeners.add(fn); },
};
function apply() {
  document.documentElement.classList.toggle('reduce-motion', motion.reduced);
  listeners.forEach((fn) => fn(motion.reduced));
}
media.addEventListener('change', apply);
apply();
