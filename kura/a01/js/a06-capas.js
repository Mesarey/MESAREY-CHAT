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
  // parpadeo (parche del kit): cada ojo tiene 32 poses en un atlas de 8 × 4 baldosas de 140 × 51 px.
  // El párpado baja sobre el iris; el ojo derecho cierra 5 ms después. Pose 0 = abierto (idéntico a la ilustración).
  ojos: {
    src: 'assets/a06/alaira/parpadeo-atlas.webp', atlas: [1120, 204], baldosa: [140, 51], columnas: 8, poses: 32,
    ojos: [{ box: [333, 287, 71, 43], origen: [2, 2], retraso: 0 }, { box: [433, 271, 63, 46], origen: [75, 2], retraso: 5 }],
  },
  parpadeoMs: { cerrar: 76, sostener: 18, abrir: 136 },
  // descansos entre parpadeos del parche (ciclo de 52.2 s, con uno doble): se ven naturales, nunca a ritmo fijo
  ritmoMs: { ciclo: 52200, inicios: [3595, 8160, 12820, 17450, 20920, 26480, 31300, 37120, 40890, 41275, 47190] },
  // fleco y hebras van delante de los ojos (solo se muestran mientras parpadea; en reposo son idénticos a la capa)
  frente: [
    { src: 'assets/a06/alaira/fleco-delantero.webp', box: [255, 104, 296, 271] },
    { src: 'assets/a06/alaira/mechita-izquierda.webp', box: [319, 293, 53, 53] },
    { src: 'assets/a06/alaira/mechita-centro.webp', box: [388, 257, 40, 53] },
    { src: 'assets/a06/alaira/mechita-derecha.webp', box: [468, 265, 38, 75] },
  ],
  estrella: { centro: [161, 594], palma: [158, 676], escala: 1.3, vista: [6, 414, 310, 340], respaldo: { src: 'assets/a06/fx/estrella-2d.webp', box: [81, 531, 147, 112] } },
};

// Banco de nubes bajo el vestido y alrededor del título (transición del paquete, sin el título pintado).
// Va a la misma profundidad que Alaira: el borde del vestido nunca se desfasa. A06 y A07 usan el mismo:
// al pasar de una a otra solo cambia el texto del HUD.
export const BANCO = { src: 'assets/a06/nubes/banco-titulo.webp', box: [0, 970, 911, 270], d: PLANO };

// Nubes limpias (sin partes del vestido): van encima y derivan aparte; nunca se ve su orilla.
export const NUBES = [
  // la bruma del pie va pegada al borde inferior de la pantalla (abajo: px que sobresale), también en teléfonos altos
  { id: 'bruma-inferior', src: 'assets/a06/nubes/bruma-inferior.webp', box: [-195, 1647, 1308, 156], abajo: -62, d: [1.65, 0.63], o: 1, drift: [22, 4, 24] },
  { id: 'bruma-pie-2', src: 'assets/a06/nubes/nube-cercana.webp', box: [-150, 1650, 1212, 104], abajo: -30, d: [1.45, 0.6], o: 0.7, drift: [18, 3, 21] },
];
