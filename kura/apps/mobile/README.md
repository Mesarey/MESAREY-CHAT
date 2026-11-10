# KURA — app móvil

App de KURA para iOS y Android (Expo + React Native + TypeScript). Hoy contiene el mundo de **Alaira** completo y funcionando sin servidor.

## Qué incluye

| Pantalla | Qué hace |
|---|---|
| Bienvenida | Alaira pregunta el nombre |
| Hoy | Saludo, foco del día, «cuéntale a Alaira», afirmación de hoy (escuchar / guardar), ritual |
| Mundos | Los cinco guías; Alaira disponible, el resto «próximamente» |
| Biblioteca | Afirmaciones, Filosofía, Respiración, Mi memoria, Mis sesiones, búsqueda |
| Afirmaciones | 8 categorías, favoritas, sesión de 3 afirmaciones que se sellan manteniendo presionado |
| Filosofía | 3 obras, 23 frases con fuente, «sorpréndeme», búsqueda |
| Respiración | Ritmo 4-2-6, 1 o 5 minutos |
| Ritual | Pausa → 1 minuto de respiración → 3 afirmaciones |
| Mi camino | Días seguidos, sendero de 10 faroles, próxima recompensa, logros |
| Perfil | Vínculo con Alaira (nivel y resonancia), ambientaciones, colección |

Recompensas: 9 logros, 9 objetos (fragmentos de historia, títulos, un paquete de afirmaciones y la ambientación **Aurora**, que cambia el cielo del mundo).

## Cómo correrla

```bash
npm install
```

```bash
npx expo start
```

Escanea el QR con **Expo Go** (iOS/Android) o pulsa `w` para abrirla en el navegador.

## Verificación

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npx expo lint
```

## Estructura

```
src/
  domain/    Reglas puras: resonancia, niveles, hitos, racha, selección de afirmaciones (con pruebas)
  content/   Contenido de Alaira: temas, afirmaciones, frases, prácticas, logros, objetos
  state/     Estado persistido en el dispositivo (zustand + AsyncStorage) y bandeja de salida de eventos
  theme/     Colores, tipografías y ambientaciones
  ui/        Fondo animado del mundo, iconos, tarjetas, respiración, sello, celebración de recompensas
  app/       Pantallas (Expo Router)
assets/alaira/  Recortes provisionales del personaje, sacados de las láminas de referencia
```

## Pendiente conocido

- **Arte**: los recortes de Alaira son provisionales y de baja resolución. Faltan el personaje en PNG transparente de alta resolución, las poses del HUD y el paisaje pintado del fondo (arcos, cascadas, glicinas); hoy el fondo se dibuja por código.
- **Servidor**: no hay cuentas ni sincronización; el progreso vive solo en el dispositivo.
- **Fuera de la app**: sin widgets ni notificaciones todavía.
- **«Cuéntale a Alaira»** guarda la nota en Mi memoria; Alaira aún no responde.
- **Voz**: «Escuchar» usa la voz del sistema, no una voz propia de Alaira.
- Probada en navegador (Chromium, tamaño de teléfono). Falta probarla en dispositivos iOS y Android reales.
