import data from './data/reglas.json';
import type { Regla } from './types';

/**
 * Reglas de Oro. Redacción editorial aportada por Mitsuo; `corta` es la versión de una línea.
 * Viven en data/reglas.json porque también las lee el widget nativo de Android.
 */
export const reglas = data.reglas as Regla[];
