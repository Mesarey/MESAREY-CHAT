import type { Afirmacion, CasoPrueba } from './types';

type O = [texto: string, acierta: boolean, nova: string];
const caso = (id: string, categoria: CasoPrueba['categoria'], habilidad: CasoPrueba['habilidad'], regla: string, situacion: string, ...o: O[]): CasoPrueba =>
  ({ id, categoria, habilidad, regla, situacion, estado: 'mvp', opciones: o.map(([texto, acierta, nova]) => ({ texto, acierta, nova })) });

/** Banco de la Prueba de Escenarios. Casos originales de NOVA escritos a partir de las Reglas de Oro y del Banco Oficial. */
export const casosPrueba: CasoPrueba[] = [
  // Tono seco
  caso('P-seco-01', 'tono_seco', 'leer', 'R-02', 'En una fiesta le comentas a alguien que la música está buena. Te dice «sí» y sigue buscando algo en su bolsa.',
    ['Decir «que la encuentres» y volver con tus amigos.', true, 'Comentario ligero y a lo tuyo. Si retoma, sigues por ahí.'],
    ['Preguntarle si está enojada.', false, 'Viste una respuesta corta y una bolsa. Lo del enojo lo pusiste tú.'],
    ['Hacerle tres preguntas más para animarla.', false, 'Empujar no cambia la causa. Suelta y ve si retoma.']),
  caso('P-seco-02', 'tono_seco', 'leer', 'R-02', 'Le respondes una historia a alguien. Te contesta «jaja sí» y nada más.',
    ['Dejarlo ahí con un corazón al mensaje.', true, 'Corto con corto. Si quiere seguir, ya sabe dónde estás.'],
    ['Escribir «¿todo bien? te noto rara».', false, 'Dos palabras no alcanzan para notar a nadie raro. Es suposición.'],
    ['Mandar otro mensaje más largo para sacar plática.', false, 'Más texto no crea interés. Deja espacio.']),
  caso('P-seco-03', 'tono_seco', 'leer', 'R-02', 'En el elevador saludas a una vecina. Contesta «buenas» sin despegar la vista del celular.',
    ['Quedarte tranquilo y decir «buen día» al bajar.', true, 'Un saludo no exige plática. Cumpliste y cerraste bien.'],
    ['Decirle «uy, qué seria».', false, 'Eso es un reclamo disfrazado de broma.'],
    ['Asomarte a ver qué está viendo.', false, 'Estaba en lo suyo. Eso es invadir.']),
  // Broma compartida
  caso('P-broma-01', 'broma_compartida', 'humor', 'R-10', 'Llevan un rato riéndose. Ella dice que le da frío y un minuto después va directo por un helado. Regresa con el cono y cara de culpable.',
    ['«Dijiste que te daba frío y fuiste directo por el helado».', true, 'Hay confianza y repetiste lo que los dos vieron, con gusto. Es la N-0219.'],
    ['«Qué rara eres».', false, 'Eso la califica a ella, no al momento. Suena a crítica.'],
    ['Explicarle que el helado le va a dar más frío.', false, 'Ella ya lo sabe y por eso trae cara de culpable. Corregirla apaga el juego.']),
  caso('P-broma-02', 'broma_compartida', 'humor', 'R-10', 'Con una amiga de confianza: se ríe del chiste antes de terminar de contarlo y ya no puede seguir.',
    ['«Te ríes antes de contar el chiste».', true, 'Detalle que los dos vieron, dicho con cariño. Es la N-0001.'],
    ['«Cuentas muy mal los chistes».', false, 'Eso es calificar. El remate va sobre lo que pasó.'],
    ['Pedirle que se calme y lo cuente bien.', false, 'Le quitaste lo divertido al momento.']),
  caso('P-broma-03', 'broma_compartida', 'humor', 'R-11', 'Haces una broma sobre su trabajo y ella se pone seria: «No me gustó eso».',
    ['«Uy, sonó más pesado de lo que quería». Y cambias de tema.', true, 'Tomaste en serio lo que te dijo y soltaste el chiste.'],
    ['«Ay, era broma».', false, 'Eso defiende el chiste. A ella le incomodó, y eso es lo que cuenta.'],
    ['Hacer otra broma para arreglarlo.', false, 'Otra broma encima de una que incomodó casi nunca arregla nada.']),
  // Invitación
  caso('P-inv-01', 'invitacion', 'intencion', 'R-12', 'Llevan veinte minutos platicando en una reunión. Ella te ha hecho varias preguntas. Ya se va.',
    ['«Me gustó platicar contigo. ¿Te late que nos pasemos el número?»', true, 'Hubo intercambio, dijiste qué te gustó y le dejaste la decisión.'],
    ['«Pásame tu número».', false, 'Sin decir por qué ni dejar salida suena a orden.'],
    ['No decir nada y buscarla luego en redes.', false, 'Tenías todo para decirlo de frente. Dilo simple.']),
  caso('P-inv-02', 'invitacion', 'intencion', 'R-07', 'Acabas de llegar a la barra junto a dos personas que no conoces.',
    ['Pedir lo tuyo y, si se da, comentar algo del lugar.', true, 'Para abrir, pide lo tuyo. Invitar bebida requiere confianza y contexto.'],
    ['«Yo invito la siguiente ronda».', false, 'Todavía no hay plática que sostenga esa invitación.'],
    ['Mandarles un trago con el bartender sin decir nada.', false, 'Sin contexto, compromete en lugar de invitar.']),
  caso('P-inv-03', 'invitacion', 'intencion', 'R-12', 'Quieres invitarla a salir. Ya platicaron varias veces y hay buena onda.',
    ['«El sábado hay un mercado de discos. ¿Te late ir? Si no puedes, sin problema».', true, 'Qué, cuándo y salida fácil.'],
    ['«A ver cuándo hacemos algo».', false, 'No propone nada: no hay a qué decir que sí.'],
    ['«Vamos el sábado, paso por ti a las cinco».', false, 'Decidiste por los dos. Deja espacio para que elija.']),
  // Cortesía
  caso('P-cort-01', 'cortesia', 'presencia', 'R-03', 'Quieres hablarle a alguien que está sentada de espaldas a ti en una barra. A su lado hay un banco libre.',
    ['Rodear y llegar por el lado del banco libre, donde te vea.', true, 'Frente o costado: que te vea llegar.'],
    ['Tocarle el hombro.', false, 'Nunca por la espalda, y menos tocando.'],
    ['Hablarle fuerte desde atrás para que voltee.', false, 'Sigue siendo por la espalda. Busca el costado.']),
  caso('P-cort-02', 'cortesia', 'abrir', 'R-06', 'Te gusta una chica que está con una amiga. Las dos te miran cuando llegas.',
    ['Saludar a las dos y seguir lo que cada una aporte.', true, 'Incluye a quienes están presentes.'],
    ['Hablarle solo a la que te gusta.', false, 'Dejaste fuera a su amiga, y ella lo nota.'],
    ['Hablarle solo a la amiga para generar curiosidad.', false, 'Eso es una puesta en escena. Conversa con las dos de verdad.']),
  caso('P-cort-03', 'cortesia', 'abrir', 'R-09', 'Traes un truco de cartas buenísimo y estás platicando con un grupo que acabas de conocer.',
    ['«¿Les late ver un truco rápido?»', true, 'Se ofrece. Si dicen que no, una historia breve también aporta.'],
    ['Sacar las cartas y empezar.', false, 'Les impusiste el espectáculo. Pregunta primero.'],
    ['Esperar a que alguien se vaya para hacérselo solo a ella.', false, 'El truco es para sumar a la plática, no para apartarla.']),
  // Iniciativa
  caso('P-ini-01', 'iniciativa', 'abrir', 'R-04', 'En una mesa cercana, dos personas platican. Una acaba de terminar una historia y las dos voltean hacia el salón.',
    ['Acercarte ahora y saludar.', true, 'Hay pausa real y miran hacia afuera. Ese es el momento.'],
    ['Esperar media hora más, por si acaso.', false, 'El hueco era este. Esperar tiene sentido cuando no hay pausa.'],
    ['Mandarles una nota con el mesero.', false, 'Tenías la pausa y el frente libre. Ve tú.']),
  caso('P-ini-02', 'iniciativa', 'sostener', 'R-05', 'Te cuenta que acaba de adoptar un gato. Es tu turno.',
    ['«Yo tuve uno que abría el refri. ¿El tuyo ya hizo alguna?»', true, 'Aportaste algo tuyo y devolviste con una pregunta.'],
    ['«¿Cómo se llama? ¿De qué raza? ¿Cuántos años tiene?»', false, 'Tres preguntas seguidas son entrevista.'],
    ['«Ah, qué padre». Y esperar.', false, 'Le dejaste toda la plática a ella. Pon algo de tu parte.']),
  caso('P-ini-03', 'iniciativa', 'instagram', 'R-05', 'Sube una historia de su perro con un sombrero ridículo.',
    ['«Ese sombrero le queda mejor que a cualquiera de nosotros. ¿Se dejó?»', true, 'Respondiste a un detalle concreto de lo que subió.'],
    ['«Hola, ¿qué haces?»', false, 'No tiene que ver con lo que publicó.'],
    ['Reaccionar con un emoji y esperar que ella escriba.', false, 'Un emoji no abre tema. Di algo del detalle.']),
  // Cierre
  caso('P-cierre-01', 'cierre', 'cerrar', 'R-13', 'Le pides su número y te dice: «No, gracias».',
    ['«Va, me dio gusto conocerte».', true, 'Corto, tranquilo y sin pedir explicación.'],
    ['«¿Segura? Piénsalo».', false, 'Ya lo pensó y contestó.'],
    ['Irte sin decir nada.', false, 'Irte está bien; despedirte lo hace mejor.']),
  caso('P-cierre-02', 'cierre', 'cerrar', 'R-08', 'Dijiste «¿me puedo sentar un minuto?». Pasó el minuto: contestan corto y miran sus celulares.',
    ['«Las dejo. Que estén a gusto».', true, 'Dijiste un minuto y fue un minuto. No te hicieron espacio para más.'],
    ['Quedarte: ya estás sentado.', false, 'Te quedas solo si te hacen espacio y la plática sigue.'],
    ['Pedir algo de tomar ahí para tener pretexto.', false, 'Eso alarga algo que ya se acabó.']),
  caso('P-cierre-03', 'cierre', 'cerrar', 'R-01', 'La plática estuvo buena, pero ya llevan un rato y ella empieza a buscar a sus amigas con la mirada.',
    ['«Ve con tus amigas. Me dio gusto platicar».', true, 'Viste el detalle y cerraste tú, sin drama.'],
    ['Seguir contando tu historia hasta terminarla.', false, 'Ya estaba buscando salida. Ciérrale tú la puerta amablemente.'],
    ['«¿Qué, ya te aburrí?»', false, 'Eso la obliga a tranquilizarte. Cierra sin cobrar.']),
];

export const etiquetaCategoria: Record<CasoPrueba['categoria'], string> = {
  tono_seco: 'Tono seco',
  broma_compartida: 'Broma compartida',
  invitacion: 'Invitación',
  cortesia: 'Cortesía',
  iniciativa: 'Iniciativa',
  cierre: 'Cierre',
};

const af = (id: string, texto: string, clase: Afirmacion['clase'], nova: string): Afirmacion => ({ id, texto, clase, nova });

/** Repaso: ¿observación o suposición? */
export const afirmaciones: Afirmacion[] = [
  af('A-01', 'Volteó a ver su celular dos veces.', 'observacion', 'Se puede ver. Todavía no dice por qué.'),
  af('A-02', 'Está aburrida de mí.', 'suposicion', 'Eso lo pusiste tú. Lo que viste fue otra cosa: ¿qué fue?'),
  af('A-03', 'Me hizo una pregunta sobre mi trabajo.', 'observacion', 'Hecho. Y es de los que cuentan como iniciativa.'),
  af('A-04', 'Le gusto.', 'suposicion', 'Puede ser. Para saberlo necesitas más de un dato.'),
  af('A-05', 'Contestó «ajá» y siguió viendo al escenario.', 'observacion', 'Eso pasó. Las causas posibles son varias.'),
  af('A-06', 'Es una mamona.', 'suposicion', 'Es un juicio sobre ella a partir de una respuesta corta.'),
  af('A-07', 'Su amiga me hizo espacio en la mesa.', 'observacion', 'Se vio. Es una invitación a quedarte un rato.'),
  af('A-08', 'Seguro tiene novio.', 'suposicion', 'No lo sabes. Si importa, se pregunta o se deja.'),
  af('A-09', 'Retomó el tema del concierto sin que yo lo mencionara.', 'observacion', 'Hecho, y de los buenos: iniciativa repetida.'),
  af('A-10', 'Me contestó cortante porque le caí mal.', 'suposicion', 'La primera mitad es observación; el «porque» es tuyo.'),
  af('A-11', 'Tardó dos horas en responder el mensaje.', 'observacion', 'Es un dato. No trae explicación incluida.'),
  af('A-12', 'Ya no le intereso; por eso tarda.', 'suposicion', 'Tardar tiene muchas causas. Aquí elegiste la que más duele.'),
  af('A-13', 'Se rio y me devolvió la broma.', 'observacion', 'Eso pasó, y es intercambio.'),
  af('A-14', 'Quiere que la invite a salir.', 'suposicion', 'Quizá. Lo sabrás si invitas dejando salida.'),
  af('A-15', 'Traía el abrigo en la mano y miró la puerta.', 'observacion', 'Dos cosas que se ven. Juntas sugieren que ya se iba.'),
  af('A-16', 'Se va porque la aburrí.', 'suposicion', 'Viste que se va. El motivo no lo viste.'),
];

/** Repaso: reformulación en voz alta o por escrito, con autoevaluación. */
export const reformulaciones: { id: string; habilidad: string; situacion: string; pide: string; revisa: string[] }[] = [
  { id: 'F-abrir', habilidad: 'abrir', situacion: 'Estás en la fila de un puesto de tacos. La persona de adelante mira la plancha igual que tú: el taquero acaba de voltear veinte tortillas de un solo movimiento.', pide: 'Di en voz alta, con tus palabras, un comentario para abrir.', revisa: ['Habla de algo que los dos ven.', 'Es una sola cosa.', 'No pide datos personales.'] },
  { id: 'F-presencia', habilidad: 'presencia', situacion: 'Vas a acercarte a un grupo de tres en una reunión. Uno te da la espalda.', pide: 'Describe en voz alta por dónde llegas y qué haces antes de hablar.', revisa: ['Llegas por donde te ven.', 'Esperas una pausa.', 'Saludas al grupo, no a una sola persona.'] },
  { id: 'F-sostener', habilidad: 'sostener', situacion: 'Te acaba de contar que aprendió a hacer pan durante un mes sin trabajo.', pide: 'Responde en voz alta sin hacer dos preguntas seguidas.', revisa: ['Aportas algo tuyo.', 'Sigues un detalle que ella dio.', 'Como mucho, una pregunta.'] },
  { id: 'F-humor', habilidad: 'humor', situacion: 'Una amiga de confianza le toma foto al recibo porque no cree el nombre del postre.', pide: 'Di el remate con tus palabras y con calidez. O decide dejarlo pasar y di por qué.', revisa: ['Habla de lo que hizo, no de cómo es.', 'El detalle lo vieron los dos.', 'Dicho con sonrisa cabría; con filo, no.'] },
  { id: 'F-intencion', habilidad: 'intencion', situacion: 'Platicaron media hora, ella preguntó y retomó. Ya se va.', pide: 'Di en voz alta qué te gustó y pide el contacto dejando salida.', revisa: ['Dices qué te gustó.', 'Preguntas, no ordenas.', 'Hay una salida fácil.'] },
  { id: 'F-leer', habilidad: 'leer', situacion: 'Le hiciste un comentario y te contestó «sí, ¿verdad?» sin voltear.', pide: 'Di en voz alta un comentario ligero para cerrar y qué harías después.', revisa: ['El comentario no reclama.', 'Vuelves a lo tuyo.', 'Sigues solo si la otra persona retoma.'] },
  { id: 'F-cerrar', habilidad: 'cerrar', situacion: 'Te dice «hoy no, gracias» cuando propones un café.', pide: 'Responde en voz alta.', revisa: ['Es corto.', 'No pide explicación.', 'No trae cara larga.'] },
  { id: 'F-instagram', habilidad: 'instagram', situacion: 'Sube una foto de una planta nueva con el texto «a ver cuánto me dura».', pide: 'Escribe o di tu respuesta a la historia.', revisa: ['Habla de un detalle concreto.', 'Si contesta corto, lo dejarías ahí.', 'No es solo un emoji.'] },
];

/**
 * Arena de Negas: contextos donde lo que cabe es dejar pasar el remate.
 * Se combinan con la nota «Qué observar» de una nega revisada.
 */
export const contextosTensos: { id: string; texto: string; nova: string }[] = [
  { id: 'T-01', texto: 'Se conocieron hace un minuto y te ha contestado con monosílabos.', nova: 'Apenas hay confianza. El detalle está, pero el remate se queda guardado.' },
  { id: 'T-02', texto: 'Acaba de colgar una llamada y se ve preocupada.', nova: 'El momento está tenso. Dejar pasar también es leer.' },
  { id: 'T-03', texto: 'Su jefa está enfrente y ella está cuidando cada palabra.', nova: 'Delante de quien la evalúa, un remate puede dejarla mal parada.' },
  { id: 'T-04', texto: 'Hace cinco minutos te dijo que una broma tuya no le gustó.', nova: 'Ya te pidió bajarle. Otro remate ahora suena a que no escuchaste.' },
  { id: 'T-05', texto: 'Va tarde, está buscando sus llaves y te pidió que la esperes tantito.', nova: 'Con prisa, cualquier comentario sobre lo que hace se siente como crítica.' },
  { id: 'T-06', texto: 'Está contando algo que le salió mal esta semana.', nova: 'Está abriéndose. Ahí se escucha; el remate estorba.' },
];
