import { ajusta, encaja, fin, paso, salida, valida, type Escena, type Unidad } from './types';

/** Mapa CHAD: ocho habilidades. Cada una trae regla de oro, microenseñanzas, una misión con dos variantes y un ejercicio. */

const NOVA_ORIGINAL = { clase: 'original_nova' as const, nota: 'Escena y diálogos originales de NOVA.' };

export const escenasMapa: Escena[] = [
  /* ============================ 1 · PRESENCIA Y APROXIMACIÓN ============================ */
  {
    id: 'mision-presencia', titulo: 'Que te vean llegar', tipo: 'mision', habilidad: 'presencia', ruta: 'principal',
    resumen: 'Antes de decir algo, eliges por dónde llegas y con qué ritmo.',
    reglas: ['R-01', 'R-03'],
    micro: ['Frente o costado: que te vean llegar.', 'Respira antes de hablar; la prisa se oye.', 'Si no hay espacio, esperar es la jugada.'],
    referencias: [
      { clase: 'adaptacion', libro: 'mito-carisma', pagina: 'PDF 148–168', nota: 'Lenguaje corporal y presencia, según Cabane. La escena es de NOVA.' },
      NOVA_ORIGINAL,
    ],
    relacionados: ['nova-mvp01-001-esc'], estado: 'mvp',
    variantes: [
      {
        id: 'expo', nombre: 'Exposición', lugar: 'Galería · sala de fotografía',
        contexto: 'Sábado en una galería. Una chica mira sola una foto grande. Detrás de ella pasa gente hacia la otra sala; a su derecha hay espacio frente a la misma foto.',
        inicio: 'pe1', finales: fin('conversacion', 'noche'),
        pasos: [
          paso('pe1', '¿Por dónde llegas?', 'Ella está de frente a la foto, de espaldas al pasillo. A su derecha, a un paso, hay lugar para ver la misma imagen.', [
            encaja('Pararte a su derecha, a un paso, mirando la misma foto.', ['Te ve de reojo y sigue viendo la foto, tranquila.'], 'Llegaste por un costado y a la vista. Compartes lo que ella está viendo.', 'pe2', { marca: 'frente' }),
            ajusta('Acercarte por detrás y hablarle sobre el hombro.', ['Se sobresalta y da un paso al lado.'], 'Por la espalda nadie te ve llegar. Usa el costado libre.', 'R-03'),
            ajusta('Plantarte entre ella y la foto para que te note.', ['Ella|«Eh… estaba viendo».'], 'Le tapaste lo que vino a ver. Llega por un lado, sin estorbar.', 'R-03'),
          ]),
          paso('pe2', '¿Con qué ritmo hablas?', 'Están los dos frente a la foto: un perro dormido en medio de un tianguis. Sientes el pulso acelerado.', [
            encaja('Respirar, mirar la foto un momento y comentar con calma: «Ese perro es el único sin prisa en todo el tianguis».', ['Ella sonríe.', 'Ella|«Es el dueño del puesto, se nota».'], 'Te diste un respiro y hablaste de lo que los dos ven. Ella añadió un detalle.', 'fin:conversacion'),
            ajusta('Soltar todo de corrido antes de que se te olvide.', ['Ella|«¿Perdón? No te entendí».'], 'La prisa se oye. Respira, baja la velocidad y di una sola cosa.', 'R-01'),
            salida('No sentirte listo y seguir viendo la expo.', ['Sigues a la otra sala. La foto del perro te sigue dando risa.'], 'Se vale. Llegaste bien y elegiste no hablar hoy. La próxima, una frase corta sobre la foto.', 'noche'),
          ]),
        ],
      },
      {
        id: 'terraza', nombre: 'Reunión en terraza', lugar: 'Terraza · junto al asador',
        contexto: 'Reunión en la terraza de un amigo. Tres personas platican en círculo junto al asador. Entre dos de ellas queda un hueco; tú vienes con tu vaso desde la cocina.',
        inicio: 'pt1', finales: fin('conversacion', 'noche'),
        pasos: [
          paso('pt1', '¿Por dónde llegas?', 'El más alto te da la espalda. El hueco queda del otro lado, de cara a los tres.', [
            encaja('Rodear y llegar por el hueco, donde los tres te vean.', ['Una de ellas te ve y se recorre medio paso.'], 'Entraste por donde te veían y te hicieron lugar solos.', 'pt2', { marca: 'frente' }),
            ajusta('Asomarte por detrás del más alto.', ['Él voltea, sorprendido, y casi te tira el vaso.'], 'Llegaste por la espalda. Rodea hasta donde te vean.', 'R-03'),
            ajusta('Meterte al centro del círculo.', ['Los tres se echan para atrás y la plática se corta.'], 'Rompiste el círculo. Entra por el borde, donde hay hueco.', 'R-03'),
          ]),
          paso('pt2', 'Ya estás en el círculo. ¿Qué haces?', 'Uno de ellos sigue contando cómo se le quemó la primera tanda de carne.', [
            encaja('Esperar el final de la anécdota y saludar: «Qué onda, soy Diego, vengo con Rodri».', ['Los tres|«Qué onda».', 'Ella|«Yo soy Mariana. Rodri nos debe carne, por cierto».'], 'Esperaste la pausa y te presentaste con calma. Te devolvieron un nombre.', 'fin:conversacion', { marca: 'espera' }),
            valida('Sonreír, levantar el vaso y escuchar hasta que termine.', ['Termina la anécdota. Él se voltea hacia ti.', 'Él|«¿Tú eres el amigo de Rodri?»'], 'Saludar sin palabras también es saludar. Te dieron la entrada ellos.', 'fin:conversacion', { marca: 'espera' }),
            ajusta('Interrumpir con un chiste sobre el asador.', ['Él pierde el hilo.', 'Él|«…¿en qué iba?»'], 'Estaba contando algo. Espera una pausa real.', 'R-04'),
          ]),
        ],
      },
    ],
  },

  /* ============================ 2 · ABRIR CONVERSACIÓN ============================ */
  {
    id: 'mision-abrir', titulo: 'Abre con lo que está pasando', tipo: 'mision', habilidad: 'abrir', ruta: 'principal',
    resumen: 'Eliges el momento y una primera frase sobre algo que todos pueden ver.',
    reglas: ['R-04', 'R-05'],
    micro: ['Lo que todos ven es terreno común.', 'Un comentario aporta; una pregunta del lugar invita.', 'Una sola cosa, y esperas la respuesta.'],
    referencias: [
      { clase: 'adaptacion', libro: 'el-metodo', nota: 'El método distingue apertura directa, del momento, de opinión y preparada. Aquí se practica la del momento, con preguntas reales.' },
      NOVA_ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [
      {
        id: 'cafe', nombre: 'Fila de café', lugar: 'Cafetería · fila',
        contexto: 'Fila larga en una cafetería. Delante de ti, una chica escribe en su celular. La máquina de espresso hace un ruido tremendo.',
        inicio: 'ac1', finales: fin('conversacion', 'noche'),
        pasos: [
          paso('ac1', '¿Cuándo hablas?', 'Ella teclea rápido, con el ceño fruncido. La fila no se mueve.', [
            encaja('Esperar a que guarde el celular y levante la vista.', ['Guarda el celular y voltea a ver el pizarrón del menú.'], 'Estaba en lo suyo. Ahora mira lo mismo que tú.', 'ac2', { marca: 'espera' }),
            ajusta('Hablarle mientras escribe.', ['Ella|«¿Mande?»', 'No levanta la vista.'], 'Estaba a medio mensaje. Espera una pausa real.', 'R-04'),
            salida('Dejarlo pasar y pedir tu café.', ['Pides tu café. Hoy tocó solo cafeína.'], 'También está bien. No todo momento tiene que ser una plática.', 'noche'),
          ], { espera: 'Escribe con el ceño fruncido.' }),
          paso('ac2', '¿Qué dices?', 'La máquina vuelve a tronar. Ella hace una mueca y ve el pizarrón.', [
            encaja('«Esa máquina suena a que el café viene con turbulencia».', ['Ella se ríe.', 'Ella|«Y eso que yo vuelo seguido».'], 'Comentario sobre algo que los dos oyeron. Ella añadió un dato: tienes por dónde seguir.', 'fin:conversacion'),
            valida('«Oye, ¿tú sabes qué es un cortado? Llevo meses pidiéndolo sin saber».', ['Ella|«Es espresso con tantita leche. Yo tampoco sabía hasta el año pasado».'], 'Pregunta real sobre el lugar. Le das algo fácil de contestar y ella puso algo suyo.', 'fin:conversacion'),
            ajusta('«¿Cómo te llamas? ¿Trabajas por aquí? ¿Siempre vienes?»', ['Ella|«Eh… sí».', 'Y vuelve a sacar el celular.'], 'Tres preguntas personales de golpe son entrevista. Abre con lo que está pasando.', 'R-05'),
          ], { abre: 'El ruido de la máquina.' }),
        ],
      },
      {
        id: 'concierto', nombre: 'Concierto', lugar: 'Foro · antes de que salga la banda',
        contexto: 'Foro chico, faltan diez minutos para que salga la banda. A tu lado, una chica y dos amigos discuten con qué canción van a abrir.',
        inicio: 'ao1', finales: fin('conversacion', 'noche'),
        pasos: [
          paso('ao1', '¿Cuándo entras?', 'Uno de ellos defiende su teoría a gritos. Los otros dos se ríen.', [
            encaja('Esperar a que se rían y quede un silencio.', ['Él termina. Se ríen y la chica voltea hacia el escenario, de tu lado.'], 'Entraste en la pausa, no encima de la discusión.', 'ao2', { marca: 'espera' }),
            ajusta('Gritar tu opinión encima de la suya.', ['Los tres voltean, confundidos.', 'Él|«¿Y este?»'], 'Estaban a media discusión. Espera a que alguien termine.', 'R-04'),
            ajusta('Tocarle el brazo a ella para llamar su atención.', ['Ella retira el brazo y se pega a su amigo.'], 'Tocar para abrir no es abrir. Espera a que te vean.', 'R-03'),
          ]),
          paso('ao2', '¿Qué dices?', 'Prueban las luces. Los tres miran al escenario, justo hacia donde estás.', [
            encaja('«Perdón que me meta: yo digo que abren con la lenta. ¿Qué apostaron?»', ['Ella|«¡Gracias! Eso dije yo. Apostamos los tacos de la salida».', 'Él|«Otro que va a perder».'], 'Te sumaste a lo que ya pasaba y hablaste con el grupo entero.', 'fin:conversacion', { marca: 'incluye' }),
            valida('«Oigan, ¿ustedes ya los habían visto en vivo?»', ['Él|«Tres veces».', 'Ella|«Yo es la primera. Vengo de colada».'], 'Pregunta del momento, para todos. Cada quien contestó lo suyo.', 'fin:conversacion', { marca: 'incluye' }),
            ajusta('A ella: «¿Y tú con quién vienes? ¿Es tu novio?»', ['Ella mira a sus amigos.', 'Ella|«Vengo con ellos».'], 'Brincaste al tema personal y dejaste fuera a los otros dos. Abre con lo que está pasando.', 'R-05'),
          ], { abre: 'La apuesta sobre la primera canción.' }),
        ],
      },
    ],
  },

  /* ============================ 3 · SOSTENERLA SIN ENTREVISTAR ============================ */
  {
    id: 'mision-sostener', titulo: 'Aporta y devuelve', tipo: 'mision', habilidad: 'sostener', ruta: 'principal',
    resumen: 'La plática ya empezó. Ahora toca aportar algo tuyo y seguir lo que la otra persona da.',
    reglas: ['R-05', 'R-06'],
    micro: ['Aporta algo tuyo antes de preguntar otra vez.', 'Sigue el detalle que te dieron.', 'Un silencio corto también le da turno al otro.'],
    referencias: [
      { clase: 'adaptacion', libro: 'mito-carisma', pagina: 'PDF 132–146', nota: 'Hablar y escuchar, según Cabane: pausa antes de responder y atención al detalle.' },
      { clase: 'adaptacion', libro: 'models', pagina: 'PDF 223–253', nota: 'Manson: compartir algo propio en lugar de solo preguntar.' },
      NOVA_ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [
      {
        id: 'oaxaca', nombre: 'Reunión de amigos', lugar: 'Sala de un amigo',
        contexto: 'Reunión en casa de un amigo. Llevas cinco minutos platicando con una chica junto a la mesa de botanas. Te acaba de decir que regresó ayer de Oaxaca.',
        inicio: 'so1', finales: fin('conversacion'),
        pasos: [
          paso('so1', '¿Cómo sigues?', 'Ella toma un totopo y te mira, esperando tu reacción.', [
            encaja('«Yo fui una vez y regresé con tres kilos de más y cero arrepentimientos. ¿Qué fue lo mejor que comiste?»', ['Ella|«Un mole en el mercado, de una señora que no te deja repetir si no te acabas la tortilla».'], 'Pusiste algo tuyo y luego preguntaste. Así la plática no se siente interrogatorio.', 'so2'),
            valida('«¿Qué fue lo que más te gustó?»', ['Ella|«La comida. Sobre todo un mole del mercado».'], 'Pregunta abierta sobre su tema: funciona. Cuida que la siguiente no sea otra pregunta sin aportar nada tuyo.', 'so2'),
            ajusta('«¿Con quién fuiste? ¿Cuánto te salió? ¿En qué hotel te quedaste?»', ['Ella|«Con unas amigas… no me acuerdo cuánto».', 'Mira hacia la cocina.'], 'Tres datos seguidos y nada tuyo: entrevista. Aporta algo y sigue un solo detalle.', 'R-05'),
          ]),
          paso('so2', 'Se hace un silencio. ¿Qué haces?', 'Terminó de contarte lo del mole. Los dos mastican. Pasan dos segundos.', [
            encaja('Retomar su detalle: «¿Y cómo diste con la señora del mole?»', ['Ella|«Por una fila enorme. Yo donde veo fila, me formo. ¿Tú no?»'], 'Seguiste lo que ella aportó y te devolvió una pregunta. Eso es sostener.', 'fin:conversacion'),
            valida('Aguantar el silencio un momento y sonreír.', ['Ella termina su totopo.', 'Ella|«¿Y tú a qué fuiste a Oaxaca?»'], 'El silencio le dio turno y lo tomó. No todo hueco hay que rellenarlo.', 'fin:conversacion'),
            ajusta('Cambiar de tema a tu trabajo para llenar el silencio.', ['Ella asiente mientras ve su vaso.'], 'Soltaste su tema justo cuando estaba vivo. Sigue el detalle que te dio.', 'R-05'),
          ]),
        ],
      },
      {
        id: 'fut', nombre: 'Terraza', lugar: 'Terraza · barandal',
        contexto: 'Tarde de terraza. Platicas con una chica recargados en el barandal. Te acaba de contar que juega fut los domingos.',
        inicio: 'sf1', finales: fin('conversacion'),
        pasos: [
          paso('sf1', '¿Cómo sigues?', 'Ella da un trago y espera a ver qué dices.', [
            encaja('«No inventes. Yo soy al que siempre mandan de portero porque no corre. ¿Tú de qué juegas?»', ['Ella se ríe.', 'Ella|«De media. Pero el domingo perdimos cinco a cero».'], 'Algo tuyo, con humor, y luego la pregunta. Ella contestó y añadió.', 'sf2'),
            valida('«¿De qué juegas?»', ['Ella|«De media. El domingo perdimos cinco a cero».'], 'Pregunta directa sobre su tema: bien. Ahora te toca aportar a ti.', 'sf2'),
            ajusta('«¿Dónde? ¿Con quién? ¿Desde cuándo? ¿Y ganan?»', ['Ella|«Eh… en una liga».', 'Voltea hacia sus amigas.'], 'Encadenaste preguntas sin esperar. Una cosa a la vez, y pon algo tuyo.', 'R-05'),
          ]),
          paso('sf2', 'Te dio un detalle. ¿Qué haces con él?', 'Cinco a cero. Ella lo dijo riéndose y se quedó esperando.', [
            encaja('«¿Cinco a cero? ¿Y de quién fue la culpa, tuya o del portero?»', ['Ella|«Del portero, obvio. Seguro era como tú».'], 'Tomaste su detalle y jugaste con él. Ella te devolvió la broma.', 'fin:conversacion'),
            valida('«Con ese marcador yo habría fingido una lesión en el minuto diez».', ['Ella|«Lo pensé. Pero ya la había fingido la semana pasada».'], 'Aportaste desde tu lado y ella siguió. Aportar también es sostener.', 'fin:conversacion'),
            ajusta('Explicarle cómo debería pararse su equipo.', ['Ella|«Ajá».', 'Mira su vaso.'], 'Ella contó una anécdota, no pidió un análisis. Sigue lo que aportó.', 'R-05'),
          ]),
        ],
      },
    ],
  },

  /* ============================ 4 · HUMOR Y NEGAS ============================ */
  {
    id: 'mision-humor', titulo: 'El remate y el momento', tipo: 'mision', habilidad: 'humor', ruta: 'principal',
    resumen: 'Una nega es un remate juguetón sobre algo que los dos vieron. Aquí decides cuándo cabe y cuándo se deja pasar.',
    reglas: ['R-10', 'R-11'],
    micro: ['Detalle observable y compartido.', 'Con calidez; si suena a crítica, se queda guardada.', 'Si incomodó, suéltala y sigue.'],
    referencias: [
      { clase: 'adaptacion', libro: 'el-metodo', nota: 'En El método la nega es una pulla para mostrar desinterés. NOVA la reescribe como remate cálido sobre una decisión o un momento compartido, nunca sobre un rasgo involuntario.' },
      { clase: 'adaptacion', libro: 'double-your-dating', pagina: 'pp. 64–96', nota: 'Humor y tono según DeAngelo; aquí se conserva el juego y se quita el filo.' },
      NOVA_ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [
      {
        id: 'baile', nombre: 'Reunión con confianza', lugar: 'Sala · reunión de amigos',
        contexto: 'Llevan veinte minutos platicando a gusto en una reunión. Ella dijo que no bailaba. Acaba de enseñarle un paso a dos personas y regresa riéndose.',
        inicio: 'hb1', finales: fin('conversacion'),
        pasos: [
          paso('hb1', '¿Cabe un remate?', 'Vuelve a tu lado, todavía marcando el paso con un pie.', [
            encaja('«Dijiste que no bailabas y ya le enseñaste el paso a dos personas».', ['Ella|«¡Fue una emergencia! Lo estaban haciendo fatal».'], 'Hay confianza, el detalle lo vieron los dos y lo dijiste con gusto. Es la nega N-0053.', 'hb2'),
            valida('Aplaudirle sin decir nada.', ['Ella hace una reverencia.', 'Ella|«Gracias, gracias. Clases los martes».'], 'También cabía. Celebraste el momento y ella siguió el juego.', 'hb2'),
            ajusta('«Bailas raro, pero le echas ganas».', ['Ella deja de mover el pie.', 'Ella|«Ah, mira».'], 'Eso califica cómo baila: suena a crítica. La nega va sobre lo que hizo, con calidez.', 'R-10'),
          ], { abre: 'Dijo que no bailaba y acaba de dar clase.' }),
          paso('hb2', 'Otra broma te salió pesada. ¿Qué haces?', 'Más tarde bromeas con que su playlist «parece de sala de espera». Ella frunce la cara: «Oye, eso no».', [
            encaja('«Uy, sonó más pesado de lo que quería». Y sueltas el chiste.', ['Ella|«Tantito. Pero va, te la paso».', 'Te enseña la siguiente canción.'], 'Tomaste en serio lo que te dijo y no defendiste el chiste. La plática sigue.', 'fin:conversacion', { marca: 'disculpa' }),
            ajusta('«Era broma, no aguantas nada».', ['Ella cruza los brazos.'], 'Le echaste la culpa por incomodarse. Si una broma incomoda, se suelta.', 'R-11'),
            ajusta('Explicar el chiste hasta que le dé risa.', ['Ella|«Sí, ya entendí».'], 'Ya te dijo que no cayó. Explicarlo es insistir. Suéltalo.', 'R-11'),
          ]),
        ],
      },
      {
        id: 'bolsita', nombre: 'Fila con prisa', lugar: 'Cafetería · caja',
        contexto: 'Cafetería. Apenas cruzaste dos frases con la chica de adelante. Le toca pagar y no encuentra su tarjeta: saca de una bolsa pequeña llaves, audífonos, un cargador y un libro.',
        inicio: 'hf1', finales: fin('conversacion'),
        pasos: [
          paso('hf1', '¿Cabe un remate ahora?', 'El cajero espera. La fila avanza detrás. Ella murmura «perdón, perdón» mientras busca.', [
            encaja('Dejarla pasar: está apurada y apenas se conocen.', ['Encuentra la tarjeta, paga y respira.', 'Voltea y se ríe sola de todo lo que sacó.', 'Ella|«Perdón, traigo mi vida aquí».'], 'Momento tenso y poca confianza: la nega se queda guardada. Mira cómo cambió el momento.', 'hf2', { marca: 'espera' }),
            ajusta('«¿Todo eso salió de esa bolsita?»', ['Ella|«Ajá».', 'No voltea.'], 'La frase es buena; el momento no. Con prisa y sin confianza suena a que la estás viendo batallar.', 'R-10'),
            ajusta('«Uy, qué desorden traes».', ['Ella aprieta la boca y sigue buscando.'], 'Eso es crítica, y encima cuando está apurada. Déjala pasar.', 'R-10'),
          ], { espera: 'Está apurada y el cajero espera.' }),
          paso('hf2', 'Ahora ella se ríe de la bolsa. ¿Qué dices?', 'Ya pagó. Va metiendo las cosas de regreso y te mira, divertida.', [
            encaja('«¿Todo eso salió de esa bolsita?»', ['Ella|«Y falta el paraguas».'], 'Misma frase, otro momento: ella abrió el tema y ya no hay prisa. Es la nega N-0233.', 'fin:conversacion'),
            valida('«Con calma, yo no traigo prisa».', ['Ella|«Gracias. El de atrás sí, creo».'], 'Sin remate y bien. Bajarle la presión también aporta.', 'fin:conversacion'),
            ajusta('«A ver si un día ordenas eso».', ['Ella|«Ajá».', 'Cierra la bolsa.'], 'Ella se reía de sí misma; tú la regañaste. El remate juega con ella, no la corrige.', 'R-10'),
          ], { abre: 'Ella misma bromeó con la bolsa.' }),
        ],
      },
    ],
  },

  /* ============================ 5 · MOSTRAR INTENCIÓN E INVITAR ============================ */
  {
    id: 'mision-intencion', titulo: 'Dilo simple y deja elegir', tipo: 'mision', habilidad: 'intencion', ruta: 'principal',
    resumen: 'Hubo plática de ida y vuelta. Dices qué te gustó y propones algo con salida.',
    reglas: ['R-12', 'R-13'],
    micro: ['«Me gustó platicar contigo» ya es intención.', 'Propón qué y cuándo.', 'Deja una salida fácil.'],
    referencias: [
      { clase: 'adaptacion', libro: 'models', pagina: 'PDF 208–223', nota: 'Manson: decir tus intenciones con claridad en lugar de esconderlas.' },
      { clase: 'adaptacion', libro: 'el-metodo', nota: 'El método propone cambiar de lugar o quedar otro día. Aquí la invitación dice qué propones y deja una salida sencilla.' },
      NOVA_ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [
      {
        id: 'expo', nombre: 'Salida de la exposición', lugar: 'Galería · salida',
        contexto: 'Llevan media hora recorriendo una exposición juntos. Ella te ha preguntado cosas y te esperó en cada sala. Están llegando a la salida.',
        inicio: 'ie1', finales: fin('contacto', 'conversacion'),
        pasos: [
          paso('ie1', '¿Dices algo antes de despedirte?', 'Ella se detiene en la puerta y se acomoda la bolsa. Te mira.', [
            encaja('«Me gustó platicar contigo».', ['Ella|«A mí también. Casi no vi los cuadros».'], 'Simple y claro. Dijiste lo que pasó y ella lo devolvió.', 'ie2', { marca: 'intencion' }),
            valida('«La pasé muy bien. La sala de arriba contigo estuvo mejor que sola».', ['Ella se ríe.', 'Ella|«La de arriba sola da miedo, sí».'], 'Lo dijiste con un detalle de lo que vivieron. También es mostrar intención.', 'ie2', { marca: 'intencion' }),
            ajusta('No decir nada y esperar a que ella lo adivine.', ['Ella|«Bueno… pues nos vemos».', 'Empieza a caminar.'], 'Ella te dio señales toda la tarde y te quedaste callado. Dilo simple.', 'R-12'),
          ], { abre: 'Te esperó en cada sala.' }),
          paso('ie2', '¿Cómo invitas?', 'Siguen en la puerta. A la vuelta hay un café con mesas afuera.', [
            encaja('«Hay un café aquí a la vuelta. ¿Te late uno ahorita o lo dejamos para otro día?»', ['Ella|«Ahorita no puedo, quedé con mi hermana. Pero otro día sí. Anota mi número».'], 'Propusiste algo concreto y con salida. Ella eligió la opción que le acomodaba.', 'fin:contacto'),
            valida('«¿Te late que nos pasemos el número y vemos otra expo?»', ['Ella|«Va. Hay una de cartel en el centro».'], 'Pediste contacto dejando que eligiera, y ella puso el plan.', 'fin:contacto'),
            ajusta('«Vamos por un café, ándale, no acepto un no».', ['Ella da un paso atrás.', 'Ella|«Hoy no puedo, de verdad».'], 'Le quitaste la salida. Una invitación deja espacio para elegir.', 'R-12'),
          ]),
        ],
      },
      {
        id: 'tacos', nombre: 'Final de la reunión', lugar: 'Puerta del departamento',
        contexto: 'Se acaba una reunión de amigos. Platicaste largo con una chica: se rieron y ella te contó que le encantan los tacos de canasta. Están tomando sus cosas.',
        inicio: 'it1', finales: fin('contacto', 'conversacion'),
        pasos: [
          paso('it1', '¿Dices algo?', 'Ella se pone la chamarra y te busca con la mirada para despedirse.', [
            encaja('«Me cayó muy bien platicar contigo».', ['Ella|«Igual. Me reí mucho con lo de tu jefe».'], 'Lo dijiste sin vueltas, y ella recordó un detalle tuyo.', 'it2', { marca: 'intencion' }),
            valida('«Oye, lo de los tacos de canasta no se me va a olvidar».', ['Ella|«Más te vale. Es información importante».'], 'Retomaste algo suyo. Se nota que escuchaste, y eso también es intención.', 'it2', { marca: 'intencion' }),
            ajusta('Despedirte de lejos con la mano y arrepentirte en el elevador.', ['Ella se despide con la mano y se va con sus amigas.'], 'Había intercambio y no dijiste nada. No hace falta un discurso: una frase.', 'R-12'),
          ]),
          paso('it2', '¿Cómo invitas?', 'Están en la puerta. Sus amigas la esperan en el pasillo.', [
            encaja('«El sábado voy por unos de canasta a la esquina de mi trabajo. ¿Te late venir? Si no puedes, sin problema».', ['Ella|«El sábado sí puedo. Pásame tu número».'], 'Qué, cuándo y salida fácil. Ella solo tuvo que decidir.', 'fin:contacto'),
            valida('«¿Te late que nos pasemos el número y te aviso cuando vaya por tacos?»', ['Ella|«Va. Pero avisas, eh».'], 'Pediste el contacto con un motivo real y le dejaste la decisión.', 'fin:contacto'),
            ajusta('«A ver cuándo salimos».', ['Ella|«Sí, a ver».', 'Se va con sus amigas.'], '«A ver cuándo» no propone nada. Di qué, cuándo y deja salida.', 'R-12'),
          ]),
        ],
      },
    ],
  },

  /* ============================ 6 · LEER LA RESPUESTA ============================ */
  {
    id: 'mision-leer', titulo: 'Respuesta seca', tipo: 'mision', habilidad: 'leer', ruta: 'principal',
    resumen: 'Te contestan corto. Separas lo que viste de lo que supones y decides con eso.',
    reglas: ['R-02', 'R-01'],
    micro: ['Una respuesta seca tiene muchas causas.', 'Comentario ligero y vuelves a lo tuyo.', 'Si retoma, sigues. Si no, ahí queda.'],
    referencias: [
      { clase: 'adaptacion', libro: 'el-metodo', nota: 'El método lee la falta de respuesta con jerga de rendimiento. Para NOVA importan la iniciativa repetida y el contexto: un gesto aislado admite varias lecturas.' },
      NOVA_ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [
      {
        id: 'terraza', nombre: 'Terraza', lugar: 'Terraza · barandal',
        contexto: 'Reunión en una terraza con buena vista. Le comentas a una chica algo sobre el atardecer. Te dice «Sí, está padre» y sigue viendo su celular.',
        inicio: 'lt1', finales: fin('conversacion', 'cierre'),
        pasos: [
          paso('lt1', 'Te contestó seco. ¿Qué haces?', 'Ella escribe algo en el celular. No se movió de lugar ni te dio la espalda.', [
            encaja('Un comentario ligero y volver a lo tuyo: «Disfrútala». Y regresas con tus amigos.', ['Vuelves a tu grupo.', 'Diez minutos después ella se acerca a la mesa de botanas, donde estás.', 'Ella|«Oye, ¿tú sabes quién trajo el guacamole?»'], 'No sabías la causa y no la inventaste. Soltaste, y ella retomó cuando pudo.', 'lt2', { marca: 'suelta' }),
            ajusta('Preguntarle qué le pasa.', ['Ella|«¿Eh? Nada».', 'Sigue escribiendo.'], 'Supusiste que le pasaba algo. Solo viste una respuesta corta y un celular.', 'R-02'),
            ajusta('Intentar con otro tema, y luego con otro.', ['Ella contesta «mjm» dos veces y se cambia de lugar.'], 'Insistir no cambia la causa. Comentario ligero y a lo tuyo.', 'R-02'),
          ], { espera: 'Sigue en su celular.' }),
          paso('lt2', 'Ella retomó. ¿Cómo sigues?', 'Tiene un totopo en la mano y cara de que el guacamole le gustó.', [
            encaja('«Yo no, pero ya voy en mi tercer totopo investigando».', ['Ella se ríe.', 'Ella|«Perdón por hace rato, estaba resolviendo algo del trabajo».'], 'Seguiste por donde ella abrió, sin cobrarle lo de antes. Y mira: la causa era el trabajo.', 'fin:conversacion'),
            valida('«Ni idea. ¿Ya probaste el de la esquina? Ese pica».', ['Ella|«¿Pica rico o pica de llorar?»'], 'Contestaste y devolviste. La plática ya es de los dos.', 'fin:conversacion'),
            ajusta('«Ah, ahora sí hablas».', ['Ella deja el totopo.', 'Ella|«Estaba ocupada».'], 'Le cobraste la respuesta seca. Si retoma, sigue por ahí y ya.', 'R-02'),
          ]),
        ],
      },
      {
        id: 'concierto', nombre: 'Concierto', lugar: 'Foro · entre canciones',
        contexto: 'Concierto, entre dos canciones. Le dices a la persona de al lado «qué buena estuvo esa». Te contesta «Ajá» y se voltea hacia su grupo.',
        inicio: 'lc1', finales: fin('cierre'),
        pasos: [
          paso('lc1', 'Te contestó seco. ¿Qué haces?', 'Ella quedó de espaldas a ti, hablando con sus amigos. Empieza la siguiente canción.', [
            encaja('Dejarlo en eso y volver al concierto.', ['Cantas la siguiente. Ella sigue con su grupo el resto de la noche.'], 'Se giró hacia su grupo: siguió en lo suyo. Ahí se deja la plática.', 'lc2', { marca: 'suelta' }),
            ajusta('Tocarle el hombro para repetirle el comentario.', ['Voltea, molesta.', 'Ella|«¿Qué?»'], 'Te dio la espalda y la tocaste desde atrás. Ahí no había plática que rescatar.', 'R-03'),
            ajusta('Gritarle otro comentario más fuerte.', ['Uno de sus amigos te mira.'], 'No fue el volumen. Si sigue en lo suyo, deja la plática ahí.', 'R-02'),
          ]),
          paso('lc2', 'Termina el concierto. ¿Qué haces?', 'Sale con su grupo sin voltear. Tú vas hacia la misma puerta.', [
            encaja('Disfrutar la salida y seguir con tu noche.', ['Sales tarareando. Tus amigos preguntan dónde cenan.'], 'No retomó y lo respetaste. Cerrar sin drama también cuenta.', 'fin:cierre', { marca: 'acepta_no' }),
            ajusta('Alcanzarla en la salida para intentar otra vez.', ['Ella apura el paso con sus amigos.'], 'Ya había respuesta: siguió en lo suyo. Perseguir no es insistir bonito.', 'R-13'),
            ajusta('Quedarte toda la noche pensando qué hiciste mal.', ['Te pierdes la plática de tus amigos.'], 'Una respuesta seca tiene muchas causas, y casi ninguna eres tú. Suéltala.', 'R-01'),
          ]),
        ],
      },
    ],
  },

  /* ============================ 7 · CERRAR CON CALMA ============================ */
  {
    id: 'mision-cerrar', titulo: 'Despedirte bien', tipo: 'mision', habilidad: 'cerrar', ruta: 'principal',
    resumen: 'La plática se acaba o te dicen que no. Cierras corto, tranquilo y sin cobrar nada.',
    reglas: ['R-13', 'R-01'],
    micro: ['Cierra tú antes de que se alargue.', 'Un no se recibe corto.', 'La próxima vez, saludas normal.'],
    referencias: [
      { clase: 'adaptacion', libro: 'models', pagina: 'PDF 109–118', nota: 'Manson sobre el rechazo: es información, no veredicto.' },
      NOVA_ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [
      {
        id: 'cafe', nombre: 'Cafetería', lugar: 'Cafetería · barra de entrega',
        contexto: 'Platicaste a gusto con una chica en la fila del café. Le entregan su vaso. Ella mira hacia la puerta y luego su reloj.',
        inicio: 'cc1', finales: fin('cierre'),
        pasos: [
          paso('cc1', '¿Cómo cierras?', 'Tiene el café en una mano y las llaves en la otra.', [
            encaja('«Que te vaya bien. Suerte con la junta».', ['Ella|«Gracias. Suerte con tu cortado».'], 'Viste las llaves y el reloj, y cerraste tú. Corto y con un detalle de la plática.', 'cc2', { marca: 'suelta' }),
            valida('«Me dio gusto platicar. Buen día».', ['Ella|«Igual, buen día».'], 'Cierre limpio. Sin pedir nada, sin alargar.', 'cc2', { marca: 'suelta' }),
            ajusta('Caminar con ella hacia la salida para seguir platicando.', ['Ella apura el paso.', 'Ella|«Bueno… ya me voy».'], 'Miró la puerta y el reloj: ya se iba. Cerrar a tiempo es parte de la plática.', 'R-13'),
          ], { espera: 'Miró la puerta y el reloj.' }),
          paso('cc2', 'Otro día te dice que no. ¿Qué respondes?', 'Una semana después coinciden en la misma cafetería. Le propones sentarse un rato. «Hoy no, ando con prisa».', [
            encaja('«Va, que te rinda el día».', ['Ella|«Gracias. Ahí nos vemos».'], 'Aceptaste a la primera y con buena cara. La puerta queda como estaba.', 'fin:cierre', { marca: 'acepta_no' }),
            ajusta('«¿Ni cinco minutitos?»', ['Ella|«De verdad no».', 'Sale rápido.'], 'Ya te había contestado. Negociar un no lo vuelve incómodo.', 'R-13'),
            ajusta('«Bueno… ni modo». Con cara larga.', ['Ella|«Perdón, eh».', 'Se va apenada.'], 'La hiciste cargar con tu decepción. Un no se recibe sin cobrar.', 'R-13'),
          ]),
        ],
      },
      {
        id: 'reunion', nombre: 'Reunión de amigos', lugar: 'Sala · reunión',
        contexto: 'Reunión de amigos. Después de una buena plática le pides su número a una chica. Te contesta: «Prefiero no, gracias».',
        inicio: 'cr1', finales: fin('cierre'),
        pasos: [
          paso('cr1', 'Te dijo que no. ¿Qué respondes?', 'Lo dijo amable y sin dar explicación. Sigue frente a ti.', [
            encaja('«Va, me dio gusto conocerte».', ['Ella|«Igual. Gracias por tomarlo así».'], 'Corto, tranquilo y sin pedir explicación. Así se recibe un no.', 'cr2', { marca: 'acepta_no' }),
            ajusta('«¿Por qué no? ¿Tienes novio?»', ['Ella|«No tengo que explicarlo».'], 'Un no no viene con justificante. Acepta y despídete bien.', 'R-13'),
            ajusta('«Bueno, te doy el mío por si cambias de opinión».', ['Ella no toma el papel.'], 'Eso es el mismo intento con otro envase. Ya hubo respuesta.', 'R-13'),
          ]),
          paso('cr2', 'Más tarde coinciden junto al refri. ¿Qué haces?', 'Ella abre el refri buscando un refresco. Te ve llegar.', [
            encaja('Saludar normal: «¿Te paso uno? Hay de toronja atrás».', ['Ella|«Va, gracias. Ese».'], 'El no fue para el número, no para tratarse bien. Así nadie queda incómodo.', 'fin:cierre'),
            ajusta('Hacerte el ofendido y esquivarla toda la noche.', ['Los amigos en común preguntan qué pasó.'], 'Castigar con frialdad también es cobrar el no. Trato normal.', 'R-01'),
            ajusta('Volver a pedirle el número «ya en confianza».', ['Ella cierra el refri.', 'Ella|«Ya te había dicho».'], 'Su respuesta no caducó. Acepta un no la primera vez.', 'R-13'),
          ]),
        ],
      },
    ],
  },

  /* ============================ 8 · INSTAGRAM ============================ */
  {
    id: 'mision-instagram', titulo: 'Responder a una historia', tipo: 'mision', habilidad: 'instagram', ruta: 'principal',
    resumen: 'Las mismas reglas, por mensaje: abres con un detalle concreto, ves si amplía el tema y propones solo si hay ida y vuelta.',
    reglas: ['R-05', 'R-02', 'R-12'],
    micro: ['Responde a un detalle concreto de la historia.', 'Fíjate si amplía el tema o contesta corto.', 'Propón algo solo si hay conversación mutua.'],
    referencias: [
      { clase: 'original_nova', nota: 'Instagram es adaptación editorial de NOVA: responder a una historia por un detalle concreto, observar si la otra persona amplía el tema y proponer algo si hay conversación mutua. El método trabaja salidas, teléfono y foros.' },
    ],
    relacionados: [], estado: 'mvp',
    variantes: [
      {
        id: 'pastel', nombre: 'El pastel chueco', lugar: 'Instagram · historias',
        contexto: 'Sigues a una chica que conociste en una reunión. Sube una historia: un pastel medio chueco, con el texto «primer intento».',
        inicio: 'gp1', finales: fin('conversacion'),
        pasos: [
          paso('gp1', '¿Qué le respondes?', 'La historia lleva diez minutos. Se ve la cocina hecha un desastre al fondo.', [
            encaja('«Ese pastel tiene personalidad. ¿De qué era?»', ['Ella|«De zanahoria. Quedó feo pero rico».'], 'Respondiste a un detalle concreto de lo que ella subió. Contestó, aunque corto.', 'gp2'),
            valida('«Para ser el primer intento, yo ya le habría entrado. ¿Sí sabía bien?»', ['Ella|«Sí. Feo pero rico».'], 'Comentario más pregunta sobre su historia. Te contestó corto: toca leer eso.', 'gp2'),
            ajusta('Reaccionar con fueguitos y escribir «hola guapa».', ['Visto. Sin respuesta.'], 'Eso no habla de nada de lo que subió. Abre con lo que está pasando: el pastel.', 'R-05'),
          ], { abre: 'El pastel y el «primer intento».' }),
          paso('gp2', 'Te contestó corto. ¿Qué haces?', '«Feo pero rico». No preguntó nada de vuelta.', [
            encaja('Responder corto y dejarlo ahí: «Rico le gana a bonito».', ['Le da corazón al mensaje.', 'Al día siguiente ella reacciona a una historia tuya.'], 'No forzaste una plática que venía corta, y ella retomó después por su cuenta.', 'fin:conversacion', { marca: 'suelta' }),
            valida('Aportar algo tuyo: «Yo una vez horneé un ladrillo sabor vainilla».', ['Ella|«JAJA, ¿y te lo comiste?»'], 'En lugar de otra pregunta pusiste una anécdota. Esta vez sí amplió.', 'fin:conversacion'),
            ajusta('Mandarle tres mensajes seguidos hasta que conteste algo más.', ['Los tres quedan en visto.'], 'Contestó corto y empujaste. Comentario ligero y a lo tuyo; si retoma, sigues.', 'R-02'),
          ]),
        ],
      },
      {
        id: 'concierto', nombre: 'La foto del concierto', lugar: 'Instagram · historias',
        contexto: 'El sábado platicaste con una chica sobre un concierto al que ella quería ir. Se siguieron en Instagram. Hoy sube una foto desde el foro.',
        inicio: 'gc1', finales: fin('contacto', 'conversacion'),
        pasos: [
          paso('gc1', '¿Qué le respondes?', 'En la foto se ve el escenario y su mano con un vaso.', [
            encaja('«¡Sí fuiste! ¿Abrieron con la que dijiste?»', ['Ella manda un audio largo, riéndose.', 'Ella|«NO, y perdí la apuesta. ¿Tú fuiste?»'], 'Retomaste algo que platicaron en persona. Ella amplió y te preguntó de vuelta.', 'gc2'),
            valida('«Qué envidia. ¿Qué tal estuvo?»', ['Ella|«Buenísimo. Tocaron dos horas. ¿Tú no alcanzaste boleto?»'], 'Pregunta sencilla sobre su historia. Contestó con detalle y devolvió la pregunta.', 'gc2'),
            ajusta('Darle like a quince fotos viejas de su perfil.', ['Ella no contesta nada.'], 'Eso no abre ninguna plática y se siente raro. Responde a lo que subió hoy.', 'R-05'),
          ], { abre: 'El concierto del que platicaron.' }),
          paso('gc2', 'Hay ida y vuelta. ¿Propones algo?', 'Te contestó largo y te hizo una pregunta. Llevan seis mensajes.', [
            encaja('«No alcancé boleto. Tocan otra vez en marzo; ¿te late ir? Si no, igual me cuentas el setlist».', ['Ella|«Va, pero esta vez apuesto yo».'], 'Había conversación mutua. Propusiste algo concreto y dejaste salida.', 'fin:contacto', { marca: 'intencion' }),
            valida('Seguir la plática: «No alcancé. Cuéntame cuál fue la mejor».', ['Ella manda otro audio.'], 'También se vale seguir platicando sin proponer todavía. El intercambio ahí está.', 'fin:conversacion'),
            ajusta('«¿Por qué tardaste dos horas en contestarme?»', ['Ella|«Estaba en un concierto…»'], 'Le pediste cuentas de su tiempo. Tardar en contestar tiene muchas causas.', 'R-02'),
          ]),
        ],
      },
    ],
  },
];

export const unidades: Unidad[] = [
  { id: 'presencia', orden: 1, titulo: 'Presencia y aproximación', icono: 'presencia', regla: 'R-03',
    intro: 'Antes de hablar ya comunicaste algo: por dónde llegaste y con qué prisa.',
    micro: ['Ubica primero: quién mira a quién.', 'Llega por el frente o un costado.', 'Respira. Hablar lento se oye seguro.'],
    escenas: ['mision-presencia'],
    ejercicio: { id: 'ej-presencia', titulo: 'Entra por donde te vean', texto: 'Hoy, al llegar a cualquier grupo (oficina, comida, reunión), entra por el lado donde te puedan ver y saluda cuando alguien te mire. Fíjate quién te devuelve el saludo.' } },
  { id: 'abrir', orden: 2, titulo: 'Abrir conversación', icono: 'abrir', regla: 'R-05',
    intro: 'La primera frase no tiene que ser brillante. Tiene que hablar de algo que los dos puedan ver.',
    micro: ['Espera una pausa real.', 'Comenta lo que está pasando.', 'Una cosa, y escuchas.'],
    escenas: ['mision-abrir'],
    ejercicio: { id: 'ej-abrir', titulo: 'Un comentario del lugar', texto: 'En una fila o un elevador, di una sola frase sobre algo que los dos estén viendo. No sigas con pregunta. Fíjate si la otra persona añade algo.' } },
  { id: 'sostener', orden: 3, titulo: 'Sostenerla sin entrevistar', icono: 'sostener', regla: 'R-06',
    intro: 'Una plática se sostiene cuando los dos ponen algo. Preguntar sin aportar cansa.',
    micro: ['Aporta algo tuyo y luego pregunta.', 'Sigue el detalle que te dieron.', 'Deja silencios cortos.'],
    escenas: ['mision-sostener'],
    ejercicio: { id: 'ej-sostener', titulo: 'Una tuya por cada pregunta', texto: 'En tu próxima plática, antes de hacer una segunda pregunta cuenta algo tuyo de una frase. Al final recuerda un detalle que la otra persona te dio.' } },
  { id: 'humor', orden: 4, titulo: 'Humor y negas', icono: 'nega', regla: 'R-10',
    intro: 'Una nega es un remate juguetón sobre algo que los dos acaban de ver. Va con calidez, o no va.',
    micro: ['Detalle observable y compartido.', 'Sobre lo que hizo, nunca sobre cómo es.', 'Si incomodó: «sonó más pesado de lo que quería».'],
    escenas: ['mision-humor'],
    ejercicio: { id: 'ej-humor', titulo: 'Caza un detalle', texto: 'Hoy solo observa: anota un momento en que alguien hizo algo simpático y contradictorio (dijo que no y lo hizo). No hace falta decir nada. Luego busca en la Arena qué remate habría cabido.' } },
  { id: 'intencion', orden: 5, titulo: 'Mostrar intención e invitar', icono: 'intencion', regla: 'R-12',
    intro: 'Si hubo plática de ida y vuelta, decir que te gustó no es arriesgado: es claro.',
    micro: ['«Me gustó platicar contigo».', 'Propón qué y cuándo.', 'Deja salida fácil.'],
    escenas: ['mision-intencion'],
    ejercicio: { id: 'ej-intencion', titulo: 'Invitación en una frase', texto: 'Escribe una invitación real para alguien (amigo, familiar, quien sea) que diga qué, cuándo y deje salida: «¿Te late ___ el ___? Si no puedes, sin problema». Mándala.' } },
  { id: 'leer', orden: 6, titulo: 'Leer la respuesta', icono: 'ojo', regla: 'R-02',
    intro: 'Lo que viste es un dato. Lo que supones es tuyo. Decide con lo primero.',
    micro: ['Separa observación de suposición.', 'Respuesta seca: comentario ligero y a lo tuyo.', 'Si retoma, sigue por ahí.'],
    escenas: ['mision-leer'],
    ejercicio: { id: 'ej-leer', titulo: 'Lo que vi y lo que supuse', texto: 'Después de una plática de hoy escribe dos cosas que sí pasaron (dijo, hizo, volteó) y una que tú supusiste. Compara.' } },
  { id: 'cerrar', orden: 7, titulo: 'Cerrar con calma', icono: 'cierre', regla: 'R-13',
    intro: 'Cómo te vas es lo último que recuerdan de ti. Y casi siempre se puede hacer bien.',
    micro: ['Cierra tú, a tiempo.', 'Un no se recibe corto.', 'Después, trato normal.'],
    escenas: ['mision-cerrar'],
    ejercicio: { id: 'ej-cerrar', titulo: 'Cierra tú primero', texto: 'En una plática de hoy, sé tú quien cierra: «Te dejo, me dio gusto platicar». Antes de que se alargue. Fíjate cómo queda el ambiente.' } },
  { id: 'instagram', orden: 8, titulo: 'Instagram como práctica', icono: 'insta', regla: 'R-05',
    intro: 'Por mensaje aplican las mismas reglas: detalle concreto, leer la respuesta y proponer con salida.',
    micro: ['Responde a algo concreto de la historia.', 'Corto con corto.', 'Propón si hay ida y vuelta.'],
    escenas: ['mision-instagram'],
    ejercicio: { id: 'ej-instagram', titulo: 'Responde a un detalle', texto: 'Contesta la historia de alguien que conoces con un comentario sobre un detalle concreto (no un emoji). Si contesta corto, déjalo ahí.' } },
];
