import type { GuideId } from '@/domain/types';

export interface World {
  id: GuideId;
  name: string;
  role: string;
  pitch: string;
  /** Color de acento del mundo; cada personaje tiene su propia dirección visual. */
  accent: string;
  deep: string;
  icon: string;
  available: boolean;
}

export const worlds: World[] = [
  { id: 'alaira', name: 'Alaira', role: 'La anfitriona', pitch: 'Respiración, afirmaciones y el arte de cambiar tu polaridad.', accent: '#F3CF8A', deep: '#2A2370', icon: 'luna', available: true },
  { id: 'amaya', name: 'Amaya', role: 'Guardiana de la vitalidad', pitch: 'Escucha tu cuerpo y cuídalo con amor.', accent: '#4FD69A', deep: '#0F3B30', icon: 'hoja', available: false },
  { id: 'azara', name: 'Azara', role: 'Estratega de la ambición', pitch: 'Convierte la confianza en decisiones y acciones.', accent: '#FF8A5C', deep: '#4A1D1A', icon: 'montana', available: false },
  { id: 'nova', name: 'Nova', role: 'Guía de la presencia', pitch: 'Cultiva tu imagen, tu expresión y tu magnetismo.', accent: '#6FC3FF', deep: '#12305A', icon: 'estrella', available: false },
  { id: 'orion', name: 'Orion', role: 'El filósofo', pitch: 'Ideas y reflexiones para cultivar tu propia sabiduría.', accent: '#C9B6FF', deep: '#2B2150', icon: 'libro', available: false },
];
