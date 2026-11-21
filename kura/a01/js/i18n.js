// Textos de A01 en español e inglés.
const STRINGS = {
  es: {
    pageTitle: 'KURA · Iniciar sesión',
    title1: 'Un nuevo tu,', title2: 'Un nuevo mundo', welcome: 'Bienvenido a Kura',
    email: 'Correo electrónico', password: 'Contraseña', forgot: 'Olvidé mi contraseña',
    signIn: 'Iniciar sesión', or: 'o', google: 'Continuar con Google',
    firstTime: '¿Primera vez aquí?', createAccount: 'Crear cuenta',
    terms: 'Términos', privacy: 'Privacidad',
    otherLang: 'English', reduceFx: 'Reducir efectos', fullFx: 'Efectos completos',
    soundMenu: 'Sonido', music: 'Música', effects: 'Efectos de sonido',
    legalTerms: 'Términos y condiciones', legalPrivacy: 'Aviso de privacidad', legalLangNote: '',
    legalNote: 'Documentos en preparación. No introduzcas datos personales reales.',
    seePrivacy: 'Ver aviso de privacidad', seeTerms: 'Ver términos y condiciones', close: 'Cerrar',
    showPass: 'Mostrar contraseña', hidePass: 'Ocultar contraseña',
    errBoth: 'Revisa tu correo y tu contraseña.', errEmail: 'Escribe un correo válido.',
    errPass: 'Tu contraseña necesita al menos 6 caracteres.',
    errLogin: 'No pudimos iniciar sesión. Revisa tus datos.',
    loading: 'Iniciando sesión…',
    demoSignIn: 'Demo: el inicio de sesión todavía no está conectado.',
    soonGoogle: 'Continuar con Google: se conectará en la integración real.',
    soon: 'Próximamente',
  },
  en: {
    pageTitle: 'KURA · Sign in',
    title1: 'A new you,', title2: 'A new world', welcome: 'Welcome to Kura',
    email: 'Email', password: 'Password', forgot: 'Forgot my password',
    signIn: 'Sign in', or: 'or', google: 'Continue with Google',
    firstTime: 'First time here?', createAccount: 'Create account',
    terms: 'Terms', privacy: 'Privacy',
    otherLang: 'Español', reduceFx: 'Reduce effects', fullFx: 'Full effects',
    soundMenu: 'Sound', music: 'Music', effects: 'Sound effects',
    legalTerms: 'Terms and conditions', legalPrivacy: 'Privacy notice', legalLangNote: 'For now these documents are available in Spanish only.',
    legalNote: 'Documents in preparation. Do not enter real personal data.',
    seePrivacy: 'View privacy notice', seeTerms: 'View terms and conditions', close: 'Close',
    showPass: 'Show password', hidePass: 'Hide password',
    errBoth: 'Check your email and password.', errEmail: 'Enter a valid email.',
    errPass: 'Your password needs at least 6 characters.',
    errLogin: 'We couldn’t sign you in. Check your details.',
    loading: 'Signing in…',
    demoSignIn: 'Demo: sign-in is not connected yet.',
    soonGoogle: 'Continue with Google will be connected in the real integration.',
    soon: 'Coming soon',
  },
};

const pick = () => {
  if (location.hash === '#en') return 'en';
  if (location.hash === '#es') return 'es';
  try { const saved = localStorage.getItem('kura.lang'); if (saved in STRINGS) return saved; } catch {}
  return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
};

let lang = pick();
export const t = (key) => STRINGS[lang][key] ?? STRINGS.es[key] ?? key;
export const currentLang = () => lang;

/** Pinta los textos de la página. Los elementos llevan data-i18n="clave" o data-i18n-attr="atributo:clave". */
export function applyLanguage(next = lang) {
  lang = next;
  try { localStorage.setItem('kura.lang', lang); } catch {}
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(',').forEach((pair) => { const [attr, key] = pair.split(':'); el.setAttribute(attr, t(key)); });
  });
  document.dispatchEvent(new CustomEvent('kura:lang', { detail: lang }));
}
