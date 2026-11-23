// A06 · capas del paquete «KURA_A06_Implementacion_Parallax» (lienzo 911 × 1726, origen arriba a la izquierda).
// box = [x, y, ancho, alto]; las cajas negativas son margen fuera de cuadro.
// d = profundidad [x, y]: cuánto del recorrido de cámara (±18 × ±11 px) recibe cada plano.
export const CAMARA = [18, 11];
// Alaira, arcos, ciudad, puentes y el banco del título se mueven juntos: la capa de Alaira trae pegado
// el fondo original que la rodea; si fueran a otra velocidad, ese fondo se vería duplicado (columnas fantasma).
// La profundidad la dan el cielo (detrás), planetas, estrellas, y las nubes cercanas y el HUD (delante).
const PLANO = [0.22, 0.16];

export const ESCENA = [
  { id: 'cielo', src: 'assets/a06/escena/cielo.webp', box: [-48, -48, 1007, 1822], d: [0.07, 0.05] },
  { id: 'planeta-grande', src: 'assets/a06/escena/planeta-grande.webp', box: [710, 72, 89, 89], d: [0.25, 0.19], cls: 'a6-planet' },
  { id: 'planeta-pequeno', src: 'assets/a06/escena/planeta-pequeno.webp', box: [818, 127, 35, 35], d: [0.32, 0.24], cls: 'a6-planet a6-planet-s' },
  { id: 'ciudad', src: 'assets/a06/escena/ciudad.webp', box: [547, 250, 412, 355], d: PLANO },
  { id: 'arco-izq', src: 'assets/a06/escena/arco-izq.webp', box: [-48, -48, 142, 504], d: PLANO },
  { id: 'arco-central', src: 'assets/a06/escena/arco-central.webp', box: [115, -48, 141, 433], d: PLANO },
  { id: 'puentes', src: 'assets/a06/escena/puentes.webp', box: [677, 392, 282, 735], d: PLANO },
];

// Alaira con su estrella: la estrella pintada se quitó de la capa y se dibuja en 3D encima.
export const ALAIRA = {
  src: 'assets/a06/alaira/alaira.webp', box: [-48, 77, 1007, 1070], d: PLANO,
  // parpadeo: atlas 5 × 5 (celdas de 181 × 89 con 2 px de margen), cuadro 0 abierto → 24 cerrado
  ojos: { src: 'assets/a06/alaira/ojos-atlas.webp', box: [320, 252, 181, 89], atlas: [925, 465], celda: [185, 93] },
  parpadeoMs: { cerrar: 86, sostener: 25, abrir: 130 },
  // fleco y hebras van delante de los ojos (solo se muestran mientras parpadea; en reposo son idénticos a la capa)
  frente: [
    { src: 'assets/a06/alaira/fleco-delantero.webp', box: [255, 104, 296, 271] },
    { src: 'assets/a06/alaira/mechita-izquierda.webp', box: [319, 293, 53, 53] },
    { src: 'assets/a06/alaira/mechita-centro.webp', box: [388, 257, 40, 53] },
    { src: 'assets/a06/alaira/mechita-derecha.webp', box: [468, 265, 38, 75] },
  ],
  estrella: { centro: [161, 594], palma: [158, 676], vista: [41, 444, 240, 290], respaldo: { src: 'assets/a06/fx/estrella-2d.webp', box: [81, 531, 147, 112] } },
};

// Banco de nubes bajo el vestido y alrededor del título (transición del paquete, sin el título pintado).
// Va a la misma profundidad que Alaira: el borde del vestido nunca se desfasa.
export const BANCO = { src: 'assets/a06/nubes/banco-titulo.webp', box: [0, 970, 911, 270], d: PLANO };

// Nubes limpias (sin partes del vestido): van encima y derivan aparte; nunca se ve su orilla.
export const NUBES = [
  { id: 'nube-cercana', src: 'assets/a06/nubes/nube-cercana.webp', box: [-150, 1027, 1212, 104], d: [1.27, 0.55], o: 0.6, drift: [16, 3, 19] },
  { id: 'bruma-inferior', src: 'assets/a06/nubes/bruma-inferior.webp', box: [-195, 1647, 1308, 156], d: [1.65, 0.63], o: 0.57, drift: [22, 4, 24] },
];
