import { color } from './tokens';

/**
 * Lenguaje visual de NOVA: un Mundo propio dentro de KURA.
 * Conserva la tipografía, los radios y el dorado de recompensa de KURA; cambia el cielo violeta
 * por un azul de medianoche y usa el azul eléctrico del mundo como acento.
 */
export const nova = {
  sky: ['#07142A', '#0D2242', '#12305A', '#091A34'] as [string, string, string, string],
  accent: '#6FC3FF',
  accentSoft: 'rgba(111,195,255,0.14)',
  ink: '#07162B',
  card: 'rgba(16,42,80,0.66)',
  cardStrong: '#0B1E3B',
  line: 'rgba(111,195,255,0.30)',
  lineSoft: 'rgba(111,195,255,0.16)',
  text: color.text,
  muted: '#B4C6E4',
  /** La escena avanza. */
  encaja: '#7BE0B5',
  /** También funciona; comunica otra cosa. */
  valida: '#6FC3FF',
  /** Faltó leer un detalle; se reintenta. Ámbar, nunca rojo: no hay castigo. */
  ajusta: '#FFC773',
  salida: '#C9B6FF',
  gold: color.gold,
};

export const tonoColor = { encaja: nova.encaja, valida: nova.valida, ajusta: nova.ajusta, salida: nova.salida } as const;
export const tonoEtiqueta = { encaja: 'Encaja', valida: 'También funciona', ajusta: 'Faltó un detalle', salida: 'Cierre tranquilo' } as const;
