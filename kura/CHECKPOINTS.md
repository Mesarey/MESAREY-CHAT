# Checkpoints

Puntos guardados a los que se puede volver exactamente.

| Checkpoint | Fecha | Commit | Web app (versión) | Qué incluye |
|---|---|---|---|---|
| **A01 · Checkpoint 1** | 2026-11-21 | `9230788932ed3035db1e7d81a1f3b518a484bcb4` | `1795251053-0e08` | A01 Observatorio en español e inglés: escena unificada con nubes y luces, estrellas con paralaje y entrada sincronizada, destellos ópticos horizontales lentos en botón y cristal, reflejo e invitación en reposo del botón, logo con neón tenue, formulario accesible, música en bucle con desvanecido y sonidos de acceso concedido / fallido. |

## Cómo volver a un checkpoint

Restaurar los archivos de A01 tal como estaban, sin perder el historial:

```bash
git checkout 9230788932ed3035db1e7d81a1f3b518a484bcb4 -- kura/a01
```

Después se hace un commit nuevo con ese estado.
