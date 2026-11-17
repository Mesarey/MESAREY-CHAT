/**
 * Modelo de contenido de NOVA. Todo lo jugable es dato versionado: escenas, pasos, opciones,
 * reacciones, reglas y referencias. Las pantallas no llevan texto editorial propio.
 */
export const NOVA_CONTENT_VERSION = 1;

/** `borrador` nunca se muestra fuera del flujo editorial. */
export type Estado = 'borrador' | 'revisado' | 'mvp';
export type Ruta = 'principal' | 'cuando_buscas_algo_mas_serio';

export type HabilidadId =
  | 'presencia' | 'abrir' | 'sostener' | 'humor' | 'intencion' | 'leer' | 'cerrar' | 'instagram'
  | 'serio';

export interface Regla {
  id: string;
  titulo: string;
  /** Versión de una línea para la presentación previa a la primera partida. */
  corta: string;
  /** Redacción editorial completa. */
  texto: string;
  icono: string;
  estado: Estado;
}

/**
 * encaja: la escena avanza. valida: también avanza; NOVA explica qué comunica.
 * ajusta: NOVA señala el detalle que faltó leer y se reintenta el paso.
 * salida: cierre tranquilo elegido por el jugador; termina la escena.
 */
export type Tono = 'encaja' | 'valida' | 'ajusta' | 'salida';

export interface Linea {
  /** 'Ella', 'Su amiga', 'Escena'… */
  quien: string;
  texto: string;
}

export interface Opcion {
  id: string;
  texto: string;
  tono: Tono;
  reaccion: Linea[];
  nova: string;
  /** Paso siguiente o `fin:<id de final>`. Las opciones `ajusta` no llevan destino. */
  ir?: string;
  regla?: string;
  /** Marca de criterio aplicado; alimenta premios. */
  marca?: 'espera' | 'frente' | 'incluye' | 'disculpa' | 'acepta_no' | 'intencion' | 'suelta';
}

export interface Paso {
  id: string;
  /** Pregunta corta de la decisión: «¿Cuándo llegas?» */
  pregunta: string;
  /** Qué se ve en este momento, en dosis pequeña. */
  escena: string;
  abre?: string;
  espera?: string;
  opciones: Opcion[];
}

export type TipoFinal = 'contacto' | 'conversacion' | 'cierre' | 'noche';

export interface Final {
  id: string;
  tipo: TipoFinal;
  titulo: string;
  texto: string;
}

export interface Variante {
  id: string;
  nombre: string;
  lugar: string;
  /** Dónde estás y quién está con quién, antes de la primera decisión. */
  contexto: string;
  inicio: string;
  pasos: Paso[];
  finales: Final[];
}

export interface Referencia {
  clase: 'adaptacion' | 'original_nova';
  libro?: string;
  pagina?: string;
  nota: string;
}

export interface Escena {
  id: string;
  titulo: string;
  tipo: 'mision' | 'jefe';
  habilidad: HabilidadId;
  ruta: Ruta;
  resumen: string;
  reglas: string[];
  micro: string[];
  referencias: Referencia[];
  /** IDs de fichas de tanda con el mismo tema (relación editorial; pueden ser borradores). */
  relacionados: string[];
  estado: Estado;
  variantes: Variante[];
}

export interface Unidad {
  id: HabilidadId;
  orden: number;
  titulo: string;
  icono: string;
  regla: string;
  intro: string;
  micro: string[];
  escenas: string[];
  ejercicio: { id: string; titulo: string; texto: string };
}

export type CategoriaPrueba = 'tono_seco' | 'broma_compartida' | 'invitacion' | 'cortesia' | 'iniciativa' | 'cierre';

export interface CasoPrueba {
  id: string;
  categoria: CategoriaPrueba;
  habilidad: HabilidadId;
  situacion: string;
  opciones: { texto: string; acierta: boolean; nova: string }[];
  regla?: string;
  estado: Estado;
}

export interface Afirmacion {
  id: string;
  texto: string;
  /** observacion: algo que se puede ver u oír. suposicion: una lectura que le pusiste tú. */
  clase: 'observacion' | 'suposicion';
  nova: string;
}

export interface Nega {
  id: string;
  texto: string;
  queObservar: string;
  estado: Estado;
  procedencia: string;
}

export interface FichaTanda {
  id: string;
  idioma: string;
  ruta: Ruta;
  modulo: string;
  tipo: 'escenario' | 'frase' | 'tip' | 'nega' | 'ejercicio';
  titulo: string;
  contenido: string;
  estado: Estado;
  procedencia: string;
  escena?: string;
  que_observar?: string;
  relacionados: string[];
}

export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  pdf: string | null;
  nota: string;
  ruta: Ruta;
  secciones: { titulo: string; paginas: string | null }[];
}

export interface Pasaje {
  id: string;
  libro: string;
  ruta: Ruta;
  clase: 'cita_textual' | 'resumen_del_libro' | 'original_nova';
  pagina: string | null;
  texto: string;
  contexto: string;
  seccion: string;
}

export interface Premio {
  id: string;
  titulo: string;
  reconoce: 'observacion' | 'claridad' | 'conversacion' | 'reciprocidad' | 'cierre' | 'constancia';
  icono: string;
  /** Qué lo desbloquea, en palabras para la sala de premios. */
  como: string;
  frase: string;
}

/* ---------- Ayudas de redacción: mantienen las escenas legibles como guion ---------- */

type L = string | Linea;
const linea = (l: L): Linea => {
  if (typeof l !== 'string') return l;
  const i = l.indexOf('|');
  return i < 0 ? { quien: 'Escena', texto: l } : { quien: l.slice(0, i), texto: l.slice(i + 1) };
};
type Extra = Pick<Opcion, 'regla' | 'marca'>;
type Borrador = Omit<Opcion, 'id'>;

export const encaja = (texto: string, reaccion: L[], nova: string, ir: string, extra: Extra = {}): Borrador =>
  ({ texto, tono: 'encaja', reaccion: reaccion.map(linea), nova, ir, ...extra });
export const valida = (texto: string, reaccion: L[], nova: string, ir: string, extra: Extra = {}): Borrador =>
  ({ texto, tono: 'valida', reaccion: reaccion.map(linea), nova, ir, ...extra });
export const ajusta = (texto: string, reaccion: L[], nova: string, regla?: string): Borrador =>
  ({ texto, tono: 'ajusta', reaccion: reaccion.map(linea), nova, regla });
export const salida = (texto: string, reaccion: L[], nova: string, fin: string, extra: Extra = {}): Borrador =>
  ({ texto, tono: 'salida', reaccion: reaccion.map(linea), nova, ir: `fin:${fin}`, ...extra });

export const paso = (id: string, pregunta: string, escena: string, opciones: Borrador[], pistas: { abre?: string; espera?: string } = {}): Paso =>
  ({ id, pregunta, escena, ...pistas, opciones: opciones.map((o, i) => ({ ...o, id: `${id}.${String.fromCharCode(97 + i)}` })) });

export const FINALES: Record<TipoFinal, Omit<Final, 'id'>> = {
  contacto: { tipo: 'contacto', titulo: 'Contacto acordado', texto: 'Hubo intercambio, dijiste qué te gustó y ella eligió seguir en contacto.' },
  conversacion: { tipo: 'conversacion', titulo: 'Conversación mutua', texto: 'Platicaron de ida y vuelta y cada quien siguió con su noche. Eso ya es una buena jugada.' },
  cierre: { tipo: 'cierre', titulo: 'Cierre tranquilo', texto: 'Leíste la respuesta y te despediste bien. Así se queda uno con buena fama.' },
  noche: { tipo: 'noche', titulo: 'Seguiste con tu noche', texto: 'Decidiste no acercarte esta vez. Nadie te debe una plática y tú no le debes un intento a nadie.' },
};
export const fin = (...tipos: TipoFinal[]): Final[] => tipos.map((t) => ({ id: t, ...FINALES[t] }));
