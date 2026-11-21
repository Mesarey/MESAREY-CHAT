// Textos legales de prototipo (KURA_Textos_Legales_Prototipo). No son documentos definitivos.
// Los campos en blanco se mantienen así a propósito: no se inventan datos del responsable.
const BLANK = '____________________';

export const LEGAL = {
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

/** Ventana emergente con el documento legal. Texto en Arial para que se lea con claridad. */
export function legalDialog({ t, sfx }) {
  const dlg = document.getElementById('legal-dialog');
  const title = dlg.querySelector('#legal-title'), body = dlg.querySelector('.legal-body'), other = dlg.querySelector('.legal-other');
  let current = 'terms';
  const node = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
  function render(kind) {
    current = kind;
    const doc = LEGAL[kind];
    title.textContent = t(kind === 'terms' ? 'legalTerms' : 'legalPrivacy');
    body.replaceChildren();
    if (t('legalLangNote')) body.append(node('p', t('legalLangNote'), 'legal-lang'));
    body.append(node('p', doc.updated, 'legal-updated'), node('p', doc.intro));
    for (const [heading, parts] of doc.sections) {
      body.append(node('h3', heading));
      for (const part of parts) {
        if (Array.isArray(part)) { const ul = node('ul'); part.forEach((li) => ul.append(node('li', li))); body.append(ul); }
        else body.append(node('p', part));
      }
    }
    other.textContent = t(kind === 'terms' ? 'seePrivacy' : 'seeTerms');
    body.scrollTop = 0;
  }
  dlg.querySelector('.legal-close').addEventListener('click', () => { sfx('tap'); dlg.close(); });
  other.addEventListener('click', () => { sfx('legal'); render(current === 'terms' ? 'privacy' : 'terms'); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // tocar fuera cierra
  document.addEventListener('kura:lang', () => { if (dlg.open) render(current); });
  return {
    open(kind) { render(kind); sfx('legal'); dlg.showModal(); body.focus({ preventScroll: true }); },
  };
}
