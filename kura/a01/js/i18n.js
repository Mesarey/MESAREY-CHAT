// Textos de A01 en español e inglés.
const STRINGS = {
  es: {
    pageTitle: 'KURA · Iniciar sesión',
    title1: 'Un nuevo tú,', title2: 'Un nuevo mundo', welcome: 'Conoce tu aura',
    email: 'Correo electrónico', password: 'Contraseña', forgot: 'Olvidé mi contraseña',
    signIn: 'Iniciar sesión', or: 'o', google: 'Continuar con Google',
    firstTime: '¿Primera vez aquí?', createAccount: 'Crear cuenta',
    terms: 'Términos', privacy: 'Privacidad',
    otherLang: 'English', reduceFx: 'Reducir efectos', fullFx: 'Efectos completos',
    soundMenu: 'Sonido', music: 'Música', effects: 'Efectos de sonido',
    legalTerms: 'Términos y condiciones', legalPrivacy: 'Aviso de privacidad',
    forgotTitle: 'Recuperar contraseña', forgotSubtitle: 'Te enviaremos un enlace para restablecerla.', sendLink: 'Enviar enlace', sending: 'Enviando enlace…',
    backToSignIn: 'Volver a iniciar sesión', sentTitle: 'Enlace enviado',
    sentText: 'Si el correo está asociado a una cuenta, recibirás un enlace para restablecer tu contraseña.', sentDemo: 'Demo: todavía no se envía ningún correo.',
    errSend: 'No pudimos enviar el enlace. Inténtalo de nuevo.', restoring: 'Restaurando sesión…',
    signupTitle: 'Crea tu cuenta', signupSubtitle: 'Tu camino en KURA comienza aquí.', confirmPassword: 'Confirmar contraseña',
    createAccountCta: 'Crear cuenta', haveAccount: '¿Ya tienes cuenta?',
    errPassShort: 'Tu contraseña necesita al menos 8 caracteres.', errMismatch: 'Las contraseñas no coinciden.', errSignupBoth: 'Revisa tu correo y tu contraseña.',
    creating: 'Creando cuenta…', demoSignUp: 'Demo: cuenta creada. Aquí se abrirá A06 · Bienvenida con Alaira.', errSignUp: 'No pudimos crear tu cuenta. Inténtalo de nuevo.',
    legalWindow: 'Términos y privacidad', legalWindowText: 'Conoce las condiciones de uso de KURA y cómo se tratará tu información.',
    acceptTerms: 'He leído y acepto los Términos y condiciones.', acceptContinue: 'Aceptar y continuar', back: 'Volver',
    legalNote: 'Documentos en preparación. No introduzcas datos personales reales.',
    seePrivacy: 'Ver aviso de privacidad', seeTerms: 'Ver términos y condiciones', close: 'Cerrar',
    showPass: 'Mostrar contraseña', hidePass: 'Ocultar contraseña',
    errBoth: 'Revisa tu correo y tu contraseña.', errEmail: 'Escribe un correo válido.',
    errPass: 'Tu contraseña necesita al menos 6 caracteres.',
    errLogin: 'No pudimos iniciar sesión. Revisa tus datos.',
    loading: 'Iniciando sesión…',
    demoSignIn: 'Demo: acceso concedido. Aquí se abrirá A06 · Bienvenida con Alaira.',
    soonGoogle: 'Continuar con Google: se conectará en la integración real.',
    soon: 'Próximamente',
  },
  en: {
    pageTitle: 'KURA · Sign in',
    title1: 'A new you,', title2: 'A new world', welcome: 'Know your aura',
    email: 'Email', password: 'Password', forgot: 'Forgot my password',
    signIn: 'Sign in', or: 'or', google: 'Continue with Google',
    firstTime: 'First time here?', createAccount: 'Create account',
    terms: 'Terms', privacy: 'Privacy',
    otherLang: 'Español', reduceFx: 'Reduce effects', fullFx: 'Full effects',
    soundMenu: 'Sound', music: 'Music', effects: 'Sound effects',
    legalTerms: 'Terms and conditions', legalPrivacy: 'Privacy notice',
    forgotTitle: 'Reset password', forgotSubtitle: 'We’ll send you a link to reset it.', sendLink: 'Send link', sending: 'Sending link…',
    backToSignIn: 'Back to sign in', sentTitle: 'Link sent',
    sentText: 'If the email is linked to an account, you’ll receive a link to reset your password.', sentDemo: 'Demo: no email is sent yet.',
    errSend: 'We couldn’t send the link. Please try again.', restoring: 'Restoring session…',
    signupTitle: 'Create your account', signupSubtitle: 'Your path in KURA begins here.', confirmPassword: 'Confirm password',
    createAccountCta: 'Create account', haveAccount: 'Already have an account?',
    errPassShort: 'Your password needs at least 8 characters.', errMismatch: 'Passwords don’t match.', errSignupBoth: 'Check your email and password.',
    creating: 'Creating account…', demoSignUp: 'Demo: account created. A06 · Welcome with Alaira will open here.', errSignUp: 'We couldn’t create your account. Please try again.',
    legalWindow: 'Terms and privacy', legalWindowText: 'Learn about KURA’s terms of use and how your information will be handled.',
    acceptTerms: 'I have read and accept the Terms and conditions.', acceptContinue: 'Accept and continue', back: 'Back',
    legalNote: 'Documents in preparation. Do not enter real personal data.',
    seePrivacy: 'View privacy notice', seeTerms: 'View terms and conditions', close: 'Close',
    showPass: 'Show password', hidePass: 'Hide password',
    errBoth: 'Check your email and password.', errEmail: 'Enter a valid email.',
    errPass: 'Your password needs at least 6 characters.',
    errLogin: 'We couldn’t sign you in. Check your details.',
    loading: 'Signing in…',
    demoSignIn: 'Demo: access granted. A06 · Welcome with Alaira will open here.',
    soonGoogle: 'Continue with Google will be connected in the real integration.',
    soon: 'Coming soon',
  },
};

/** Idioma del teléfono: español → español; inglés o cualquier otro (italiano, francés…) → inglés. */
export const deviceLang = () => {
  const list = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
  return String(list[0] || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
};

const pick = () => {
  if (location.hash === '#en') return 'en';
  if (location.hash === '#es') return 'es';
  try {
    localStorage.removeItem('kura.lang'); // versiones anteriores guardaban el idioma para siempre
    const chosen = sessionStorage.getItem('kura.lang'); // cambio manual: dura mientras la app está abierta
    if (chosen in STRINGS) return chosen;
  } catch {}
  return deviceLang();
};

let lang = pick();
export const t = (key) => STRINGS[lang][key] ?? STRINGS.es[key] ?? key;
export const currentLang = () => lang;

/** Pinta los textos de la página. Los elementos llevan data-i18n="clave" o data-i18n-attr="atributo:clave". */
export function applyLanguage(next = lang, { manual = false } = {}) {
  lang = next;
  if (manual) { try { sessionStorage.setItem('kura.lang', lang); } catch {} }
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(',').forEach((pair) => { const [attr, key] = pair.split(':'); el.setAttribute(attr, t(key)); });
  });
  document.dispatchEvent(new CustomEvent('kura:lang', { detail: lang }));
}
