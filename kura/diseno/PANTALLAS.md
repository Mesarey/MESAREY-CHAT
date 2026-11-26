# KURA — Inventario completo de pantallas

Cada código identifica una pantalla o un estado. Los archivos de diseño se nombran con el código, por ejemplo `A01-inicio-de-sesion`, `L01-hoy-alaira`, `R03-ritual-en-curso`. Cuando dos mundos usan la misma pantalla, se indica qué elementos cambian.

La navegación principal, una vez dentro de KURA, es **Hoy · Mundos · Mi camino · Biblioteca · Perfil**. Hoy siempre muestra el mundo activo. Si la persona entra a un mundo disponible desde Mundos, aterriza directamente en su portada. Cada actividad tiene un regreso visible que devuelve al punto desde el que se abrió.

**Regla del cielo de KURA:** en todo cielo de KURA se ven los dos planetas del mundo, uno grande lavanda-violeta y uno pequeño a su lado (`a01/assets/a06/escena/planeta-grande.webp` y `planeta-pequeno.webp`). Pueden estar lejos y cambiar de lugar en cada escena, pero siempre aparecen. La luna también puede estar presente.

## 1. Inicio de sesión y primera entrada

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| A01 | Inicio de sesión | Logo, bienvenida breve, correo, contraseña, Iniciar sesión, Continuar con Google, Crear cuenta y Olvidé mi contraseña. Preparar el estado con teclado abierto y el de error. |
| A02 | Crear cuenta | Correo, contraseña, confirmación y enlace para volver a iniciar sesión. Al completar el registro, abre la bienvenida con Alaira. |
| A03 | Recuperar contraseña | Campo de correo, Enviar enlace y regreso. |
| A04 | Enlace enviado | Confirmación breve y Volver a iniciar sesión. |
| A05 | Restaurando sesión | Logo y transición breve. Si la sesión existe, abre Hoy en el mundo predeterminado. Si expiró, abre inicio de sesión. |
| A06 | Bienvenida con Alaira | Alaira presenta KURA. Empezar abre el cuestionario y Saltar por ahora permite continuar al tour. |
| A07 | ¿Cómo te llamo? | Campo de nombre, Continuar y Omitir. El nombre se usa en saludos y en algunas afirmaciones que admiten personalización. |
| A08 | ¿Cuántos años tienes? | Selector o campo de edad, con opción de omitir. |
| A09 | ¿Cómo te identificas? | Mujer, hombre, otra identidad y Prefiero no decirlo. |
| A10 | ¿Qué te motiva a cambiar tu Aura? | Sentirme mejor conmigo, Calmar mi ansiedad, Cuidar más mi cuerpo, Avanzar hacia mis metas, Comenzar a manifestar y Aprender habilidades sociales. Incluye «No sé todavía. Quiero descubrirlo». Escena propia: Alaira sentada en una luna creciente sobre un lago, con los dos planetas y la luna llena. |
| A11 | ¿Listo para KURA? | Puerta al tour. Alaira, asomada al barandal del templo, señala con el índice los banners de los otros cuatro guías: Amaya (ciudad aérea de cristal y jardines), Azara (castillo carmesí imponente, con vitrales y cristales de rubí), Nova (noche pop star en azul oscuro con flashes de cámara) y Orion (biblioteca observatorio con esfera armilar). Tonos templados de atardecer. Tocar un banner abre la vista previa del guía: su mundo, su frase, lo que ofrece, el modo contemplación (en Amaya, además, el aviso de consultar siempre al médico), flechas o deslizar para pasar al siguiente y «Empezar con …». Iniciar el tour abre A13 y Saltar entra a KURA. Diseño aprobado y banners HD en `diseno/A11/`. |
| A12 | Alaira: tu guía principal | Se llega con «Saltar» en A11 («Iniciar el tour» queda pendiente hasta que exista toda la plataforma). Alaira, compasiva, presenta su mundo y sus funciones: **Afirmaciones de gratitud** · **Inteligencia emocional** (diario de sentimientos y mapa de emociones: cada día pregunta «¿Cómo te sientes hoy?»; si no sabes, el mapa te guía desde lo que sientes en el cuerpo hasta nombrar la emoción) · **Rituales de ritmo emocional** (afirmaciones rápidas con animaciones) · **Soundscape y contemplación** (música de su mundo con lluvia, fuego, río… también para dormir) · **Arcanos y tarot** · **Horóscopo del día** (opcional, usa la fecha de nacimiento de A08) · **Tu camino** (rachas, medallas, outfits y paisajes que se desbloquean). Botón «Entrar al mundo de Alaira». Va antes del anuncio de KURA PASS. |
| A13–A17 | Tour de los cinco mundos | Una imagen por personaje: Alaira, Amaya, Azara, Nova y Orion. Cada una muestra una escena, su especialidad y Siguiente. Saltar tour permite entrar a KURA. |
| A18 | Elige cómo empezar | Entrar con Alaira y Conocer KURA PASS. Alaira es el mundo gratuito. Tras terminar o saltar la introducción, abre Hoy con su primera afirmación visible. |

### Funciones que comparten los cinco guías
- **Rituales personales**: varias afirmaciones rápidas con animaciones para interiorizarlas.
- **Soundscape y contemplación**: la música de su mundo con sonidos de naturaleza (lluvia, fuego, río…), también para dormir.
- **Recompensas**: outfits del guía y paisajes (skins) de su mundo que se desbloquean con el uso.
- **Tu camino**: rachas (por ejemplo, tres días seguidos), medallas y premios exclusivos por constancia (un año seguido: medalla especial y skins únicas).

## 2. Mundos, lector y controles comunes

| Código | Pantalla o estado | Qué debe verse |
|---|---|---|
| M01 | Mundos | Cinco accesos ilustrados. Indicar el mundo activo y cuáles requieren KURA PASS. Tocar un mundo disponible abre su Hoy. |
| M02 | Vista previa de mundo bloqueado | Personaje, entorno y una muestra de lo que ofrece. Ver KURA PASS y Volver a Mundos. |
| M03 | Selector rápido de mundo | Se abre desde el encabezado. Muestra los cinco personajes y el mundo activo. |
| M04 | Mundo predeterminado | Selector de mundo de inicio, con confirmación visible al guardarlo. También accesible desde Perfil. |
| M05 | Cambio de mundo | Estado de transición. Cambian el arte, la iluminación y la pista inicial. Diseñar el momento de salida y el de llegada. |
| M06 | Música del mundo | Canción actual, lista de pistas, Siguiente canción, volumen y silencio. Estados abierto, silenciado y pista seleccionada. |
| M07 | Lector a pantalla completa | Frase grande, Guardar, Compartir, × Ocultar y Salir. Deslizar o Siguiente. En Orion incluye autor, obra y tipo de texto. |
| M08 | Compartir frase | Vista previa de la frase y su atribución. Compartir abre la hoja nativa del teléfono. |
| M09 | Frase guardada u ocultada | Guardar cambia el icono. Ocultar avanza a otra frase y ofrece Deshacer. |
| M10 | Elegir categorías | Todas y selección de uno o varios temas del mundo. Las siguientes frases salen de los temas elegidos y se barajan antes de repetir el ciclo. |
| M11 | Sin frases disponibles | Mensaje breve y acceso a Cambiar categorías. |

## 3. Alaira — Gratitud, afirmaciones y calma

Referencia principal: «Alaira en cuatro pantallas de KURA lunar». Conservar rostro, cabello ciruela, ojos ámbar, la estrella junto al cabello, el vestido violeta y el jardín lunar. Cada actividad con su propia pose y encuadre.

| Código | Pantalla | Qué aparece |
|---|---|---|
| L01 | Hoy con Alaira | Portada de su mundo (se llega con «Entrar al mundo de Alaira» en A12). Jardín lunar con cielo estrellado vivo y Alaira animada (cabello y falda ondean, parpadeo suave, la estrella gira y flota en sus manos). Arriba solo el Aura y su nivel. Los objetos del jardín son los atajos, en medallones de cristal animados: Horóscopo (luna), Tarot (cartas), Afirmaciones (pociones: abre las categorías), Soundscape (fuente), Emociones (libro: abre el mapa de emociones de L08) y Gratitud (flores). Abajo la afirmación del día (tocarla pasa a la siguiente) con Categorías, Guardar, Escuchar y «×» Ocultar (con Deshacer). En el centro el orbe «Ritual» abre «Elige tu ritual»: Ritual de Alaira (gratis) o Ritual de los mundos (una afirmación de cada guía, KURA PASS), 1 o 5 min y Comenzar. Menú: Hoy · Mundos · Mi camino · Biblioteca · Perfil. Diseño aprobado en `diseno/L01/`. |
| L02 | Explorar con Alaira | Categorías, Diario de gratitud, Respiración, Ritual y Contemplación. |
| L03 | Categorías de Alaira | Gratitud, calma, espiritualidad, pensamiento positivo y rutina matutina. |
| L04 | Diario de gratitud | Alaira escribiendo y tres botones: Una persona, Un lugar, Un momento. |
| L05 | Escribir gratitud | Pregunta breve según la opción, campo de texto, Guardar y Volver. Variante con teclado. |
| L06 | Gratitud guardada | Confirmación, Añadir otra y Volver a Hoy. |
| L07 | Historial del diario | Entradas por fecha, estado vacío y vista de una entrada. |
| L08 | ¿Cómo te has sentido? | Seguimiento con respuestas rápidas, texto opcional y Ahora no. |
| L09 | Respuesta al seguimiento | Mensaje cálido y acceso a una afirmación, respiración o contemplación según lo compartido. |

Alaira usa además las pantallas de ritual, respiración, contemplación y Mi camino. Para respiración, la pose sentada frente a la luna debe ser una ilustración propia.

## 4. Amaya — Cuerpo, cuidado y descanso

| Código | Pantalla | Qué aparece |
|---|---|---|
| AM01 | Hoy con Amaya | Amaya en el lago y una afirmación corporal en grande. Siguiente, Guardar, Mapa del cuerpo y acceso a sus prácticas. |
| AM02 | Tu cuidado | Mapa del cuerpo, Respiración, Descanso y Ritual de cuerpo completo. |
| AM03 | Mapa del cuerpo | Silueta interactiva: ojos y sentidos, pulmones, corazón, digestión, movimiento y cuerpo completo. Lista alternativa accesible. |
| AM04 | Afirmación de una zona | Lector con la zona elegida («Gracias, corazón, por latir conmigo»). Siguiente permanece en esa zona. |
| AM05 | Categorías de Amaya | Cuerpo, cuidado, descanso, bienestar, amor propio y acompañamiento en momentos difíciles. |
| AM06 | Sesiones de respiración | Lista de sesiones con duración y acceso a su preparación. |
| AM07 | Descanso | Práctica guiada o contemplación para dormir. |
| AM08 | Crear un hábito de cuidado | Hábito, frecuencia y recordatorio opcional. |
| AM09 | Mi hábito de hoy | Hábito guardado, Marcar hoy y estado realizado. |

## 5. Azara — Poder, conquista y abundancia

| Código | Pantalla | Qué aparece |
|---|---|---|
| AZ01 | Hoy con Azara | Azara en el salón carmesí con una afirmación al entrar («Yo soy abundante»). Siguiente, Guardar, Categorías y Ritual. |
| AZ02 | Categorías de conquista | Todas, poder y confianza, cierres, logros, dinero y patrimonio, abundancia, ley de atracción, trabajo y estudio. |
| AZ03 | Lector de conquista | Variante carmesí del lector. Admite afirmaciones con nombre («Yo, Mitsuo, soy capaz de lograr lo que me propongo»). |
| AZ04 | Preparar mi ritual con Azara | Cinco afirmaciones según las categorías activas. Comenzar abre el ritual de voz alta. |
| AZ05 | Mi compromiso con Azara | Variante de Mi camino con progreso, racha, recompensas y acceso a su ritual. |

Flujo central: afirmación → categoría o siguiente frase → ritual → progreso. Las referencias de clientes y propuestas sirven solo como guía visual (composición, vitrales, botones).

## 6. Nova — Presencia y magnetismo

| Código | Pantalla | Qué aparece |
|---|---|---|
| N01 | Hoy con Nova | Nova en su ciudad, con acceso a sus guías y a contemplación. |
| N02 | Guías de Nova | Índice ilustrado de presencia, estilo, expresión y conversación. |
| N03 | Detalle de una guía | Título, idea principal, ejemplo y acceso al siguiente contenido. |
| N04 | Elegir escenario | Opciones como bar, fiesta o cafetería. |
| N05 | Escena | Contexto de la situación y botón para avanzar. |
| N06 | Elegir respuesta | Situación y alternativas interactivas. |
| N07 | Devolución de Nova | Reacción del personaje, explicación breve y Continuar o Volver a intentarlo. |
| N08 | Práctica completada | Resultado y acceso a su progreso. |

N04–N08 son los estados visuales de los HUD; las dinámicas concretas quedan sujetas al diseño de Nova.

## 7. Orion — Filosofía, autores y obras

| Código | Pantalla | Qué aparece |
|---|---|---|
| O01 | Hoy con Orion | Frase filosófica en grande con autor y obra. Ver siguiente frase, Guardar y Explorar archivo. |
| O02 | Archivo astral | Autores, Obras, Temas y Buscar. |
| O03 | Autores | Epicteto, Séneca, Marco Aurelio, Lao Tsé, Sun Tzu… |
| O04 | Detalle de autor | Introducción breve, obras y acceso a sus frases. |
| O05 | Obras y guías de lectura | Estantería de obras y «¿Por dónde empiezo?». |
| O06 | Detalle de obra | Autor, sinopsis, contexto y acceso a pasajes. Tratamiento para cita, paráfrasis y reflexión original de KURA. |
| O07 | Lector de pasajes | Frase o pasaje grande, atribución, Siguiente, Guardar y Volver a la obra. |
| O08 | Temas de filosofía | Categorías para explorar y filtrar. |
| O09 | Buscar en el archivo | Por autor, obra, tema o texto. Resultados y estado sin coincidencias. |

El HUD del observatorio da la dirección visual de Orion.

## 8. Rituales y Break de los cinco

| Código | Pantalla o estado | Qué aparece |
|---|---|---|
| R01 | Preparar ritual individual | Personaje, duración y número de afirmaciones. Comenzar. |
| R02 | Preparar Break de los cinco | Ilustración del grupo, 1 min / 5 min y Comenzar. Requiere KURA PASS. |
| R03 | Ritual en curso | Personaje activo, afirmación grande, progreso 1 de 5, cronómetro, Pausar, Repetir y Siguiente. En el Break cambia el personaje con cada turno. |
| R04 | En pausa | Conserva frase y posición. Reanudar y Terminar. |
| R05 | Salir antes de completar | Seguir practicando y Salir. |
| R06 | Última afirmación | La acción cambia a Completar ritual. La quinta frase termina la sesión aunque quede tiempo. |
| R07 | Ritual completado | Confirmación, personaje y recompensa si corresponde. Ver Mi camino y Volver a Hoy. |

Preparación, en curso, pausa y completado son escenas distintas. En el estado activo, frase y controles caben en una pantalla con texto normal; preparar variante con frase larga.

## 9. Respiración y contemplación

| Código | Pantalla o estado | Qué aparece |
|---|---|---|
| RE01 | Preparar respiración | Nombre, instrucciones breves, fases, duración, icono de viento y Comenzar. |
| RE02–RE04 | Inhala / Sostén / Exhala | El círculo se expande, se mantiene y se contrae. Cambian instrucción y cuenta regresiva. |
| RE05 | Respiración en pausa | Tiempo y fase conservados. Reanudar o Terminar. |
| RE06 | Respiración finalizada | Mensaje de cierre; si se detuvo antes, «Está bien parar aquí». |
| C01 | Contemplación | Paisaje del mundo activo, reloj y controles discretos. Variante por personaje de día y de noche. |
| C02 | Mezcla de audio | Pista, volumen de música, sonido natural y volumen del ambiente. |
| C03 | Elegir duración | Libre, meditar 15 minutos, dormir 1 hora o 2 horas. |
| C04 | Elegir hora del paisaje | Hora local, amanecer, día, atardecer y noche. Activo con KURA PASS; vista previa gratuita. |
| C05 | Contemplación en curso | Controles recogidos, reloj según el modo, Pausar y Salir. |
| C06 | Contemplación en pausa o finalizada | En pausa permite reanudar. Al finalizar, música y ambiente se apagan. |

## 10. Mi camino, compromisos y recompensas

| Código | Pantalla o estado | Qué aparece |
|---|---|---|
| P01 | Mi camino | Selector de personaje, racha, semana, compromiso, rituales terminados y próximo hito. Composición propia por mundo. |
| P02 | Elegir compromiso | Metas de 7, 14, 21 o 30 días, con su símbolo y Comenzar con [personaje]. |
| P03 | Compromiso activo | Meta, días completados y siguiente práctica. Inicio directo del ritual de un minuto. |
| P04 | Hoy ya cuenta | Marca del día, racha y progreso hacia la recompensa. Otra sesión suma al historial sin sumar otro día. |
| P05 | Racha interrumpida | Racha anterior, días omitidos, calendario y mensaje del personaje. Retomar, Elegir nueva meta y Ajustar recordatorios. |
| P06 | Calendario e historial | Días practicados, omitidos y futuros. Una fecha abre sus sesiones. |
| P07 | Rituales terminados | Fecha, personaje, tipo y duración. Estado vacío. |
| P08 | Hitos del personaje | Recorrido de hasta un año con medallas obtenidas y próximas; hitos de días, meses y aniversario. |
| P09 | Recompensa desbloqueada | Medalla, atuendo o personalización. Ver colección y Continuar. |
| P10 | Colección de recompensas | Medallas, atuendos y elementos del mundo: bloqueado, desbloqueado y equipado. Atuendos en KURA PASS. |
| P11 | Vista previa y equipar | Personaje o mundo con la recompensa aplicada; requisito o Equipar. |

## 11. Biblioteca

| Código | Pantalla | Qué aparece |
|---|---|---|
| B01 | Biblioteca | Afirmaciones, Frases y pasajes y Favoritos, con filtro por personaje. |
| B02 | Buscar | Búsqueda, filtros, historial y resultados. |
| B03 | Favoritos | Contenido guardado con su mundo y, si corresponde, autor y obra. |
| B04 | Detalle guardado | La frase exacta. Compartir, Quitar de favoritos y Volver. |
| B05 | Biblioteca vacía | Estado ilustrado y acceso para descubrir una frase. |
| B06 | Sin resultados | Cambiar filtros o borrar la búsqueda conservando el contexto. |

## 12. Perfil, KURA PASS, ajustes y widgets

| Código | Pantalla | Qué aparece |
|---|---|---|
| F01 | Perfil | Nombre, cuenta y Editar perfil, Mi intención, Ajustes, KURA PASS y Ayuda. |
| F02 | Editar perfil | Nombre y datos compartidos. Guardar y Cancelar. |
| F03 | Mi intención | Respuestas de bienvenida; retomar o actualizar el cuestionario. |
| F04 | Ajustes | Audio, mundo predeterminado, recordatorios, tamaño de texto y reducir movimiento. |
| F05 | Recordatorios | Afirmaciones cada hora, invitaciones a practicar y seguimiento de ánimo. Activación, horarios y descanso opcional. |
| F06 | Permiso de notificaciones | Explicación previa a la solicitud nativa; si está denegado, Abrir ajustes del teléfono. |
| F07 | Abrir desde una notificación | Lector con la afirmación exacta del aviso y acceso a su ritual. |
| F08 | KURA PASS | Plan gratuito con Alaira, ventajas del PASS y precio objetivo de US$4.99 al mes. Prueba de siete días cuando aplique. |
| F09 | Compra y restauración | En curso, confirmada, cancelada y error. Restaurar compras. |
| F10 | Administrar suscripción | Estado, renovación o vencimiento y gestión en la tienda. |
| F11 | Acceso vencido | Renovar PASS y Volver con Alaira. |
| F12 | Ayuda | Preguntas frecuentes y soporte; detalle de una pregunta. |
| F13 | Cuenta | Cerrar sesión y gestión de cuenta con confirmaciones. |
| W01 | Widget de afirmaciones | Compacto y ampliado. Guardar, Otra, Abrir y Ajustes. Frase corta y larga con lectura desplazable. |
| W02 | Widget de filosofía | Igual, con autor, obra y tipo de texto. |
| W03 | Widget de respiración | Acceso directo a una sesión del personaje elegido. |
| W04 | Widget de contemplación | Acceso a contemplación, meditación o dormir con el mundo elegido. |
| W05 | Configurar widget | Personaje, tipo de contenido y opciones; vista al añadir y al editar. |
