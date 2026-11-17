import { ajusta, encaja, fin, paso, salida, valida, type Escena, type Opcion } from './types';

/**
 * Escenario de referencia: dos amigas en el bar. Es el Jefe de ronda.
 * Cinco variantes: tres de mesa y dos de barra. Cada una cambia la distribución,
 * el detalle que abre la plática y la respuesta de ellas.
 */

type B = Omit<Opcion, 'id'>;

const DEJAR_PASAR = (): B =>
  salida(
    'Dejar pasar el momento y seguir con tu noche.',
    ['Te quedas con tus amigos. La noche sigue.'],
    'También es jugada. Nadie te debe una plática y tú no le debes un intento a nadie. Si quieres ver cómo sale, vuelve a jugarla.',
    'noche',
  );

const AL_OIDO = (): B =>
  ajusta(
    'Hablarle al oído desde atrás.',
    ['Ella da un brinco y se hace a un lado. Su amiga te mira seria.'],
    'Por la espalda nadie te ve venir, y con ruido menos. Busca el frente o un costado. Va de nuevo.',
    'R-03',
  );

const AL_HOMBRO = (): B =>
  ajusta(
    'Tocarle el hombro desde atrás.',
    ['Voltea de golpe, con la mano en el hombro.', 'Ella|«¿Sí?»'],
    'Tocar a alguien que no te ha visto arranca la plática con un susto. Llega por donde te vean.',
    'R-03',
  );

const ENTREVISTA = (): B =>
  ajusta(
    '«¿Cómo se llaman? ¿De dónde son? ¿Vienen seguido? ¿A qué se dedican?»',
    ['Su amiga|«Eh… ¿perdón?»', 'Se miran entre ellas.'],
    'Cuatro preguntas sin esperar una respuesta ya es entrevista. Suelta una cosa del lugar y deja que contesten.',
    'R-05',
  );

export const jefeBar: Escena = {
  id: 'jefe-bar-dos-amigas',
  titulo: 'Dos amigas en el bar',
  tipo: 'jefe',
  habilidad: 'abrir',
  ruta: 'principal',
  resumen: 'Ves a una chica que te gusta con una amiga. Ubicas al grupo, eliges cuándo y por dónde llegar, qué decir y cómo cerrar.',
  reglas: ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06', 'R-07', 'R-08', 'R-09', 'R-12', 'R-13'],
  micro: [
    'Primero ubicas: quién mira a quién y por dónde te verían llegar.',
    'Un comentario aporta; una pregunta sobre el lugar invita. Las dos jalan.',
    'Si dices que vas de paso, vas de paso. Te quedas solo si te hacen espacio.',
    'Conversación mutua, contacto acordado o cierre tranquilo: las tres son buenas salidas.',
  ],
  referencias: [
    { clase: 'adaptacion', libro: 'el-metodo', nota: 'Con el material de Mystery narrado en El método se trabajan la apertura, el contexto de grupo y la entrada breve. En el libro el aviso de «me voy pronto» a veces es falso; aquí se trata como un compromiso real.' },
    { clase: 'original_nova', nota: 'Escena, diálogos y consecuencias escritos para NOVA a partir del escenario de referencia de Mitsuo.' },
  ],
  relacionados: ['nova-mvp01-001-esc'],
  estado: 'mvp',
  variantes: [
    /* ------------------------------ MESA · interés mutuo ------------------------------ */
    {
      id: 'mesa-interes',
      nombre: 'Mesa · hay intercambio',
      lugar: 'Bar · mesa alta',
      contexto: 'Jueves, bar lleno. La chica que te gusta está en una mesa alta con una amiga. Ella queda de espaldas al pasillo; su amiga, de frente a ella. Hay una esquina libre en la mesa.',
      inicio: 'mi1',
      finales: fin('contacto', 'conversacion', 'cierre', 'noche'),
      pasos: [
        paso('mi1', '¿Cuándo llegas?', 'Su amiga está contando algo y mueve las manos. Ella la escucha, de espaldas a ti.', [
          encaja('Esperar a que termine y, en la pausa, ir a saludar a las dos.', ['Su amiga remata la historia. Se ríen y las dos voltean hacia la barra.', 'Ahí vas.'], 'Pausa real: nadie quedó a media frase. Ese es tu hueco.', 'mi2', { marca: 'espera' }),
          ajusta('Interrumpir mientras sigue hablando, para no perder el impulso.', ['Su amiga se queda con la frase en el aire.', 'Su amiga|«…perdón, ¿qué?»'], 'Llegaste a media historia. Están contando algo: dales tiempo y entra en la pausa.', 'R-04'),
          DEJAR_PASAR(),
        ], { abre: 'Cuando acaben la historia y levanten la vista.', espera: 'Una sigue contando algo.' }),
        paso('mi2', '¿Por dónde llegas?', 'Ella sigue de espaldas al pasillo. La esquina libre queda junto a su amiga: desde ahí las dos te verían.', [
          encaja('Rodear la esquina y saludar desde donde ambas puedan verte.', ['Su amiga te ve primero y levanta las cejas. Ella voltea sin sobresalto.'], 'Te vieron llegar. Nadie tuvo que adivinar quién le hablaba.', 'mi3', { marca: 'frente' }),
          AL_OIDO(),
          AL_HOMBRO(),
        ]),
        paso('mi3', '¿Qué dices?', 'Ya estás en la esquina y las dos te miran. El bar se llenó en diez minutos; hay fila en la puerta.', [
          encaja('«Oigan, se llenó de golpe. Entré por una y ya casi me toca esperar afuera».', ['Ella|«Llegamos temprano y de todos modos nos tocó esperar».', 'Su amiga|«Media hora parada. Mis tacones no perdonan».'], 'Aportaste un comentario: no pide nada y ellas eligieron sumarse. Te respondió y añadió un detalle. Ya tienes por dónde seguir.', 'mi4', { marca: 'incluye' }),
          valida('«Oigan, ¿a ustedes también les tocó esperar para entrar?»', ['Su amiga|«Uf, como media hora».', 'Ella|«Yo ya iba a proponer tacos mejor».'], 'Abriste con una pregunta sobre el lugar: fácil de contestar y les pasa el turno. El comentario aporta; la pregunta invita. Las dos jalan porque hablan de lo que todos ven.', 'mi4', { marca: 'incluye' }),
          ENTREVISTA(),
        ]),
        paso('mi4', '¿Te quedas?', 'Las dos siguen el tema de la fila. Su amiga te pregunta con quién vienes. Hay un banco libre en tu esquina.', [
          encaja('«¿Me puedo sentar un minuto? Si están en su plática, todo bien».', ['Su amiga recorre su bolsa.', 'Su amiga|«Siéntate, estábamos criticando la playlist».', 'Ella se gira un poco hacia ti.'], 'Preguntaste y dejaste salida. Te hicieron espacio: ahora sí, platica con las dos.', 'mi5'),
          ajusta('Jalar el banco y sentarte sin preguntar.', ['Las dos miran el banco y luego se miran entre ellas.'], 'Ibas bien, pero el lugar en su mesa lo dan ellas. Pregunta y deja la puerta abierta.', 'R-08'),
          salida('«Bueno, las dejo. Que estén a gusto».', ['Ella|«Igual, suerte con la fila».', 'Su amiga levanta su vaso.'], 'Cerrar arriba también cuenta. Había espacio para más, pero irte bien nunca es mala jugada.', 'cierre', { marca: 'suelta' }),
        ]),
        paso('mi5', 'Ya sentado, ¿qué aportas?', 'Su amiga pide otra ronda. Ella te mira el vaso: traes agua.', [
          encaja('«Yo empecé con agua. Mi gran inauguración de la noche».', ['Ella se ríe.', 'Ella|«Qué fiestón. ¿Y luego qué sigue, agua mineral?»'], 'Broma sobre ti y sobre algo que todos ven. Ella la retomó: eso ya es intercambio.', 'mi6'),
          valida('«¿Les late ver un truco rápido? Es de un minuto».', ['Su amiga|«A ver, pero si sale mal te burlamos».', 'Ella|«Yo sí quiero ver».'], 'Preguntaste antes de hacerlo. Si te dicen que no, cuentas una historia corta y listo.', 'mi6'),
          ajusta('Invitarles una ronda de shots para quedar bien.', ['Su amiga|«Gracias, ya pedimos».', 'Se hace un silencio corto.'], 'Invitar bebida pide confianza y contexto; llevas un minuto sentado. Pide lo tuyo y aporta plática.', 'R-07'),
        ]),
        paso('mi6', '¿Pides el contacto?', 'Llevan un rato. Ella te hizo una pregunta y retomó el tema dos veces. Su amiga mira la hora: ya casi se van.', [
          encaja('«Me gustó platicar contigo. ¿Te late que nos pasemos el número?»', ['Ella|«Va. Pásame tu cel y me marco».'], 'Ella preguntó y retomó: había intercambio. Dijiste qué te gustó y dejaste que eligiera.', 'fin:contacto', { marca: 'intencion' }),
          valida('«Me dio gusto conocerlas. Que les vaya bien en la que sigue».', ['Ella|«Igualmente. Estuvo buena la plática».', 'Su amiga|«Suerte con tu agua».'], 'Cierre limpio con plática mutua. Había señales para pedir el contacto, pero irte bien también es ganar.', 'fin:conversacion', { marca: 'suelta' }),
          ajusta('«Dame tu número, ándale, no seas así».', ['Ella se echa para atrás.', 'Ella|«Mmm, mejor no».'], 'Pediste empujando. Para pedir contacto, di qué te gustó y deja espacio para que elija.', 'R-12'),
        ], { abre: 'Te hizo una pregunta y retomó el tema.' }),
      ],
    },

    /* ------------------------------ MESA · siguen en su plática ------------------------------ */
    {
      id: 'mesa-su-platica',
      nombre: 'Mesa · quieren su plática',
      lugar: 'Bar · mesa junto a la ventana',
      contexto: 'Viernes temprano. La chica que te gusta está con una amiga en una mesa junto a la ventana. Ella queda de espaldas al pasillo; su amiga, enfrente. Del lado de la ventana hay una esquina libre.',
      inicio: 'mp1',
      finales: fin('cierre', 'noche'),
      pasos: [
        paso('mp1', '¿Cuándo llegas?', 'Su amiga le enseña algo en el celular. Las dos están inclinadas sobre la pantalla.', [
          encaja('Esperar a que guarden el celular y levanten la vista.', ['Guardan el celular. Las dos buscan al mesero con la mirada.', 'Ahí vas.'], 'Estaban en lo suyo y esperaste a que se abriera el momento.', 'mp2', { marca: 'espera' }),
          ajusta('Llegar ya y asomarte a ver qué están viendo.', ['Su amiga voltea el celular boca abajo.', 'Su amiga|«¿Se te ofrece algo?»'], 'Estaban en algo privado. Dales tiempo: entra cuando levanten la vista.', 'R-04'),
          DEJAR_PASAR(),
        ], { abre: 'Cuando levanten la vista de la pantalla.', espera: 'Están viendo algo juntas.' }),
        paso('mp2', '¿Por dónde llegas?', 'Ella sigue de espaldas al pasillo. Por el lado de la ventana queda la esquina libre, de cara a las dos.', [
          encaja('Rodear por la ventana y saludar desde donde ambas puedan verte.', ['Las dos te ven acercarte. Ella sonríe por cortesía.'], 'Entraste por donde te veían. Así nadie se sobresalta.', 'mp3', { marca: 'frente' }),
          AL_OIDO(),
          AL_HOMBRO(),
        ]),
        paso('mp3', '¿Qué dices?', 'Estás en la esquina. El mesero lleva rato sin pasar por esta zona.', [
          encaja('«Oigan, creo que el mesero ya nos olvidó a todos. Llevo diez minutos haciéndole señas».', ['Su amiga|«Nosotras ya íbamos a ir a la barra».', 'Ella sonríe y vuelve a la carta.'], 'Aportaste un comentario y te contestó su amiga. Fíjate: ella sonrió y regresó a lo suyo.', 'mp4', { marca: 'incluye' }),
          valida('«Oigan, ¿a ustedes sí les tomaron la orden?»', ['Su amiga|«Nada. Ya íbamos a ir a la barra».', 'Ella niega con la cabeza y vuelve a la carta.'], 'Pregunta sobre el lugar: les pasa el turno. Contestó su amiga; ella volvió a la carta. Ese dato importa.', 'mp4', { marca: 'incluye' }),
          ENTREVISTA(),
        ]),
        paso('mp4', '¿Te quedas?', 'Su amiga te sigue la plática. Ella contesta corto y regresa a la carta. Hay una silla libre.', [
          encaja('«¿Me puedo sentar un minuto? Si están en su plática, todo bien».', ['Su amiga|«Ay, es que nos estamos poniendo al día. Hace mil que no nos vemos».'], 'Preguntaste y te dijeron que no con buena onda. Eso también es una respuesta clara.', 'mp5'),
          ajusta('Jalar la silla y sentarte junto a ella.', ['Ella recorre su bolsa hacia el otro lado.', 'Su amiga|«Este… estamos esperando a alguien».'], 'El lugar en su mesa lo dan ellas, y ella casi no ha participado. Pregunta primero.', 'R-08'),
          salida('«Va, las dejo pedir. Que estén a gusto».', ['Su amiga|«Gracias, igual».', 'Ella levanta la mano.'], 'Leíste que la plática era de ellas y te fuiste a tiempo.', 'cierre', { marca: 'suelta' }),
        ], { espera: 'Ella volvió a la carta.' }),
        paso('mp5', 'Quieren seguir entre ellas. ¿Qué respondes?', 'Te acaban de decir que se están poniendo al día. Su amiga te sonríe, esperando.', [
          encaja('«Va, que estén a gusto».', ['Su amiga|«Gracias, igual».', 'Ella levanta la mano para despedirse.'], 'Aceptaste a la primera y sin cara larga. Despedirte bien también cuenta como una buena jugada.', 'fin:cierre', { marca: 'acepta_no' }),
          ajusta('«Nomás un ratito, no les quito tiempo».', ['Su amiga|«De verdad, otro día».'], 'Ya te habían contestado. Insistir convierte un no amable en un momento incómodo.', 'R-13'),
          ajusta('Pedirle el número a ella antes de irte.', ['Ella|«Eh… no, gracias».'], 'Su amiga sostuvo la plática y ella volvió a la carta: no había intercambio para esa pregunta. Agradece y despídete.', 'R-12'),
        ]),
      ],
    },

    /* ------------------------------ MESA · falta de espacio ------------------------------ */
    {
      id: 'mesa-sin-espacio',
      nombre: 'Mesa · no hay por dónde',
      lugar: 'Bar · gabinete',
      contexto: 'Sábado. La chica que te gusta y su amiga están en un gabinete pegado a la pared. Ella queda de espaldas al pasillo; su amiga, al fondo. No hay esquina libre: el único acceso es por detrás de ella.',
      inicio: 'ms1',
      finales: fin('conversacion', 'cierre', 'noche'),
      pasos: [
        paso('ms1', '¿Te acercas ahora?', 'Platican cerca, en voz baja. Para hablarles tendrías que pararte detrás de ella.', [
          encaja('Esperar: no hay por dónde llegar de frente y están en plática privada.', ['Sigues con lo tuyo.', 'Veinte minutos después se levantan y se paran junto a la barra a pedir la cuenta, de cara al salón.'], 'No había espacio ni pausa. Esperar no es rajarse: es leer el lugar.', 'ms2', { marca: 'espera' }),
          ajusta('Meterte por atrás y asomarte por encima de su hombro.', ['Ella se encoge y voltea con los ojos muy abiertos.'], 'Por la espalda y en plática privada: dos motivos para esperar. Si no hay espacio, espera.', 'R-03'),
          DEJAR_PASAR(),
        ], { espera: 'No hay espacio y hablan en voz baja.' }),
        paso('ms2', '¿Cómo llegas ahora?', 'Están de pie junto a la barra, de cara al salón, esperando la terminal. Te ven pasar.', [
          encaja('Acercarte de frente y saludar a las dos: «Qué onda. ¿Ya de salida?»', ['Ella|«Sí, mañana se trabaja».', 'Su amiga|«Ella. Yo no».'], 'Ahora sí te vieron venir, y saludaste a las dos.', 'ms3', { marca: 'frente' }),
          valida('«Oigan, ese gabinete es el mejor lugar del bar. ¿Cómo le hicieron?»', ['Su amiga|«Llegando a las siete».', 'Ella|«Y sin soltar la mesa ni para ir al baño».'], 'Comentario sobre algo que las dos vivieron. Te contestaron las dos.', 'ms3', { marca: 'incluye' }),
          ajusta('Esperar a que una vaya al baño para hablar a solas con la otra.', ['Te quedas rondando. Su amiga te nota y le dice algo al oído.'], 'Vienen juntas. Tratar a su amiga como estorbo se nota. Saluda a las dos.', 'R-06'),
        ], { abre: 'Están de pie, de cara al salón.' }),
        paso('ms3', 'Ya van de salida. ¿Cómo cierras?', 'Ya pagaron. Ella te contestó con gusto, pero trae el abrigo en la mano.', [
          encaja('«Las dejo ir. Me dio gusto saludarlas».', ['Ella|«Igual. Aquí andamos los jueves».', 'Su amiga se despide con la mano.'], 'Ya iban de salida y lo respetaste. Mira: te dejó un dato sin que lo pidieras.', 'fin:conversacion', { marca: 'suelta' }),
          valida('«Antes de que se vayan: me gustó platicar. Si otro día coincidimos, les guardo el gabinete».', ['Ella se ríe.', 'Ella|«Trato hecho».'], 'Dijiste qué te gustó y no pediste nada con prisa. Con tan poca plática, eso es lo que cabe.', 'fin:conversacion', { marca: 'intencion' }),
          ajusta('«Quédense a una más, yo invito».', ['Su amiga|«No, gracias, ya nos vamos».', 'Ella se pone el abrigo.'], 'Traían el abrigo en la mano: ya habían decidido. Invitar para retener no es el camino.', 'R-13'),
        ]),
      ],
    },

    /* ------------------------------ BARRA · respuesta seca ------------------------------ */
    {
      id: 'barra-seca',
      nombre: 'Barra · respuesta seca',
      lugar: 'Bar · barra',
      contexto: 'Jueves. La chica que te gusta y su amiga están de pie, de cara a la barra. A la derecha de ella hay un hueco libre. Detrás pasan los meseros con charolas.',
      inicio: 'bs1',
      finales: fin('contacto', 'conversacion', 'cierre', 'noche'),
      pasos: [
        paso('bs1', '¿Cuándo llegas?', 'Están haciendo su pedido. El bartender les pregunta algo y ellas señalan la carta.', [
          encaja('Esperar a que terminen de pedir.', ['El bartender se va a preparar. Ellas se giran un poco hacia el salón.'], 'Estaban pidiendo. Ahora hay pausa y además pueden verte.', 'bs2', { marca: 'espera' }),
          ajusta('Meterte entre las dos para pedir lo tuyo.', ['Las dos se abren, incómodas. El bartender te ignora.'], 'Cortaste su pedido y te pusiste en medio. Espera a que terminen.', 'R-04'),
          DEJAR_PASAR(),
        ], { espera: 'Están a medio pedido.' }),
        paso('bs2', '¿Dónde te paras?', 'Ya pidieron. El hueco libre queda a la derecha de ella. Atrás siguen pasando meseros.', [
          encaja('En el hueco de la derecha, medio de lado, sin tapar el paso.', ['Ella te ve llegar de reojo. Su amiga también.'], 'Lado libre, a la vista y con el paso despejado. Así se llega a una barra.', 'bs3', { marca: 'frente' }),
          ajusta('Pegado detrás de ellas, esperando a que volteen.', ['Su amiga siente a alguien atrás y jala su bolsa hacia adelante.'], 'Atrás nadie te ve llegar. Usa el lado libre.', 'R-03'),
          ajusta('Recargado en la entrada de meseros, que queda más cerca.', ['Mesero|«Con permiso, joven».', 'Te mueves dos veces. Ellas lo notan.'], 'Estorbar el paso te deja mal parado antes de hablar. Mantén libre el paso.', 'R-01'),
        ]),
        paso('bs3', '¿Qué dices?', 'El bartender le prende fuego a una cáscara de naranja sobre la copa de ella.', [
          encaja('«Oigan, ¿qué pidieron? Porque a mí nadie me prende fuego al agua».', ['Ella|«Un negroni».', 'Y vuelve a mirar al bartender. Su amiga no voltea.'], 'Respuesta seca. Puede ser el ruido, la sed o que no trae ganas. Todavía no sabes cuál.', 'bs4', { marca: 'incluye' }),
          valida('«Oigan, pedir aquí es deporte extremo. ¿Cuánto llevan?»', ['Ella|«Poquito».', 'Y sigue viendo cómo le preparan la copa.'], 'Abriste bien y te contestó corto. Una respuesta seca puede tener muchas causas.', 'bs4', { marca: 'incluye' }),
          ajusta('«Yo les invito esas. ¿Qué toman?»', ['Su amiga|«Ya pagamos, gracias».'], 'Invitar una bebida pide confianza y contexto. Para abrir, pide lo tuyo.', 'R-07'),
        ], { abre: 'El fuego en la copa: lo ven todos.' }),
        paso('bs4', 'Te contestó seco. ¿Qué haces?', 'Ella mira al bartender. Su amiga revisa el celular. Tú sigues sin pedir.', [
          encaja('Un comentario ligero y volver a lo tuyo: «Buena elección». Y pides tu agua.', ['Pides. Pasa un minuto.', 'Ella|«¿Agua? ¿Vienes manejando o perdiste una apuesta?»'], 'Soltaste y ella retomó. Ahora sí hay por dónde seguir.', 'bs5', { marca: 'suelta' }),
          ajusta('Insistir: «¿Y qué más? Cuéntenme, ¿de dónde son?»', ['Ella|«Ajá…»', 'Mira a su amiga.'], 'Empujaste una plática que todavía no existía. Comentario ligero, vuelves a lo tuyo, y ves si retoma.', 'R-02'),
          ajusta('«¿Qué, muy seria?»', ['Ella levanta una ceja y se voltea hacia su amiga.'], 'Eso suena a reclamo. Una respuesta corta no es una ofensa.', 'R-02'),
        ]),
        paso('bs5', 'Ella retomó. ¿Por dónde sigues?', 'Las dos te miran el vaso de agua. Su amiga ya guardó el celular.', [
          encaja('«Empecé con agua. Mi gran inauguración de la noche».', ['Ella se ríe.', 'Su amiga|«Este sí sabe vivir».'], 'Ella abrió el tema y tú lo seguiste con una broma sobre ti. Las dos entraron.', 'bs6'),
          valida('«Manejando. ¿Y ustedes qué celebran?»', ['Su amiga|«Que por fin es jueves».', 'Ella|«Y que sobrevivimos al inventario».'], 'Contestaste y devolviste el turno a las dos. Ya hay ida y vuelta.', 'bs6'),
          ajusta('Aprovechar para pegarte más y recargarte junto a ella.', ['Ella da medio paso hacia su amiga.'], 'Una pregunta suya no es permiso para invadir. Mantén tu lugar y sigue la plática.', 'R-01'),
        ], { abre: 'Te preguntó por el agua.' }),
        paso('bs6', '¿Cómo cierras?', 'Les entregan sus copas. Su amiga señala una mesa que se acaba de desocupar.', [
          encaja('«Vayan por su mesa antes de que se la ganen. Me dio gusto platicar».', ['Ella|«Igual. Salud con tu agua».'], 'Viste que tenían a dónde ir y cerraste tú. Conversación mutua y despedida limpia.', 'fin:conversacion', { marca: 'suelta' }),
          valida('«Me gustó platicar contigo. Si te late, te dejo mi Insta y ahí seguimos».', ['Ella|«Va, pásalo».', 'Lo anota y se va con su amiga a la mesa.'], 'Ella retomó por su cuenta, así que había intercambio. Dijiste qué te gustó y le dejaste la decisión.', 'fin:contacto', { marca: 'intencion' }),
          ajusta('Tomar tu vaso y seguirlas a la mesa.', ['Se sientan. Tú quedas de pie junto a la mesa. Nadie te hace espacio.'], 'Nadie te invitó a la mesa. Quédate únicamente si te hacen espacio.', 'R-08'),
        ]),
      ],
    },

    /* ------------------------------ BARRA · rechazo explícito ------------------------------ */
    {
      id: 'barra-rechazo',
      nombre: 'Barra · te dicen que no',
      lugar: 'Bar · barra',
      contexto: 'Viernes. La chica que te gusta y su amiga están de cara a la barra, revisando la carta de cocteles. El lado izquierdo, junto a su amiga, está libre.',
      inicio: 'br1',
      finales: fin('conversacion', 'cierre', 'noche'),
      pasos: [
        paso('br1', '¿Cuándo llegas?', 'Leen la carta juntas y se ríen de algo. El bartender se acerca a tomarles la orden.', [
          encaja('Esperar a que pidan y se giren.', ['Piden. El bartender se aleja y ellas se recargan de lado en la barra.'], 'Pedido terminado y cuerpos hacia el salón: ahí hay pausa.', 'br2', { marca: 'espera' }),
          ajusta('Hablarles por encima del hombro mientras piden.', ['El bartender te mira a ti. Ellas pierden el hilo del pedido.'], 'Estaban haciendo un pedido. Dales tiempo.', 'R-04'),
          DEJAR_PASAR(),
        ], { espera: 'El bartender les está tomando la orden.' }),
        paso('br2', '¿Por dónde llegas?', 'Ya pidieron. El lado libre está a la izquierda, junto a su amiga. Desde ahí te verían las dos.', [
          encaja('Por la izquierda, saludando primero a quien te queda más cerca: su amiga.', ['Su amiga|«Hola».', 'Ella se inclina para verte.'], 'Llegaste por el lado libre y saludaste a quien tenías enfrente. Nadie quedó fuera.', 'br3', { marca: 'incluye' }),
          ajusta('Rodear por atrás para quedar junto a la que te gusta.', ['Apareces de pronto a su lado. Ella se sobresalta y derrama un poco.'], 'Pasaste por su espalda para brincarte a su amiga. Llega por donde te vean.', 'R-03'),
          ajusta('Estirar el brazo entre las dos para alcanzar una carta.', ['Las dos se hacen para atrás.'], 'Te metiste en su espacio antes de saludar. Usa el lado libre.', 'R-03'),
        ]),
        paso('br3', '¿Qué dices?', 'La carta de cocteles tiene nombres de telenovela. Tú la tienes en la mano.', [
          encaja('«Oigan, ¿ya vieron que hay uno que se llama Rubí? No sé si pedirlo o tenerle miedo».', ['Su amiga|«¡Yo pedí ese!»', 'Ella|«Yo La Usurpadora. Cero arrepentimientos».'], 'Comentario sobre algo que las dos acaban de leer. Te contestaron las dos y con detalle.', 'br4', { marca: 'incluye' }),
          valida('«Oigan, es mi primera vez aquí. ¿Qué recomiendan?»', ['Su amiga|«El Rubí, pero bajo tu propio riesgo».', 'Ella|«La Usurpadora. Confía».'], 'Pregunta real sobre el lugar: les das el papel de expertas. Las dos opinaron.', 'br4', { marca: 'incluye' }),
          ENTREVISTA(),
        ], { abre: 'Los nombres de la carta.' }),
        paso('br4', '¿Cómo sostienes la plática?', 'Llegan las copas. Las dos siguen el juego de las telenovelas.', [
          encaja('Seguir lo que aporta cada una: a su amiga, a qué sabe el Rubí; a ella, por qué La Usurpadora.', ['Su amiga|«A venganza con frutos rojos».', 'Ella|«Porque me cae bien la villana. ¿Tú cuál eres?»'], 'Seguiste lo que dio cada una. Ella te devolvió una pregunta: el interés se puede dirigir cuando hay intercambio.', 'br5', { marca: 'incluye' }),
          ajusta('Darle la espalda a su amiga y hablar solo con ella.', ['Su amiga saca el celular. Ella mira a su amiga y contesta más corto.'], 'Dejaste fuera a alguien presente y la plática se enfrió. Conversa con las dos.', 'R-06'),
          ajusta('Invitar la siguiente ronda para asegurar tu lugar.', ['Su amiga|«Así estamos bien, gracias».'], 'Tu lugar en la plática no se compra con una ronda. Sigue lo que aportan.', 'R-07'),
        ]),
        paso('br5', '¿Pides el contacto?', 'Ella te hizo dos preguntas y se ríe con lo que dices. Su amiga también está a gusto.', [
          encaja('«Me gustó platicar contigo. ¿Te late que nos pasemos el número?»', ['Ella|«Ay, gracias, pero no. Tengo novio».'], 'Leíste bien el intercambio y preguntaste bien. La respuesta fue no, y es toda la información que necesitas.', 'br6', { marca: 'intencion' }),
          salida('«Me dio gusto conocerlas. Disfruten sus telenovelas».', ['Ella|«Igual. Cuídate de Rubí».'], 'Plática mutua y cierre a tiempo. No pedir nada también es una opción completa.', 'conversacion', { marca: 'suelta' }),
          ajusta('Pedirle su celular «para anotarte tú».', ['Ella aprieta el teléfono contra su pecho.', 'Ella|«No, mejor no».'], 'Tomar su teléfono le quita la decisión. Di qué te gustó y pregunta.', 'R-12'),
        ]),
        paso('br6', 'Te dijo que no. ¿Qué respondes?', 'Ella te sostiene la mirada, amable. Su amiga espera a ver qué haces.', [
          encaja('«Va, me dio gusto conocerlas».', ['Ella|«Igual. Qué buena onda».', 'Su amiga levanta su copa.'], 'Así se recibe un no: corto, tranquilo y sin cobrar nada.', 'fin:cierre', { marca: 'acepta_no' }),
          ajusta('«¿Y eso qué? Nomás es un número».', ['Ella deja de sonreír.', 'Su amiga|«Ya te dijo que no».'], 'Un no ya es respuesta. Negociarlo borra todo lo bueno de la plática.', 'R-13'),
          ajusta('«Uy, pues tú te lo pierdes».', ['Las dos se voltean hacia la barra.'], 'Eso es cobrarle el no. Despedirte bien también cuenta como una buena jugada.', 'R-13'),
        ]),
      ],
    },
  ],
};
