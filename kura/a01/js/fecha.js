// A08 · Selector de fecha con el estilo de KURA: cada caja (Día, Mes, Año) se puede escribir y la lista
// se acorta mientras escribes («3» → 3, 30, 31; «ju» → Junio, Julio; «19» → 1999, 1998…).
// Se abre una lista de cristal debajo de la caja; flechas, Enter y Escape funcionan; tocar una opción la elige.
// Accesible: combobox con listbox (aria-expanded, aria-activedescendant, aria-selected).

const norm = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
const open = new Set(); // solo una lista abierta a la vez

/**
 * @param {HTMLElement} wrap  caja .a08-sel con input, botón .a08-open y lista .a08-list
 * @param {{ options: () => {v: number|string, label: string}[], onCommit: (v: string) => void, sfx: (n: string) => void, next?: () => HTMLInputElement|null }} o
 *   next: la caja que sigue; tras elegir con Enter el foco pasa ahí si está vacía (si no, se cierra el teclado)
 */
export function makeCombo(wrap, { options, onCommit, sfx, next }) {
  const input = wrap.querySelector('input'), list = wrap.querySelector('.a08-list'), btn = wrap.querySelector('.a08-open');
  let value = '', active = -1, shown = [];
  const labelOf = (v) => options().find((o) => String(o.v) === v)?.label ?? '';

  function render(filter) {
    const q = norm(filter || '');
    const all = options();
    shown = !q ? all : all.filter((o) => norm(o.label).startsWith(q) || String(o.v).startsWith(q) || (q.length > 2 && norm(o.label).includes(q)));
    list.innerHTML = shown.length
      ? shown.map((o, i) => `<li role="option" id="${list.id}-${i}" data-i="${i}" aria-selected="${String(o.v) === value}"${String(o.v) === value ? ' class="is-sel"' : ''}>${o.label}</li>`).join('')
      : '<li class="a08-none" aria-disabled="true">—</li>';
    active = q && shown.length ? 0 : shown.findIndex((o) => String(o.v) === value);
    mark();
  }
  function mark() {
    list.querySelectorAll('[role=option]').forEach((li, i) => li.classList.toggle('is-active', i === active));
    const li = list.querySelector(`[data-i="${active}"]`);
    if (li) { li.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', li.id); } else input.removeAttribute('aria-activedescendant');
  }
  function show(filter) {
    for (const c of open) if (c !== api) c.close();
    render(filter);
    if (list.hidden) { list.hidden = false; wrap.classList.add('is-open'); input.setAttribute('aria-expanded', 'true'); open.add(api); }
    place();
  }
  // si abajo no cabe (pantallas bajas o con teclado), la lista se abre hacia arriba; nunca se sale de la pantalla
  function place() {
    list.classList.remove('is-up'); list.style.maxHeight = '';
    const r = wrap.getBoundingClientRect(), vh = window.visualViewport?.height ?? innerHeight, want = list.offsetHeight;
    const below = vh - r.bottom - 12, above = r.top - 12;
    if (want > below && above > below) list.classList.add('is-up');
    const room = Math.max(below, above);
    if (want > room) list.style.maxHeight = `${Math.max(120, room - 8)}px`;
  }
  function close() { list.hidden = true; wrap.classList.remove('is-open'); input.setAttribute('aria-expanded', 'false'); open.delete(api); }
  function commit(o) {
    const before = value;
    value = o ? String(o.v) : '';
    input.value = o ? o.label : '';
    close();
    if (value !== before) onCommit(value);
  }
  // lo escrito se resuelve al salir: coincidencia exacta, o la única que queda; si no, vuelve a lo elegido
  function resolve() {
    const q = norm(input.value);
    if (!q) { commit(null); return; }
    const exact = options().find((o) => norm(o.label) === q || String(o.v) === q);
    if (exact) commit(exact); else if (shown.length === 1) commit(shown[0]); else { input.value = labelOf(value); close(); }
  }

  // al enfocar se selecciona lo elegido para reemplazarlo al escribir (y otra vez tras el toque, que en
  // algunos teléfonos quita la selección), pero nunca encima de algo que ya se empezó a escribir
  const selectChosen = () => { if (input.value === labelOf(value)) input.select(); };
  input.addEventListener('focus', () => { sfx('focus'); selectChosen(); requestAnimationFrame(selectChosen); show(''); });
  input.addEventListener('input', () => show(input.value));
  // tocar el campo ya enfocado (tras elegir con Enter) vuelve a abrir la lista y selecciona el texto
  input.addEventListener('pointerup', () => { if (document.activeElement === input && list.hidden) { show(''); selectChosen(); } });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) { show(''); return; }
      active = Math.max(0, Math.min(shown.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)));
      mark();
    } else if (e.key === 'Enter') {
      if (!list.hidden && shown[active]) { e.preventDefault(); sfx('tap'); commit(shown[active]); const n = next?.(); if (n && !n.value) n.focus(); else input.blur(); }
    } else if (e.key === 'Escape') {
      if (!list.hidden) { e.preventDefault(); input.value = labelOf(value); close(); }
    } else if (e.key === 'Tab') resolve();
  });
  input.addEventListener('blur', () => setTimeout(() => { if (!wrap.contains(document.activeElement)) resolve(); }, 0));
  // tocar una opción no quita el foco del campo (pointerdown con preventDefault)
  list.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const li = e.target.closest('[role=option]');
    if (!li) return;
    sfx('tap'); commit(shown[+li.dataset.i]); input.blur();
  });
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); if (list.hidden) input.focus(); else { close(); input.blur(); } });

  const api = {
    get value() { return value; },
    /** Elige un valor desde el código (sin abrir la lista). */
    set(v) { value = v == null || v === '' ? '' : String(v); input.value = value ? labelOf(value) : ''; },
    /** Las opciones cambiaron (idioma, mes o año): se actualiza el texto y la lista abierta. */
    refresh() { if (value && !labelOf(value)) value = ''; if (document.activeElement !== input) input.value = labelOf(value); if (!list.hidden) render(input.value === labelOf(value) ? '' : input.value); },
    close,
    input,
  };
  return api;
}

// Tocar fuera cierra cualquier lista abierta.
document.addEventListener('pointerdown', (e) => { for (const c of open) if (!c.input.closest('.a08-sel').contains(e.target)) c.close(); }, true);
