export type GuideId = 'alaira' | 'amaya' | 'azara' | 'nova' | 'orion';
export type PracticeKind = 'respiracion' | 'afirmaciones' | 'ritual' | 'filosofia';

/** Lo único que el cliente reporta: "terminé esta práctica". Todo lo demás se deriva. */
export interface PracticeEvent {
  /** UUID generado en el cliente; es la llave de idempotencia. */
  id: string;
  practiceId: string;
  guide: GuideId;
  kind: PracticeKind;
  /** Instante real de finalización (ms epoch). */
  at: number;
  /** Día local del usuario (YYYY-MM-DD) con corte a las 04:00. */
  localDate: string;
  durationSec: number;
}

export type Grant = { item: string } | { xp: number };

export type MilestoneCondition =
  | { counter: string; atLeast: number }
  | { streakAtLeast: number }
  | { levelAtLeast: number };

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  when: MilestoneCondition;
  grants: Grant[];
}

export type RewardKind = 'ambientacion' | 'afirmaciones' | 'fragmento' | 'titulo';

export interface RewardItem {
  id: string;
  kind: RewardKind;
  name: string;
  description: string;
}

export interface PracticeDef {
  id: string;
  guide: GuideId;
  kind: PracticeKind;
  xp: number;
  /** Duración mínima plausible; por debajo no se otorga nada. */
  minDurationSec: number;
}

export interface RulesContent {
  practices: Record<string, PracticeDef>;
  milestones: Milestone[];
  items: Record<string, RewardItem>;
}

export type Presentation =
  | { id: string; kind: 'nivel'; level: number }
  | { id: string; kind: 'hito'; milestoneId: string; items: string[]; xp: number };

export interface SessionRecord {
  eventId: string;
  practiceId: string;
  kind: PracticeKind;
  at: number;
  localDate: string;
  durationSec: number;
  xp: number;
}

export interface PlayerState {
  xp: number;
  appliedEvents: string[];
  /** Días locales con al menos una práctica, ordenados y sin repetir. */
  activeDays: string[];
  bestStreak: number;
  counters: Record<string, number>;
  milestonesDone: string[];
  inventory: string[];
  /** Celebraciones pendientes de mostrarse; sobreviven a cerrar la app. */
  presentations: Presentation[];
  sessions: SessionRecord[];
}

export const emptyPlayer = (): PlayerState => ({
  xp: 0,
  appliedEvents: [],
  activeDays: [],
  bestStreak: 0,
  counters: {},
  milestonesDone: [],
  inventory: [],
  presentations: [],
  sessions: [],
});
