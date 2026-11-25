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
    build: 'KURA_001 · Versión MVP', a06Title: '¡Hola! Soy Alaira', a06Guide: 'Estoy aquí para guiarte', a06Question: 'Un nuevo tú te espera',
    a06Start: 'Empezar', voice: 'Voz de Alaira',
    a07Title: '¿Cómo te llamo?', a07Info: 'Usaré tu nombre para crear afirmaciones y planes solo para ti.', a07Label: 'Tu nombre',
    a07Continue: 'Continuar', a07Empty: 'Escribe cómo quieres que te llame.',
    a07Hello1: '¡Encantada,', a07Hello2: '{nombre}!', a07Next: 'La siguiente pantalla llega en la próxima fase.',
    a08Title1: '¿Cuál es tu fecha', a08Title2: 'de nacimiento?', a08Day: 'Día', a08Month: 'Mes', a08Year: 'Año', a08Pick: '—',
    a08Age: 'Tu edad:', a08Years: '{n} años', a08Year1: '1 año', a08Empty: 'Elige tu día, mes y año de nacimiento.', a08Future: 'Esa fecha todavía no llega.',
    a08Months: 'Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre',
    a09Title: '¿Cómo te identificas?', a09Woman: 'Mujer', a09Man: 'Hombre', a09Other: 'Otra identidad', a09None: 'Prefiero no decirlo', a09Empty: 'Elige una opción para continuar.',
    a10Title1: '¿Qué te motiva a cambiar', a10Title2: 'tu Aura?', a10Hint: 'Elige una o varias',
    a10o1: 'Sentirme mejor conmigo', a10o2: 'Calmar mi ansiedad', a10o3: 'Cuidar más mi cuerpo', a10o4: 'Avanzar hacia mis metas',
    a10o5: 'Comenzar a manifestar', a10o6: 'Aprender habilidades sociales', a10o7: 'No sé todavía. Quiero descubrirlo',
    a10Empty: 'Elige al menos una opción o toca Omitir.', a10Skip: 'Omitir',
    a11Eyebrow: 'Tu viaje comienza', a11Title1: '¿Listo para', a11Title1F: '¿Lista para', a11Title1N: '¿Todo listo', a11Title2: 'KURA?', a11Title2F: 'KURA?', a11Title2N: 'para KURA?',
    a11Sub: 'Ellos también te esperan.', a11Tour: 'Iniciar el tour', a11Skip: 'Saltar', a11Meet: 'Conoce a {nombre} y su mundo',
    a11Soon: 'El tour llega en la próxima fase.',
    a12Eyebrow: 'Tu guía principal', a12Title: 'Alaira', a12Sub: 'Compasiva. Te acompaña cada día.',
    a12F1: 'Afirmaciones de gratitud', a12F2: 'Inteligencia emocional', a12F3: 'Rituales de ritmo emocional', a12F4: 'Soundscape y contemplación', a12F5: 'Arcanos y tarot', a12F6: 'Horóscopo del día',
    a12Camino: 'Tu camino: rachas, medallas, outfits y paisajes que desbloqueas', a12Cta: 'Entrar al mundo de Alaira', a12Soon: 'El mundo de Alaira llega en la próxima fase.',
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
    build: 'KURA_001 · MVP version', a06Title: 'Hi! I’m Alaira', a06Guide: 'I’m here to guide you', a06Question: 'A new you awaits',
    a06Start: 'Start', voice: 'Alaira’s voice',
    a07Title: 'What’s your name?', a07Info: 'I’ll use your name to create affirmations and plans just for you.', a07Label: 'Your name',
    a07Continue: 'Continue', a07Empty: 'Type what you’d like me to call you.',
    a07Hello1: 'Lovely to meet you,', a07Hello2: '{nombre}!', a07Next: 'The next screen comes in the next phase.',
    a08Title1: 'What’s your', a08Title2: 'date of birth?', a08Day: 'Day', a08Month: 'Month', a08Year: 'Year', a08Pick: '—',
    a08Age: 'Your age:', a08Years: '{n} years', a08Year1: '1 year', a08Empty: 'Choose your day, month and year of birth.', a08Future: 'That date hasn’t come yet.',
    a08Months: 'January,February,March,April,May,June,July,August,September,October,November,December',
    a09Title: 'How do you identify?', a09Woman: 'Woman', a09Man: 'Man', a09Other: 'Another identity', a09None: 'Prefer not to say', a09Empty: 'Choose an option to continue.',
    a10Title1: 'What motivates you', a10Title2: 'to change your Aura?', a10Hint: 'Choose one or more',
    a10o1: 'Feel better about myself', a10o2: 'Calm my anxiety', a10o3: 'Take better care of my body', a10o4: 'Move toward my goals',
    a10o5: 'Start manifesting', a10o6: 'Learn social skills', a10o7: "I don't know yet. I want to find out",
    a10Empty: 'Choose at least one option, or tap Skip.', a10Skip: 'Skip',
    a11Eyebrow: 'Your journey begins', a11Title1: 'Ready for', a11Title1F: 'Ready for', a11Title1N: 'Ready for', a11Title2: 'KURA?', a11Title2F: 'KURA?', a11Title2N: 'KURA?',
    a11Sub: 'They’re waiting for you too.', a11Tour: 'Start the tour', a11Skip: 'Skip', a11Meet: 'Meet {nombre} and their world',
    a11Soon: 'The tour arrives in the next phase.',
    a12Eyebrow: 'Your main guide', a12Title: 'Alaira', a12Sub: 'Compassionate. With you every day.',
    a12F1: 'Gratitude affirmations', a12F2: 'Emotional intelligence', a12F3: 'Emotional rhythm rituals', a12F4: 'Soundscape & contemplation', a12F5: 'Arcana & tarot', a12F6: 'Daily horoscope',
    a12Camino: 'Your path: streaks, medals, outfits and landscapes to unlock', a12Cta: "Enter Alaira's world", a12Soon: "Alaira's world arrives in the next phase.",
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
