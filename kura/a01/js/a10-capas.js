// A10 · ¿Qué te motiva a cambiar tu Aura? — capas de la escena (diseño A aprobado: Alaira sentada en la luna
// creciente sobre el lago, con aurora, luna llena y los dos planetas de KURA).
// Lienzo de 911 × 1726 como A06 (--v = 1 px del lienzo). box = [x, y, ancho, alto]; d = profundidad [x, y]
// (parte del recorrido de cámara CAMARA que recibe cada plano).
//
// La ilustración original mide 944 × 755 px; aquí se muestra a 982 px de ancho (K = 982 / 944) con 36 px de
// margen a cada lado para el paralaje.
const K = 982 / 944, OX = -36, OY = -24;
const at = (x, y) => [+(x * K + OX).toFixed(1), +(y * K + OY).toFixed(1)];
const box = (x, y, w, h) => [...at(x, y), +(w * K).toFixed(1), +(h * K).toFixed(1)];

export const CAMARA = [18, 11];

// Fondo sin Alaira (generado con Higgsfield a partir del diseño): se pinta en WebGL con la aurora ondulando,
// las estrellas titilando y el lago brillando (js/a10-cielo.js). Si no hay WebGL queda la imagen quieta.
export const FONDO = {
  src: 'assets/a10/fondo.webp', mapas: 'assets/a10/mapas.png', box: box(0, 0, 944, 755), d: [0.12, 0.08],
  // estrellas grandes con destello en cruz (px de la ilustración original y brillo 0–255)
  estrellas: [[281, 13, 200], [198, 20, 183], [346, 17, 173], [507, 95, 168], [484, 50, 165], [898, 101, 163], [559, 146, 162], [796, 32, 160], [745, 67, 149], [603, 35, 142], [870, 57, 138], [581, 111, 130], [649, 48, 129], [428, 26, 129], [719, 173, 127]].map(([x, y, b]) => [x / 944, y / 755, b / 255]),
  luna: [795 / 944, 134 / 755, 46 / 944], // luna llena: centro y radio (para su halo que respira)
};

// Los dos planetas de KURA (regla del cielo): lejos, en el hueco oscuro entre la aurora y la luna.
export const PLANETAS = [
  { src: 'assets/a06/escena/planeta-grande.webp', box: box(685, 173, 46, 46), d: [0.07, 0.05], flota: 16 },
  { src: 'assets/a06/escena/planeta-pequeno.webp', box: box(738, 221, 17, 17), d: [0.08, 0.055], flota: 11 },
];

// Alaira con la luna creciente (recorte del diseño; la luna se rehízo sólida y sin el logo pintado).
export const ALAIRA = {
  src: 'assets/a10/alaira.webp', box: box(41, 38, 903, 717), d: [0.55, 0.4],
  brillo: { src: 'assets/a10/luna-brillo.webp', box: box(6, 4, 894, 751) }, // halo de la luna creciente (detrás)
  brote: at(508, 338),                         // hojas del brote dorado: de aquí salen las partículas
  particulas: box(360, 60, 300, 350),            // zona donde viven las partículas (lienzo pequeño)
};

// Bruma delantera sobre la orilla de la escena (nubes limpias de A06, sin vestido): tapa el corte del fondo
// y da profundidad al moverse más que Alaira.
export const BRUMA = [
  { src: 'assets/a06/nubes/bruma-inferior.webp', box: [-200, 650, 1308, 156], d: [1.15, 0.6], o: 0.95, drift: [16, 3, 26] },
  { src: 'assets/a06/nubes/nube-cercana.webp', box: [-150, 716, 1212, 104], d: [1.4, 0.7], o: 0.75, drift: [20, 2, 21] },
];
