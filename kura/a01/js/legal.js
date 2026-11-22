// Textos legales de prototipo (KURA_Textos_Legales_Prototipo). No son documentos definitivos.
// Los campos en blanco se mantienen así a propósito: no se inventan datos del responsable.
const BLANK = '____________________';

const LEGAL_ES = {
  terms: {
    title: 'Términos y condiciones',
    updated: `Última actualización: ${BLANK}`,
    intro: 'Bienvenido a KURA. Estos términos describen las condiciones de uso de nuestra aplicación y del sitio KURA World.',
    sections: [
      ['1. Responsable', ['KURA es un proyecto independiente operado por:', `Nombre legal: ${BLANK}`, `Correo de soporte: ${BLANK}`]],
      ['2. Sobre KURA', ['KURA ofrece afirmaciones, audios, lecturas, ejercicios de reflexión y experiencias con personajes para acompañar tu bienestar y desarrollo personal.', 'Los contenidos tienen fines educativos e informativos. No sustituyen atención médica, psicológica ni asesoramiento profesional, y no garantizan resultados específicos.']],
      ['3. Tu cuenta', ['Al crear una cuenta, proporciona información correcta y protege tus credenciales. Eres responsable del uso que realices de la aplicación y puedes comunicarte con soporte si detectas un acceso no autorizado.']],
      ['4. Uso respetuoso', ['Utiliza KURA de forma lícita y respetuosa. No está permitido vulnerar su seguridad, acceder a cuentas ajenas, distribuir contenido sin autorización ni utilizar la aplicación para acosar o perjudicar a otras personas.', 'Los personajes de KURA son ficticios. Sus mensajes no representan una evaluación profesional de tu situación.']],
      ['5. Tus textos y preferencias', ['Conservas los derechos que te correspondan sobre los textos que escribas. Su tratamiento, junto con tus selecciones, preferencias y datos de cuenta, se describe en el Aviso de privacidad.']],
      ['6. Anuncios y suscripciones', ['KURA podrá ofrecer anuncios y funciones mediante suscripción. Antes de contratar se mostrarán el precio, la periodicidad, las condiciones de renovación y las opciones de cancelación.', 'Desinstalar la aplicación no cancela automáticamente una suscripción. Los pagos, cancelaciones y reembolsos estarán sujetos a las condiciones de la plataforma de compra y a los derechos que establezca la legislación aplicable.']],
      ['7. Contenidos y propiedad intelectual', ['Los derechos sobre la aplicación, personajes, ilustraciones, audios y demás contenidos pertenecen a sus respectivos titulares. Puedes utilizarlos para tu experiencia personal dentro de KURA, conforme a estos términos.']],
      ['8. Disponibilidad y cambios', ['Podremos actualizar la aplicación y sus contenidos. Informaremos los cambios relevantes que afecten tu cuenta o los servicios contratados, respetando los derechos aplicables.']],
      ['9. Contacto', [`Para consultas sobre estos términos, escribe a: ${BLANK}`]],
    ],
  },
  privacy: {
    title: 'Aviso de privacidad',
    updated: `Última actualización: ${BLANK}`,
    intro: 'En KURA queremos explicarte qué información se utiliza y para qué.',
    sections: [
      ['1. Responsable de tus datos', [`Nombre legal: ${BLANK}`, `Domicilio: ${BLANK}`, `Correo de privacidad: ${BLANK}`, 'Este aviso corresponde a la aplicación KURA y al sitio KURA World.']],
      ['2. Información que tratamos', ['Según las funciones que utilices, podremos tratar:', ['Datos de registro e identificación de tu cuenta, como correo electrónico.', 'Textos que escribas dentro de la aplicación.', 'Selecciones, preferencias, favoritos y progreso.', 'Información de uso y diagnóstico para analítica y funcionamiento.', 'Información relacionada con anuncios.', 'Estado e identificadores de tus compras o suscripciones.', 'Información que envíes al solicitar soporte.'], 'KURA no graba tu voz.', 'Los datos técnicos concretos, identificadores y proveedores utilizados se detallarán en la versión definitiva de este aviso.']],
      ['3. Para qué utilizamos la información', ['Utilizamos la información necesaria para administrar tu cuenta, guardar tus contenidos y preferencias, ofrecer las funciones solicitadas, gestionar suscripciones y atender consultas.', 'También utilizaremos información para analítica y anuncios. Las tecnologías empleadas, sus finalidades y las opciones de consentimiento o configuración se especificarán antes del lanzamiento.']],
      ['4. Servicios de terceros', ['KURA podrá utilizar proveedores de autenticación, almacenamiento, analítica, publicidad y pagos.', `Proveedores y datos que reciben: ${BLANK}`]],
      ['5. Tus textos', ['Los textos que escribas pueden incluir información personal. Evita introducir datos sensibles o información privada de otras personas que no sea necesaria para utilizar la aplicación.', 'Las condiciones específicas de almacenamiento, acceso y eliminación se describirán en la versión definitiva.']],
      ['6. Conservación y seguridad', ['Conservaremos la información durante los períodos necesarios para las finalidades informadas y las obligaciones aplicables.', `Plazos de conservación y eliminación: ${BLANK}`, `Medidas de seguridad implementadas: ${BLANK}`]],
      ['7. Tus derechos y eliminación de cuenta', ['Podrás solicitar acceso, corrección o eliminación de tus datos y ejercer los demás derechos que correspondan.', `Correo para solicitudes: ${BLANK}`, `Ruta para eliminar la cuenta en la app: ${BLANK}`, `Página para solicitar eliminación: ${BLANK}`]],
      ['8. Usuarios menores de edad', ['KURA busca ofrecer una experiencia para distintas edades. Las condiciones de acceso de menores, las autorizaciones necesarias y las medidas específicas sobre publicidad y tratamiento de sus datos se definirán antes del lanzamiento.']],
      ['9. Actualizaciones', ['Publicaremos los cambios de este aviso en KURA y KURA World. Cuando corresponda, informaremos los cambios relevantes y solicitaremos las autorizaciones necesarias.']],
    ],
  },
};

const LEGAL_EN = {
  terms: {
    updated: `Last updated: ${BLANK}`,
    intro: 'Welcome to KURA. These terms describe the conditions for using our app and the KURA World website.',
    sections: [
      ['1. Operator', ['KURA is an independent project operated by:', `Legal name: ${BLANK}`, `Support email: ${BLANK}`]],
      ['2. About KURA', ['KURA offers affirmations, audio, readings, reflection exercises and experiences with characters to support your well-being and personal growth.', 'The content is for educational and informational purposes. It does not replace medical or psychological care or professional advice, and it does not guarantee specific results.']],
      ['3. Your account', ['When you create an account, provide accurate information and protect your credentials. You are responsible for how you use the app, and you can contact support if you notice unauthorized access.']],
      ['4. Respectful use', ['Use KURA lawfully and respectfully. You may not compromise its security, access other people’s accounts, distribute content without authorization, or use the app to harass or harm others.', 'KURA’s characters are fictional. Their messages are not a professional assessment of your situation.']],
      ['5. Your texts and preferences', ['You keep the rights that belong to you over the texts you write. How they are handled, together with your selections, preferences and account data, is described in the Privacy notice.']],
      ['6. Ads and subscriptions', ['KURA may offer ads and features through a subscription. Before you subscribe, the price, billing period, renewal terms and cancellation options will be shown.', 'Uninstalling the app does not automatically cancel a subscription. Payments, cancellations and refunds are subject to the purchase platform’s terms and to the rights established by applicable law.']],
      ['7. Content and intellectual property', ['The rights to the app, characters, illustrations, audio and other content belong to their respective owners. You may use them for your personal experience within KURA, in accordance with these terms.']],
      ['8. Availability and changes', ['We may update the app and its content. We will inform you of relevant changes that affect your account or the services you have purchased, respecting the applicable rights.']],
      ['9. Contact', [`For questions about these terms, write to: ${BLANK}`]],
    ],
  },
  privacy: {
    updated: `Last updated: ${BLANK}`,
    intro: 'At KURA we want to explain what information is used and why.',
    sections: [
      ['1. Who is responsible for your data', [`Legal name: ${BLANK}`, `Address: ${BLANK}`, `Privacy email: ${BLANK}`, 'This notice covers the KURA app and the KURA World website.']],
      ['2. Information we handle', ['Depending on the features you use, we may handle:', ['Registration and account identification data, such as your email address.', 'Texts you write within the app.', 'Selections, preferences, favorites and progress.', 'Usage and diagnostic information for analytics and operation.', 'Ad-related information.', 'Status and identifiers of your purchases or subscriptions.', 'Information you send when requesting support.'], 'KURA does not record your voice.', 'The specific technical data, identifiers and providers used will be detailed in the final version of this notice.']],
      ['3. How we use the information', ['We use the information needed to manage your account, save your content and preferences, provide the features you request, manage subscriptions and answer questions.', 'We will also use information for analytics and ads. The technologies used, their purposes and the consent or settings options will be specified before launch.']],
      ['4. Third-party services', ['KURA may use providers for authentication, storage, analytics, advertising and payments.', `Providers and the data they receive: ${BLANK}`]],
      ['5. Your texts', ['The texts you write may include personal information. Avoid entering sensitive data or other people’s private information that is not needed to use the app.', 'The specific conditions for storage, access and deletion will be described in the final version.']],
      ['6. Retention and security', ['We will keep information for the periods needed for the stated purposes and applicable obligations.', `Retention and deletion periods: ${BLANK}`, `Security measures in place: ${BLANK}`]],
      ['7. Your rights and account deletion', ['You may request access to, correction or deletion of your data and exercise the other rights that apply.', `Email for requests: ${BLANK}`, `Path to delete your account in the app: ${BLANK}`, `Page to request deletion: ${BLANK}`]],
      ['8. Minors', ['KURA aims to offer an experience for different ages. The conditions for minors’ access, the necessary authorizations and the specific measures on advertising and the handling of their data will be defined before launch.']],
      ['9. Updates', ['We will publish changes to this notice in KURA and KURA World. When appropriate, we will inform you of relevant changes and request the necessary authorizations.']],
    ],
  },
};

export const LEGAL = { es: LEGAL_ES, en: LEGAL_EN };

/** Ventana emergente con los documentos legales (Arial para que se lea con claridad).
 *  open(kind, { sound }): lectura de Términos o Privacidad (sound: SFX al abrir).
 *  accept(): ventana «Términos y privacidad» con la casilla sin marcar; resuelve true al aceptar. */
export function legalDialog({ t, sfx, lang }) {
  const dlg = document.getElementById('legal-dialog');
  const title = dlg.querySelector('#legal-title'), body = dlg.querySelector('.legal-body'), other = dlg.querySelector('.legal-other');
  const acceptBox = dlg.querySelector('.legal-accept'), check = dlg.querySelector('#legal-check'), cont = dlg.querySelector('#legal-continue');
  let mode = 'read', current = 'terms', resolver = null;
  const node = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
  function renderDoc(kind) {
    current = kind;
    const doc = LEGAL[lang()][kind];
    title.textContent = t(kind === 'terms' ? 'legalTerms' : 'legalPrivacy');
    body.replaceChildren();
    if (mode === 'accept') {
      const back = node('button', `← ${t('back')}`, 'legal-back'); back.type = 'button';
      back.addEventListener('click', () => { sfx('tap'); renderAccept(); });
      body.append(back);
    }
    body.append(node('p', doc.updated, 'legal-updated'), node('p', doc.intro));
    for (const [heading, parts] of doc.sections) {
      body.append(node('h3', heading));
      for (const part of parts) {
        if (Array.isArray(part)) { const ul = node('ul'); part.forEach((li) => ul.append(node('li', li))); body.append(ul); }
        else body.append(node('p', part));
      }
    }
    other.hidden = mode === 'accept';
    other.textContent = t(kind === 'terms' ? 'seePrivacy' : 'seeTerms');
    body.scrollTop = 0;
  }
  function renderAccept() {
    current = 'accept';
    title.textContent = t('legalWindow');
    body.replaceChildren(node('p', t('legalWindowText'), 'legal-lead'));
    for (const kind of ['terms', 'privacy']) {
      const b = node('button', t(kind === 'terms' ? 'seeTerms' : 'seePrivacy'), 'legal-doc-link'); b.type = 'button';
      b.addEventListener('click', () => { sfx('legal'); renderDoc(kind); });
      body.append(b);
    }
    other.hidden = true;
    body.scrollTop = 0;
  }
  const render = () => (current === 'accept' ? renderAccept() : renderDoc(current));
  const finish = (ok) => { const r = resolver; resolver = null; if (dlg.open) dlg.close(); r?.(ok); };
  dlg.querySelector('.legal-close').addEventListener('click', () => { sfx('tap'); finish(false); });
  dlg.addEventListener('close', () => { if (resolver) finish(false); });
  other.addEventListener('click', () => { sfx('legal'); renderDoc(current === 'terms' ? 'privacy' : 'terms'); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) finish(false); }); // tocar fuera cierra
  check.addEventListener('change', () => { cont.disabled = !check.checked; sfx('focus'); });
  cont.addEventListener('click', () => { if (check.checked) finish(true); });
  document.addEventListener('kura:lang', () => { if (dlg.open) render(); });
  return {
    open(kind, { sound = 'legal' } = {}) { mode = 'read'; acceptBox.hidden = true; renderDoc(kind); sfx(sound); dlg.showModal(); body.focus({ preventScroll: true }); },
    accept() {
      mode = 'accept'; acceptBox.hidden = false; check.checked = false; cont.disabled = true; // sin marcar por defecto
      renderAccept(); sfx('legal'); dlg.showModal(); body.focus({ preventScroll: true });
      return new Promise((res) => { resolver = res; });
    },
  };
}
