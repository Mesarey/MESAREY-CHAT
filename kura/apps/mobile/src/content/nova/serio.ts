import { ajusta, encaja, fin, paso, valida, type Escena } from './types';

/**
 * Ruta «Cuando buscas algo más serio». Vive aparte de CHAD.
 * Trabaja idealización, reciprocidad, expectativas y compatibilidad.
 * Del amor (Stendhal) pertenece a esta ruta y está excluido de CHAD.
 */

const ORIGINAL = { clase: 'original_nova' as const, nota: 'Escena y diálogos originales de NOVA.' };

export const introSerio = {
  titulo: 'Cuando buscas algo más serio',
  texto: 'Esta ruta va aparte del Mapa CHAD. Aquí no se trata de abrir una plática sino de saber qué buscas, decirlo, escuchar qué busca la otra persona y ver si las dos cosas caben juntas.',
  puntos: [
    'Idealización: separar a la persona que conoces de la historia que ya imaginaste.',
    'Reciprocidad: fijarte si la iniciativa va y viene.',
    'Expectativas: decir qué buscas en primera persona.',
    'Compatibilidad: decidir con lo que los dos dijeron.',
  ],
};

export const escenasSerio: Escena[] = [
  {
    id: 'serio-idealizacion', titulo: 'Una buena cita y mucha imaginación', tipo: 'mision', habilidad: 'serio', ruta: 'cuando_buscas_algo_mas_serio',
    resumen: 'Después de una primera cita buena, tu cabeza ya va tres meses adelante.',
    reglas: ['R-01'],
    micro: ['Lo que pasó y lo que imaginas van en listas distintas.', 'Una segunda ocasión concreta te da más datos que diez teorías.'],
    referencias: [
      { clase: 'adaptacion', libro: 'del-amor', pagina: 'Libro I, II, VI, XI–XII · PDF 33, 40–42, 50–53', nota: 'Stendhal llama cristalización a cubrir a la persona con perfecciones imaginadas. La escena actual es de NOVA.' },
      { clase: 'adaptacion', libro: 'el-metodo', nota: 'El método llama «monoítis» a la fijación por una persona antes de una relación.' },
      ORIGINAL,
    ],
    relacionados: ['nova-mvp01-047-esc'], estado: 'mvp',
    variantes: [{
      id: 'primera-cita', nombre: 'Después de la primera cita', lugar: 'De regreso a casa',
      contexto: 'Primera cita: se rieron, ella se quedó dos horas y al despedirse dijo «la pasé muy bien». En el camión de regreso ya te imaginas un viaje a la playa juntos.',
      inicio: 'si1', finales: fin('conversacion', 'contacto'),
      pasos: [
        paso('si1', '¿Qué sabes de verdad?', 'Vas viendo por la ventana con una sonrisa. Tu cabeza ya eligió hotel.', [
          encaja('Separar: pasó que se rieron y se quedó dos horas. Lo del viaje lo puse yo.', ['Lo anotas en el celular. La lista de «pasó» tiene tres cosas. La de «imaginé», siete.'], 'Eso es ver a la persona que conoces y no a la historia que ya armaste. Sigue igual de emocionante, pero es real.', 'si2'),
          ajusta('Escribirle «ya sé que eres la indicada».', ['Tarda una hora en contestar.', 'Ella|«Jaja, apenas nos conocemos».'], 'Llevan dos horas juntos. Le mandaste la película entera cuando van en el tráiler.', 'R-01'),
          ajusta('Revisar todas sus fotos para confirmar que es perfecta.', ['Dos horas después sabes el nombre de su perro de 2019.'], 'Eso alimenta la historia imaginada, no lo que sabes de ella. Vuelve a lo que sí pasó.', 'R-01'),
        ]),
        paso('si2', '¿Cuál es tu siguiente paso?', 'Ya en tu casa. Quieres volver a verla.', [
          encaja('Invitar a algo concreto: «La pasé muy bien. ¿Te late repetir el jueves?»', ['Ella|«El jueves no puedo. ¿Viernes?»'], 'Una segunda ocasión real. Lo que pase ahí amplía lo que sabes.', 'fin:contacto'),
          valida('Decirle qué te gustó y preguntar cómo la pasó: «Me gustó cómo te ríes de tus propios chistes. ¿Tú cómo la pasaste?»', ['Ella|«Muy bien. Me quedé con ganas de que me contaras lo de tu abuela».'], 'Dijiste algo concreto y dejaste que ella pusiera su versión. Ahora sabes un poco más.', 'fin:conversacion'),
          ajusta('Planear el mes completo y mandárselo.', ['Ella|«Wow, eh… vamos viendo, ¿no?»'], 'Te adelantaste por los dos. Una invitación a la vez.', 'R-12'),
        ]),
      ],
    }],
  },
  {
    id: 'serio-reciprocidad', titulo: 'Siempre empiezo yo', tipo: 'mision', habilidad: 'serio', ruta: 'cuando_buscas_algo_mas_serio',
    resumen: 'Ella contesta amable, pero la iniciativa siempre sale de tu lado.',
    reglas: ['R-02', 'R-12'],
    micro: ['Reciprocidad es que la iniciativa vaya y venga.', 'Dejar espacio también es una forma de preguntar.'],
    referencias: [
      { clase: 'adaptacion', libro: 'del-amor', pagina: 'Libro I, V–VI, XIV–XV · PDF 40–42, 55–58', nota: 'Stendhal sobre el ritmo de la confianza. La escena actual es de NOVA.' },
      { clase: 'adaptacion', libro: 'el-metodo', pagina: 'PDF 310', nota: 'Frase de NOVA a partir de la apertura del paso 8: «Deja un poco de espacio para ver si la otra persona también propone».' },
      ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [{
      id: 'tres-semanas', nombre: 'Tres semanas de mensajes', lugar: 'Tu celular',
      contexto: 'Llevan tres semanas saliendo. Tú escribes primero, tú propones los planes. Ella siempre contesta amable y siempre llega. Nunca ha propuesto nada.',
      inicio: 'sr1', finales: fin('conversacion', 'cierre'),
      pasos: [
        paso('sr1', '¿Qué haces con eso?', 'Tienes un mensaje a medio escribir proponiendo el plan del sábado.', [
          encaja('Dejar un espacio: no proponer esta vez y ver si ella lo hace.', ['Borras el mensaje. Pasan cinco días.', 'Ella|«Oye, ¿sí vamos por el ramen que dijiste?»'], 'Dejaste lugar para que ella también propusiera, y lo hizo. Eso no lo habrías sabido escribiendo tú.', 'sr2'),
          valida('Decirlo simple: «Me gusta salir contigo. Siento que casi siempre propongo yo; ¿tú cómo lo ves?»', ['Ella|«Ay, es que tú planeas muy bien y me dejé llevar. Va: el sábado me toca a mí».'], 'Lo dijiste en primera persona y sin reclamo. Ella te contó su lado.', 'sr2'),
          ajusta('Escribirle el doble para que se note tu interés.', ['Ella contesta a uno de cada tres mensajes.'], 'Más de lo mismo no te dice si hay reciprocidad. Deja espacio o pregúntalo.', 'R-02'),
        ]),
        paso('sr2', 'Ella propuso. ¿Cómo lo tomas?', 'Tienes su mensaje en pantalla.', [
          encaja('Tomarlo con gusto: «Va. Me dio gusto que propusieras».', ['Ella|«Jaja, ya era hora, ¿no?»'], 'Recibiste su iniciativa y dijiste que te importa. Eso la invita a repetirla.', 'fin:conversacion'),
          valida('«Va. ¿Jueves?»', ['Ella|«Jueves».'], 'Simple y suficiente. La iniciativa ya fue y vino.', 'fin:conversacion'),
          ajusta('«Hasta que te acordaste de mí».', ['Ella|«Uy. Perdón, eh».'], 'Le cobraste justo cuando hizo lo que querías. Si retoma, sigue por ahí.', 'R-02'),
        ]),
      ],
    }],
  },
  {
    id: 'serio-expectativas', titulo: 'Decir qué buscas', tipo: 'mision', habilidad: 'serio', ruta: 'cuando_buscas_algo_mas_serio',
    resumen: 'Tú buscas una relación y no sabes qué busca ella. Toca decirlo y escuchar.',
    reglas: ['R-12', 'R-13'],
    micro: ['Di qué buscas en primera persona.', 'Lo que te contesten, tómalo literal.'],
    referencias: [
      { clase: 'adaptacion', libro: 'del-amor', pagina: 'Libro I, XXXI–XXXIV · PDF 102–120', nota: 'Stendhal sobre intimidad y confidencias. La escena actual es de NOVA.' },
      { clase: 'adaptacion', libro: 'el-metodo', pagina: 'PDF 444', nota: 'Frase de NOVA a partir de la apertura del paso 11: «Decir qué buscas a tiempo le da a la otra persona espacio para elegir».' },
      ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [{
      id: 'cuarta-cita', nombre: 'Cuarta cita', lugar: 'Caminando después de cenar',
      contexto: 'Cuarta cita. Todo va bien: se buscan, se ríen. Tú buscas una relación. No sabes qué busca ella y te da miedo preguntar.',
      inicio: 'sx1', finales: fin('conversacion', 'cierre'),
      pasos: [
        paso('sx1', '¿Cómo lo dices?', 'Caminan despacio hacia su casa. Hay un silencio cómodo.', [
          encaja('«Yo ando buscando algo en serio, sin prisa. ¿Tú en qué andas?»', ['Ella se queda pensando.', 'Ella|«Gracias por decirlo. Yo ahorita no quiero nada serio; vengo saliendo de algo».'], 'Pusiste lo tuyo primero y preguntaste. Te contestó claro. Eso vale más que adivinar.', 'sx2', { marca: 'intencion' }),
          valida('«Oye, ¿y tú qué buscas ahorita?»', ['Ella|«Mmm… ¿tú qué buscas?»', 'Le dices que algo en serio.', 'Ella|«Yo ahorita no quiero nada serio; vengo saliendo de algo».'], 'Funciona, pero sin tu parte ella contesta a ciegas y te regresa la pregunta. Cuando pusiste lo tuyo, salió claro.', 'sx2'),
          ajusta('No tocar el tema y esperar a que se dé solo.', ['Pasan dos meses. Sigues sin saber.'], 'Lo que no se dice no se elige. Decir qué buscas le da espacio para decidir.', 'R-12'),
        ]),
        paso('sx2', 'Ella no quiere nada serio. ¿Qué respondes?', 'Te mira, pendiente de tu reacción.', [
          encaja('«Gracias por decírmelo. Entonces buscamos cosas distintas. Me gustó conocerte».', ['Ella|«A mí también. Y gracias por no hacérmelo difícil».'], 'Escuchaste lo que dijo y lo tomaste literal. Duele un poco y es un buen cierre.', 'fin:cierre', { marca: 'acepta_no' }),
          ajusta('«Eso dices ahorita. Ya cambiarás de opinión».', ['Ella|«No me estás escuchando».'], 'Te dijo qué busca y le contestaste con lo que tú quieres que busque.', 'R-13'),
          ajusta('Fingir que tú tampoco quieres nada serio, para quedarte.', ['Sigues saliendo con ella. Cada semana te pesa más.'], 'Cambiaste lo que buscas para no perderla. Eso no es compatibilidad: es aguantar.', 'R-12'),
        ]),
      ],
    }],
  },
  {
    id: 'serio-compatibilidad', titulo: 'Planes que no caben juntos', tipo: 'mision', habilidad: 'serio', ruta: 'cuando_buscas_algo_mas_serio',
    resumen: 'Se gustan mucho y quieren cosas distintas para los próximos años.',
    reglas: ['R-01', 'R-12'],
    micro: ['Gustarse no resuelve la compatibilidad.', 'Se decide con lo que los dos dijeron, no con lo que esperas que cambie.'],
    referencias: [
      { clase: 'adaptacion', libro: 'del-amor', pagina: 'Libro I, XL–XLI · PDF 142–147', nota: 'Stendhal sobre desencanto y remedios. La escena actual es de NOVA.' },
      ORIGINAL,
    ],
    relacionados: [], estado: 'mvp',
    variantes: [{
      id: 'irse-del-pais', nombre: 'Ella se quiere ir', lugar: 'Su sala, domingo',
      contexto: 'Llevan cuatro meses. Ella quiere irse a vivir fuera del país en dos años. Tú acabas de abrir un negocio aquí. Hasta hoy los dos han evitado el tema.',
      inicio: 'sc1', finales: fin('conversacion', 'cierre'),
      pasos: [
        paso('sc1', '¿Abres el tema?', 'Ella está viendo departamentos en otra ciudad en su laptop. Te ve y baja un poco la pantalla.', [
          encaja('Preguntar cómo se lo imagina y contar tu plan real.', ['Ella|«Me lo imagino allá, sí. Y me gustaría que fuera contigo, pero no sé si tú quieres eso».', 'Le cuentas del negocio.'], 'Los dos pusieron su plan sobre la mesa. Ahora hay algo con qué decidir.', 'sc2'),
          ajusta('Evitar el tema para no arruinar el domingo.', ['Ella cierra la laptop. El tema sigue ahí.'], 'Evitarlo no lo desaparece; solo lo patea. Con calma, pregúntalo.', 'R-01'),
          ajusta('Prometer que te irías con ella, sin haberlo pensado.', ['Ella sonríe. Tú sientes un hueco en el estómago.'], 'Prometiste algo que no sabes si quieres. Di lo que es cierto hoy.', 'R-12'),
        ]),
        paso('sc2', '¿Qué deciden?', 'Ya saben qué quiere cada quien. Se hace un silencio largo.', [
          encaja('Buscar si hay una versión que les sirva a los dos y, si no la hay, decirlo con cariño.', ['Hablan dos horas. No hay respuesta todavía, pero ya no hay tema prohibido.'], 'Eso es decidir juntos con información real. La respuesta puede tardar; la claridad ya la tienen.', 'fin:conversacion'),
          valida('Darse un plazo concreto para pensarlo y volver a hablar.', ['Ella|«Va. En un mes lo hablamos otra vez, con calendario en mano».'], 'Un plazo definido evita que se vuelva «luego vemos» para siempre.', 'fin:conversacion'),
          ajusta('Seguir como si nada y ver qué pasa.', ['Pasa un año. Ella compra su boleto.'], 'Ver qué pasa también es una decisión, y la toma el calendario por ustedes.', 'R-12'),
        ]),
      ],
    }],
  },
];
