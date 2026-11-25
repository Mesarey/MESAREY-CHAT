// A11 · ¿Listo para KURA? — capas de la escena (diseño D aprobado: Alaira asomada al barandal del templo,
// señalando con el índice los banners de los otros cuatro guías).
// Lienzo de 911 × 1726 como A06–A10 (--v = 1 px del lienzo). box = [x, y, ancho, alto]; d = profundidad [x, y]
// (parte del recorrido de cámara CAMARA que recibe cada plano).
//
// La ilustración del diseño mide 944 × 2048 px; aquí se muestra a 982 px de ancho (K = 982 / 944) con 36 px de
// margen a cada lado para el paralaje.
const K = 982 / 944, OX = -36, OY = -22;
const at = (x, y) => [+(x * K + OX).toFixed(1), +(y * K + OY).toFixed(1)];
const box = (x, y, w, h) => [...at(x, y), +(w * K).toFixed(1), +(h * K).toFixed(1)];

export const CAMARA = [18, 11];

// Fondo sin Alaira ni flores del frente: arcos del templo, glicinas colgantes, los dos planetas de KURA (regla
// del cielo), el castillo en el acantilado, el barandal de piedra y la terraza.
export const FONDO = { src: 'assets/a11/fondo.webp', box: box(0, 0, 944, 2048), d: [0.12, 0.08] };

// Alaira recortada (se apoya en el barandal). Se mueve más que el fondo, pero poco en vertical para que sus brazos
// sigan apoyados en la piedra.
export const ALAIRA = {
  src: 'assets/a11/alaira.webp', box: box(209, 99, 735, 733), d: [0.45, 0.14],
  dedo: at(252, 790),                 // punta del índice: de aquí sale la estela de chispas
  chispas: box(20, 700, 330, 230),    // zona donde viven las chispas (lienzo pequeño)
};

// Glicinas del frente en las esquinas de abajo (la derecha es la misma en espejo). Se anclan al pie de la pantalla.
export const GLICINA = { src: 'assets/a11/glicina.webp', w: 204, h: 497, d: [1.2, 0.6] };

// Los cuatro guías que Alaira presenta. fy = encuadre vertical del retrato dentro de la tarjeta (object-position).
export const GUIAS = [
  { id: 'amaya', nombre: 'Amaya', src: 'assets/a11/banners/amaya.webp', fy: 40 },
  { id: 'azara', nombre: 'Azara', src: 'assets/a11/banners/azara.webp', fy: 44 },
  { id: 'nova', nombre: 'Nova', src: 'assets/a11/banners/nova.webp', fy: 40 },
  { id: 'orion', nombre: 'Orion', src: 'assets/a11/banners/orion.webp', fy: 44 },
];
