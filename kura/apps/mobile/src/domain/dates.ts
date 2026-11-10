/** El "día" de KURA cambia a las 04:00 locales, para que practicar a medianoche cuente para hoy. */
export const DAY_CUTOFF_HOURS = 4;

const pad = (n: number) => String(n).padStart(2, '0');

export function localDateOf(at: number | Date): string {
  const d = new Date(typeof at === 'number' ? at : at.getTime());
  d.setHours(d.getHours() - DAY_CUTOFF_HOURS);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Suma días a una fecha YYYY-MM-DD sin depender de la zona horaria. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/**
 * Días seguidos hasta `today`. Si hoy aún no hay práctica, la racha de ayer sigue viva:
 * solo se pierde cuando pasa un día completo sin practicar.
 */
export function currentStreak(activeDays: readonly string[], today: string): number {
  const set = new Set(activeDays);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(cursor)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export type DayPart = 'manana' | 'tarde' | 'noche';

export function dayPartOf(at: Date): DayPart {
  const h = at.getHours();
  if (h >= DAY_CUTOFF_HOURS && h < 12) return 'manana';
  if (h >= 12 && h < 19) return 'tarde';
  return 'noche';
}
