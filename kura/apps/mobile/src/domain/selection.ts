/** Azar determinista: la misma semilla da siempre la misma elección (app, widget y notificación coinciden). */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: string): () => number {
  let a = hash(seed) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Weighted<T> {
  value: T;
  weight: number;
}

/** Elige `count` elementos distintos respetando pesos. */
export function pickWeighted<T>(pool: readonly Weighted<T>[], count: number, seed: string): T[] {
  const rnd = seededRandom(seed);
  const rest = pool.filter((p) => p.weight > 0);
  const out: T[] = [];
  while (out.length < count && rest.length > 0) {
    const total = rest.reduce((a, p) => a + p.weight, 0);
    let r = rnd() * total;
    let i = 0;
    while (i < rest.length - 1 && r >= rest[i].weight) {
      r -= rest[i].weight;
      i++;
    }
    out.push(rest[i].value);
    rest.splice(i, 1);
  }
  return out;
}

export interface AffirmationLike {
  id: string;
  theme: string;
}

export interface AffirmationPickOptions {
  focusThemes: readonly string[];
  favoriteThemes: readonly string[];
  savedIds: readonly string[];
  recentIds: readonly string[];
}

/** Pesa foco, favoritas y guardadas; evita repetir lo visto hace poco mientras queden alternativas. */
export function pickAffirmations<T extends AffirmationLike>(
  pool: readonly T[],
  count: number,
  seed: string,
  o: AffirmationPickOptions,
): T[] {
  const weigh = (list: readonly T[]) =>
    list.map((a) => ({
      value: a,
      weight:
        (o.focusThemes.includes(a.theme) ? 4 : 1) *
        (o.favoriteThemes.includes(a.theme) ? 2 : 1) *
        (o.savedIds.includes(a.id) ? 2 : 1),
    }));
  const freshPool = pool.filter((a) => !o.recentIds.includes(a.id));
  const picked = pickWeighted(weigh(freshPool), count, seed);
  if (picked.length < count) {
    const missing = pool.filter((a) => !picked.includes(a));
    picked.push(...pickWeighted(weigh(missing), count - picked.length, seed + ':relleno'));
  }
  return picked;
}
