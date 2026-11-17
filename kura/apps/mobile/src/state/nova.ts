import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { jefeBar, unidades, type Escena, type HabilidadId } from '@/content/nova';
import { localDateOf } from '@/domain/dates';
import {
  emptyNova, iniciarEscena, marcarEjercicio, registrarPrueba, registrarRepaso, resolverNega, terminarEscena,
  type Catalogo, type NovaProgress, type Partida, type Resultado,
} from '@/domain/nova';

const cat: Catalogo = { mapa: unidades.map((u) => ({ habilidad: u.id, escenas: u.escenas })), jefe: jefeBar };
const hoy = () => localDateOf(Date.now());

interface NovaStore extends NovaProgress {
  hydrated: boolean;
  verIntro: () => void;
  iniciar: (escena: Escena, variante: string) => void;
  terminar: (escena: Escena, partida: Partida) => Resultado;
  nega: (tarjeta: string, esperó?: boolean) => Resultado;
  prueba: (aciertos: number) => Resultado;
  repasar: (aciertos: number, total: number, habilidad: HabilidadId | null, limpio: boolean) => Resultado;
  ejercicio: (id: string) => Resultado;
  guardar: (id: string) => void;
  /** Marca como vistos todos los premios pendientes de mostrar. */
  premiosVistos: () => void;
  reiniciar: () => void;
}

const datos = (s: NovaStore): NovaProgress => {
  const { hydrated: _h, ...rest } = s;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as unknown as NovaProgress;
};

/** Progreso de NOVA, guardado en el dispositivo aparte del de los otros guías. */
export const useNova = create<NovaStore>()(
  persist(
    (set, get) => {
      const aplicar = (r: Resultado) => {
        set(r.state);
        return r;
      };
      return {
        hydrated: false,
        ...emptyNova(),
        verIntro: () => set({ introVista: true }),
        iniciar: (escena, variante) => set(iniciarEscena(datos(get()), escena, variante)),
        terminar: (escena, partida) => aplicar(terminarEscena(datos(get()), escena, partida, hoy(), cat)),
        nega: (tarjeta, esperó) => aplicar(resolverNega(datos(get()), tarjeta, hoy(), cat, esperó)),
        prueba: (aciertos) => aplicar(registrarPrueba(datos(get()), aciertos, hoy(), cat)),
        repasar: (aciertos, total, habilidad, limpio) => aplicar(registrarRepaso(datos(get()), aciertos, total, habilidad, limpio, hoy(), cat)),
        ejercicio: (id) => aplicar(marcarEjercicio(datos(get()), id)),
        guardar: (id) => set((s) => ({ guardadas: s.guardadas.includes(id) ? s.guardadas.filter((x) => x !== id) : [...s.guardadas, id] })),
        premiosVistos: () => set({ porMostrar: [] }),
        reiniciar: () => set(emptyNova()),
      };
    },
    {
      name: 'kura.nova.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => datos(s),
      onRehydrateStorage: () => () => useNova.setState({ hydrated: true }),
    },
  ),
);
