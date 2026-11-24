# Checkpoints

Puntos guardados a los que se puede volver exactamente.

| Checkpoint | Fecha | Commit | Web app (versión) | Qué incluye |
|---|---|---|---|---|
| **A01 · Checkpoint 1** | 2026-11-21 | `9230788932ed3035db1e7d81a1f3b518a484bcb4` | `1795251053-0e08` | A01 Observatorio en español e inglés: escena unificada con nubes y luces, estrellas con paralaje y entrada sincronizada, destellos ópticos horizontales lentos en botón y cristal, reflejo e invitación en reposo del botón, logo con neón tenue, formulario accesible, música en bucle con desvanecido y sonidos de acceso concedido / fallido. |
| **A01 · Checkpoint 2** | 2026-11-22 | `4cf4dd7bc54d14bac3530ba7c06ef37b0c000944` | `1795329513-0d25` | A01–A05 completas (iniciar sesión, crear cuenta, recuperar contraseña, enlace enviado, restaurando sesión) con visor de teléfono, giroscopio, 3 canciones en orden y en bucle que continúan donde se quedaron, SFX igualados en volumen, Términos y Privacidad en español e inglés. Nuevo: el HUD crece en teléfonos altos con más espacio entre botones, English / Reducir efectos / Términos / Privacidad usan el mismo sonido, y el idioma sigue al teléfono (español → español; cualquier otro → inglés). |
| **Checkpoint 3** | 2026-11-24 | `4ccf4d9773aeea86ec287077572095e63d8d5fd5` | `1795502850-5e60` | A01–A08: A06 Bienvenida con Alaira rehecha con el paquete de paralaje (cielo, Alaira y arquitectura en un plano, estrellas nítidas como A01, parpadeo del parche, estrella 3D 1.3× con polvo de oro y sonido muy suave, nubes del pie hasta el borde), A07 «¿Cómo te llamo?» y A08 «¿Cuál es tu fecha de nacimiento?» con el mismo marco (al cambiar solo cambia el contenido), sonidos de Empezar y de falta un dato, versión «KURA_001 · Versión MVP», vidrio del HUD desenfocado desde la entrada, campos vacíos al abrir, selector de idioma en el visor. |

## Cómo volver a un checkpoint

Restaurar los archivos de A01 tal como estaban, sin perder el historial.

Checkpoint 3:

```bash
git checkout 4ccf4d9773aeea86ec287077572095e63d8d5fd5 -- kura/a01
```

Checkpoint 2:

```bash
git checkout 4cf4dd7bc54d14bac3530ba7c06ef37b0c000944 -- kura/a01
```

Checkpoint 1:

```bash
git checkout 9230788932ed3035db1e7d81a1f3b518a484bcb4 -- kura/a01
```

Después se hace un commit nuevo con ese estado.
