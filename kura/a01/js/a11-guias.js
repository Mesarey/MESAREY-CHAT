// A11 · Vista previa de cada guía (diseños aprobados, hechos con Higgsfield).
// Al tocar un banner se abre una ficha del mismo tamaño para los cuatro, con la ilustración de su mundo a sangre y
// encima un HUD con el estilo de ese mundo:
//   · Amaya  — HUD aero (cristal claro, menta y cielo, letra ancha Michroma + Outfit), mosaicos con datos.
//   · Azara  — carmesí rubí sobrio (Cormorant marfil, cristal guinda, líneas finas), lista.
//   · Nova   — pop star de noche, minimalista (Outfit delgada, azul de ciudad), mosaicos.
//   · Orion  — biblioteca filosófica onírica (Cormorant crema, cristal violeta), lista.
// Todos tienen el modo contemplación (ver su mundo en calma); Amaya lleva además el aviso de salud.
// Textos en español e inglés; la ficha se rehace si cambia el idioma con ella abierta.

const I = {
  cuerpo: '<circle cx="12" cy="3.6" r="1.9"/><path d="M12 6v8.2M7 8.6l5 1.4 5-1.4M9.6 21l1.3-6.8h2.2l1.3 6.8"/>',
  pulso: '<path d="M12 20.2S3.5 15 3.5 9.2A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 2.2C20.5 15 12 20.2 12 20.2Z"/><path d="M5.5 12.2h3.2l1.4-2.6 2.2 5 1.5-2.4h4.6"/>',
  estira: '<circle cx="14.5" cy="4" r="1.8"/><path d="M14 6.6 11.6 13l3.4 2.4-1 5.4M11.6 13 8 17.5l-3 .5M12.8 8.6l4.6 1.6 2.6-3"/>',
  gota: '<path d="M12 3.2s5.6 6.2 5.6 10.2a5.6 5.6 0 0 1-11.2 0C6.4 9.4 12 3.2 12 3.2Z"/>',
  loto: '<path d="M12 19c-3.8 0-7.5-2.4-8.8-6.2 2.6-.4 5.2.4 7 2M12 19c3.8 0 7.5-2.4 8.8-6.2-2.6-.4-5.2.4-7 2M12 19c-2.2-1.8-3.4-4.4-3.4-7.2S10 6.6 12 5c2 1.6 3.4 4 3.4 6.8S14.2 17.2 12 19Z"/>',
  diamante: '<path d="M7 4h10l4 5-9 11L3 9l4-5Z"/><path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5"/>',
  mente: '<path d="M9.5 4.5a3 3 0 0 0-5 2.6 3 3 0 0 0-1 5 3.2 3.2 0 0 0 2.6 4.6A3 3 0 0 0 12 19V5.6a2.6 2.6 0 0 0-2.5-1.1ZM14.5 4.5a3 3 0 0 1 5 2.6 3 3 0 0 1 1 5 3.2 3.2 0 0 1-2.6 4.6A3 3 0 0 1 12 19"/><path d="M8 9.4c1 0 2 .7 2 1.8M16 9.4c-1 0-2 .7-2 1.8M7.6 14c.8-.6 2-.6 2.6.2M16.4 14c-.8-.6-2-.6-2.6.2"/>',
  ajustes: '<path d="M4 6h9M17 6h3M4 12h4M12 12h8M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  aura: '<path d="M6.5 17.5a7.5 7.5 0 0 1 0-11M10 15a3.8 3.8 0 0 1 0-6"/><path d="m13.5 13.2 5.6 5.6M13.4 6.6l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3.8-1.6Z"/>',
  grupo: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="8.6" r="2.4"/><path d="M16.6 13.6c2.2.2 3.6 1.8 4 4.4"/>',
  corona: '<path d="M4 17.5h16M4.6 17.5 3 7.5l5 4 4-6.5 4 6.5 5-4-1.6 10"/>',
  copa: '<path d="M4.5 4.5h15L12 12.5 4.5 4.5ZM12 12.5V20M8 20h8M7.6 7.8h8.8"/>',
  charla: '<path d="M4.5 18.6 5.6 15A7.4 7.4 0 1 1 9 18.2l-4.5.4Z"/><path d="M9 11h.01M12.5 11h.01M16 11h.01"/>',
  pin: '<path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0c0 5 6.5 11 6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  escudo: '<path d="M12 3.2 19 6v5.4c0 4.6-3 8-7 9.4-4-1.4-7-4.8-7-9.4V6l7-2.8Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',
  corazon: '<path d="M12 20S3.5 14.8 3.5 9A4.4 4.4 0 0 1 12 6.8 4.4 4.4 0 0 1 20.5 9C20.5 14.8 12 20 12 20Z"/>',
  laurel: '<path d="M12 21v-6M8.2 19.4C5 17.8 3.4 14.6 3.8 10.6M15.8 19.4c3.2-1.6 4.8-4.8 4.4-8.8"/><path d="M5.6 16.2c-1.6-.2-2.6-1.2-3-2.6 1.6-.2 2.8.6 3 2.6ZM4.4 12.6c-1.4-.6-2-1.8-2-3.2 1.4.2 2.4 1.2 2 3.2ZM4.6 9c-1-.9-1.2-2.2-.8-3.4 1.2.6 1.8 1.8.8 3.4ZM18.4 16.2c1.6-.2 2.6-1.2 3-2.6-1.6-.2-2.8.6-3 2.6ZM19.6 12.6c1.4-.6 2-1.8 2-3.2-1.4.2-2.4 1.2-2 3.2ZM19.4 9c1-.9 1.2-2.2.8-3.4-1.2.6-1.8 1.8-.8 3.4Z"/>',
  brujula: '<circle cx="12" cy="12" r="8.5"/><path d="m15.6 8.4-2 5.2-5.2 2 2-5.2 5.2-2Z"/><path d="M12 3.5v1.6M12 18.9v1.6M3.5 12h1.6M18.9 12h1.6"/>',
  pluma: '<path d="M19.5 4.5c-6 .3-10.6 4.6-11.6 10.8l-1.4 1.4M19.5 4.5c-.3 6-4.6 10.6-10.8 11.6M19.5 4.5 9 15M4 20l2.5-3.3"/>',
  ojo: '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  sol: '<path d="M3 17.5h18M6 20.5h12M7 17.5a5 5 0 0 1 10 0M12 7.5V6M6.7 9.7 5.6 8.6M17.3 9.7l1.1-1.1"/>',
};
const icon = (k) => `<svg class="gi-ico" viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;

// Copia de cada guía. items: [icono, texto, dato opcional]. layout: 'grid' (mosaicos en dos columnas) o 'lista'.
const GUIA = {
  amaya: {
    arte: 'assets/a11/guias/amaya.webp', layout: 'grid', contemplaIco: 'sol',
    es: {
      sello: 'Cuerpo · Cuidado · Descanso', titulo: ['Mejora tu salud.'], sub: 'Reprograma tu cuerpo y tu sistema nervioso.',
      items: [['cuerpo', 'Afirmaciones por zona del cuerpo'], ['pulso', 'Presión arterial', '120/80'], ['estira', 'Ejercicios y consejos'], ['gota', 'Agua y medicamentos', 'anillo']],
      mundo: 'su ciudad de cristal', aviso: 'Amaya no sustituye a tu médico. Consulta siempre a un profesional de la salud.',
    },
    en: {
      sello: 'Body · Care · Rest', titulo: ['Improve your health.'], sub: 'Reprogram your body and your nervous system.',
      items: [['cuerpo', 'Affirmations for each part of your body'], ['pulso', 'Blood pressure', '120/80'], ['estira', 'Exercises and tips'], ['gota', 'Water and medication', 'anillo']],
      mundo: 'her city of glass', aviso: 'Amaya doesn’t replace your doctor. Always consult a health professional.',
    },
  },
  azara: {
    arte: 'assets/a11/guias/azara.webp', layout: 'lista', contemplaIco: 'ojo',
    es: {
      titulo: ['Conquista tus metas.', 'Atrae lo que mereces.'],
      items: [['loto', 'Ritual de afirmaciones'], ['diamante', 'Abundancia, poder y confianza'], ['mente', 'Reprograma tu mente'], ['ajustes', 'Afirmaciones personalizadas']],
      mundo: 'su castillo carmesí',
    },
    en: {
      titulo: ['Conquer your goals.', 'Attract what you deserve.'],
      items: [['loto', 'Affirmation ritual'], ['diamante', 'Abundance, power and confidence'], ['mente', 'Reprogram your mind'], ['ajustes', 'Personalized affirmations']],
      mundo: 'her crimson castle',
    },
  },
  nova: {
    arte: 'assets/a11/guias/nova.webp', layout: 'grid', contemplaIco: 'ojo',
    es: {
      titulo: ['Tu presencia importa.'], sub: 'Experto en seducción y juegos sociales.',
      items: [['aura', 'Aura de atracción'], ['grupo', 'Juego social'], ['corona', 'Reglas de oro para ligar'], ['copa', 'Domina el lugar'], ['charla', 'Habilidades sociales'], ['pin', 'Escenarios reales'], ['escudo', 'Anti-bullying'], ['corazon', 'Señales de interés']],
      mundo: 'su ciudad de noche',
    },
    en: {
      titulo: ['Your presence matters.'], sub: 'Expert in seduction and social games.',
      items: [['aura', 'Aura of attraction'], ['grupo', 'Social game'], ['corona', 'Golden rules for dating'], ['copa', 'Own the room'], ['charla', 'Social skills'], ['pin', 'Real-life scenarios'], ['escudo', 'Anti-bullying'], ['corazon', 'Signs of interest']],
      mundo: 'his city at night',
    },
  },
  orion: {
    arte: 'assets/a11/guias/orion.webp', layout: 'filas', contemplaIco: 'ojo',
    es: {
      titulo: ['Tu camino filosófico.', 'Nunca dejes de aprender.'],
      items: [['laurel', 'Corrientes filosóficas', 'Un camino para aprender de cada escuela'], ['pluma', 'Frases célebres', 'De estoicos, poetas y más']],
      mundo: 'su biblioteca observatorio',
    },
    en: {
      titulo: ['Your philosophical path.', 'Never stop learning.'],
      items: [['laurel', 'Schools of philosophy', 'A path to learn from each school'], ['pluma', 'Famous quotes', 'From Stoics, poets and more']],
      mundo: 'his observatory library',
    },
  },
};

const UI = {
  es: { contempla: 'Modo contemplación', empezar: 'Empezar con {nombre}', cerrar: 'Cerrar', anterior: 'Guía anterior', siguiente: 'Siguiente guía' },
  en: { contempla: 'Contemplation mode', empezar: 'Start with {nombre}', cerrar: 'Close', anterior: 'Previous guide', siguiente: 'Next guide' },
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ARROW_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const ARROW_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHEV = '<svg class="gi-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6"/></svg>';

/** Encabezado propio de cada mundo. */
function heading(id, nombre, T) {
  if (id === 'amaya') return `<div class="gh-amaya"><h2 class="gh-nombre" id="guia-nombre">${esc(nombre)}</h2><p class="gh-sello">${esc(T.sello)}</p></div>`;
  if (id === 'nova') return `<h2 class="gh-tag" id="guia-nombre"><i aria-hidden="true">/</i>${esc(nombre)}</h2>`;
  if (id === 'orion') return `<h2 class="gh-orion" id="guia-nombre">${esc(nombre)}</h2>`;
  return `<h2 class="gh-tag" id="guia-nombre"><i aria-hidden="true"></i>${esc(nombre)}<i aria-hidden="true"></i></h2>`;
}
function item([k, txt, dato]) {
  // el anillo de agua (6 de 8 vasos) ocupa el lugar del icono; los demás datos van bajo el texto
  const lead = dato === 'anillo' ? `<span class="gi-anillo" aria-hidden="true">${icon(k)}<b>6/8</b></span>` : icon(k);
  const sub = dato && dato !== 'anillo' ? `<span class="gi-dato" aria-hidden="true">${esc(dato)}</span>` : '';
  return `<li class="gi">${lead}<span class="gi-txt">${esc(txt)}${sub}</span>${CHEV}</li>`;
}

/**
 * @param {{ guias: {id:string,nombre:string}[], lang: () => string, sfx: (n:string)=>void, onStart: (id:string)=>void, reduced: () => boolean }} o
 */
export function guidePreview({ guias, lang, sfx, onStart, reduced }) {
  const dlg = document.getElementById('guia-dialog');
  const card = dlg.querySelector('.guia-card');
  let current = null, opener = null;

  function render(id) {
    const g = guias.find((x) => x.id === id), G = GUIA[id], L = lang() === 'en' ? 'en' : 'es', T = G[L], U = UI[L];
    current = id;
    card.dataset.guia = id;
    card.innerHTML = `
      <img class="guia-arte" src="${G.arte}" alt="" decoding="async" draggable="false">
      <div class="guia-velo" aria-hidden="true"></div>
      <button type="button" class="guia-close" aria-label="${U.cerrar}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></svg></button>
      <div class="guia-body">
        ${heading(id, g.nombre, T)}
        <p class="guia-titulo">${T.titulo.map((l) => `<span>${esc(l)}</span>`).join('')}</p>
        ${T.sub ? `<p class="guia-sub">${esc(T.sub)}</p>` : ''}
        <ul class="guia-items guia-${G.layout}">${T.items.map(item).join('')}</ul>
        <p class="guia-contempla">${icon(G.contemplaIco)}<span><b>${U.contempla}</b> <span class="gc-sep">—</span> ${esc(T.mundo)}</span></p>
        ${T.aviso ? `<p class="guia-aviso" role="note">${esc(T.aviso)}</p>` : ''}
      </div>
      <div class="guia-foot">
        <button type="button" class="guia-nav guia-prev" aria-label="${U.anterior}">${ARROW_L}</button>
        <button type="button" class="guia-start"><span>${esc(U.empezar.replace('{nombre}', g.nombre))}</span>${CHEV}</button>
        <button type="button" class="guia-nav guia-next" aria-label="${U.siguiente}">${ARROW_R}</button>
      </div>`;
  }

  function step(dir) {
    const i = guias.findIndex((x) => x.id === current), next = guias[(i + dir + guias.length) % guias.length].id;
    sfx('tap');
    render(next);
    if (!reduced()) { card.classList.remove('is-in-l', 'is-in-r'); void card.offsetWidth; card.classList.add(dir > 0 ? 'is-in-r' : 'is-in-l'); }
    card.querySelector('.guia-start').focus({ preventScroll: true });
  }

  function open(id, from) {
    opener = from || null;
    render(id);
    card.classList.remove('is-in-l', 'is-in-r');
    if (!dlg.open) dlg.showModal();
    card.querySelector('.guia-start').focus({ preventScroll: true });
  }
  function close() { if (dlg.open) dlg.close(); }

  // precarga silenciosa de las cuatro ilustraciones (al pasar de una a otra no hay parpadeo)
  const pre = () => Object.values(GUIA).forEach((G) => { const im = new Image(); im.decoding = 'async'; im.src = G.arte; });

  dlg.addEventListener('close', () => { current = null; opener?.focus?.({ preventScroll: true }); opener = null; });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) { sfx('tap'); close(); } }); // tocar fuera la cierra
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
  document.addEventListener('kura:lang', () => { if (current) render(current); });

  return { open, close, prefetch: pre, get current() { return current; }, get isOpen() { return dlg.open; } };
}
