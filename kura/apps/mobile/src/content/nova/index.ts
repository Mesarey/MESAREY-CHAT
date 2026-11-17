import librosData from './data/libros.json';
import negasData from './data/negas.json';
import tanda01 from './data/tanda-01.json';
import { jefeBar } from './jefe';
import { premios } from './premios';
import { afirmaciones, casosPrueba, contextosTensos, reformulaciones } from './prueba';
import { reglas } from './reglas';
import { escenasSerio } from './serio';
import type { Escena, FichaTanda, Libro, Nega, Pasaje } from './types';
import { escenasMapa, unidades } from './unidades';

export * from './types';
export { reglas, unidades, premios, casosPrueba, afirmaciones, reformulaciones, contextosTensos, jefeBar, escenasMapa, escenasSerio };
export { etiquetaCategoria } from './prueba';
export { introSerio } from './serio';

export const negas = negasData.negas as Nega[];
export const META_NEGAS = negasData.meta;

/** Tandas importadas. Para sumar otra: `npm run nova:importar -- tanda <archivo>` y agrégala aquí. */
export const tandas = [tanda01] as unknown as { tanda: string; fuente: string; total: number; conteo: Record<string, number>; contenido: FichaTanda[] }[];
export const fichasTanda: FichaTanda[] = tandas.flatMap((t) => t.contenido);

export const libros = librosData.libros as Libro[];
export const pasajes = librosData.pasajes as Pasaje[];

export const escenas: Escena[] = [...escenasMapa, jefeBar, ...escenasSerio];
export const escenaPorId = (id: string) => escenas.find((e) => e.id === id);
export const reglaPorId = (id: string) => reglas.find((r) => r.id === id);
export const negaPorId = (id: string) => negas.find((n) => n.id === id);

/* ------------------------------ Experiencia pública ------------------------------ */

const publico = <T extends { estado: string }>(xs: T[]) => xs.filter((x) => x.estado !== 'borrador');

/** Lo único que puede salir en juego, catálogo y widget. Los borradores se quedan en el flujo editorial. */
export const publicado = {
  escenas: publico(escenas),
  negas: publico(negas),
  reglas: publico(reglas),
  casos: publico(casosPrueba),
};

export const borradores = {
  fichas: fichasTanda.filter((f) => f.estado === 'borrador'),
  negas: fichasTanda.filter((f) => f.tipo === 'nega' && f.estado === 'borrador'),
};

/** Avance hacia 1,000: cuentan solo las negas base revisadas; las variantes y los borradores van aparte. */
export const avanceNegas = {
  meta: META_NEGAS,
  revisadas: negas.filter((n) => n.estado === 'revisado').length,
  variantes: 0,
  borradores: borradores.negas.length,
};

/* ------------------------------ Validación ------------------------------ */

export interface Hallazgo {
  tipo: 'id_duplicado' | 'relacion_rota' | 'borrador_publico' | 'estructura';
  id: string;
  detalle: string;
}

export function validarContenido(): Hallazgo[] {
  const h: Hallazgo[] = [];
  const todos: string[] = [
    ...reglas.map((r) => r.id), ...negas.map((n) => n.id), ...fichasTanda.map((f) => f.id), ...escenas.map((e) => e.id),
    ...casosPrueba.map((c) => c.id), ...afirmaciones.map((a) => a.id), ...premios.map((p) => p.id), ...libros.map((l) => l.id),
    ...pasajes.map((p) => p.id), ...reformulaciones.map((r) => r.id), ...contextosTensos.map((c) => c.id), ...unidades.map((u) => `unidad:${u.id}`),
    ...unidades.map((u) => u.ejercicio.id),
  ];
  const vistos = new Set<string>();
  for (const id of todos) {
    if (vistos.has(id)) h.push({ tipo: 'id_duplicado', id, detalle: 'El ID aparece más de una vez en el contenido.' });
    vistos.add(id);
  }
  const tandaIds = new Set(fichasTanda.map((f) => f.id));
  const reglaIds = new Set(reglas.map((r) => r.id));
  const libroIds = new Set(libros.map((l) => l.id));
  const escenaIds = new Set(escenas.map((e) => e.id));

  for (const f of fichasTanda) {
    for (const r of f.relacionados ?? []) if (!tandaIds.has(r)) h.push({ tipo: 'relacion_rota', id: f.id, detalle: `relacionados → ${r} no existe.` });
  }
  for (const p of pasajes) if (!libroIds.has(p.libro)) h.push({ tipo: 'relacion_rota', id: p.id, detalle: `libro → ${p.libro} no existe.` });
  for (const u of unidades) {
    if (!reglaIds.has(u.regla)) h.push({ tipo: 'relacion_rota', id: `unidad:${u.id}`, detalle: `regla → ${u.regla} no existe.` });
    for (const e of u.escenas) if (!escenaIds.has(e)) h.push({ tipo: 'relacion_rota', id: `unidad:${u.id}`, detalle: `escena → ${e} no existe.` });
    const variantes = u.escenas.flatMap((e) => escenaPorId(e)?.variantes ?? []).length;
    if (variantes < 2) h.push({ tipo: 'estructura', id: `unidad:${u.id}`, detalle: 'Cada habilidad publicada necesita al menos dos variantes.' });
  }
  for (const c of casosPrueba) {
    if (c.regla && !reglaIds.has(c.regla)) h.push({ tipo: 'relacion_rota', id: c.id, detalle: `regla → ${c.regla} no existe.` });
    if (c.opciones.filter((o) => o.acierta).length !== 1) h.push({ tipo: 'estructura', id: c.id, detalle: 'Cada caso lleva exactamente una opción que acierta.' });
  }
  for (const e of escenas) {
    for (const r of e.reglas) if (!reglaIds.has(r)) h.push({ tipo: 'relacion_rota', id: e.id, detalle: `regla → ${r} no existe.` });
    for (const r of e.relacionados) if (!tandaIds.has(r)) h.push({ tipo: 'relacion_rota', id: e.id, detalle: `relacionados → ${r} no existe.` });
    for (const ref of e.referencias) if (ref.libro && !libroIds.has(ref.libro)) h.push({ tipo: 'relacion_rota', id: e.id, detalle: `referencia → libro ${ref.libro} no existe.` });
    if (e.ruta === 'principal' && e.referencias.some((r) => r.libro === 'del-amor')) h.push({ tipo: 'estructura', id: e.id, detalle: 'Del amor está excluido de CHAD.' });
    const opIds = new Set<string>();
    for (const v of e.variantes) {
      const pasoIds = new Set(v.pasos.map((p) => p.id));
      const finIds = new Set(v.finales.map((f) => f.id));
      if (!pasoIds.has(v.inicio)) h.push({ tipo: 'relacion_rota', id: `${e.id}/${v.id}`, detalle: `inicio → ${v.inicio} no existe.` });
      for (const p of v.pasos) {
        if (p.opciones.length < 2 || p.opciones.length > 3) h.push({ tipo: 'estructura', id: p.id, detalle: 'Cada paso lleva dos o tres opciones.' });
        if (!p.opciones.some((o) => o.tono === 'encaja' || o.tono === 'valida')) h.push({ tipo: 'estructura', id: p.id, detalle: 'El paso no tiene ninguna opción que avance.' });
        for (const o of p.opciones) {
          if (opIds.has(o.id)) h.push({ tipo: 'id_duplicado', id: o.id, detalle: 'Opción repetida dentro de la escena.' });
          opIds.add(o.id);
          if (o.regla && !reglaIds.has(o.regla)) h.push({ tipo: 'relacion_rota', id: o.id, detalle: `regla → ${o.regla} no existe.` });
          if (o.tono === 'ajusta') {
            if (o.ir) h.push({ tipo: 'estructura', id: o.id, detalle: 'Una opción que se reintenta no lleva destino.' });
          } else if (!o.ir) h.push({ tipo: 'relacion_rota', id: o.id, detalle: 'Falta el destino.' });
          else if (o.ir.startsWith('fin:') ? !finIds.has(o.ir.slice(4)) : !pasoIds.has(o.ir)) h.push({ tipo: 'relacion_rota', id: o.id, detalle: `ir → ${o.ir} no existe en la variante.` });
        }
      }
    }
  }
  // Ningún borrador puede aparecer en la experiencia pública.
  for (const x of [...publicado.escenas, ...publicado.negas, ...publicado.reglas, ...publicado.casos]) {
    if ((x.estado as string) === 'borrador') h.push({ tipo: 'borrador_publico', id: x.id, detalle: 'Un borrador llegó al contenido público.' });
  }
  const textosBorrador = new Set(borradores.negas.map((n) => n.contenido));
  for (const n of publicado.negas) if (textosBorrador.has(n.texto)) h.push({ tipo: 'borrador_publico', id: n.id, detalle: 'Una nega pública repite el texto de un borrador de tanda.' });
  for (const e of publicado.escenas) for (const r of e.relacionados) {
    // La relación editorial con un borrador se permite; su texto no se muestra al jugador.
    void r;
  }
  return h;
}
