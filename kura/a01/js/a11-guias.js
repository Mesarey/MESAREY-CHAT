// A11 · Vista previa de cada guía. Al tocar un banner se abre una ficha con su mundo, su frase y lo que ofrece.
// Todos tienen el modo contemplación (ver su mundo en calma); Amaya lleva además un aviso de salud.
// Textos en español e inglés; la ficha se rehace si cambia el idioma con ella abierta.

const COPY = {
  amaya: {
    acento: '120, 214, 170',
    es: {
      frase: 'Mejora tu salud, reprograma tu cuerpo y tu sistema nervioso.',
      puntos: [
        'Afirmaciones para cada parte de tu cuerpo',
        'Registro de salud, como tu presión arterial',
        'Ejercicios y consejos para lo que quieras mejorar',
        'Recordatorios saludables: tomar agua, tus medicamentos',
      ],
      mundo: 'su ciudad aérea de cristal y jardines',
      aviso: 'Amaya te acompaña, pero no sustituye a tu médico. Consulta siempre a un profesional de la salud.',
    },
    en: {
      frase: 'Improve your health, reprogram your body and nervous system.',
      puntos: [
        'Affirmations for every part of your body',
        'Health log, such as your blood pressure',
        'Exercises and tips for whatever you want to improve',
        'Healthy reminders: drink water, take your medication',
      ],
      mundo: 'her floating city of glass and gardens',
      aviso: 'Amaya is here for you, but she doesn’t replace your doctor. Always consult a health professional.',
    },
  },
  azara: {
    acento: '255, 96, 110',
    es: {
      frase: 'Conquista tus metas y atrae lo que mereces.',
      puntos: [
        'Ritual de afirmaciones',
        'Abundancia, poder, confianza y más',
        'Ejercicios para reprogramar tu mente',
        'Afirmaciones personalizadas',
      ],
      mundo: 'su castillo carmesí',
    },
    en: {
      frase: 'Conquer your goals and attract what you deserve.',
      puntos: [
        'Affirmation ritual',
        'Abundance, power, confidence and more',
        'Exercises to reprogram your mind',
        'Personalized affirmations',
      ],
      mundo: 'her crimson castle',
    },
  },
  nova: {
    acento: '110, 170, 255',
    es: {
      frase: 'Experto en seducción y juegos sociales. Tu presencia importa.',
      puntos: [
        'Cambia tu aura de atracción',
        'Eleva tu juego social',
        'Reglas de oro para ligar',
        'Reglas de oro para moverte en un lugar social y tener el cuarto a tu favor',
        'Habilidades sociales',
        'Práctica de escenarios reales',
        'Reglas contra el bullying',
        'Señales para ligar: indicadores de interés',
      ],
      mundo: 'su ciudad de noche, entre flashes',
    },
    en: {
      frase: 'Expert in seduction and social games. Your presence matters.',
      puntos: [
        'Shift your aura of attraction',
        'Level up your social game',
        'Golden rules for dating',
        'Golden rules to move through a social place and own the room',
        'Social skills',
        'Real-life scenario practice',
        'Anti-bullying rules',
        'Dating signals: indicators of interest',
      ],
      mundo: 'his city at night, among camera flashes',
    },
  },
  orion: {
    acento: '196, 160, 255',
    es: {
      frase: 'Tu camino filosófico. Nunca dejes de aprender.',
      puntos: [
        'Un camino por las corrientes filosóficas',
        'Frases célebres de estoicos, poetas y más',
      ],
      mundo: 'su biblioteca observatorio',
    },
    en: {
      frase: 'Your philosophical path. Never stop learning.',
      puntos: [
        'A path through the schools of philosophy',
        'Famous quotes from Stoics, poets and more',
      ],
      mundo: 'his observatory library',
    },
  },
};

const UI = {
  es: { contempla: 'Modo contemplación', contemplaTxt: 'Contempla {mundo}.', empezar: 'Empezar con {nombre}', cerrar: 'Cerrar', ofrece: 'Lo que te ofrece', anterior: 'Guía anterior', siguiente: 'Siguiente guía' },
  en: { contempla: 'Contemplation mode', contemplaTxt: 'Take in {mundo}.', empezar: 'Start with {nombre}', cerrar: 'Close', ofrece: 'What she offers', ofreceM: 'What he offers', anterior: 'Previous guide', siguiente: 'Next guide' },
};
const MASC = new Set(['nova', 'orion']);

const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5c.9 6.1 3.4 8.6 9.5 9.5v1c-6.1.9-8.6 3.4-9.5 9.5h-1c-.9-6.1-3.4-8.6-9.5-9.5v-1c6.1-.9 8.6-3.4 9.5-9.5Z" /></svg>';
const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="3.2" /></svg>';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * @param {{ guias: {id:string,nombre:string,src:string}[], lang: () => string, sfx: (n:string)=>void, onStart: (id:string)=>void, reduced: () => boolean }} o
 */
export function guidePreview({ guias, lang, sfx, onStart, reduced }) {
  const dlg = document.getElementById('guia-dialog');
  const card = dlg.querySelector('.guia-card');
  let current = null, opener = null;

  function render(id) {
    const g = guias.find((x) => x.id === id), c = COPY[id], L = lang() === 'en' ? 'en' : 'es', T = c[L], U = UI[L];
    current = id;
    dlg.style.setProperty('--acento', c.acento);
    dlg.dataset.guia = id;
    const ofrece = L === 'en' && MASC.has(id) ? U.ofreceM : U.ofrece;
    card.innerHTML = `
      <div class="guia-hero"><img src="${g.src}" alt="" decoding="async" draggable="false" style="--fy:${g.fy}%">
        <button type="button" class="guia-close" aria-label="${U.cerrar}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
      </div>
      <div class="guia-body">
        <h2 class="guia-nombre" id="guia-nombre">${esc(g.nombre)}</h2>
        <p class="guia-frase">${esc(T.frase)}</p>
        <h3 class="guia-ofrece">${ofrece}</h3>
        <ul class="guia-puntos">${T.puntos.map((p) => `<li>${STAR}<span>${esc(p)}</span></li>`).join('')}</ul>
        <div class="guia-contempla">${EYE}<p><strong>${U.contempla}</strong><span>${esc(U.contemplaTxt.replace('{mundo}', T.mundo))}</span></p></div>
        ${T.aviso ? `<p class="guia-aviso" role="note">${esc(T.aviso)}</p>` : ''}
      </div>
      <div class="guia-foot">
        <button type="button" class="guia-nav guia-prev" aria-label="${U.anterior}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5.5 8.5 12 15 18.5" /></svg></button>
        <button type="button" class="guia-start">${esc(U.empezar.replace('{nombre}', g.nombre))}</button>
        <button type="button" class="guia-nav guia-next" aria-label="${U.siguiente}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.5 15.5 12 9 18.5" /></svg></button>
      </div>`;
    card.querySelector('.guia-body').scrollTop = 0;
  }

  function step(dir) {
    const i = guias.findIndex((x) => x.id === current), next = guias[(i + dir + guias.length) % guias.length].id;
    sfx('tap');
    if (reduced()) { render(next); return; }
    card.classList.remove('is-in-l', 'is-in-r'); void card.offsetWidth;
    render(next); card.classList.add(dir > 0 ? 'is-in-r' : 'is-in-l');
  }

  function open(id, from) {
    opener = from || null;
    render(id);
    card.classList.remove('is-in-l', 'is-in-r');
    if (!dlg.open) dlg.showModal();
    card.querySelector('.guia-start').focus({ preventScroll: true });
  }
  function close() { if (dlg.open) dlg.close(); }

  dlg.addEventListener('close', () => { current = null; opener?.focus?.({ preventScroll: true }); opener = null; });
  // tocar fuera de la ficha la cierra
  dlg.addEventListener('click', (e) => { if (e.target === dlg) { sfx('tap'); close(); } });
  card.addEventListener('click', (e) => {
    if (e.target.closest('.guia-close')) { sfx('tap'); close(); }
    else if (e.target.closest('.guia-prev')) step(-1);
    else if (e.target.closest('.guia-next')) step(1);
    else if (e.target.closest('.guia-start')) { const id = current; close(); onStart(id); }
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  // deslizar a los lados cambia de guía
  let sx = 0, sy = 0, tracking = false;
  card.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; tracking = true; });
  card.addEventListener('pointerup', (e) => {
    if (!tracking) return; tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  });
  card.addEventListener('pointercancel', () => { tracking = false; });
  document.addEventListener('kura:lang', () => { if (current) { const b = card.querySelector('.guia-body'), s = b.scrollTop; render(current); card.querySelector('.guia-body').scrollTop = s; } });

  return { open, close, get current() { return current; }, get isOpen() { return dlg.open; } };
}
