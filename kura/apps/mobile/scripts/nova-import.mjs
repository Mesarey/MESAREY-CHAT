#!/usr/bin/env node
/**
 * Importador de contenido de NOVA. Convierte las fuentes editoriales en datos versionados
 * que la app empaqueta (src/content/nova/data/*.json).
 *
 *   node scripts/nova-import.mjs negas  <NOVA_1000_Negas_Observacion.md>
 *   node scripts/nova-import.mjs tanda  <NOVA_MVP_Tanda_NN.json>
 *   node scripts/nova-import.mjs banco  <NOVA_Banco_Oficial.md>
 *
 * Sin argumento de ruta usa las copias en kura/content/nova/fuentes/.
 * Después de importar corre `npm run nova:validar`.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '../src/content/nova/data');
const fuentes = resolve(here, '../../../content/nova/fuentes');
const [, , cmd, argPath] = process.argv;

const write = (name, obj) => {
  writeFileSync(join(dataDir, name), JSON.stringify(obj, null, 1) + '\n');
  console.log(`✓ ${name}`);
};
const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').trim();

function importNegas(path) {
  const md = readFileSync(path, 'utf8');
  const negas = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^\|\s*(N-\d{4})\s*\|/);
    if (!m) continue;
    const [id, frase, observar] = cells(line);
    negas.push({
      id,
      // Se guarda sin las comillas angulares exteriores; la interfaz las pone.
      texto: frase.replace(/^«/, '').replace(/»$/, ''),
      queObservar: observar,
      estado: 'revisado',
      procedencia: /Ejemplo de Mitsuo/.test(observar) ? 'ejemplo_mitsuo' : 'nova_original',
    });
  }
  const dup = negas.map((n) => n.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) throw new Error(`IDs de nega duplicados: ${dup.join(', ')}`);
  write('negas.json', { version: 1, fuente: 'NOVA_1000_Negas_Observacion.md', meta: 1000, total: negas.length, negas });
}

function importTanda(path) {
  const src = JSON.parse(readFileSync(path, 'utf8'));
  const items = src.contenido;
  if (!Array.isArray(items)) throw new Error('La tanda no trae la lista «contenido».');
  const first = items[0]?.id ?? '';
  const tag = (first.match(/^nova-(mvp\d+)-/) ?? [])[1];
  if (!tag) throw new Error('No pude leer el número de tanda del primer ID (se espera nova-mvpNN-…).');
  // Se conserva cada ficha tal cual llega: ID, relaciones, ruta, módulo y estado editorial.
  write(`tanda-${tag.replace('mvp', '')}.json`, {
    version: src.version ?? 1,
    tanda: tag,
    fuente: path.split('/').pop().replace(/^[0-9a-f]{8}-/, ''),
    total: items.length,
    conteo: src.conteo ?? {},
    contenido: items,
  });
  console.log(`  Registra el archivo nuevo en src/content/nova/index.ts (lista «tandas»).`);
}

const LIBROS = [
  ['el-metodo', 'El método', 'Neil Strauss'],
  ['arte-seduccion', 'El arte de la seducción', 'Robert Greene'],
  ['models', 'Models', 'Mark Manson'],
  ['mito-carisma', 'El mito del carisma', 'Olivia Fox Cabane'],
  ['del-amor', 'Del amor', 'Stendhal'],
  ['memorias', 'Memorias', 'Giacomo Casanova'],
  ['double-your-dating', 'Double Your Dating', 'David DeAngelo'],
  ['arte-natural', 'El arte natural de la seducción', 'Richard La Ruina'],
];

function importBanco(path) {
  const lines = readFileSync(path, 'utf8').split('\n');
  const libros = [];
  const pasajes = [];
  let libro = null;
  let seccion = '';
  let header = null;
  let originales = false;
  const counters = {};
  const nextId = (lib, kind) => {
    const k = `${lib}-${kind}`;
    counters[k] = (counters[k] ?? 0) + 1;
    return `banco-${lib}-${kind}-${String(counters[k]).padStart(3, '0')}`;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      const def = LIBROS.find(([, t, a]) => h2[1].startsWith(`${t} · ${a}`));
      libro = def
        ? { id: def[0], titulo: def[1], autor: def[2], pdf: null, nota: '', ruta: def[0] === 'del-amor' ? 'cuando_buscas_algo_mas_serio' : 'principal', secciones: [] }
        : null;
      if (libro) libros.push(libro);
      seccion = '';
      header = null;
      originales = false;
      continue;
    }
    if (!libro) continue;
    const link = line.match(/^\[PDF[^\]]*\]\((.+?)\)/);
    if (link) { libro.pdf = link[1]; continue; }
    const h = line.match(/^#{3,5} (.+)$/);
    if (h) {
      seccion = plain(h[1]);
      const pag = seccion.match(/(?:PDF|pp?\.)\s*([\d–\-, ]+\d)/);
      libro.secciones.push({ titulo: seccion.replace(/\s*·\s*(?:PDF|pp?\.)\s*[\d–\-, ]+\d.*$/, ''), paginas: pag ? pag[1].trim() : null });
      header = null;
      originales = /^Frases(?: y afirmaciones)? originales/.test(seccion);
      continue;
    }
    if (!libro.nota && line.trim() && !line.startsWith('|') && !line.startsWith('-')) libro.nota = plain(line);
    if (originales) {
      const b = line.match(/^- (.+)$/);
      if (b) {
        pasajes.push({
          id: nextId(libro.id, 'nova'), libro: libro.id, ruta: libro.ruta, clase: 'original_nova', pagina: null,
          texto: plain(b[1]).replace(/^«/, '').replace(/»\.?$/, ''), contexto: `Frase original de NOVA a partir de ${libro.titulo}.`, seccion,
        });
      }
      continue;
    }
    if (line.startsWith('|')) {
      const row = cells(line);
      if (!header) { header = row; i++; continue; }
      // Solo se importan las tablas cuya primera columna registra la página.
      if (!/PDF|Página/i.test(header[0])) continue;
      const cita = /cita|pasaje/i.test(header[1]);
      pasajes.push({
        id: nextId(libro.id, cita ? 'cita' : 'nota'), libro: libro.id, ruta: libro.ruta,
        clase: cita ? 'cita_textual' : 'resumen_del_libro', pagina: row[0],
        texto: plain(row[1] ?? '').replace(/^«/, '').replace(/»\.?$/, ''),
        contexto: plain(row[2] ?? ''), seccion,
      });
    } else header = null;
  }
  const faltan = LIBROS.filter(([id]) => !libros.some((l) => l.id === id)).map(([, t]) => t);
  if (faltan.length) throw new Error(`No encontré estos libros en el banco: ${faltan.join(', ')}`);
  write('libros.json', { version: 1, fuente: 'NOVA_Banco_Oficial.md', libros, pasajes });
}

const defaults = { negas: 'NOVA_1000_Negas_Observacion.md', tanda: 'NOVA_MVP_Tanda_01.json', banco: 'NOVA_Banco_Oficial.md' };
if (!defaults[cmd]) {
  console.error('Uso: node scripts/nova-import.mjs <negas|tanda|banco> [ruta]');
  process.exit(1);
}
const path = argPath ? resolve(argPath) : join(fuentes, defaults[cmd]);
if (!existsSync(path)) {
  console.error(`No existe ${path}`);
  process.exit(1);
}
({ negas: importNegas, tanda: importTanda, banco: importBanco })[cmd](path);
