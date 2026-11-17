import type { Premio } from './types';

/** Premios: reconocen criterio aplicado. Ninguno pide un número de teléfono. */
export const premios: Premio[] = [
  { id: 'primera-jugada', titulo: 'Primera jugada', reconoce: 'constancia', icono: 'chispa', como: 'Completa tu primera misión.', frase: 'Ya saliste a la cancha. Lo demás es repetir.' },
  { id: 'por-el-frente', titulo: 'Por el frente', reconoce: 'observacion', icono: 'frente', como: 'Después de que NOVA te corrija una llegada por la espalda, elige el frente o el costado.', frase: 'Que te vean llegar. Siempre.' },
  { id: 'lees-el-momento', titulo: 'Lees el momento', reconoce: 'observacion', icono: 'reloj', como: 'Elige esperar o dejar pasar cuando el contexto lo pide, en tres decisiones distintas.', frase: 'Esperar no es rajarse: es leer.' },
  { id: 'ojo-al-detalle', titulo: 'Ojo al detalle', reconoce: 'observacion', icono: 'ojo', como: 'Resuelve 10 tarjetas distintas en la Arena de Negas.', frase: 'El remate sale de lo que sí viste.' },
  { id: 'las-dos-cuentan', titulo: 'Las dos cuentan', reconoce: 'conversacion', icono: 'grupo', como: 'Termina el Jefe de ronda saludando e incluyendo a las dos amigas.', frase: 'La plática es con quienes están presentes.' },
  { id: 'sono-pesado', titulo: 'Soltaste el chiste', reconoce: 'claridad', icono: 'disculpa', como: 'Cuando una broma incomode, reconoce que sonó pesada y suéltala.', frase: '«Uy, sonó más pesado de lo que quería».' },
  { id: 'dilo-simple', titulo: 'Dilo simple', reconoce: 'claridad', icono: 'intencion', como: 'Muestra intención con una frase clara y dejando salida.', frase: '«Me gustó platicar contigo».' },
  { id: 'buen-cierre', titulo: 'Buen cierre', reconoce: 'cierre', icono: 'cierre', como: 'Termina una escena con un cierre tranquilo o aceptando un no.', frase: 'Despedirte bien también cuenta como una buena jugada.' },
  { id: 'ida-y-vuelta', titulo: 'Ida y vuelta', reconoce: 'reciprocidad', icono: 'serio', como: 'Completa una escena de «Cuando buscas algo más serio».', frase: 'Que la iniciativa vaya y venga.' },
  { id: 'criterio-fino', titulo: 'Criterio fino', reconoce: 'observacion', icono: 'escenarios', como: 'Saca 7 de 8 o más en la Prueba de Escenarios.', frase: 'Viste el detalle antes de elegir.' },
  { id: 'vuelta-al-ruedo', titulo: 'Vuelta al ruedo', reconoce: 'constancia', icono: 'repaso', como: 'Completa una sesión de Repaso.', frase: 'Lo que costó se practica otra vez.' },
  { id: 'jefe-de-ronda', titulo: 'Jefe de ronda', reconoce: 'conversacion', icono: 'corona', como: 'Completa el Jefe de ronda en una rama de mesa y en una de barra.', frase: 'Mesa y barra: cada lugar tiene su entrada.' },
  { id: 'ruta-completa', titulo: 'Ruta completa', reconoce: 'constancia', icono: 'mapa', como: 'Completa las ocho habilidades del Mapa CHAD.', frase: 'Ocho habilidades, un solo criterio.' },
];
