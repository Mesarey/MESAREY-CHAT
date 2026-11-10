import { AMBIENCE_AURORA } from '@/content/alaira';

export const color = {
  gold: '#F3CF8A',
  goldDeep: '#DDAA55',
  cream: '#F7EBD3',
  text: '#F5F1FF',
  muted: '#BDB7E3',
  faint: 'rgba(200,192,255,0.32)',
  card: 'rgba(28,26,82,0.62)',
  cardStrong: 'rgba(22,20,66,0.86)',
  ink: '#1B1840',
};

export const font = {
  display: 'Montserrat_600SemiBold',
  body: 'Montserrat_400Regular',
  bodyBold: 'Montserrat_600SemiBold',
};

/** Una ambientación es la "piel" del mundo: cielo, luna y brillo. Se desbloquean como recompensa. */
export interface Ambience {
  id: string;
  name: string;
  sky: [string, string, string, string];
  moon: [string, string];
  cloud: string;
  glow: string;
}

export const ambiences: Record<string, Ambience> = {
  base: {
    id: 'base',
    name: 'Noche violeta',
    sky: ['#12113A', '#1F1C5C', '#34297C', '#1A1750'],
    moon: ['#FFF3D6', '#E9C98F'],
    cloud: '#8E7BE0',
    glow: '#B9A4FF',
  },
  [AMBIENCE_AURORA]: {
    id: AMBIENCE_AURORA,
    name: 'Aurora',
    sky: ['#1A1440', '#4A2668', '#B4587A', '#2A1A52'],
    moon: ['#FFF6E0', '#FFC98A'],
    cloud: '#F0A0B4',
    glow: '#FFC6A0',
  },
};

/** Ancho máximo de la columna de contenido: teléfonos la llenan, tabletas la amplían hasta aquí. */
export const MAX_WIDTH = 720;
