// LoginForm: validación, estados de error / enfoque / carga, mostrar contraseña y teclado.
import { auth } from './auth.js';
import { t } from './i18n.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function loginForm({ stage, sfx, onPrimary, toast, motion }) {
  const form = document.getElementById('form');
  const email = document.getElementById('email'), pass = document.getElementById('pass');
  const fEmail = document.getElementById('field-email'), fPass = document.getElementById('field-pass');
  const msg = document.getElementById('form-msg');
  const cta = document.getElementById('cta'), eye = document.getElementById('eye');
  const coarse = matchMedia('(pointer: coarse)').matches;

  const say = (text, kind = 'error') => { msg.textContent = text; msg.classList.add('is-on'); msg.classList.toggle('is-info', kind === 'info'); };
  const clear = () => { msg.classList.remove('is-on'); msg.textContent = ''; fEmail.classList.remove('is-error'); fPass.classList.remove('is-error'); email.removeAttribute('aria-invalid'); pass.removeAttribute('aria-invalid'); };
  const shake = (el) => { if (!motion.reduced) el.animate([{ translate: '0' }, { translate: '-8px' }, { translate: '7px' }, { translate: '-5px' }, { translate: '3px' }, { translate: '0' }], { duration: 450, easing: 'ease-out' }); };
  [email, pass].forEach((i) => i.addEventListener('input', clear));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cta.getAttribute('aria-busy') === 'true') return; // sin envíos duplicados
    clear();
    const badEmail = !EMAIL_RE.test(email.value.trim()), badPass = pass.value.length < 6;
    if (badEmail || badPass) {
      sfx('error');
      if (badEmail) { fEmail.classList.add('is-error'); email.setAttribute('aria-invalid', 'true'); shake(fEmail); }
      if (badPass) { fPass.classList.add('is-error'); pass.setAttribute('aria-invalid', 'true'); shake(fPass); }
      say(t(badEmail && badPass ? 'errBoth' : badEmail ? 'errEmail' : 'errPass'));
      (badEmail ? email : pass).focus();
      return;
    }
    cta.setAttribute('aria-busy', 'true');
    cta.setAttribute('aria-label', t('loading'));
    const res = await auth.signInWithEmail(email.value.trim(), pass.value);
    cta.removeAttribute('aria-busy');
    cta.removeAttribute('aria-label');
    if (res.ok) return; // aquí se navegaría a A05 / Hoy
    say(t('demoSignIn'), 'info');
  });

  cta.addEventListener('click', (e) => { if (cta.getAttribute('aria-busy') !== 'true') onPrimary(e); });

  eye.addEventListener('click', () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    eye.setAttribute('aria-label', t(show ? 'hidePass' : 'showPass'));
    sfx('toggle');
    pass.focus({ preventScroll: true });
  });

  document.getElementById('google').addEventListener('click', async () => {
    sfx('tap');
    const r = await auth.signInWithGoogle();
    if (!r.ok) toast(t('soonGoogle'));
  });

  [email, pass].forEach((i) => i.addEventListener('focus', () => sfx('focus')));

  // Teclado virtual: centrar el campo y atenuar la ilustración.
  form.addEventListener('focusin', (e) => {
    if (!(e.target instanceof HTMLInputElement) || !coarse) return;
    stage.classList.add('is-typing');
    setTimeout(() => e.target.closest('.field')?.scrollIntoView({ block: 'center', behavior: motion.reduced ? 'auto' : 'smooth' }), 280);
  });
  form.addEventListener('focusout', () => setTimeout(() => { if (!form.contains(document.activeElement)) stage.classList.remove('is-typing'); }, 60));
}
