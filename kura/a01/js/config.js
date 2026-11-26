// KURA · A01 — Todos los parámetros ajustables en un solo lugar.
// Las coordenadas están en el lienzo de referencia de 899 × 1750 px.

export const CANVAS = { width: 899, height: 1750 };

export const config = {
  stars: {
    countMobile: 90,
    countDesktop: 120,
    flareEvery: 8,           // una de cada N estrellas lleva destello de cuatro puntas
    intensity: 1.25,          // brillo general
    twinkleSpeed: 1.0,       // multiplica la velocidad de titileo
    cycle: [3, 8],           // segundos por ciclo de titileo
    size: [2.2, 4.6],        // tamaño en px de referencia
    flareSize: [18, 28],
  },
  burst: {
    particles: 70,           // chispas finas por toque
    size: [1.1, 2.4],
    speed: [120, 420],       // px/s
    life: [0.7, 1.4],
  },
  clouds: {
    // y, alto, opacidad, espejo, desenfoque (px), deriva (px de referencia), duración (s)
    front:  { y: 1040, h: 260, opacity: 0.22, flip: false, blur: 1.5,   drift: 34, duration: 30 },
    bottom: { y: 1450, h: 300, opacity: 0.50, flip: true,  blur: 0,   drift: 28, duration: 42 },
  },
  // Viento en las nubes de atrás (el mar de nubes del mirador, detrás de los personajes).
  // Varios trozos de la misma textura cruzan de izquierda a derecha, muy despacio, y aparecen
  // y desaparecen con suavidad; las fases escalonadas evitan uniones y reinicios visibles.
  // Coordenadas en px de referencia; duration = segundos por cruce completo.
  wind: {
    speed: 1,
    layers: {
      far:  { y: 190, h: 300, width: 1350, opacity: 0.30, blur: 1.5, duration: 90, count: 3 },
      near: { y: 330, h: 290, width: 1260, opacity: 0.22, blur: 3,   duration: 72, count: 3 },
    },
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
    inviteEvery: 7,          // segundos entre invitaciones mientras la página está en reposo (sin sonido)
    idleAfter: 4,            // segundos sin tocar ni mover para considerar reposo
  },
  hud: {
    border: 0.7,             // contorno fijo del cristal, más tenue que el botón
    loop: 18,
  },
  // Destellos ópticos horizontales: siguen muy despacio las orillas superior e inferior,
  // van y vienen de un lado a otro y se encienden y apagan con suavidad.
  // Nunca entran al interior del panel, donde va el texto.
  flares: {
    hud:    { count: 2, size: 280, intensity: 0.8, speed: [7, 14], life: [9, 15] },   // speed en px de referencia por segundo
    button: { count: 2, size: 200, intensity: 0.75, speed: [6, 12], life: [8, 13] },
  },
  audio: {
    // Canciones de toda la sección inicial (A01–A05 y el test), en orden; al acabar una
    // empieza la siguiente y al terminar la 4 vuelve a la 1. Se desvanecen al entrar al mundo de Alaira.
    playlist: [
      'audio/ambiente.mp3',                          // 1
      'audio/musica-2-shadow-protocol-inicio.mp3',   // 2 · Start Shadow Protocol
      'audio/musica-3-shadow-protocol-segunda.mp3',  // 3 · Second Shadow Protocol
      'audio/musica-4-shadows-of-the-void.mp3',      // 4 · Shadows of the Void
    ],
    musicVolume: 0.5,        // las cuatro canciones miden ≈ −13.5 LUFS (diferencia < 1 dB): mismo volumen para todas
    sfxVolume: 1.0,          // efectos un poco por encima de la música, todos al mismo nivel (ver sfxLevels)
    fadeOut: 2.6,            // segundos al silenciar
    fadeIn: 2.0,
    // Sonidos con archivo propio. Los que no están aquí (toque, enfoque, alternar) se sintetizan.
    // Auditoría de volumen: ajuste en dB por sonido para que todos lleguen al mismo nivel
    // (pico de corto plazo ≈ −24 dBFS medido dentro de la app). Medido con audio._measure(nombre).
    sfxLevels: { tap: 14, focus: 20.5, toggle: 17, error: 18, granted: -10, legal: -7, effects: 2.5, createAccount: -9.3, soundIcon: 4, closeLegal: -6.8, start: 14, starFloat: -1, decline: 3, fireworks: -29, greet: -15.4,
      guiaAmaya: -2.1, guiaAzara: -11.5, guiaNova: -21.1, guiaOrion: -1.6, transicion: 1.5 },
    // los cuatro sonidos de guía de A11 quedan iguales entre sí y 5 dB por debajo del resto de los efectos
    // fireworks: más bajo que la estrella (≈ −49 dB), como un eco lejano
    // starFloat es un fondo muy sutil (≈ 23 dB por debajo de los demás sonidos), en bucle mientras se ve A06
    sfxFiles: {
      error: 'audio/sfx/acceso-fallido.mp3',       // inicio de sesión incorrecto
      granted: 'audio/sfx/acceso-concedido.wav',   // acceso concedido: entra a A06 (correo, Google, otro proveedor o cuenta nueva)
      legal: 'audio/sfx/abrir-aviso.wav',          // abrir Términos o Privacidad
      effects: 'audio/sfx/efectos.wav',            // botón «Reducir / Efectos completos»
      createAccount: 'audio/sfx/crear-cuenta.wav', // «Crear cuenta»
      soundIcon: 'audio/sfx/icono-audio.wav',     // tocar el icono de audio
      closeLegal: 'audio/sfx/cerrar-aviso.wav',    // cerrar Términos / Privacidad (X, tocar fuera o Escape)
      start: 'audio/sfx/empezar.wav',              // «Empezar» en A06
      greet: 'audio/sfx/encantada.wav',            // A07: aparece el saludo con el nombre
      fireworks: 'audio/sfx/fuegos-artificiales.wav', // A07: fuegos artificiales al poner el nombre
      decline: 'audio/sfx/falta-dato.wav',         // falta un dato para avanzar: campos vacíos en A01–A03 y la introducción (A07 en adelante)
      starFloat: 'audio/sfx/estrella-flotando.wav', // la estrella de la mano de Alaira (A06), en bucle y muy suave
      transicion: 'audio/sfx/transicion.wav',      // paso de A09→A10, A10→A11 y A11→A12 (cambio de escenario)
      guiaAmaya: 'audio/sfx/guia-amaya.wav',       // A11: elegir a Amaya (banner o flechas de la vista previa)
      guiaAzara: 'audio/sfx/guia-azara.wav',       // A11: elegir a Azara
      guiaNova: 'audio/sfx/guia-nova.wav',         // A11: elegir a Nova
      guiaOrion: 'audio/sfx/guia-orion.wav',       // A11: elegir a Orion
    },
  },
  performance: {
    maxPixelRatioMobile: 1.75,
    maxPixelRatioDesktop: 2,
    slowFrameMs: 26,         // si la media supera esto, se reduce la calidad
  },
  parallax: 6,              // px de referencia por unidad de profundidad, con el cursor
  gyroParallax: 10,          // con el giroscopio (el cielo nunca se mueve más que su margen de 12 px)
  // Profundidad de cada capa: positiva = se aleja al mover, negativa = flota delante (HUD).
  depth: { scene: 1, wind: 1.4, front: 3, bottom: 2.4, stars: 0.75, hud: -1.7, logo: -0.8 },
};
