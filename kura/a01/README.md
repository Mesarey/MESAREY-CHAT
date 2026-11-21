# A01 · Inicio de sesión (Observatorio)

Pantalla de entrada de KURA en español e inglés, recreada a partir de la referencia aprobada (`../diseno/A01/referencia-observatorio.webp`) y del kit «KURA A01 Observatorio · Separación avanzada».

## Cómo verla

HTML, CSS y JavaScript sin compilación. Se abre con un servidor local:

```bash
npx serve kura/a01
```

- Español: `http://localhost:3000/#es` · Inglés: `http://localhost:3000/#en` (también desde el botón «English / Español» bajo el panel).
- Panel de ajustes de desarrollo: **Mayús + D**, o `#dev` en la dirección.

## Estructura

| Archivo | Módulo |
|---|---|
| `js/config.js` | Todos los parámetros ajustables (estrellas, nubes, luces, bordes, audio, rendimiento) |
| `js/scene.js` | SceneBackground, CloudLayers, AmbientLighting y paralaje leve |
| `js/starfield.js` | StarField, destellos ópticos del cristal y chispas al tocar (una sola instancia de WebGLRenderer) |
| `js/border.js` | LuminousBorder: luz que recorre el botón principal; contorno fijo del cristal |
| `styles.css` | GlassHUD, campos, tipografía y estados |
| `js/form.js` | LoginForm (validación, error, enfoque, carga, mostrar contraseña, teclado) |
| `js/auth.js` | Puntos de integración de autenticación (hoy responden «demo») |
| `js/audio.js` | AudioControl y efectos de sonido |
| `js/motion.js` | MotionSettings (sistema + «Reducir efectos») |
| `js/i18n.js` | Textos en español e inglés |
| `js/devpanel.js` | Panel de ajustes de desarrollo |

Orden de capas: escena → nubes posteriores (detrás del grupo) → bruma intermedia enmascarada → nubes delanteras e inferiores → luces → logo y audio → cristal → bordes luminosos → textos y controles → estrellas y chispas (lienzo sin eventos de puntero).

## Decisiones

- **Escena unificada.** El fondo y el grupo separados del kit no coinciden en escala con la escena unificada, así que se usa la unificada. La silueta del grupo (`assets/masks/detras-del-grupo.png`) se obtuvo comparando la escena con el fondo vacío; sirve para que las nubes posteriores queden detrás de los personajes. No hay separación individual de personajes ni se animan sus cuerpos.
- **Estrellas.** Posiciones precalculadas solo en cielo oscuro visible (`data/estrellas.json`), lejos de rostros, logo, planetas y audio. 90 en móvil y 120 en escritorio; una de cada 11 lleva destello de cuatro puntas. No se usa bloom.
- **Tipografía.** Playfair Display Italic (local, OFL): fue la más parecida a la referencia en la comparación. Campos y textos pequeños usan la misma familia porque así lo muestra la referencia; los tamaños tienen mínimos legibles en móvil (16 px en campos para que iOS no haga zoom).
- **Áreas táctiles.** Mínimo 44 px. En teléfonos pequeños esto hace el formulario un poco más alto que en la referencia y la página se desplaza.
- **Logo.** El oficial, con su fondo azul quitado conservando el dibujo.

## Audio

- `audio/ambiente.mp3` suena en bucle tras el primer toque. Silenciar baja el volumen en 2.6 s, pero la canción sigue avanzando: al volver a activarla continúa donde iba. Si falta el archivo, no hay errores.
- Para la transición al mundo de Alaira ya existe `audio.fadeOutMusic(segundos)`.
- **Efectos de sonido** sintetizados en el navegador (provisionales hasta elegir los definitivos): toque de «Iniciar sesión», toques discretos en botones y enlaces, enfoque de campos, alternar y error. La invitación del botón es solo visual, sin sonido.
- Para reemplazarlos por sonidos propios basta con poner archivos en `audio/sfx/` con estos nombres; se usan automáticamente:

| Archivo | Momento | Idea para ElevenLabs (Sound Effects) |
|---|---|---|
| `iniciar-sesion.mp3` | Tocar «Iniciar sesión» | «fantasy game confirm button, soft whoosh into bright crystal chord, gentle low thump, elegant, 1.2 seconds» |
| `toque.mp3` | Botones y enlaces | «tiny glass tap, soft high crystal pluck, quiet UI click, 0.3 seconds» |
| `enfoque.mp3` | Enfocar un campo | «very soft airy glass tick, quiet, 0.2 seconds» |
| `alternar.mp3` | Mostrar contraseña, sonido, idioma | «two soft crystal notes rising, quiet toggle, 0.3 seconds» |
| `error.mp3` | Error del formulario | «gentle low two-note descending chime, soft, not harsh, 0.5 seconds» |

## Cómo ajustar los efectos

Todo está en `js/config.js`; el panel de desarrollo (Mayús + D) permite probar en vivo y copiar la configuración resultante.

- Estrellas: `stars.intensity`, `stars.twinkleSpeed`, `stars.countMobile/Desktop`.
- Bordes: `button.border`, `button.loop` (6–9 s), `button.inviteEvery`, `hud.border`.
- Destellos ópticos del cristal: `hud.flares` (cantidad, tamaño, intensidad, velocidad, vida).
- Nubes: `clouds.*.opacity / blur / drift / duration`.
- Luces: `lights.*` y `lights.breathe`.

## Verificado

En Chromium (emulación): iPhone 14 Pro, iPhone SE, Android de 360 px, iPhone Pro Max, tableta y escritorio; teclado (orden de tabulación), movimiento reducido del sistema y de la página, idioma, errores, carga, demo, mostrar contraseña, música (inicio, desvanecido, continuidad) y sin errores de consola.

## Pendiente

- Autenticación real, Google OAuth, registro (A02), recuperación (A03), Términos y Privacidad.
- Probar en iPhone y Android reales (rendimiento de WebGL, teclado, audio en iOS).
- Rendimiento medido solo en emulación; no hay cifra de FPS en dispositivos.
