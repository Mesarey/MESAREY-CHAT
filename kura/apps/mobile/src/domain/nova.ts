import type { Escena, HabilidadId, Opcion, TipoFinal } from '@/content/nova/types';

/**
 * Reglas puras de NOVA: variantes, XP, premios y repaso. Sin I/O, para poder probarlas.
 * El XP de NOVA es su propia resonancia; no se mezcla con la de otros guías.
 */

export const XP = { mision: 40, jefe: 80, serio: 40, nega: 5, pruebaPorPunto: 10, repaso: 15, ejercicio: 10 } as const;
export const XP_POR_NIVEL = 200;

export const nivelNova = (xp: number) => ({
  nivel: Math.floor(xp / XP_POR_NIVEL) + 1,
  enNivel: xp % XP_POR_NIVEL,
  paraSubir: XP_POR_NIVEL,
});

export type Marca = NonNullable<Opcion['marca']>;

export interface ProgresoEscena {
  /** Variante → tipo de final con el que se completó. */
  variantes: Record<string, TipoFinal>;
  enCurso: boolean;
  ultima?: string;
  /** Variantes ya mostradas en la vuelta actual; se vacía cuando se recorrieron todas. */
  vistas: string[];
}

export interface PendienteRepaso {
  habilidad: HabilidadId;
  fallos: number;
  reglas: string[];
  desde: string;
}

export interface NovaProgress {
  introVista: boolean;
  xp: number;
  /** Premio → fecha local en que se ganó. */
  premios: Record<string, string>;
  /** Premios ganados que todavía no se le muestran al jugador. */
  porMostrar: string[];
  escenas: Record<string, ProgresoEscena>;
  /** IDs de opciones distintas donde se aplicó cada criterio. */
  marcas: Partial<Record<Marca, string[]>>;
  negasResueltas: string[];
  mazo: string[];
  recordPrueba: number;
  repaso: PendienteRepaso[];
  repasoDias: string[];
  observacion: { aciertos: number; total: number };
  ejercicios: string[];
  guardadas: string[];
}

export const emptyNova = (): NovaProgress => ({
  introVista: false, xp: 0, premios: {}, porMostrar: [], escenas: {}, marcas: {}, negasResueltas: [], mazo: [],
  recordPrueba: 0, repaso: [], repasoDias: [], observacion: { aciertos: 0, total: 0 }, ejercicios: [], guardadas: [],
});

export type Rand = () => number;

export function barajar<T>(xs: readonly T[], rand: Rand = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Variante para una partida nueva: recorre todas antes de repetir y nunca
 * entrega la misma dos veces seguidas si la escena tiene más de una.
 */
export function elegirVariante(escena: Escena, p: ProgresoEscena | undefined, rand: Rand = Math.random): string {
  const ids = escena.variantes.map((v) => v.id);
  if (ids.length === 1) return ids[0];
  const vistas = p?.vistas ?? [];
  let pool = ids.filter((id) => !vistas.includes(id));
  if (pool.length === 0) pool = ids;
  const sinRepetir = pool.filter((id) => id !== p?.ultima);
  const usable = sinRepetir.length ? sinRepetir : pool;
  return usable[Math.floor(rand() * usable.length)];
}

export function iniciarEscena(state: NovaProgress, escena: Escena, variante: string): NovaProgress {
  const prev = state.escenas[escena.id] ?? { variantes: {}, enCurso: false, vistas: [] };
  const completas = prev.vistas.length >= escena.variantes.length;
  const vistas = completas ? [variante] : prev.vistas.includes(variante) ? prev.vistas : [...prev.vistas, variante];
  return { ...state, escenas: { ...state.escenas, [escena.id]: { ...prev, enCurso: true, ultima: variante, vistas } } };
}

export type EstadoMision = 'disponible' | 'en_progreso' | 'completada';
export const estadoMision = (p?: ProgresoEscena): EstadoMision =>
  !p ? 'disponible' : Object.keys(p.variantes).length > 0 ? 'completada' : p.enCurso ? 'en_progreso' : 'disponible';

/** Lo que pasó en una partida, para decidir XP, premios y repaso al terminar. */
export interface Partida {
  variante: string;
  final: TipoFinal;
  /** Opciones elegidas que llevan marca de criterio. */
  marcas: { marca: Marca; opcion: string }[];
  /** Reglas señaladas por NOVA en opciones que hubo que reintentar. */
  ajustes: string[];
  /** Se eligió bien el frente después de una corrección por la espalda. */
  corrigioEspalda: boolean;
}

export interface Resultado {
  state: NovaProgress;
  xp: number;
  premios: string[];
}

const hoyMas = (hoy: string, dias: number) => {
  const d = new Date(`${hoy}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function otorgar(state: NovaProgress, ids: string[], hoy: string): { state: NovaProgress; nuevos: string[] } {
  const nuevos = ids.filter((id) => !state.premios[id]);
  if (!nuevos.length) return { state, nuevos };
  const premios = { ...state.premios };
  for (const id of nuevos) premios[id] = hoy;
  return { state: { ...state, premios, porMostrar: [...state.porMostrar, ...nuevos] }, nuevos };
}

export interface Catalogo {
  /** Escenas de misión del Mapa CHAD, una lista por habilidad. */
  mapa: { habilidad: HabilidadId; escenas: string[] }[];
  jefe: Escena;
}

/** Premios que dependen solo del estado acumulado. */
export function premiosPorEstado(s: NovaProgress, cat: Catalogo): string[] {
  const out: string[] = [];
  const completas = Object.entries(s.escenas).filter(([, p]) => Object.keys(p.variantes).length > 0);
  if (completas.length > 0) out.push('primera-jugada');
  const esperas = new Set([...(s.marcas.espera ?? [])]);
  if (esperas.size >= 3) out.push('lees-el-momento');
  if (s.negasResueltas.length >= 10) out.push('ojo-al-detalle');
  if ((s.marcas.disculpa ?? []).length > 0) out.push('sono-pesado');
  if ((s.marcas.intencion ?? []).length > 0) out.push('dilo-simple');
  if (s.recordPrueba >= 7) out.push('criterio-fino');
  if (s.repasoDias.length > 0) out.push('vuelta-al-ruedo');
  const jefe = s.escenas[cat.jefe.id]?.variantes ?? {};
  const ramas = Object.keys(jefe);
  if (ramas.some((v) => v.startsWith('mesa')) && ramas.some((v) => v.startsWith('barra'))) out.push('jefe-de-ronda');
  if (cat.mapa.every((u) => u.escenas.some((e) => Object.keys(s.escenas[e]?.variantes ?? {}).length > 0))) out.push('ruta-completa');
  return out;
}

export function terminarEscena(state: NovaProgress, escena: Escena, partida: Partida, hoy: string, cat: Catalogo): Resultado {
  const prev = state.escenas[escena.id] ?? { variantes: {}, enCurso: false, vistas: [] };
  const primeraVez = !(partida.variante in prev.variantes);
  // «Seguiste con tu noche» es una salida válida, pero no completa la misión ni da XP.
  const cuenta = partida.final !== 'noche';
  const base = escena.tipo === 'jefe' ? XP.jefe : escena.ruta === 'principal' ? XP.mision : XP.serio;
  const xp = cuenta && primeraVez ? base : 0;

  const marcas = { ...state.marcas };
  for (const m of partida.marcas) {
    const lista = marcas[m.marca] ?? [];
    if (!lista.includes(m.opcion)) marcas[m.marca] = [...lista, m.opcion];
  }

  // Repaso: si hubo que reintentar, la habilidad se agenda; si salió limpia, se da por repasada.
  let repaso = state.repaso;
  if (escena.habilidad !== 'serio') {
    const actual = repaso.find((r) => r.habilidad === escena.habilidad);
    if (partida.ajustes.length > 0) {
      const reglas = [...new Set([...(actual?.reglas ?? []), ...partida.ajustes])];
      repaso = [...repaso.filter((r) => r.habilidad !== escena.habilidad), { habilidad: escena.habilidad, fallos: (actual?.fallos ?? 0) + partida.ajustes.length, reglas, desde: actual?.desde ?? hoy }];
    } else if (actual && cuenta) {
      repaso = repaso.filter((r) => r.habilidad !== escena.habilidad);
    }
  }

  let next: NovaProgress = {
    ...state,
    xp: state.xp + xp,
    marcas,
    repaso,
    escenas: {
      ...state.escenas,
      [escena.id]: { ...prev, enCurso: false, ultima: partida.variante, variantes: cuenta ? { ...prev.variantes, [partida.variante]: partida.final } : prev.variantes },
    },
  };

  const ids = premiosPorEstado(next, cat);
  if (partida.corrigioEspalda) ids.push('por-el-frente');
  if (cuenta && (partida.final === 'cierre' || partida.marcas.some((m) => m.marca === 'acepta_no'))) ids.push('buen-cierre');
  if (cuenta && escena.tipo === 'jefe' && partida.marcas.some((m) => m.marca === 'incluye')) ids.push('las-dos-cuentan');
  if (cuenta && escena.ruta === 'cuando_buscas_algo_mas_serio') ids.push('ida-y-vuelta');
  const r = otorgar(next, ids, hoy);
  next = r.state;
  return { state: next, xp, premios: r.nuevos };
}

/** Arena: una tarjeta distinta resuelta da XP una sola vez. */
export function resolverNega(state: NovaProgress, tarjeta: string, hoy: string, cat: Catalogo, esperó = false): Resultado {
  const nueva = !state.negasResueltas.includes(tarjeta);
  const marcas = { ...state.marcas };
  if (esperó) {
    const lista = marcas.espera ?? [];
    if (!lista.includes(tarjeta)) marcas.espera = [...lista, tarjeta];
  }
  let next: NovaProgress = { ...state, marcas, xp: state.xp + (nueva ? XP.nega : 0), negasResueltas: nueva ? [...state.negasResueltas, tarjeta] : state.negasResueltas };
  const r = otorgar(next, premiosPorEstado(next, cat), hoy);
  next = r.state;
  return { state: next, xp: nueva ? XP.nega : 0, premios: r.nuevos };
}

/** Mazo: entrega la siguiente tarjeta y solo vuelve a barajar cuando se acabaron todas. */
export function siguienteDelMazo(state: NovaProgress, todas: string[], rand: Rand = Math.random): { state: NovaProgress; tarjeta: string } {
  let mazo = state.mazo.filter((id) => todas.includes(id));
  if (mazo.length === 0) {
    // Primero las que faltan por resolver; las resueltas regresan al final de la vuelta.
    const pendientes = barajar(todas.filter((id) => !state.negasResueltas.includes(id)), rand);
    const resueltas = barajar(todas.filter((id) => state.negasResueltas.includes(id)), rand);
    mazo = [...pendientes, ...resueltas];
  }
  const [tarjeta, ...resto] = mazo;
  return { state: { ...state, mazo: resto }, tarjeta };
}

/** Prueba: solo mejorar el récord da XP, por la diferencia. */
export function registrarPrueba(state: NovaProgress, aciertos: number, hoy: string, cat: Catalogo): Resultado {
  const mejora = Math.max(0, aciertos - state.recordPrueba);
  const xp = mejora * XP.pruebaPorPunto;
  let next: NovaProgress = { ...state, xp: state.xp + xp, recordPrueba: Math.max(state.recordPrueba, aciertos) };
  const r = otorgar(next, premiosPorEstado(next, cat), hoy);
  next = r.state;
  return { state: next, xp, premios: r.nuevos };
}

/** Repaso: una sesión por día da XP. Guarda la precisión al distinguir observación de suposición. */
export function registrarRepaso(state: NovaProgress, aciertos: number, total: number, habilidad: HabilidadId | null, limpio: boolean, hoy: string, cat: Catalogo): Resultado {
  const primeraDelDia = !state.repasoDias.includes(hoy);
  const xp = primeraDelDia ? XP.repaso : 0;
  let repaso = state.repaso;
  if (habilidad) {
    // Si salió limpio se retira de la agenda; si no, se reagenda para dentro de dos días.
    repaso = limpio ? repaso.filter((r) => r.habilidad !== habilidad) : repaso.map((r) => (r.habilidad === habilidad ? { ...r, desde: hoyMas(hoy, 2) } : r));
  }
  let next: NovaProgress = {
    ...state, xp: state.xp + xp, repaso,
    repasoDias: primeraDelDia ? [...state.repasoDias, hoy] : state.repasoDias,
    observacion: { aciertos: state.observacion.aciertos + aciertos, total: state.observacion.total + total },
  };
  const r = otorgar(next, premiosPorEstado(next, cat), hoy);
  next = r.state;
  return { state: next, xp, premios: r.nuevos };
}

export function marcarEjercicio(state: NovaProgress, id: string): Resultado {
  if (state.ejercicios.includes(id)) return { state, xp: 0, premios: [] };
  return { state: { ...state, xp: state.xp + XP.ejercicio, ejercicios: [...state.ejercicios, id] }, xp: XP.ejercicio, premios: [] };
}

/** Índice estable por día para la rotación diaria (mismo cálculo que el widget nativo). */
export function indiceDelDia(fecha: string, total: number, salto = 0): number {
  const [y, m, d] = fecha.split('-').map(Number);
  const dias = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return (((dias + salto) % total) + total) % total;
}
