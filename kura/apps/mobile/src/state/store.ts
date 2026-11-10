import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { rules } from '@/content/alaira';
import { localDateOf } from '@/domain/dates';
import { applyPracticeEvent, markPresentationSeen, type ApplyResult } from '@/domain/progression';
import { emptyPlayer, type PlayerState, type PracticeEvent } from '@/domain/types';

export interface MemoryEntry {
  id: string;
  at: number;
  text: string;
}

interface KuraState {
  hydrated: boolean;
  name: string;
  focusTheme: string;
  favoriteThemes: string[];
  savedAffirmations: string[];
  recentAffirmations: string[];
  ambience: string;
  memory: MemoryEntry[];
  player: PlayerState;
  /** Eventos aún no enviados al servidor. Hoy solo se acumulan; el backend los consumirá tal cual. */
  outbox: PracticeEvent[];

  setName: (name: string) => void;
  setFocusTheme: (id: string) => void;
  toggleFavoriteTheme: (id: string) => void;
  toggleSavedAffirmation: (id: string) => void;
  noteAffirmationsShown: (ids: string[]) => void;
  setAmbience: (id: string) => void;
  addMemory: (text: string) => void;
  completePractice: (practiceId: string, durationSec: number) => ApplyResult;
  dismissPresentation: (id: string) => void;
  reset: () => void;
}

const RECENT_KEPT = 12;
const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

const initial = {
  name: '',
  focusTheme: 'confianza',
  favoriteThemes: [] as string[],
  savedAffirmations: [] as string[],
  recentAffirmations: [] as string[],
  ambience: 'base',
  memory: [] as MemoryEntry[],
  player: emptyPlayer(),
  outbox: [] as PracticeEvent[],
};

export const useKura = create<KuraState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initial,

      setName: (name) => set({ name: name.trim() }),
      setFocusTheme: (focusTheme) => set({ focusTheme }),
      toggleFavoriteTheme: (id) => set((s) => ({ favoriteThemes: toggle(s.favoriteThemes, id) })),
      toggleSavedAffirmation: (id) => set((s) => ({ savedAffirmations: toggle(s.savedAffirmations, id) })),
      noteAffirmationsShown: (ids) =>
        set((s) => ({
          recentAffirmations: [...s.recentAffirmations.filter((x) => !ids.includes(x)), ...ids].slice(-RECENT_KEPT),
        })),
      setAmbience: (id) => {
        if (id === 'base' || get().player.inventory.includes(id)) set({ ambience: id });
      },
      addMemory: (text) => {
        const clean = text.trim();
        if (!clean) return;
        set((s) => ({ memory: [{ id: Crypto.randomUUID(), at: Date.now(), text: clean }, ...s.memory] }));
      },

      completePractice: (practiceId, durationSec) => {
        const practice = rules.practices[practiceId];
        const now = Date.now();
        const event: PracticeEvent = {
          id: Crypto.randomUUID(),
          practiceId,
          guide: practice?.guide ?? 'alaira',
          kind: practice?.kind ?? 'ritual',
          at: now,
          localDate: localDateOf(now),
          durationSec: Math.round(durationSec),
        };
        const result = applyPracticeEvent(get().player, event, rules);
        if (result.status === 'aplicado') {
          set((s) => ({ player: result.state, outbox: [...s.outbox, event] }));
        }
        return result;
      },

      dismissPresentation: (id) => set((s) => ({ player: markPresentationSeen(s.player, id) })),
      reset: () => set({ ...initial, player: emptyPlayer() }),
    }),
    {
      name: 'kura.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) =>
        Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')),
      onRehydrateStorage: () => () => useKura.setState({ hydrated: true }),
    },
  ),
);
