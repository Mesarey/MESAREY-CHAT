import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { affirmations, streakStops } from '@/content/alaira';
import { currentStreak, localDateOf } from '@/domain/dates';
import { useKura } from './store';

/** Día local vigente; se actualiza al volver a la app y al cruzar el corte de las 04:00. */
export function useToday(): string {
  const [today, setToday] = useState(() => localDateOf(Date.now()));
  useEffect(() => {
    const refresh = () => setToday(localDateOf(Date.now()));
    const timer = setInterval(refresh, 60_000);
    const sub = AppState.addEventListener('change', (st) => st === 'active' && refresh());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return today;
}

export function useStreak() {
  const today = useToday();
  const activeDays = useKura((s) => s.player.activeDays);
  const done = useKura((s) => s.player.milestonesDone);
  return useMemo(() => {
    const streak = currentStreak(activeDays, today);
    const next = streakStops.find((m) => !done.includes(m.id));
    return { streak, practicedToday: activeDays.includes(today), next, target: next?.when.streakAtLeast ?? null };
  }, [activeDays, today, done]);
}

/** Afirmaciones que el usuario puede ver: las base más los paquetes que ya desbloqueó. */
export function useAffirmationPool() {
  const inventory = useKura((s) => s.player.inventory);
  return useMemo(() => affirmations.filter((a) => !a.requires || inventory.includes(a.requires)), [inventory]);
}
