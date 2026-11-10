import type { Milestone, PracticeDef, RewardItem, RulesContent } from '@/domain/types';

export interface Theme {
  id: string;
  name: string;
  tagline: string;
  icon: string;
}

export const themes: Theme[] = [
  { id: 'confianza', name: 'Confianza', tagline: 'Cree en ti', icon: 'montana' },
  { id: 'calma', name: 'Calma', tagline: 'Encuentra tu centro', icon: 'luna' },
  { id: 'salud', name: 'Salud', tagline: 'Escucha tu cuerpo', icon: 'hoja' },
  { id: 'enfoque', name: 'Enfoque', tagline: 'Una cosa a la vez', icon: 'enfoque' },
  { id: 'amor-propio', name: 'Amor propio', tagline: 'Valórate cada día', icon: 'corazon' },
  { id: 'abundancia', name: 'Abundancia', tagline: 'Abre posibilidades', icon: 'sol' },
  { id: 'gratitud', name: 'Gratitud', tagline: 'Honra lo presente', icon: 'loto' },
  { id: 'proposito', name: 'Propósito', tagline: 'Sigue tu camino', icon: 'estrella' },
];

/** Los cuatro temas que aparecen como acceso rápido en "Hoy". */
export const quickThemes = ['confianza', 'calma', 'salud', 'enfoque'];

export interface Affirmation {
  id: string;
  theme: string;
  text: string;
  /** Si existe, solo está disponible cuando el usuario tiene ese objeto. */
  requires?: string;
}

const byTheme: Record<string, string[]> = {
  confianza: [
    'Hoy confío en mi propio ritmo.',
    'Tengo lo necesario para dar el siguiente paso.',
    'Mi voz merece ser escuchada.',
    'Puedo hacer cosas difíciles.',
    'Confío en las decisiones que tomo con calma.',
    'Cada intento me vuelve más capaz.',
  ],
  calma: [
    'Respiro, y vuelvo a mí.',
    'No tengo que resolverlo todo ahora.',
    'Mi paz no depende de lo que pasa afuera.',
    'Suelto lo que no puedo controlar.',
    'En este momento estoy a salvo.',
    'Elijo responder en lugar de reaccionar.',
  ],
  salud: [
    'Mi cuerpo me habla y yo lo escucho.',
    'Descansar también es avanzar.',
    'Cuido de mí con paciencia.',
    'Agradezco a mi cuerpo todo lo que hace por mí.',
    'Me nutro con lo que me hace bien.',
    'Cada respiración me renueva.',
  ],
  enfoque: [
    'Una cosa a la vez es suficiente.',
    'Mi atención es valiosa y decido dónde ponerla.',
    'Empiezo pequeño y sigo constante.',
    'Lo importante primero.',
    'Vuelvo al presente cada vez que me distraigo.',
    'Termino lo que hoy me propuse.',
  ],
  'amor-propio': [
    'Soy suficiente tal como soy hoy.',
    'Me hablo como le hablaría a alguien que quiero.',
    'Merezco cosas buenas.',
    'Mis errores no definen mi valor.',
    'Me permito ocupar mi lugar.',
    'Me elijo, incluso en los días difíciles.',
  ],
  abundancia: [
    'Hay espacio para mí y para lo que quiero construir.',
    'Recibo con gratitud lo que llega.',
    'Me abro a nuevas posibilidades.',
    'Lo que doy con intención vuelve multiplicado.',
    'Reconozco las oportunidades cuando aparecen.',
    'Mi trabajo crea valor.',
  ],
  gratitud: [
    'Hoy encuentro algo pequeño que agradecer.',
    'Lo que ya tengo es un buen comienzo.',
    'Agradezco a quien fui por traerme hasta aquí.',
    'Este momento también es un regalo.',
    'Honro a las personas que me acompañan.',
    'La gratitud cambia cómo miro mi día.',
  ],
  proposito: [
    'Lo que hago hoy construye lo que quiero ser.',
    'Mi camino no tiene que parecerse al de nadie.',
    'Sigo lo que me da sentido.',
    'Cada paso cuenta, también los lentos.',
    'Estoy donde necesito estar para empezar.',
    'Mi vida tiene una dirección que yo elijo.',
  ],
};

const packLuz: [string, string][] = [
  ['calma', 'Soy la calma que estaba buscando.'],
  ['confianza', 'Mi luz no necesita permiso para brillar.'],
  ['amor-propio', 'Vuelvo a mí con ternura.'],
  ['proposito', 'Mi presencia cambia el lugar al que llego.'],
];

export const affirmations: Affirmation[] = [
  ...Object.entries(byTheme).flatMap(([theme, list]) =>
    list.map((text, i) => ({ id: `alaira.${theme}.${i + 1}`, theme, text })),
  ),
  ...packLuz.map(([theme, text], i) => ({
    id: `alaira.luz.${i + 1}`,
    theme,
    text,
    requires: 'alaira.pack.luz',
  })),
];

export interface BreathPattern {
  inhala: number;
  sosten: number;
  exhala: number;
}
export const breath: BreathPattern = { inhala: 4, sosten: 2, exhala: 6 };

export interface Quote {
  id: string;
  text: string;
  source: string;
}
export interface Work {
  id: string;
  title: string;
  author: string;
  icon: string;
  quotes: Quote[];
}

const work = (id: string, title: string, author: string, icon: string, q: [string, string][]): Work => ({
  id,
  title,
  author,
  icon,
  quotes: q.map(([text, source], i) => ({ id: `${id}.${i + 1}`, text, source })),
});

export const works: Work[] = [
  work('arte-de-la-guerra', 'El arte de la guerra', 'Sun Tzu', 'pagoda', [
    ['El supremo arte de la guerra es someter al enemigo sin luchar.', 'Capítulo III'],
    ['Conoce a tu enemigo y conócete a ti mismo; en cien batallas nunca estarás en peligro.', 'Capítulo III'],
    ['Vencerá quien sepa cuándo luchar y cuándo no.', 'Capítulo III'],
    ['La invencibilidad está en uno mismo; la vulnerabilidad, en el adversario.', 'Capítulo IV'],
    ['Los guerreros victoriosos primero vencen y después van a la batalla; los derrotados primero van a la batalla y después buscan vencer.', 'Capítulo IV'],
    ['Así como el agua adapta su curso al terreno, el guerrero logra la victoria adaptándose a su adversario.', 'Capítulo VI'],
    ['La rapidez es la esencia de la guerra.', 'Capítulo XI'],
  ]),
  work('meditaciones', 'Meditaciones', 'Marco Aurelio', 'luna', [
    ['El universo es cambio; la vida, opinión.', 'Libro IV, 3'],
    ['Al amanecer, cuando te cueste levantarte, ten presente esto: me levanto para hacer mi tarea de ser humano.', 'Libro V, 1'],
    ['El alma se tiñe del color de sus pensamientos.', 'Libro V, 16'],
    ['Lo que estorba a la acción la hace avanzar; lo que se interpone en el camino se vuelve el camino.', 'Libro V, 20'],
    ['El mejor modo de defenderte es no parecerte a quien te hizo daño.', 'Libro VI, 6'],
    ['Cava en tu interior. Dentro está la fuente del bien, y brotará siempre que sigas cavando.', 'Libro VII, 59'],
    ['Muy poco se necesita para vivir una vida feliz.', 'Libro VII, 67'],
    ['No discutas más sobre cómo debe ser una buena persona: sé una.', 'Libro X, 16'],
  ]),
  work('aristoteles', 'Aristóteles', 'Aristóteles', 'columna', [
    ['Todos los seres humanos desean por naturaleza saber.', 'Metafísica I, 1'],
    ['Por el asombro comenzaron los seres humanos a filosofar.', 'Metafísica I, 2'],
    ['La felicidad es una actividad del alma conforme a la virtud.', 'Ética a Nicómaco I, 7'],
    ['Una golondrina no hace verano, ni tampoco un solo día; así tampoco un solo día basta para hacer feliz a alguien.', 'Ética a Nicómaco I, 7'],
    ['Nos hacemos justos practicando la justicia, moderados practicando la moderación y valientes practicando la valentía.', 'Ética a Nicómaco II, 1'],
    ['La virtud es un término medio entre dos vicios: uno por exceso y otro por defecto.', 'Ética a Nicómaco II, 6'],
    ['Cualquiera puede enfadarse, eso es fácil. Hacerlo con la persona adecuada, en la medida justa, en el momento oportuno y por el motivo correcto, eso no es fácil.', 'Ética a Nicómaco II, 9'],
    ['El amigo es otro yo.', 'Ética a Nicómaco IX, 4'],
  ]),
];

export const allQuotes = works.flatMap((w) => w.quotes.map((q) => ({ ...q, work: w })));

export const PRACTICE = {
  respira1: 'alaira.respiracion.1min',
  respira5: 'alaira.respiracion.5min',
  ritual: 'alaira.ritual.diario',
  afirmaciones: 'alaira.afirmaciones.tema',
  frase: 'alaira.filosofia.frase',
} as const;

const practiceList: PracticeDef[] = [
  { id: PRACTICE.respira1, guide: 'alaira', kind: 'respiracion', xp: 15, minDurationSec: 45 },
  { id: PRACTICE.respira5, guide: 'alaira', kind: 'respiracion', xp: 35, minDurationSec: 240 },
  { id: PRACTICE.ritual, guide: 'alaira', kind: 'ritual', xp: 40, minDurationSec: 60 },
  { id: PRACTICE.afirmaciones, guide: 'alaira', kind: 'afirmaciones', xp: 15, minDurationSec: 5 },
  { id: PRACTICE.frase, guide: 'alaira', kind: 'filosofia', xp: 10, minDurationSec: 3 },
];

export const AMBIENCE_AURORA = 'alaira.amb.aurora';

const itemList: RewardItem[] = [
  {
    id: 'alaira.fragmento.1',
    kind: 'fragmento',
    name: 'Fragmento I · La orilla',
    description:
      'Alaira te esperaba en la orilla del lago. «Aquí nadie llega tarde», dijo. «Cada quien llega cuando está listo para escucharse».',
  },
  {
    id: 'alaira.fragmento.2',
    kind: 'fragmento',
    name: 'Fragmento II · Los faroles',
    description:
      'Por cada día que vuelves, un farol se enciende en el sendero. Alaira no los prende: dice que la luz es tuya y que ella solo te enseña dónde mirar.',
  },
  {
    id: 'alaira.fragmento.3',
    kind: 'fragmento',
    name: 'Fragmento III · La brújula',
    description:
      'La brújula de su cinturón no apunta al norte. Apunta al estado desde el que estás actuando. Cambiar de polaridad, dice Alaira, es aprender a leerla.',
  },
  {
    id: 'alaira.pack.luz',
    kind: 'afirmaciones',
    name: 'Afirmaciones · Luz interior',
    description: 'Cuatro afirmaciones nuevas que Alaira guarda para quienes ya hicieron del ritual una costumbre.',
  },
  { id: 'alaira.titulo.ritmo', kind: 'titulo', name: 'Título · Ritmo propio', description: 'Para quien aprendió a volver a su respiración.' },
  { id: 'alaira.titulo.lunas', kind: 'titulo', name: 'Título · Siete lunas', description: 'Siete días seguidos junto a Alaira.' },
  { id: 'alaira.titulo.mente', kind: 'titulo', name: 'Título · Mente despierta', description: 'Diez ideas contempladas con calma.' },
  { id: 'alaira.titulo.plena', kind: 'titulo', name: 'Título · Luna llena', description: 'Treinta días seguidos. Tu luz ya es costumbre.' },
  {
    id: AMBIENCE_AURORA,
    kind: 'ambientacion',
    name: 'Ambientación · Aurora',
    description: 'El lago de Alaira al amanecer. Actívala desde tu perfil.',
  },
];

const milestones: Milestone[] = [
  {
    id: 'primer-brote',
    title: 'Primer brote',
    description: 'Completaste tu primera sesión.',
    icon: 'brote',
    when: { counter: 'sesiones', atLeast: 1 },
    grants: [{ item: 'alaira.fragmento.1' }, { xp: 20 }],
  },
  {
    id: 'racha-3',
    title: 'Tres faroles',
    description: 'Tres días seguidos.',
    icon: 'estrella',
    when: { streakAtLeast: 3 },
    grants: [{ item: 'alaira.fragmento.2' }, { xp: 30 }],
  },
  {
    id: 'racha-7',
    title: 'Siete lunas',
    description: 'Siete días seguidos.',
    icon: 'luna',
    when: { streakAtLeast: 7 },
    grants: [{ item: 'alaira.titulo.lunas' }, { xp: 50 }],
  },
  {
    id: 'racha-10',
    title: 'Amanecer en el lago',
    description: 'Diez días seguidos.',
    icon: 'sol',
    when: { streakAtLeast: 10 },
    grants: [{ item: AMBIENCE_AURORA }, { xp: 80 }],
  },
  {
    id: 'racha-30',
    title: 'Luna llena',
    description: 'Treinta días seguidos.',
    icon: 'luna',
    when: { streakAtLeast: 30 },
    grants: [{ item: 'alaira.titulo.plena' }, { xp: 200 }],
  },
  {
    id: 'respira-7',
    title: 'Ritmo propio',
    description: 'Siete sesiones de respiración.',
    icon: 'orbita',
    when: { counter: 'tipo:respiracion', atLeast: 7 },
    grants: [{ item: 'alaira.titulo.ritmo' }, { xp: 40 }],
  },
  {
    id: 'ritual-5',
    title: 'Luz interior',
    description: 'Cinco rituales completos.',
    icon: 'loto',
    when: { counter: 'tipo:ritual', atLeast: 5 },
    grants: [{ item: 'alaira.pack.luz' }, { xp: 40 }],
  },
  {
    id: 'filosofia-10',
    title: 'Mente despierta',
    description: 'Diez frases contempladas.',
    icon: 'libro',
    when: { counter: 'tipo:filosofia', atLeast: 10 },
    grants: [{ item: 'alaira.titulo.mente' }, { xp: 40 }],
  },
  {
    id: 'vinculo-3',
    title: 'La brújula',
    description: 'Vínculo nivel 3 con Alaira.',
    icon: 'brujula',
    when: { levelAtLeast: 3 },
    grants: [{ item: 'alaira.fragmento.3' }],
  },
];

export const rules: RulesContent = {
  practices: Object.fromEntries(practiceList.map((p) => [p.id, p])),
  milestones,
  items: Object.fromEntries(itemList.map((i) => [i.id, i])),
};

/** Hitos de racha en orden: son las paradas de "Tu camino". */
export const streakStops = milestones
  .filter((m): m is Milestone & { when: { streakAtLeast: number } } => 'streakAtLeast' in m.when)
  .sort((a, b) => a.when.streakAtLeast - b.when.streakAtLeast);
