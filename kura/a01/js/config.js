// KURA · A01 — Todos los parámetros ajustables en un solo lugar.
// Las coordenadas están en el lienzo de referencia de 899 × 1750 px.

export const CANVAS = { width: 899, height: 1750 };

export const config = {
  stars: {
    countMobile: 90,
    countDesktop: 120,
    flareEvery: 11,          // una de cada N estrellas lleva destello de cuatro puntas
    intensity: 1.0,          // brillo general
    twinkleSpeed: 1.0,       // multiplica la velocidad de titileo
    cycle: [3, 8],           // segundos por ciclo de titileo
    size: [1.2, 3.2],        // tamaño en px de referencia
    flareSize: [9, 14],
  },
  burst: {
    particles: 70,           // chispas finas por toque
    size: [1.1, 2.4],
    speed: [120, 420],       // px/s
    life: [0.7, 1.4],
  },
  clouds: {
    // y, alto, opacidad, espejo, desenfoque (px), deriva (px de referencia), duración (s)
    back:   { y: 260,  h: 230, opacity: 0.45, flip: false, blur: 1.5, drift: 26, duration: 46 },
    mist:   { y: 690,  h: 200, opacity: 0.16, flip: true,  blur: 3,   drift: 20, duration: 38 },
    front:  { y: 1040, h: 260, opacity: 0.22, flip: false, blur: 1.5,   drift: 34, duration: 30 },
    bottom: { y: 1450, h: 300, opacity: 0.50, flip: true,  blur: 0,   drift: 28, duration: 42 },
  },
  lights: {
    violet: 0.08,            // ambiente violeta
    goldLeft: 0.18,
    goldRight: 0.18,
    blueTop: 0.08,
    hudGlow: 0.22,
    breathe: 12,             // segundos de respiración del aura
  },
  button: {
    border: 1.0,             // intensidad del borde luminoso del botón principal
    loop: 7.5,               // segundos que tarda el segmento principal en dar la vuelta
    breathe: 4,              // respiración de intensidad
    inviteEvery: 9,          // segundos entre animaciones de invitación (con sonido)
  },
  hud: {
    border: 0.85,            // más tenue que el botón
    loop: 18,
  },
  audio: {
    music: 'audio/ambiente.mp3',
    musicVolume: 0.55,
    sfxVolume: 0.8,
    fadeOut: 2.6,            // segundos al silenciar
    fadeIn: 2.0,
    // Si existen estos archivos (por ejemplo, generados con ElevenLabs) se usan en lugar
    // de los sonidos sintetizados. Si no existen, se sintetizan sin error.
    sfxFiles: {
      invite: 'audio/sfx/invitacion.mp3',
      primary: 'audio/sfx/iniciar-sesion.mp3',
      tap: 'audio/sfx/toque.mp3',
      focus: 'audio/sfx/enfoque.mp3',
      toggle: 'audio/sfx/alternar.mp3',
      error: 'audio/sfx/error.mp3',
    },
  },
  performance: {
    maxPixelRatioMobile: 1.75,
    maxPixelRatioDesktop: 2,
    slowFrameMs: 26,         // si la media supera esto, se reduce la calidad
  },
  parallax: 6,               // px de referencia que se mueve la escena con el cursor
};
