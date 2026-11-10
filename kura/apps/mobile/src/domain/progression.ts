import { currentStreak } from './dates';
import type { Milestone, PlayerState, PracticeEvent, Presentation, RulesContent } from './types';

/** Resonancia necesaria para pasar del nivel `level` al siguiente. */
export const xpToNext = (level: number) => 60 + 40 * (level - 1);

export function levelInfo(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let rest = Math.max(0, Math.floor(xp));
  while (rest >= xpToNext(level)) {
    rest -= xpToNext(level);
    level++;
  }
  return { level, into: rest, needed: xpToNext(level) };
}

export const FIRST_OF_DAY_MULTIPLIER = 2;
/** A partir de esta práctica del día la resonancia se reduce: no se premia el farmeo. */
export const FULL_XP_PRACTICES_PER_DAY = 3;
export const DIMINISHED_FACTOR = 0.25;
const MAX_SESSIONS_KEPT = 500;

export function xpForEvent(baseXp: number, practicesAlreadyToday: number): number {
  if (practicesAlreadyToday === 0) return baseXp * FIRST_OF_DAY_MULTIPLIER;
  if (practicesAlreadyToday < FULL_XP_PRACTICES_PER_DAY) return baseXp;
  return Math.max(1, Math.round(baseXp * DIMINISHED_FACTOR));
}

function isMet(m: Milestone, s: PlayerState, streak: number): boolean {
  const w = m.when;
  if ('counter' in w) return (s.counters[w.counter] ?? 0) >= w.atLeast;
  if ('streakAtLeast' in w) return streak >= w.streakAtLeast;
  return levelInfo(s.xp).level >= w.levelAtLeast;
}

export type ApplyResult =
  | { status: 'aplicado'; state: PlayerState; xpGained: number; presentations: Presentation[] }
  | { status: 'duplicado' | 'rechazado'; state: PlayerState; xpGained: 0; presentations: [] };

/**
 * Corazón del sistema de recompensas. Función pura: mismo estado + mismo evento = mismo resultado.
 * Es la que el servidor ejecutará como autoridad y la que el cliente usa para mostrar el resultado al instante.
 */
export function applyPracticeEvent(prev: PlayerState, ev: PracticeEvent, content: RulesContent): ApplyResult {
  if (prev.appliedEvents.includes(ev.id)) {
    return { status: 'duplicado', state: prev, xpGained: 0, presentations: [] };
  }
  const practice = content.practices[ev.practiceId];
  if (!practice || ev.durationSec < practice.minDurationSec) {
    return { status: 'rechazado', state: prev, xpGained: 0, presentations: [] };
  }

  const levelBefore = levelInfo(prev.xp).level;
  const practicesToday = prev.sessions.filter((x) => x.localDate === ev.localDate).length;
  const eventXp = xpForEvent(practice.xp, practicesToday);

  const activeDays = prev.activeDays.includes(ev.localDate)
    ? prev.activeDays
    : [...prev.activeDays, ev.localDate].sort();
  const streak = currentStreak(activeDays, ev.localDate);

  const s: PlayerState = {
    ...prev,
    xp: prev.xp + eventXp,
    appliedEvents: [...prev.appliedEvents, ev.id],
    activeDays,
    bestStreak: Math.max(prev.bestStreak, streak),
    counters: {
      ...prev.counters,
      sesiones: (prev.counters.sesiones ?? 0) + 1,
      [`tipo:${ev.kind}`]: (prev.counters[`tipo:${ev.kind}`] ?? 0) + 1,
    },
    milestonesDone: [...prev.milestonesDone],
    inventory: [...prev.inventory],
    sessions: [
      ...prev.sessions,
      {
        eventId: ev.id,
        practiceId: ev.practiceId,
        kind: ev.kind,
        at: ev.at,
        localDate: ev.localDate,
        durationSec: ev.durationSec,
        xp: eventXp,
      },
    ].slice(-MAX_SESSIONS_KEPT),
  };

  // Los hitos pueden dar resonancia que a su vez cumple hitos de nivel: se evalúa hasta estabilizar.
  const fresh: Presentation[] = [];
  let bonusXp = 0;
  let changed = true;
  while (changed) {
    changed = false;
    for (const m of content.milestones) {
      if (s.milestonesDone.includes(m.id) || !isMet(m, s, streak)) continue;
      s.milestonesDone.push(m.id);
      const items: string[] = [];
      let xp = 0;
      for (const g of m.grants) {
        if ('xp' in g) xp += g.xp;
        else if (!s.inventory.includes(g.item)) {
          s.inventory.push(g.item);
          items.push(g.item);
        }
      }
      s.xp += xp;
      bonusXp += xp;
      fresh.push({ id: `${ev.id}:hito:${m.id}`, kind: 'hito', milestoneId: m.id, items, xp });
      changed = true;
    }
  }

  const levelAfter = levelInfo(s.xp).level;
  if (levelAfter > levelBefore) {
    fresh.unshift({ id: `${ev.id}:nivel:${levelAfter}`, kind: 'nivel', level: levelAfter });
  }
  s.presentations = [...prev.presentations, ...fresh];

  return { status: 'aplicado', state: s, xpGained: eventXp + bonusXp, presentations: fresh };
}

export function markPresentationSeen(s: PlayerState, id: string): PlayerState {
  return { ...s, presentations: s.presentations.filter((p) => p.id !== id) };
}
