# KURA — Inventario de pantallas (MVP v1)

Cada código es una pantalla o un estado que se diseña como concepto visual.
Nombres de archivo: `A08-fecha-de-nacimiento`, `L01-portada-alaira`, `R03-ritual-en-curso`, etc.

**Navegación principal (dentro de KURA):** Hoy · Mundos · Mi camino · Biblioteca · Perfil
- **Hoy** siempre muestra el mundo activo.
- Desde **Mundos**, entrar a un mundo abre su portada (o su intro la primera vez).
- Toda actividad tiene un regreso visible al punto desde donde se abrió.
- 🔒 = solo KURA Plus. Al tocarlo sin Plus se abre **K04**.

## Prefijos

| Prefijo | Sección |
|---|---|
| A | Inicio de sesión y primera entrada |
| T | Tour rápido |
| K | KURA Plus (venta y bloqueos) |
| N | Navegación y Mundos |
| R | Ritual (compartido por todos los mundos) |
| S | Personalización compartida: soundscape, outfits, escenario, contemplación |
| L | Mundo de Alaira — gratitud y ley de atracción |
| Y | Mundo de Amaya — cuerpo y bienestar |
| Z | Mundo de Lazara — modo ganar |
| O | Mundo de Orión — filosofía estoica |
| V | Mundo de Nova — habilidades sociales y atracción |
| C | Mi camino |
| B | Biblioteca |
| P | Perfil y ajustes |
| G | Estados globales |

---

## Flujo de primera vez

A01/A02 → A06 Bienvenida → A07 Nombre → A08 Fecha de nacimiento → A09 Identidad → A10 Motivación → A11 ¿Tour o saltar? → (T01–T06) → K01 Anuncio KURA Plus → A12 Entrada al mundo de Alaira → L01 Portada de Alaira

---

## 1. Inicio de sesión y primera entrada (A)

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| A01 | Inicio de sesión | Logo, bienvenida breve, correo, contraseña, Iniciar sesión, Continuar con Google, Crear cuenta, Olvidé mi contraseña. Estados: teclado abierto y error. |
| A02 | Crear cuenta | Correo, contraseña, confirmación, enlace a iniciar sesión. Al completar, abre A06. |
| A03 | Recuperar contraseña | Correo, Enviar enlace, regreso. |
| A04 | Enlace enviado | Confirmación y Volver a iniciar sesión. |
| A05 | Restaurando sesión | Logo y transición. Con sesión: abre Hoy. Sesión expirada: abre A01. |
| A06 | Bienvenida con Alaira | Alaira presenta KURA. Empezar → A07. Saltar por ahora → A11. |
| A07 | ¿Cómo te llamo? ✅ | Nombre, Continuar, Omitir. Se usa en saludos y afirmaciones personalizadas. |
| A08 | ¿Cuál es tu fecha de nacimiento? ✅ | Selector Día/Mes/Año, edad calculada («Tienes 30 años ✦»), Continuar, Omitir. La fecha alimenta los Arcanos (L05). |
| A09 | ¿Cómo te identificas? | Mujer, Hombre, Otra identidad, Prefiero no decirlo. Continuar y Omitir. |
| A10 | ¿Qué te motiva a cambiar tu Aura? | Sentirme mejor conmigo · Encontrar calma · Cuidar mi cuerpo · Avanzar hacia mis metas · Cambiar cómo me hago presente · No sé todavía, quiero descubrirlo. Selección múltiple. *v1: solo se guarda. v2: recomienda mundo (calma/gratitud → Alaira, cuerpo → Amaya, metas → Lazara, sabiduría → Orión, presencia social → Nova).* |
| A11 | ¿Te muestro KURA? | Alaira ofrece un recorrido rápido. Ver recorrido → T01. Saltar → K01. Solo aparece la primera vez. |
| A12 | Entrando al mundo de Alaira | Transición cinematográfica (portal/nubes) hacia L01. |

## 2. Tour rápido (T) — se anima al final, cuando el HUD esté completo

| Código | Pantalla | Qué aparece |
|---|---|---|
| T01 | Hoy | Resalta la portada del mundo activo y el botón de ritual. |
| T02 | Mundos | Resalta el selector de personajes. |
| T03 | Mi camino | Resalta rachas y progreso. |
| T04 | Biblioteca | Resalta favoritos y guardados. |
| T05 | Perfil | Resalta ajustes y KURA Plus. |
| T06 | ¡Listo! | Cierre del tour. Continuar → K01. |

Todas con: indicador de pasos, Siguiente y Saltar recorrido.

## 3. KURA Plus (K)

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| K01 | Anuncio KURA Plus (onboarding) | Banner rápido: «Explora KURA Plus: más personajes, más funciones, más widgets». Obtener Plus → K02. Después → A12. |
| K02 | Planes | Beneficios, mensual/anual, precio, prueba gratis, Restaurar compras, términos. |
| K03 | Bienvenido a Plus | Confirmación con animación de desbloqueo. Volver al punto de origen. |
| K04 | Contenido bloqueado (hoja inferior) | Qué es la función, vista previa, Obtener Plus → K02, Ahora no. |

## 4. Navegación y Mundos (N)

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| N01 | Barra de navegación | Hoy · Mundos · Mi camino · Biblioteca · Perfil. Estados activo/inactivo. Cambia de color según el mundo activo. |
| N02 | Mundos | Carrusel de personajes estilo selección de videojuego: Alaira, Amaya, Lazara, Orión, Nova. Cada carta muestra nombre, tema y estado (activo / disponible / 🔒). |
| N03 | Vista previa de mundo | Al tocar una carta: arte del personaje, de qué trata, funciones principales, Entrar o Desbloquear con Plus. |
| N04 | Cambiar mundo activo | Confirmación «¿Hacer de Amaya tu mundo en Hoy?». |

## 5. Ritual (R) — mismo esquema en todos los mundos

Cambia por mundo: personaje, paleta, música, tipo de frase (gratitud, bienestar, poder, estoica, confianza social).

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| R01 | Preparar ritual | El personaje invita: «5 afirmaciones, dilas con intención». Duración aprox., racha actual, Comenzar. |
| R02 | Respira | Cuenta regresiva / respiración guiada de 3 ciclos antes de empezar. |
| R03 | Ritual en curso | Afirmación grande, progreso 1/5, botón «La dije» (o mantener presionado mientras la dices), escuchar con la voz del personaje. |
| R04 | Ritual completado | Celebración, racha +1, recompensa (puntos para outfits), Compartir, Volver a Hoy. |
| R05 | Racha perdida / recuperar | Mensaje amable y opción de reiniciar. |

## 6. Personalización compartida (S) — todos los mundos

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| S01 | Soundscape 🔒 | Reproductor de ambiente del mundo: pistas, mezcla de capas (lluvia, viento, cuencos), temporizador. |
| S02 | Contemplación | Modo inmersivo: solo el escenario animado, música y una frase que aparece lentamente. Tocar para salir. |
| S03 | Vestuario 🔒 | Outfits del personaje: desbloqueados con rachas/premios y bloqueados con requisito. Vista previa en el personaje. |
| S04 | Escenario y ambiente 🔒 | Cambiar landscape, música y «feeling» del mundo (como plantillas). Vista previa y Aplicar. |
| S05 | Premio desbloqueado | Modal: nuevo outfit/escenario obtenido. Ver / Equipar. |

---

## 7. Mundo de Alaira (L) — gratitud y ley de atracción
Paleta violeta y dorado, cielo estelar, palacio flotante.

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| L01 | Portada de Alaira (Hoy) | Saludo con nombre, afirmación del día, botón grande Ritual (→ R01), accesos: Afirmaciones, Mis afirmaciones, Arcanos, Retos, Diario, Mapa de emociones, Contemplación, Soundscape, Vestuario, Escenario. |
| L02 | Afirmaciones | Categorías (gratitud, amor propio, abundancia, calma) y carrusel de afirmaciones. |
| L03 | Detalle de afirmación | Frase grande, escuchar, guardar en favoritos, compartir como imagen. |
| L04 | Mis afirmaciones | Afirmaciones personalizadas con tu nombre. Crear nueva (plantillas o texto libre). |
| L05 | Arcanos 🔒 | Tu arcano según fecha de nacimiento/edad, significado y afirmaciones asociadas. Arcano del día. |
| L06 | Retos de ley de atracción 🔒 | Lista de retos (7, 21, 30 días) con progreso. |
| L07 | Reto en curso 🔒 | Día X de N, tarea del día, marcar como hecha. |
| L08 | Diario 🔒 | Lista de entradas por fecha. Nueva entrada. |
| L09 | Nueva entrada de diario 🔒 | Pregunta guía de gratitud («3 cosas por las que agradeces hoy»), texto, guardar. |
| L10 | ¿Cómo te sientes hoy? | Check-in de emoción: selector visual de emociones + nota opcional. |
| L11 | Mapa de emociones | Calendario/mapa con color por emoción, patrones de la semana y del mes. |

## 8. Mundo de Amaya (Y) — cuerpo y bienestar

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| Y01 | Intro de Amaya (primera vez) | Amaya se presenta: quién es y qué puedes hacer en su mundo. 2–3 pasos y Entrar. |
| Y02 | Portada de Amaya | Saludo, afirmación de bienestar del día, Ritual, recordatorios de hoy (agua), última presión registrada, accesos. |
| Y03 | Registrar presión arterial | Sistólica, diastólica, pulso, fecha/hora, nota. Aviso: «KURA no sustituye consejo médico». |
| Y04 | Historial de presión | Gráfica y lista de registros, filtro por semana/mes. |
| Y05 | Recordatorios | Agua (meta diaria y vasos tomados) y recordatorios personalizados. Activar/desactivar. |
| Y06 | Crear recordatorio | Nombre, hora, repetición, sonido. |
| Y07 | Afirmaciones por zona del cuerpo | Silueta tocable para elegir zona (corazón, piel, espalda…) o «cuerpo completo». |
| Y08 | Ritual de cuerpo completo | Variante de R03 que recorre el cuerpo de pies a cabeza con afirmaciones. |

## 9. Mundo de Lazara (Z) — modo ganar

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| Z01 | Intro de Lazara (primera vez) | «Conquista y reprograma tu mente para entrar en Win Mode». |
| Z02 | Portada de Lazara | Frase ganadora del día, Ritual, nivel/racha de victorias, accesos. |
| Z03 | Rituales de afirmación | Elegir enfoque: Abundancia, Poder, Confianza → abre R01 con ese enfoque. |
| Z04 | Ejercicios prácticos | Lista de ejercicios interpersonales y mentales (postura de poder, pedir algo difícil, visualización de logro). |
| Z05 | Ejercicio en curso | Instrucciones paso a paso, temporizador, marcar como completado. |
| Z06 | Frases ganadoras | Feed de frases para guardar y compartir. |
| Z07 | Track record | Metas activas, logros conseguidos, gráfica de victorias por semana. |
| Z08 | Registrar logro / nueva meta | Título, categoría, fecha, cómo te sentiste. |

## 10. Mundo de Orión (O) — filosofía estoica

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| O01 | Intro de Orión (primera vez) | Orión presenta los caminos de sabiduría. |
| O02 | Portada de Orión | Frase estoica del día, Ritual (afirmaciones estoicas), camino en progreso, accesos. |
| O03 | Caminos de sabiduría | Rutas temáticas (control, adversidad, tiempo, virtud) con lecciones. |
| O04 | Lección | Idea central, frase parafraseada, práctica del día, Completar. |
| O05 | Filósofos | Galería: clásicos (Marco Aurelio, Séneca, Epicteto…) y modernos. |
| O06 | Perfil de filósofo | Retrato, breve biografía, frases parafraseadas, guardar. |
| O07 | Journal estoico | Pregunta reflexiva del día (mañana/noche), texto, guardar. |

## 11. Mundo de Nova (V) — habilidades sociales y atracción
Se siente como un juego dentro de KURA: niveles, XP y misiones.

| Código | Pantalla | Qué aparece y qué pasa al tocar |
|---|---|---|
| V01 | Intro de Nova (primera vez) | Nova explica: habilidades sociales, carisma y atracción. Elige tu objetivo (amistades, citas, networking). |
| V02 | Portada de Nova | Nivel y XP, misión del día, Ritual de confianza, accesos. |
| V03 | Reglas de oro | Tarjetas coleccionables con principios clave. |
| V04 | Escenarios | Lista por categoría: acercarte a alguien, la conversación pierde interés, un grupo no te presta atención, networking, citas. |
| V05 | Escenario interactivo | Situación ilustrada + 3–4 respuestas posibles. Eliges una. |
| V06 | Resultado del escenario | Feedback de tu elección, la mejor opción y por qué, +XP. |
| V07 | Señales de interés | Guía de indicadores de interés y desinterés (lenguaje corporal, conversación), con ejemplos. |
| V08 | Técnicas de conversación | Iniciar, mantener y cerrar conversaciones; humor y rizz; cómo integrarte a un grupo. |
| V09 | Misión en la vida real | Reto práctico del día («saluda a 3 personas nuevas»), marcar hecho y cómo fue. |
| V10 | Progreso social | Mapa de habilidades (confianza, conversación, lectura de señales) y nivel de cada una. |

---

## 12. Mi camino (C)

| Código | Pantalla | Qué aparece |
|---|---|---|
| C01 | Resumen | Racha global, rituales completados, minutos de contemplación, progreso por mundo. |
| C02 | Historial | Calendario con lo que hiciste cada día. |
| C03 | Logros | Insignias obtenidas y por obtener. |
| C04 | Emociones (resumen) | Resumen del mapa de emociones (L11) de todos los mundos. |

## 13. Biblioteca (B)

| Código | Pantalla | Qué aparece |
|---|---|---|
| B01 | Biblioteca | Pestañas: Favoritos, Mis afirmaciones, Diario, Frases, Reglas de oro. |
| B02 | Buscar | Búsqueda en todo el contenido, filtro por mundo. |
| B03 | Colección | Lista dentro de una pestaña o de un mundo. |

## 14. Perfil y ajustes (P)

| Código | Pantalla | Qué aparece |
|---|---|---|
| P01 | Perfil | Avatar, nombre, edad, mundo activo, estado de Plus, accesos a ajustes. |
| P02 | Editar datos | Nombre, fecha de nacimiento, identidad, motivación (A07–A10). |
| P03 | Suscripción | Plan actual, renovación, gestionar → K02. |
| P04 | Notificaciones | Recordatorio de ritual, afirmación del día, recordatorios de Amaya. |
| P05 | Sonido y voz | Música, efectos, voz del personaje, volumen. |
| P06 | Cuenta y privacidad | Cambiar contraseña, exportar datos, eliminar cuenta. |
| P07 | Cerrar sesión | Confirmación. |

## 15. Estados globales (G)

| Código | Estado |
|---|---|
| G01 | Cargando (con animación del mundo activo) |
| G02 | Sin conexión |
| G03 | Error genérico con reintentar |
| G04 | Vacío (sin diario, sin favoritos…) con invitación a empezar |
| G05 | Notificación / recordatorio (diseño de push) |

---

## Prioridad sugerida para el MVP

1. **Ya:** A09–A12, K01, L01, R01–R04, N01–N03 → el flujo completo hasta el primer ritual.
2. **Después:** resto de Alaira (L), S01–S04, K02–K04, Mi camino, Biblioteca, Perfil.
3. **Luego:** intros y portadas de Amaya, Lazara, Orión y Nova, y sus funciones.
4. **Al final:** Tour animado (T), estados globales (G).

**Total: ~115 pantallas.** A 2 créditos por imagen (con 2–3 intentos cada una): ~230–700 créditos.
