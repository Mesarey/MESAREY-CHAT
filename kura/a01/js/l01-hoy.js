// L01 · Hoy con Alaira: lo que se toca en el HUD.
//   · Afirmación del día de las categorías elegidas (se barajan y no se repiten hasta terminar el ciclo).
//     Tocar la frase pasa a la siguiente. Guardar la marca (Biblioteca), Escuchar (voz pronto) y «×» la oculta
//     con «Deshacer» unos segundos. Todo se guarda solo en este dispositivo (localStorage).
//   · Categorías: hoja con temas de Alaira (también desde el medallón «Afirmaciones»).
//   · Orbe «Ritual»: hoja «Elige tu ritual» — Ritual de Alaira (gratis) o Ritual de los mundos (KURA PASS).
//   · Medallones del jardín y menú inferior: cada uno abre su sección (por ahora avisan que llegan pronto).
const AF = {
  gratitud: [
    ['Hoy elijo agradecer lo que ya florece en mí.', 'Today I choose to be grateful for what is already blooming in me.'],
    ['Agradezco cada pequeño paso que me trajo hasta aquí.', "I'm grateful for every small step that brought me here."],
    ['Mi corazón reconoce la belleza de este día.', 'My heart recognizes the beauty of this day.'],
    ['Gracias, cuerpo, por acompañarme en todo.', 'Thank you, body, for carrying me through everything.'],
  ],
  calma: [
    ['Respiro despacio; la calma también vive en mí.', 'I breathe slowly; calm lives in me too.'],
    ['No tengo que resolverlo todo hoy.', "I don't have to solve everything today."],
    ['Suelto lo que no puedo controlar.', "I release what I can't control."],
    ['Mi paz es un lugar al que siempre puedo volver.', 'My peace is a place I can always return to.'],
  ],
  espiritualidad: [
    ['Confío en el camino que se abre ante mí.', 'I trust the path opening before me.'],
    ['Mi luz interior me guía, incluso de noche.', 'My inner light guides me, even at night.'],
    ['El universo me acompaña en cada paso.', 'The universe walks with me at every step.'],
    ['Escucho mi intuición con amor.', 'I listen to my intuition with love.'],
  ],
  positivo: [
    ['Merezco cosas buenas y hoy me abro a recibirlas.', 'I deserve good things and today I open myself to receive them.'],
    ['Cada día aprendo a quererme un poco más.', 'Every day I learn to love myself a little more.'],
    ['Puedo crecer a mi propio ritmo.', 'I can grow at my own pace.'],
    ['Mis pensamientos amables crean mi mundo.', 'My kind thoughts create my world.'],
  ],
  manana: [
    ['Hoy empiezo con una intención clara y el corazón abierto.', 'Today I begin with a clear intention and an open heart.'],
    ['Este nuevo día es una página en blanco para mí.', 'This new day is a blank page for me.'],
    ['Despierto con gratitud por una nueva oportunidad.', 'I wake up grateful for a new chance.'],
    ['Me regalo un momento de calma antes de empezar.', 'I give myself a moment of calm before I begin.'],
  ],
};
const K = { cats: 'kura.l01.categorias', ocultas: 'kura.l01.ocultas', guardadas: 'kura.guardadas' };
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function setupHoy({ $, t, lang, toast, sfx, scene, motion }) {
  const phrase = $('l01-afirmacion'), saveBtn = $('l01-guardar'), undo = $('l01-deshacer');
  let cats = read(K.cats, ['gratitud']).filter((c) => AF[c]);
  if (!cats.length) cats = ['gratitud'];
  const hidden = new Set(read(K.ocultas, [])), saved = new Set(read(K.guardadas, []));
  let deck = [], cur = null, undoTimer = 0, lastHidden = null;

  const text = (id) => { const [c, i] = id.split(':'); return AF[c]?.[+i]?.[lang() === 'en' ? 1 : 0] ?? ''; };
  const pool = () => cats.flatMap((c) => AF[c].map((_, i) => `${c}:${i}`)).filter((id) => !hidden.has(id));
  function refill() { deck = shuffle(pool()); if (cur && deck.length > 1 && deck[0] === cur) deck.push(deck.shift()); }
  function paint() {
    phrase.classList.toggle('is-vacia', !cur);
    phrase.textContent = cur ? text(cur) : (lang() === 'en' ? 'No affirmations left here. Change your categories.' : 'No quedan afirmaciones aquí. Cambia tus categorías.');
    saveBtn.setAttribute('aria-pressed', String(!!cur && saved.has(cur)));
    saveBtn.disabled = !cur; $('l01-ocultar').disabled = !cur;
  }
  function show(next, animate = true) {
    const go = () => { cur = next; paint(); };
    if (!animate || motion.reduced) { go(); return; }
    phrase.classList.add('is-out');
    setTimeout(() => { go(); phrase.classList.remove('is-out'); }, 260);
  }
  function nextPhrase(animate = true) { if (!deck.length) refill(); show(deck.shift() ?? null, animate); }
  refill(); nextPhrase(false);
  document.addEventListener('kura:lang', paint);

  phrase.addEventListener('click', () => { if (!cur) { openCats(); return; } sfx('tap'); nextPhrase(); });
  saveBtn.addEventListener('click', () => {
    if (!cur) return;
    const on = !saved.has(cur);
    on ? saved.add(cur) : saved.delete(cur); write(K.guardadas, [...saved]);
    saveBtn.setAttribute('aria-pressed', String(on)); sfx(on ? 'start' : 'toggle');
    if (on) scene.glow();
    toast(t(on ? 'l01Guardada' : 'l01Quitada'));
  });
  $('l01-escuchar').addEventListener('click', () => { sfx('tap'); toast(t('l01VozPronto')); });
  $('l01-ocultar').addEventListener('click', () => {
    if (!cur) return;
    lastHidden = cur; hidden.add(cur); write(K.ocultas, [...hidden]); sfx('toggle');
    deck = deck.filter((id) => id !== cur); nextPhrase();
    undo.hidden = false; undo.classList.remove('is-on'); void undo.offsetWidth; undo.classList.add('is-on');
    clearTimeout(undoTimer); undoTimer = setTimeout(() => { undo.hidden = true; lastHidden = null; }, 4500);
  });
  $('l01-deshacer-btn').addEventListener('click', () => {
    if (!lastHidden) return;
    hidden.delete(lastHidden); write(K.ocultas, [...hidden]); sfx('tap');
    if (cur) deck.unshift(cur);
    show(lastHidden); lastHidden = null; undo.hidden = true; clearTimeout(undoTimer);
  });

  /* ---------- Hojas (categorías y ritual) ---------- */
  const sheet = (id) => {
    const d = $(id);
    d.addEventListener('click', (e) => { if (e.target === d) d.close('cancel'); }); // tocar fuera la cierra
    d.addEventListener('cancel', () => sfx('closeLegal'));
    return d;
  };
  const cd = sheet('cats-hoja'), rd = sheet('ritual-hoja');
  const chips = [...$('l01-chips').querySelectorAll('input')];
  function openCats() { chips.forEach((c) => { c.checked = cats.includes(c.value); }); sfx('tap'); cd.showModal(); }
  $('l01-chips').addEventListener('change', (e) => {
    if (!chips.some((c) => c.checked)) e.target.checked = true; // siempre queda al menos una
    sfx(e.target.checked ? 'tap' : 'toggle');
  });
  cd.addEventListener('close', () => {
    if (cd.returnValue !== 'ok') return;
    const next = chips.filter((c) => c.checked).map((c) => c.value);
    sfx('closeLegal');
    if (next.join() === cats.join()) return;
    cats = next; write(K.cats, cats); refill(); nextPhrase(); scene.glow();
  });
  $('l01-categorias').addEventListener('click', openCats);

  const sub = $('l01-op-sub');
  const paintSub = () => { sub.textContent = t(rd.querySelector('input[name=duracion]:checked').value === '5' ? 'l01RitualAlairaSub5' : 'l01RitualAlairaSub'); };
  rd.addEventListener('change', (e) => { sfx('tap'); if (e.target.name === 'duracion') paintSub(); });
  document.addEventListener('kura:lang', paintSub);
  rd.addEventListener('close', () => {
    if (rd.returnValue !== 'start') return;
    const which = rd.querySelector('input[name=ritual]:checked').value;
    if (which === 'mundos') { sfx('decline'); toast(t('l01PassPronto')); return; }
    sfx('start'); scene.glow(); toast(t('l01RitualPronto'));
  });
  $('cta-l01').addEventListener('click', () => { sfx('tap'); scene.glow(); paintSub(); rd.showModal(); });

  /* ---------- Medallones, Aura y menú ---------- */
  document.querySelectorAll('.l01-med').forEach((b) => b.addEventListener('click', () => {
    b.classList.remove('is-tap'); void b.offsetWidth; b.classList.add('is-tap');
    if (b.dataset.fn === 'afirmaciones') { openCats(); return; }
    sfx('tap');
    toast(`${b.querySelector('.l01-med-nombre').textContent}: ${t('l01Pronto')}`);
  }));
  $('l01-aura').addEventListener('click', () => { sfx('tap'); toast(t('l01AuraToast')); });
  document.querySelectorAll('.l01-menu button').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.tab === 'hoy') return;
    sfx('tap'); toast(`${b.querySelector('span').textContent}: ${t('l01Pronto')}`);
  }));

  return { close() { if (cd.open) cd.close('cancel'); if (rd.open) rd.close('cancel'); } };
}
