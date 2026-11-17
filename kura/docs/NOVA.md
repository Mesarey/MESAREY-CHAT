# NOVA en KURA

Mundo de conversación, atracción y lectura social. Entrada: **KURA → Mundos → NOVA** (`/nova`).

## Qué incluye

| Modo | Ruta | Qué hace |
|---|---|---|
| Presentación | `/nova` (primera vez) | Reglas de Oro en versión corta antes de la primera partida |
| Mapa CHAD | `/nova/mapa`, `/nova/unidad/[id]` | 8 habilidades: regla de oro, microenseñanzas, misión con 2 variantes, ejercicio |
| Jefe de ronda | `/nova/jugar/jefe-bar-dos-amigas` | Dos amigas en el bar: 3 variantes de mesa (interés mutuo, quieren su plática, sin espacio) y 2 de barra (respuesta seca, rechazo explícito) |
| Prueba de Escenarios | `/nova/prueba` | Ronda de 8 casos sin repetir que mezcla las 6 categorías; guarda el récord |
| Arena de Negas | `/nova/arena` | Mazo con las 66 negas revisadas y 6 momentos tensos donde lo correcto es «Dejar pasar» |
| Repaso | `/nova/repaso` | Agenda lo que costó, observación vs. suposición y reformulación oral con autoevaluación |
| Ruta seria | `/nova/serio` | Idealización, reciprocidad, expectativas y compatibilidad. Fuera de CHAD |
| Premios | `/nova/premios` | 13 premios con la condición que los desbloqueó |
| Catálogo, Fuentes, Editorial | `/nova/catalogo`, `/nova/fuentes`, `/nova/editorial` | Negas revisadas; índice de los 8 libros; borradores y validación |
| Ficha | `/nova/ficha/[id]` | Nega (`N-…`), regla (`R-…`) o ficha de tanda. Es el destino del widget (`kura://nova/ficha/…`) |

XP: misión 40, jefe 80, ruta seria 40 (una vez por variante), nega distinta 5, prueba 10 por punto de mejora sobre el récord, repaso 15 (una vez al día), ejercicio 10. Reintentar nunca suma XP.

## Archivos

```
src/content/nova/        Contenido versionado (types, reglas, unidades, jefe, serio, prueba, premios, index con validación)
src/content/nova/data/   JSON importados: negas, tanda-01, libros, reglas
src/domain/nova.ts       Reglas puras: variantes, XP, premios, mazo, repaso (con pruebas)
src/state/nova.ts        Progreso persistido en el dispositivo (kura.nova.v1)
src/app/nova/            Pantallas
native/nova-widget/      Widget Android (Kotlin + recursos)
plugins/withNovaWidget.js  Config plugin que instala el widget al hacer prebuild
scripts/nova-import.mjs  Importador
../../content/nova/fuentes/  Copias de las fuentes editoriales
```

## Importar una segunda tanda

1. Copia el archivo a `kura/content/nova/fuentes/NOVA_MVP_Tanda_02.json` (mismo formato que la 01: `version`, `conteo`, `contenido[]` con `id`, `ruta`, `modulo`, `tipo`, `estado`, `relacionados`…).
2. `npm run nova:importar -- tanda ../../content/nova/fuentes/NOVA_MVP_Tanda_02.json` → genera `src/content/nova/data/tanda-02.json`.
3. En `src/content/nova/index.ts` importa el archivo y agrégalo a `tandas`.
4. `npm run nova:validar`. Falla si hay IDs duplicados, relaciones rotas o un borrador en la experiencia pública.
5. Los borradores se ven solo en Flujo editorial. Para publicar una nega, pásala a `NOVA_1000_Negas_Observacion.md` revisada y corre `npm run nova:importar -- negas`.

Banco Oficial: `npm run nova:importar -- banco <NOVA_Banco_Oficial.md>` regenera `libros.json` (libro, autor, PDF, índice y pasajes con página y clase: cita, resumen u original de NOVA).

## Compilar el APK

```bash
npm run android:apk
```

Requiere JDK 17, Android SDK (platform 37, build-tools 37, NDK 27.1) y acceso a `dl.google.com` y `repo.reactnative.dev`. Sale en `android/app/build/outputs/apk/release/app-release.apk`, firmado con la llave debug que genera Expo (no hay llave de publicación en el repo).

## Demo web en un solo HTML

```bash
./scripts/demo-web.sh
```

Exporta la web sin rutas asíncronas (solo durante el comando; `app.json` se restaura) y arma `dist-demo/index.html` con el código, las imágenes y las fuentes incrustadas. En pantallas anchas se muestra dentro de un marco de teléfono de 390 × 844; en un teléfono ocupa toda la pantalla. El progreso se guarda en el navegador de quien lo abre.
