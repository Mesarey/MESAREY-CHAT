// SignupForm (A02): correo, contraseña y confirmación; luego la ventana de términos.
import { auth } from './auth.js';
import { t } from './i18n.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASS = 8;

export function signupForm({ stage, sfx, motion, legal, onPrimary, onGranted }) {
  const $ = (id) => document.getElementById(id);
  const form = $('form-a02'), cta = $('cta-a02'), msg = $('su-msg');
  const email = $('su-email'), pass = $('su-pass'), pass2 = $('su-pass2');
  const fEmail = $('su-field-email'), fPass = $('su-field-pass'), fPass2 = $('su-field-pass2');
  const fields = [[email, fEmail], [pass, fPass], [pass2, fPass2]];
  const coarse = matchMedia('(pointer: coarse)').matches;
  let msgKey = null, quietFocus = false;

  const say = (key, kind = 'error') => { msgKey = key; msg.textContent = t(key); msg.classList.add('is-on'); msg.classList.toggle('is-info', kind === 'info'); };
  const clear = () => { msgKey = null; msg.classList.remove('is-on'); msg.textContent = ''; for (const [i, f] of fields) { f.classList.remove('is-error'); i.removeAttribute('aria-invalid'); } };
  const shake = (el) => { if (!motion.reduced) el.animate([{ translate: '0' }, { translate: '-8px' }, { translate: '7px' }, { translate: '-5px' }, { translate: '3px' }, { translate: '0' }], { duration: 450, easing: 'ease-out' }); };
  const mark = (input, field) => { field.classList.add('is-error'); input.setAttribute('aria-invalid', 'true'); shake(field); };
  document.addEventListener('kura:lang', () => { if (msgKey) msg.textContent = t(msgKey); });
  fields.forEach(([i]) => i.addEventListener('input', clear));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cta.getAttribute('aria-busy') === 'true') return;
    clear();
    const badEmail = !EMAIL_RE.test(email.value.trim());
    const badPass = pass.value.length < MIN_PASS;
    const mismatch = !badPass && pass.value !== pass2.value;
    if (badEmail || badPass || mismatch) {
      sfx(!email.value.trim() || !pass.value || !pass2.value ? 'decline' : 'error'); // campo vacío: aviso de «falta un dato»
      if (badEmail) mark(email, fEmail);
      if (badPass) mark(pass, fPass);
      if (mismatch) mark(pass2, fPass2);
      say(badEmail && (badPass || mismatch) ? 'errSignupBoth' : badEmail ? 'errEmail' : badPass ? 'errPassShort' : 'errMismatch');
      quietFocus = true; (badEmail ? email : badPass ? pass : pass2).focus(); quietFocus = false;
      return;
    }
    // Términos antes de crear la cuenta: casilla sin marcar por defecto.
    const accepted = await legal.accept();
    if (!accepted) return;
    cta.setAttribute('aria-busy', 'true');
    cta.setAttribute('aria-label', t('creating'));
    const res = await auth.signUpWithEmail(email.value.trim(), pass.value);
    cta.removeAttribute('aria-busy');
    cta.removeAttribute('aria-label');
    // Cuenta creada → entra a A06 · Bienvenida con Alaira (mismo sonido que al iniciar sesión).
    if (res.ok || res.reason === 'demo') { sfx('granted'); onGranted?.('signup'); return; } // demo: entra igual a A06
    sfx('error'); say('errSignUp');
  });

  cta.addEventListener('click', (e) => { if (cta.getAttribute('aria-busy') !== 'true') onPrimary(e); });

  form.querySelectorAll('[data-eye]').forEach((eye) => eye.addEventListener('click', () => {
    const input = $(eye.dataset.eye), show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    eye.setAttribute('aria-label', t(show ? 'hidePass' : 'showPass'));
    sfx('focus');
    quietFocus = true; input.focus({ preventScroll: true }); quietFocus = false;
  }));
  fields.forEach(([i]) => i.addEventListener('focus', () => { if (!quietFocus) sfx('focus'); }));

  form.addEventListener('focusin', (e) => {
    if (!(e.target instanceof HTMLInputElement) || !coarse) return;
    stage.classList.add('is-typing');
    setTimeout(() => e.target.closest('.field')?.scrollIntoView({ block: 'center', behavior: motion.reduced ? 'auto' : 'smooth' }), 280);
  });
  form.addEventListener('focusout', () => setTimeout(() => { if (!form.contains(document.activeElement)) stage.classList.remove('is-typing'); }, 60));

  return { reset() { clear(); form.reset(); form.querySelectorAll('[data-eye]').forEach((eye) => { $(eye.dataset.eye).type = 'password'; eye.setAttribute('aria-pressed', 'false'); }); } };
}
