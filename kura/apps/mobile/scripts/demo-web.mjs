#!/usr/bin/env node
/**
 * Demo web de KURA en un solo HTML, con marco de teléfono.
 * Toma `dist/` (npx expo export -p web) y produce `dist-demo/index.html` con el código,
 * las imágenes y las fuentes incrustadas, para poder abrirlo sin servidor ni conexión.
 *   npx expo export -p web && node scripts/demo-web.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const dist = join(root, 'dist');
const out = join(root, 'dist-demo');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ttf': 'font/ttf', '.otf': 'font/otf', '.gif': 'image/gif', '.webp': 'image/webp' };

const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
let js = scripts.map((s) => readFileSync(join(dist, s), 'utf8')).join('\n;\n');

// Cada asset que el código pide por URL ("/assets/…") se reemplaza por un data: URI.
let n = 0;
js = js.replace(/"(\/assets\/[^"]+\.(?:png|jpe?g|gif|webp|ttf|otf))"/g, (whole, url) => {
  const f = join(dist, url);
  if (!existsSync(f)) return whole;
  n++;
  return JSON.stringify(`data:${mime[extname(f)]};base64,${readFileSync(f).toString('base64')}`);
});
if (/_expo\/static\/js\/web\/[^"]+\.js/.test(js.replace(/__expo-metro-runtime/g, ''))) console.warn('Aviso: el bundle aún carga partes por separado (asyncRoutes).');
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');

const page = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KURA · NOVA (demo)</title>
<style>
html { height: 100%; background: radial-gradient(circle at 50% 30%, #1b2a4a, #05070d 70%); }
body { margin: 0; overflow: hidden; }
#root { display: flex; height: 100%; flex: 1; }
/* En pantallas grandes, el body es el teléfono: lo que la app dibuje con position:fixed (popups) queda dentro. */
@media (min-width: 560px) and (min-height: 700px) {
  html { display: flex; align-items: center; justify-content: center; }
  body { width: 390px; height: min(844px, calc(100vh - 40px)); border-radius: 44px; border: 10px solid #0b0b10;
         box-shadow: 0 0 0 2px #2b2f3a, 0 30px 80px rgba(0,0,0,.6); transform: translateZ(0); position: relative; }
}
@media not all and (min-width: 560px) and (min-height: 700px) { html, body { height: 100%; } }
</style>
<script>
// Las rutas de la app viven en la URL; el visor puede servir la página en cualquier ruta, así que se arranca en "/".
try { if (location.pathname !== '/') history.replaceState(null, '', '/' + location.hash); } catch (e) {}
</script>
</head>
<body>
<div id="root"></div>
<script>${safe(js)}</script>
</body>
</html>
`;
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), page);
console.log(`✓ dist-demo/index.html · ${(page.length / 1e6).toFixed(1)} MB · ${n} assets incrustados`);
