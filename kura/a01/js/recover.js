// RecoverForm (A03): correo y «Enviar enlace». Al terminar abre A04 · Enlace enviado.
import { auth } from './auth.js';
import { t } from './i18n.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function recoverForm({ stage, sfx, motion, onPrimary, onSent }) {
  const $ = (id) => document.getElementById(id);
  const form = $('form-a03'), cta = $('cta-a03'), msg = $('rc-msg'), email = $('rc-email'), field = $('rc-field-email');
  const coarse = matchMedia('(pointer: coarse)').matches;
  let msgKey = null, quiet = false;
  const say = (key) => { msgKey = key; msg.textContent = t(key); msg.classList.add('is-on'); };
  const clear = () => { msgKey = null; msg.classList.remove('is-on'); msg.textContent = ''; field.classList.remove('is-error'); email.removeAttribute('aria-invalid'); };
  document.addEventListener('kura:lang', () => { if (msgKey) msg.textContent = t(msgKey); });
  email.addEventListener('input', clear);
  email.addEventListener('focus', () => { if (!quiet) sfx('focus'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cta.getAttribute('aria-busy') === 'true') return;
    clear();
    if (!EMAIL_RE.test(email.value.trim())) {
      sfx('error');
      field.classList.add('is-error'); email.setAttribute('aria-invalid', 'true');
      if (!motion.reduced) field.animate([{ translate: '0' }, { translate: '-8px' }, { translate: '7px' }, { translate: '-5px' }, { translate: '3px' }, { translate: '0' }], { duration: 450, easing: 'ease-out' });
      say('errEmail');
      quiet = true; email.focus(); quiet = false;
      return;
    }
    cta.setAttribute('aria-busy', 'true'); cta.setAttribute('aria-label', t('sending'));
    const res = await auth.sendResetLink(email.value.trim());
    cta.removeAttribute('aria-busy'); cta.removeAttribute('aria-label');
    if (res.ok || res.reason === 'demo') { onSent({ demo: !res.ok }); return; }
    sfx('error'); say('errSend');
  });
  cta.addEventListener('click', (e) => { if (cta.getAttribute('aria-busy') !== 'true') onPrimary(e); });

  form.addEventListener('focusin', (e) => {
    if (!(e.target instanceof HTMLInputElement) || !coarse) return;
    stage.classList.add('is-typing');
    setTimeout(() => e.target.closest('.field')?.scrollIntoView({ block: 'center', behavior: motion.reduced ? 'auto' : 'smooth' }), 280);
  });
  form.addEventListener('focusout', () => setTimeout(() => { if (!form.contains(document.activeElement)) stage.classList.remove('is-typing'); }, 60));
  return { reset() { clear(); form.reset(); } };
}
