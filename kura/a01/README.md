# A01–A05 · Entrada a KURA (Observatorio)

Pantalla de entrada de KURA en español e inglés, recreada a partir de la referencia aprobada (`../diseno/A01/referencia-observatorio.webp`) y del kit «KURA A01 Observatorio · Separación avanzada».

## Cómo verla

HTML, CSS y JavaScript sin compilación. Se abre con un servidor local:

```bash
npx serve kura/a01
```

- A05 (Restaurando sesión) solo dura lo que tarde la carga: en un teléfono rápido apenas se ve; si algo se traba, queda la animación de carga. Para revisarlo quieto: `#a05` (se queda hasta tocar la pantalla).
- A03 (Recuperar contraseña): `#a03` o «Olvidé mi contraseña». A04 (Enlace enviado): tras enviar, o `#a04`.
- A02 (Crear cuenta): `http://localhost:3000/#a02`, o «Crear cuenta» desde A01. El escenario no cambia: solo el contenido del HUD, con transición suave; el botón «atrás» del teléfono regresa a A01.
- Idioma automático: KURA usa el idioma del teléfono. Español → español; inglés o cualquier otro idioma (italiano, francés…) → inglés.
- El botón «English / Español» bajo el panel lo cambia mientras la app está abierta; al volver a abrirla, sigue al teléfono.
- Para probar: `http://localhost:3000/#es` · `http://localhost:3000/#en`.
- En teléfonos más altos que la referencia (899 × 1750) el HUD reparte la altura sobrante (`--g`) entre campos, botones y enlaces para dar más espacio a los dedos.
- Panel de ajustes de desarrollo: **Mayús + D**, o `#dev` en la dirección.

## Visor de teléfono

En **Idioma** se elige cómo se ve la app: automático (el del teléfono: español si está en español, inglés en cualquier otro), español o inglés. Cambia al instante, sin recargar.

`visor.html` muestra la app dentro de un teléfono (iPhone 17, 17 Pro Max, Air, 16/15, Plus, 14/13, mini, SE; Galaxy S25 Ultra, S25/S24, A55; Pixel 9 Pro; Xiaomi; Motorola, o una medida personalizada) a su resolución real, con botones para saltar a A01–A05 y ver la entrada de nuevo. «Elegir carpeta de audio» o «Elegir archivos de audio» carga la música y los sonidos desde el dispositivo (no se suben a ningún lado); reconoce los nombres del ZIP y tus nombres originales, y un archivo con «shadow» en el nombre se agrega como segunda canción. Abierto en un teléfono, la app ocupa toda la pantalla y los controles quedan en un botón.

## Paralaje y giroscopio

El mundo se mueve por capas (GSAP `quickTo`): cielo, nubes lejanas y cercanas, estrellas y el HUD en sentido contrario, cada uno a su profundidad (`config.depth`). En PC lo mueve el cursor; en teléfono, el giroscopio. En el visor, el cuadro «Giroscopio» simula la inclinación sin girar el teléfono: el movimiento ocurre dentro de la pantalla. El visor le pasa la inclinación directo a la app (`__kura.tilt.simulate`), así funciona en cualquier navegador aunque no dé permiso de sensores.

Los destellos ópticos se colocan con la posición del panel sin el paralaje (el shader lo suma aparte) y solo cuando nada del HUD está animado; dos veces por segundo se confirma que siguen en su lugar. Así no se desfasan al mover el cursor/teléfono ni al cambiar rápido de pantalla.


En teléfono, el primer toque activa el giroscopio: al inclinar el teléfono la escena (y las estrellas) se mueven como con el cursor en PC. En iPhone el sistema pide permiso la primera vez. Necesita HTTPS (Netlify, GitHub Pages) y no funciona dentro de la web app de Claude, que bloquea los sensores.

## A06 · Bienvenida con Alaira

Se entra al iniciar sesión o crear cuenta (suena «acceso concedido»); también con `#a06`. Rehecha desde cero con el paquete **KURA_A06_Implementacion_Parallax** (lienzo 911 × 1726, `--v` = 1 px de ese lienzo). Capas y profundidades en `js/a06-capas.js`; imágenes en `assets/a06/`.

- **Paralaje por capas** (cursor en PC, giroscopio en teléfono; recorrido de cámara ±18 × ±11 px): el cielo va al fondo, los planetas un poco más rápido, Alaira con arcos, ciudad, puentes y el banco de nubes del título en un mismo plano, y las nubes cercanas y la bruma del pie por delante. Alaira y la arquitectura van juntas porque la capa de Alaira trae pegado el fondo original que la rodea: si fueran a otra velocidad, ese fondo se vería duplicado.
- **Estrellas del cielo**: las dibuja el mismo motor que las de A01 (`js/starfield.js`, nítidas, con destello en cruz), solo donde se ve cielo abierto (`js/a06-estrellas.js`).
- **Parpadeo** de dos clases que se alternan. El **rápido** usa el parche del kit (`alaira/parpadeo-atlas.webp`, 32 poses por ojo: cerrar 76 ms, pausa 18 ms, abrir 136 ms, ojo derecho 5 ms después). El **suave** usa tres fotogramas hechos con Higgsfield sobre la ilustración (`parpadeo-medio`, `parpadeo-casi`, `parpadeo-cerrado`): las pestañas bajan y los fotogramas se funden (cerrar 150 ms, pausa 70 ms, abrir 230 ms). A veces es **lento y tranquilo** (cerrar 280 ms, pausa 420 ms, abrir 460 ms). Mezcla: 55 % rápido, 33 % suave, 12 % lento. Los descansos son variados y a veces hay un parpadeo doble. El fleco y las hebras van delante. Con los ojos abiertos se ve idéntica a la ilustración. Tocarla la hace parpadear suave.
- **Estrella 3D** de la mano (`js/estrella3d.js`), 1.3 veces el tamaño del diseño para apreciar sus partículas: el GLB del kit gira 0° → 180° → 0° en 5.2 s, con órbita dorada, halo, rayos, chispas y polvo de oro. Suena «estrella flotando» en bucle muy suave (≈ 23 dB debajo de los efectos) mientras se ve A06. El modelo y sus destellos van dentro del código (`js/estrella-datos.js`): la web app no tiene que leer ningún archivo aparte. La estrella pintada se quitó de la capa de Alaira; si no hay WebGL se muestra la del diseño. Tocarla la hace brillar.
- **Vista de cerca**: `estrella.html` (botón «★ Estrella 3D de cerca» en el visor). Si algo falla, lo dice en la propia pantalla.
- **Nubes limpias** (sin partes del vestido): la bruma del pie deriva, se aparta al paso del dedo y tiene margen de sobra: nunca se ve su orilla. El banco del título sale de la transición del paquete sin el título pintado y se mueve con Alaira; no hay nube encima del título.
- **HUD** en HTML con el mismo cristal, bordes luminosos y botón que A01–A04; «Empezar» suena `empezar.wav` y lleva a A07. Empezar es obligatorio: no hay «Saltar por ahora».
- **Pie**: la bruma va pegada al borde inferior de la pantalla y las nubes de las esquinas del panel (del HUD de referencia, sin la línea del borde) siguen el borde inferior del panel, también en teléfonos altos.
- **Voz de Alaira**: interruptor en el menú de sonido, solo en la introducción.

## A07 · ¿Cómo te llamo?

Se entra con «Empezar» en A06 (suena `empezar.wav`); también con `#a07`. Es casi igual a A06: mismo escenario de Alaira (paralaje, estrellas, parpadeo, estrella 3D y su sonido), misma nube del título y el mismo marco (título y panel en el mismo lugar y del mismo tamaño, con altura fija y contenido centrado). Al pasar de A06 a A07 el panel se queda quieto y solo cambian el título y el contenido de adentro: no se cruzan capas.

- **Panel**: explicación en dos líneas, campo «Tu nombre» y «Continuar →». Sin «Omitir». El campo siempre empieza vacío (también al recargar o al regresar a A07).
- **Continuar** guarda el nombre o apodo sin espacios al inicio ni al final, **solo en este dispositivo** (`localStorage`, clave `kura.nombre`), y saluda.
- **Saludo**: aparece una tarjeta de cristal grande arriba, entre la estrella y el título: «¡Encantada, {nombre}!» («Lovely to meet you, {name}!»), con el nombre en dorado. Al mismo tiempo pasa esto:
  - Suena `encantada.wav`.
  - Alaira **sonríe**: una expresión hecha con Higgsfield sobre la ilustración (`alaira/sonrisa.webp`, solo ojos y boca). Dura unos 3 s y luego vuelve a su cara de siempre.
  - Salen **fuegos artificiales** sobre el HUD (`js/fuegos.js`): chispas doradas, lilas y rosadas que caen con estela. Suena `fuegos-artificiales.wav`, más bajo que la estrella.
  - Después pasa sola a A08.
- Si el campo está vacío, suena `falta-dato.wav`, el borde se marca y aparece «Escribe cómo quieres que te llame.».
- El nombre se usará en saludos y en las afirmaciones que admiten personalización.
- Español e inglés («What’s your name?»).

## A08 · ¿Cuál es tu fecha de nacimiento?

Se entra con «Continuar» en A07 (después del saludo); también con `#a08`. Mismo escenario y mismo marco que A06–A07: al pasar de A07 a A08 el panel se queda quieto y solo cambia el contenido. Los adornos dorados de la edad (`assets/a08/`) se hicieron con Higgsfield.

- **Título** en dos líneas («¿Cuál es tu fecha / de nacimiento?» · «What’s your / date of birth?»).
- **Día, Mes y Año** en cajas propias de KURA (`js/fecha.js`): se puede escribir y la lista se acorta. Por ejemplo, «3» deja 3, 30 y 31; «ju» deja Junio y Julio; «199» deja 1999 a 1990.
  - Debajo se abre una lista de cristal con el elegido en dorado. Si no cabe abajo, se abre hacia arriba.
  - Se usa con toque, flechas, Enter y Escape. Con Enter pasa a la siguiente caja vacía.
  - Si lo escrito no coincide con nada, la caja vuelve a lo que estaba elegido.
  - Los días se ajustan al mes y al año: 30 o 31, y 29 de febrero solo en año bisiesto. Los años van del actual hacia atrás, 120 años.
- **Tu edad** se calcula al momento («28 años» · «28 years»; «1 año»).
  - Al cambiar la fecha, el número cuenta hasta la edad y brilla en dorado.
  - Sin partículas (se quitaron porque trababan la pantalla). El brillo del número pasa una sola vez cada vez que cambia la fecha.
  - A los lados hay dos filetes dorados con lunas. Son tenues mientras no hay fecha y brillan cuando aparece la edad.
- **Continuar**: si falta un dato suena `falta-dato.wav` y se marcan las cajas vacías («Elige tu día, mes y año de nacimiento.»); si la fecha está en el futuro, «Esa fecha todavía no llega.». La fecha se guarda solo en este dispositivo (`localStorage`, clave `kura.nacimiento`, formato AAAA-MM-DD). Después pasa a A09.
- **Sin edad mínima**: los textos legales piden no añadir una restricción de edad sin una decisión posterior.
- Empieza vacía cada vez que se entra.

## A09 · ¿Cómo te identificas?

Se entra con «Continuar» en A08; también con `#a09`. Mismo escenario y mismo marco que A06–A08. Sigue el diseño A aprobado (imagen hecha con Higgsfield sobre una captura de A08).

- **Título** en una línea: «¿Cómo te identificas?» · «How do you identify?».
- **Cuatro opciones** en cuadrícula de 2 × 2, cada una con un ícono dorado dibujado en SVG (nítido en cualquier pantalla):
  - Mujer (luna) · Woman
  - Hombre (sol) · Man
  - Otra identidad (destello) · Another identity
  - Prefiero no decirlo (nube) · Prefer not to say
- **Al elegir**: la opción se enciende con borde dorado y su ícono crece un poco. Suena un toque y salen chispas del ícono. Son botones de opción nativos: funcionan con flechas del teclado y con lector de pantalla.
- **Continuar** sin elegir: suena `falta-dato.wav`, se marcan las opciones y aparece «Elige una opción para continuar.».
- La respuesta se guarda **solo en este dispositivo** (`localStorage`, clave `kura.identidad`; valores `mujer`, `hombre`, `otra`, `prefiero-no-decir`). Después pasa a A10.
- Empieza sin opción elegida cada vez que se entra.

## A10 · ¿Qué te motiva a cambiar tu Aura?

Se entra con «Continuar» en A09; también con `#a10`. **Escenario propio**, distinto de A06–A09: diseño A aprobado (Alaira sentada en una luna creciente dorada sobre un lago, con aurora boreal, luna llena, jardín y los dos planetas de KURA). El diseño está guardado en `kura/diseno/A10/aprobado-diseno-A.webp`.

- **Capas** (`js/a10-capas.js`), separadas del diseño con Higgsfield: fondo sin Alaira (`assets/a10/fondo.webp`), Alaira con su luna (`alaira.webp`, la luna rehecha sólida y sin el logo pintado), halo de la luna (`luna-brillo.webp`), los dos planetas de KURA y bruma delante.
- **Cielo vivo en WebGL** (`js/a10-cielo.js`, sin librerías): la aurora ondula y una luz recorre sus cortinas; cada estrella titila a su ritmo y 15 estrellas grandes tienen destello en cruz; el lago tiene ondas finas y reflejos que chispean; el halo de la luna llena respira. Un mapa (`assets/a10/mapas.png`: rojo aurora, verde lago, azul estrellas) dice dónde va cada efecto.
- **Partículas doradas** que suben del brote, meciéndose, con estrellitas del adorno. Al elegir una opción (o tocar el brote) florece: destello de luz y un puñado de chispas.
- **Paralaje** con cursor o giroscopio: fondo y planetas muy lejos, Alaira en medio, la bruma delante y el HUD encima.
- **Rendimiento**: el cielo se dibuja a 30 cuadros/s en un solo lienzo y baja su resolución solo si el teléfono se atrasa; las partículas viven en un lienzo pequeño junto al brote; nada se anima detrás del panel de cristal (la bruma del panel está quieta). Todo se detiene al salir de A10, con la pestaña oculta o con «Reducir efectos». Sin WebGL queda la ilustración quieta.
- **Título** en dos renglones: «¿Qué te motiva a cambiar / tu Aura?» · «What motivates you / to change your Aura?», con «Elige una o varias» · «Choose one or more».
- **Siete opciones** con ícono dorado en SVG (se pueden marcar varias; casillas nativas, funcionan con teclado y lector de pantalla):
  - Sentirme mejor conmigo (corazón) · Feel better about myself
  - Calmar mi ansiedad (ondas) · Calm my anxiety
  - Cuidar más mi cuerpo (loto) · Take better care of my body
  - Avanzar hacia mis metas (montaña con estrella) · Move toward my goals
  - Comenzar a manifestar (mano con destello) · Start manifesting
  - Aprender habilidades sociales (dos destellos) · Learn social skills
  - No sé todavía. Quiero descubrirlo (brújula) · I don't know yet. I want to find out — es exclusiva: desmarca las demás, y marcar otra la desmarca.
- **Continuar** sin elegir: suena `falta-dato.wav`, se marcan las opciones y aparece «Elige al menos una opción o toca Omitir.». Con opciones, se guardan **solo en este dispositivo** (`localStorage`, clave `kura.motivos`, lista JSON de valores).
- **Omitir** · **Skip**: sigue sin guardar nada (borra `kura.motivos`). Los dos llevan a A11.

## A11 · ¿Listo para KURA?

Se entra con «Continuar» u «Omitir» en A10; también con `#a11`. **Escenario propio**: diseño D aprobado (Alaira asomada al barandal de un templo con glicinas, al atardecer, señala con el índice los banners de los otros cuatro guías). El diseño y los banners HD están en `kura/diseno/A11/`.

- **Capas** (`js/a11-capas.js`), separadas del diseño con Higgsfield: templo sin Alaira con los dos planetas de KURA y el castillo (`assets/a11/fondo.webp`), Alaira recortada (`alaira.webp`) y glicinas del frente (`glicina.webp`, la derecha es la misma en espejo).
- **Vivo y ligero**: Alaira respira; de la punta de su índice late una luz y cae una estela de chispas doradas hacia los banners; las glicinas se mecen y caen pétalos lila por toda la pantalla; un brillo recorre cada banner de vez en cuando. Estela y pétalos comparten un solo ciclo a 30 cuadros/s; todo se detiene al salir de A11, con la pestaña oculta o con «Reducir efectos». No hay panel de cristal (nada se re-desenfoca).
- **Paralaje** con cursor o giroscopio: templo y cielo al fondo, Alaira en medio, glicinas y pétalos delante, el HUD encima, y dentro de cada banner el mundo se desliza un poco (ventana con profundidad).
- **Título** según la identidad elegida en A09: «¿Lista para / KURA?» (mujer), «¿Listo para / KURA?» (hombre) y «¿Todo listo / para KURA?» (otra identidad, prefiero no decirlo o sin respuesta). En inglés siempre «Ready for / KURA?». Arriba «Tu viaje comienza» · «Your journey begins» y abajo «Ellos también te esperan.» · «They’re waiting for you too.».
- **Banners** de Amaya (ciudad aérea de cristal y jardines), Azara (castillo carmesí imponente, con vitrales y cristales de rubí), Nova (noche pop star en azul oscuro, con flashes) y Orion (biblioteca observatorio con esfera armilar), en HD (`assets/a11/banners/`, 1400 × 600). El nombre y la flecha van en texto real (nítido y traducible). Tocar un banner hace destellar el dedo de Alaira y abre su **vista previa** (`js/a11-guias.js`).
- **Vista previa del guía** (diseños aprobados, hechos con Higgsfield): ficha del mismo tamaño para los cuatro (9 : 16, todo medido en `cqw`), con la ilustración de su mundo a sangre (`assets/a11/guias/`, HD en `kura/diseno/A11/guias/`) y un HUD con el estilo de cada mundo: **Amaya** aero (cristal claro, menta y cielo, título ancho en Michroma con «Cuerpo · Cuidado · Descanso», mosaicos con datos de ejemplo y el aviso de consultar siempre al médico), **Azara** carmesí rubí sobrio (Cormorant marfil, lista en cristal guinda), **Nova** pop star de noche minimalista (Outfit delgada, azul de ciudad, ocho mosaicos; collar del dragón plateado) y **Orion** biblioteca observatorio en azul noche y oro, con su vestuario canónico (Cormorant marfil, título a la izquierda con trazo dorado, cada función en su propia barra de cristal). Todos con su **modo contemplación**. Se pasa de un guía a otro con las flechas, deslizando o con ← →; se cierra con la X, tocando fuera, Esc o al cambiar de pantalla. «Empezar con …» deja anotado por quién empezar el tour (`localStorage`, clave `kura.tourInicio`). Español e inglés. Letras: Cormorant Garamond, Outfit y Michroma (OFL, en `assets/fonts/`).
- **Iniciar el tour** · **Start the tour** (sonido de inicio) y **Saltar** · **Skip**: por ahora muestran un aviso, hasta que existan el tour (A13–A17) y Hoy.
- **Cabe sin scroll** en cualquier teléfono (probado de 375 × 629 a 430 × 932): en teléfonos altos los banners crecen; en los bajos suben sobre el barandal y se compactan.

## Estructura

| Archivo | Módulo |
|---|---|
| `js/config.js` | Todos los parámetros ajustables (estrellas, nubes, luces, bordes, audio, rendimiento) |
| `js/scene.js` | SceneBackground, CloudLayers (con viento en las nubes de atrás), AmbientLighting y paralaje leve |
| `js/starfield.js` | StarField (sigue el paralaje), destellos ópticos del botón y del cristal, chispas al tocar (una sola instancia de WebGLRenderer) |
| `js/border.js` | LuminousBorder: contorno y halo del botón y del cristal |
| `styles.css` | GlassHUD, campos, tipografía y estados |
| `js/form.js` | LoginForm (A01: validación, error, enfoque, carga, mostrar contraseña, teclado) |
| `js/recover.js` | RecoverForm (A03: correo y «Enviar enlace»; abre A04 con respuesta neutra) |
| `js/signup.js` | SignupForm (A02: correo, contraseña de 8+ caracteres, confirmación, ventana de términos con casilla sin marcar) |
| `js/auth.js` | Puntos de integración de autenticación (hoy responden «demo») |
| `js/audio.js` | AudioControl y efectos de sonido |
| `js/motion.js` | MotionSettings (sistema + «Reducir efectos») |
| `js/i18n.js` | Textos en español e inglés |
| `js/legal.js` | Términos y aviso de privacidad (textos de prototipo) y su ventana |
| `js/devpanel.js` | Panel de ajustes de desarrollo |
| `js/a10.js` · `js/a10-capas.js` · `js/a10-cielo.js` | A10: escena por capas, partículas del brote y cielo vivo en WebGL |
| `js/a11.js` · `js/a11-capas.js` | A11: escena por capas, estela de chispas del índice, pétalos y paralaje de los banners |
| `js/a11-guias.js` | A11: vista previa de cada guía (frase, lo que ofrece, modo contemplación) |

Orden de capas: escena → nubes posteriores (detrás del grupo) → nubes delanteras e inferiores → luces → logo y audio → cristal → bordes luminosos → textos y controles → estrellas y chispas (lienzo sin eventos de puntero).

## Decisiones

- **Escena unificada.** El fondo y el grupo separados del kit no coinciden en escala con la escena unificada, así que se usa la unificada. La silueta del grupo (`assets/masks/detras-del-grupo.png`) se obtuvo comparando la escena con el fondo vacío; sirve para que las nubes posteriores queden detrás de los personajes. No hay separación individual de personajes ni se animan sus cuerpos.
- **Estrellas.** Posiciones precalculadas solo en cielo oscuro visible (`data/estrellas.json`), lejos de rostros, logo, planetas y audio. 90 en móvil y 120 en escritorio; una de cada 11 lleva destello de cuatro puntas. No se usa bloom.
- **Tipografía.** Playfair Display Italic (local, OFL): fue la más parecida a la referencia en la comparación. Campos y textos pequeños usan la misma familia porque así lo muestra la referencia; los tamaños tienen mínimos legibles en móvil (16 px en campos para que iOS no haga zoom).
- **Escala.** Todo el texto y los controles escalan con el ancho de la pantalla, igual que la referencia. Las áreas táctiles de 44 px se amplían con pseudo-elementos invisibles. En iOS se fija la escala inicial para que enfocar un campo no haga zoom.
- **Términos y privacidad.** Ventana con texto en Arial y desplazamiento; textos de prototipo con los campos del responsable en blanco y la nota «Documentos en preparación». En inglés se avisa que por ahora están solo en español.
- **Logo.** El oficial, con su fondo azul quitado conservando el dibujo, separado en símbolo y palabra para que cada parte respire con un brillo de neón tenue a destiempo.
- **Invitación del botón.** Tras unos segundos sin actividad, un reflejo cruza el botón, el halo se enciende y la flecha da dos pasos a la derecha. Se repite cada 7 s mientras la página sigue en reposo; sin sonido.

## Audio

- **Volumen auditado:** todos los efectos llegan al mismo nivel (pico de corto plazo ≈ −22 dBFS, diferencia < 1 dB) con `config.audio.sfxLevels`; las cuatro canciones miden ≈ −13 a −13.5 LUFS entre sí. Para medir un sonido: `__kura.audio._measure('nombre')`.

- El botón de sonido abre un selector con dos interruptores, **Música** y **Efectos de sonido**; la elección se recuerda.
- Cuatro canciones para toda la sección inicial, en orden y en bucle: 1 (`ambiente.mp3`), 2 · Start Shadow Protocol, 3 · Second Shadow Protocol y 4 · Shadows of the Void (`config.audio.playlist`).
- La música sigue donde se quedó: la canción y el segundo se guardan, así que al recargar o volver a A05 no empieza de cero.
- `audio/ambiente.mp3` suena tras el primer toque. Silenciar baja el volumen en 2.6 s, pero la canción sigue avanzando: al volver a activarla continúa donde iba. Si falta el archivo, no hay errores.
- Para la transición al mundo de Alaira ya existe `audio.fadeOutMusic(segundos)`.
- «Acceso concedido» suena cuando `js/auth.js` responde `{ ok: true }` (correo, Google u otro proveedor); «acceso fallido», con datos inválidos o cuando responde `{ ok: false, reason: 'invalid' | 'network' }`. Mientras no haya servidor, el panel de desarrollo (Mayús + D) tiene botones para escuchar ambos.
- **Efectos de sonido**: «Iniciar sesión» no tiene sonido propio; suena `acceso-fallido.mp3` si faltan o fallan los datos y `acceso-concedido.wav` al entrar a A06 (también al crear cuenta; en la demo suena igual con un aviso) (solo con sus archivos, sin sustituto sintetizado). Toques de botones y enlaces, enfoque de campos (también mostrar contraseña) y alternar se sintetizan en el navegador. La invitación del botón es solo visual.
- Para reemplazarlos por sonidos propios basta con poner archivos en `audio/sfx/` con estos nombres; se usan automáticamente:

| Archivo | Momento | Idea para ElevenLabs (Sound Effects) |
|---|---|---|
| `toque.mp3` | Botones y enlaces | «tiny glass tap, soft high crystal pluck, quiet UI click, 0.3 seconds» |
| `enfoque.mp3` | Enfocar un campo | «very soft airy glass tick, quiet, 0.2 seconds» |
| `alternar.mp3` | Botón de sonido e idioma (mostrar contraseña usa el de enfoque) | «two soft crystal notes rising, quiet toggle, 0.3 seconds» |
| `acceso-fallido.mp3` | Datos inválidos o inicio de sesión rechazado | **Incluido** (elegido por ti) |
| `acceso-concedido.wav` | Acceso concedido: entrar a A06 con correo, Google, otro proveedor o cuenta nueva | **Incluido** (elegido por ti) |
| `abrir-aviso.wav` | Abrir Términos o Privacidad | **Incluido** (elegido por ti) |
| `cerrar-aviso.wav` | Cerrar Términos o Privacidad (X, tocar fuera o Escape; al aceptar no suena) | **Incluido** (elegido por ti) |
| `empezar.wav` | «Empezar» en A06 | **Incluido** (elegido por ti) |
| `encantada.wav` | Tarjeta «¡Encantada, {nombre}!» en A07 (mismo volumen que los demás efectos) | **Incluido** (elegido por ti) |
| `fuegos-artificiales.wav` | Fuegos artificiales al decir tu nombre en A07: ≈ 27 dB debajo de los efectos, más bajo que la estrella | **Incluido** (elegido por ti) |
| `falta-dato.wav` | Tocar para avanzar cuando falta un dato: campos vacíos en A01, A02 y A03, y la introducción (A07 y las siguientes). Si el dato está escrito pero no es válido, A01–A03 usan `acceso-fallido.mp3` | **Incluido** (elegido por ti) |
| `estrella-flotando.wav` | La estrella de Alaira en A06: bucle muy suave, ≈ 23 dB debajo de los efectos | **Incluido** (elegido por ti) |
| `efectos.wav` | Botón «Reducir / Efectos completos» | **Incluido** (elegido por ti) |
| `crear-cuenta.wav` | «Crear cuenta» | **Incluido** (elegido por ti) |
| `icono-audio.wav` | Tocar el icono de audio | **Incluido** (elegido por ti) |

## Cómo ajustar los efectos

Todo está en `js/config.js`; el panel de desarrollo (Mayús + D) permite probar en vivo y copiar la configuración resultante.

- Estrellas: `stars.intensity`, `stars.twinkleSpeed`, `stars.countMobile/Desktop`.
- Bordes: `button.border`, `hud.border`.
- Invitación en reposo: `button.idleAfter` (segundos sin actividad) y `button.inviteEvery` (cada cuánto se repite).
- Brillo del logo: `@keyframes neon` en `styles.css` (7 s el símbolo, 9 s la palabra).
- Destellos ópticos: `flares.hud` y `flares.button` (cantidad, tamaño, intensidad, velocidad, vida). Solo recorren las orillas superior e inferior, nunca el interior.
- Viento en las nubes de atrás: `wind.speed` y `wind.layers.far/near` (altura, opacidad, desenfoque, duración del cruce, cantidad). La máscara `assets/masks/viento.png` limita el viento al mar de nubes, detrás de personajes y arquitectura.
- Resto de nubes: `clouds.*.opacity / blur / drift / duration`.
- Luces: `lights.*` y `lights.breathe`.

## Verificado

En Chromium (emulación): iPhone 14 Pro, iPhone SE, Android de 360 px, iPhone Pro Max, tableta y escritorio; teclado (orden de tabulación), movimiento reducido del sistema y de la página, idioma, errores, carga, demo, mostrar contraseña, música (inicio, desvanecido, continuidad) y sin errores de consola.

## Pendiente

- Autenticación real, Google OAuth, registro (A02), recuperación (A03), Términos y Privacidad.
- Probar en iPhone y Android reales (rendimiento de WebGL, teclado, audio en iOS).
- Rendimiento medido solo en emulación; no hay cifra de FPS en dispositivos.
