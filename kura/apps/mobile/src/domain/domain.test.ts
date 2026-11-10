import { describe, expect, it } from 'vitest';
import { rules, affirmations, PRACTICE } from '../content/alaira';
import { addDays, currentStreak, localDateOf } from './dates';
import { applyPracticeEvent, levelInfo, markPresentationSeen, xpForEvent, xpToNext } from './progression';
import { pickAffirmations } from './selection';
import { emptyPlayer, type PlayerState, type PracticeEvent } from './types';

let n = 0;
const ev = (localDate: string, over: Partial<PracticeEvent> = {}): PracticeEvent => ({
  id: `e${++n}`,
  practiceId: PRACTICE.respira1,
  guide: 'alaira',
  kind: 'respiracion',
  at: 0,
  localDate,
  durationSec: 60,
  ...over,
});
const run = (events: PracticeEvent[], start: PlayerState = emptyPlayer()) =>
  events.reduce((s, e) => applyPracticeEvent(s, e, rules).state, start);

describe('fechas', () => {
  it('antes de las 04:00 sigue siendo el día anterior', () => {
    expect(localDateOf(new Date(2026, 0, 10, 3, 59))).toBe('2026-01-09');
    expect(localDateOf(new Date(2026, 0, 10, 4, 0))).toBe('2026-01-10');
  });
  it('suma días cruzando mes y año', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('la racha sigue viva si hoy aún no se practica y se pierde tras un día vacío', () => {
    const days = ['2026-01-01', '2026-01-02', '2026-01-03'];
    expect(currentStreak(days, '2026-01-03')).toBe(3);
    expect(currentStreak(days, '2026-01-04')).toBe(3);
    expect(currentStreak(days, '2026-01-05')).toBe(0);
  });
});

describe('niveles', () => {
  it('nivel y progreso son coherentes con la curva', () => {
    expect(levelInfo(0)).toEqual({ level: 1, into: 0, needed: 60 });
    expect(levelInfo(59).level).toBe(1);
    expect(levelInfo(60)).toEqual({ level: 2, into: 0, needed: 100 });
    expect(levelInfo(60 + 100 + 5)).toEqual({ level: 3, into: 5, needed: xpToNext(3) });
  });
  it('primera del día vale doble y después de la tercera se reduce', () => {
    expect([0, 1, 2, 3, 9].map((k) => xpForEvent(20, k))).toEqual([40, 20, 20, 5, 5]);
  });
});

describe('aplicar eventos', () => {
  it('es idempotente: reenviar el mismo evento no cambia nada', () => {
    const e = ev('2026-01-01');
    const once = applyPracticeEvent(emptyPlayer(), e, rules);
    const twice = applyPracticeEvent(once.state, e, rules);
    expect(once.status).toBe('aplicado');
    expect(twice.status).toBe('duplicado');
    expect(twice.state).toBe(once.state);
  });

  it('rechaza prácticas desconocidas o demasiado cortas sin tocar el estado', () => {
    const s = emptyPlayer();
    expect(applyPracticeEvent(s, ev('2026-01-01', { practiceId: 'no.existe' }), rules).status).toBe('rechazado');
    const short = applyPracticeEvent(s, ev('2026-01-01', { durationSec: 5 }), rules);
    expect(short.status).toBe('rechazado');
    expect(short.state).toBe(s);
  });

  it('la primera sesión otorga el hito, su fragmento y la resonancia extra', () => {
    const r = applyPracticeEvent(emptyPlayer(), ev('2026-01-01'), rules);
    expect(r.state.milestonesDone).toContain('primer-brote');
    expect(r.state.inventory).toEqual(['alaira.fragmento.1']);
    expect(r.xpGained).toBe(15 * 2 + 20);
    expect(r.state.xp).toBe(50);
    expect(r.presentations.map((p) => p.kind)).toEqual(['hito']);
  });

  it('diez días seguidos desbloquean la ambientación Aurora una sola vez', () => {
    const days = Array.from({ length: 12 }, (_, i) => addDays('2026-01-01', i));
    const s = run(days.map((d) => ev(d)));
    expect(s.bestStreak).toBe(12);
    expect(s.milestonesDone).toEqual(expect.arrayContaining(['racha-3', 'racha-7', 'racha-10']));
    expect(s.inventory.filter((i) => i === 'alaira.amb.aurora')).toHaveLength(1);
    expect(s.milestonesDone).not.toContain('racha-30');
  });

  it('un día sin practicar reinicia la racha pero conserva lo ganado', () => {
    const s = run([ev('2026-01-01'), ev('2026-01-02'), ev('2026-01-04'), ev('2026-01-05')]);
    expect(currentStreak(s.activeDays, '2026-01-05')).toBe(2);
    expect(s.bestStreak).toBe(2);
    expect(s.milestonesDone).not.toContain('racha-3');
    expect(s.inventory).toContain('alaira.fragmento.1');
  });

  it('subir de nivel genera una celebración y cada hito se presenta una vez', () => {
    const s = run([ev('2026-01-01'), ev('2026-01-01')]); // 50 + 15 = 65 → nivel 2
    expect(levelInfo(s.xp).level).toBe(2);
    expect(s.presentations.filter((p) => p.kind === 'nivel')).toHaveLength(1);
    const ids = s.presentations.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const after = markPresentationSeen(s, ids[0]);
    expect(after.presentations).toHaveLength(ids.length - 1);
  });

  it('la resonancia de un hito puede cumplir un hito de nivel en el mismo evento', () => {
    const base: PlayerState = { ...emptyPlayer(), xp: 150, milestonesDone: ['primer-brote'], counters: { sesiones: 3 } };
    const r = applyPracticeEvent(base, ev('2026-01-01', { practiceId: PRACTICE.frase, kind: 'filosofia' }), rules);
    expect(levelInfo(r.state.xp).level).toBe(3);
    expect(r.state.milestonesDone).toContain('vinculo-3');
    expect(r.state.inventory).toContain('alaira.fragmento.3');
  });

  it('el orden de llegada de dos días distintos no cambia días activos ni inventario', () => {
    const a = ev('2026-01-01');
    const b = ev('2026-01-02');
    const ab = run([a, b]);
    const ba = run([b, a]);
    expect(ba.activeDays).toEqual(ab.activeDays);
    expect([...ba.inventory].sort()).toEqual([...ab.inventory].sort());
    expect(ba.xp).toBe(ab.xp);
  });
});

describe('contenido', () => {
  it('toda recompensa de hito existe en el catálogo y los ids no se repiten', () => {
    const ids = rules.milestones.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of rules.milestones)
      for (const g of m.grants) if ('item' in g) expect(rules.items[g.item], g.item).toBeDefined();
  });
  it('todo objeto del catálogo se puede obtener por algún hito', () => {
    const granted = new Set(rules.milestones.flatMap((m) => m.grants.flatMap((g) => ('item' in g ? [g.item] : []))));
    for (const id of Object.keys(rules.items)) expect(granted.has(id), id).toBe(true);
  });
  it('las afirmaciones tienen ids únicos y sus requisitos existen', () => {
    const ids = affirmations.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of affirmations) if (a.requires) expect(rules.items[a.requires]).toBeDefined();
  });
});

describe('selección de afirmaciones', () => {
  const opts = { focusThemes: ['calma'], favoriteThemes: [], savedIds: [], recentIds: [] };
  it('es determinista por semilla y no repite', () => {
    const a = pickAffirmations(affirmations, 3, 'u:2026-01-01', opts);
    const b = pickAffirmations(affirmations, 3, 'u:2026-01-01', opts);
    expect(a).toEqual(b);
    expect(new Set(a.map((x) => x.id)).size).toBe(3);
  });
  it('evita las recientes mientras haya alternativas y rellena si no las hay', () => {
    const calm = affirmations.filter((a) => a.theme === 'calma' && !a.requires);
    const recent = calm.slice(0, 4).map((a) => a.id);
    const picked = pickAffirmations(calm, 3, 's', { ...opts, recentIds: recent });
    expect(picked).toHaveLength(3);
    expect(picked.filter((p) => !recent.includes(p.id))).toHaveLength(2);
  });
  it('el tema en foco domina la selección', () => {
    let calma = 0;
    for (let i = 0; i < 200; i++)
      calma += pickAffirmations(affirmations, 1, `seed${i}`, opts)[0].theme === 'calma' ? 1 : 0;
    expect(calma).toBeGreaterThan(60);
  });
});
