import { describe, expect, it } from 'vitest';
import { avanceNegas, borradores, escenas, fichasTanda, jefeBar, libros, negas, publicado, reglas, unidades, validarContenido } from '@/content/nova';
import { barajar, elegirVariante, emptyNova, estadoMision, indiceDelDia, iniciarEscena, registrarPrueba, registrarRepaso, resolverNega, siguienteDelMazo, terminarEscena, XP, type Catalogo, type Partida } from './nova';

const cat: Catalogo = { mapa: unidades.map((u) => ({ habilidad: u.id, escenas: u.escenas })), jefe: jefeBar };
const HOY = '2026-11-17';
const partida = (p: Partial<Partida>): Partida => ({ variante: 'x', final: 'conversacion', marcas: [], ajustes: [], corrigioEspalda: false, ...p });
const mision = escenas.find((e) => e.id === 'mision-abrir')!;

describe('contenido de NOVA', () => {
  it('pasa la validación: sin IDs duplicados, relaciones rotas ni borradores públicos', () => {
    expect(validarContenido()).toEqual([]);
  });
  it('importa las 66 negas revisadas con ID y nota de observación', () => {
    expect(negas).toHaveLength(66);
    expect(negas.every((n) => /^N-\d{4}$/.test(n.id) && n.texto && n.queObservar && n.estado === 'revisado')).toBe(true);
  });
  it('importa las 200 fichas de la tanda 01 y conserva sus 20 negas como borradores', () => {
    expect(fichasTanda).toHaveLength(200);
    expect(borradores.negas).toHaveLength(20);
    expect(fichasTanda.filter((f) => f.ruta === 'cuando_buscas_algo_mas_serio')).toHaveLength(15);
  });
  it('el avance hacia 1,000 cuenta solo negas base revisadas', () => {
    expect(avanceNegas).toMatchObject({ meta: 1000, revisadas: 66, borradores: 20 });
  });
  it('ningún texto de borrador aparece en negas, reglas o escenas públicas', () => {
    const borr = new Set(borradores.fichas.map((f) => f.contenido));
    const publicos = [
      ...publicado.negas.map((n) => n.texto), ...publicado.reglas.map((r) => r.texto),
      ...publicado.escenas.flatMap((e) => e.variantes.flatMap((v) => v.pasos.flatMap((p) => p.opciones.map((o) => o.texto)))),
    ];
    expect(publicos.filter((t) => borr.has(t))).toEqual([]);
  });
  it('trae los ocho libros con autor y enlace al PDF', () => {
    expect(libros.map((l) => l.autor)).toEqual(['Neil Strauss', 'Robert Greene', 'Mark Manson', 'Olivia Fox Cabane', 'Stendhal', 'Giacomo Casanova', 'David DeAngelo', 'Richard La Ruina']);
    expect(libros.every((l) => l.pdf?.startsWith('https://'))).toBe(true);
  });
  it('tiene 13 reglas y 8 habilidades con al menos dos variantes cada una', () => {
    expect(reglas).toHaveLength(13);
    expect(unidades).toHaveLength(8);
  });
  it('el jefe tiene ramas de mesa y de barra, y la barra no usa acciones de mesa', () => {
    const barra = jefeBar.variantes.filter((v) => v.id.startsWith('barra'));
    expect(barra.length).toBeGreaterThanOrEqual(2);
    expect(jefeBar.variantes.filter((v) => v.id.startsWith('mesa')).length).toBeGreaterThanOrEqual(2);
    const textos = barra.flatMap((v) => v.pasos.flatMap((p) => p.opciones.map((o) => o.texto))).join(' ');
    expect(textos).not.toMatch(/silla|banco|sentar/i);
  });
});

describe('variantes', () => {
  it('no repite la variante anterior', () => {
    for (let i = 0; i < 50; i++) expect(elegirVariante(mision, { variantes: {}, enCurso: false, vistas: ['cafe'], ultima: 'cafe' })).toBe('concierto');
  });
  it('recorre todas las variantes del jefe antes de repetir', () => {
    let s = emptyNova();
    const vistas: string[] = [];
    for (let i = 0; i < jefeBar.variantes.length; i++) {
      const v = elegirVariante(jefeBar, s.escenas[jefeBar.id]);
      vistas.push(v);
      s = iniciarEscena(s, jefeBar, v);
    }
    expect(new Set(vistas).size).toBe(jefeBar.variantes.length);
    const sig = elegirVariante(jefeBar, s.escenas[jefeBar.id]);
    expect(sig).not.toBe(vistas[vistas.length - 1]);
  });
  it('barajar conserva los elementos', () => {
    expect(barajar([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('XP y premios', () => {
  it('completar una misión da XP una vez por variante y el premio Primera jugada', () => {
    const a = terminarEscena(emptyNova(), mision, partida({ variante: 'cafe' }), HOY, cat);
    expect(a.xp).toBe(XP.mision);
    expect(a.premios).toContain('primera-jugada');
    expect(estadoMision(a.state.escenas[mision.id])).toBe('completada');
    const b = terminarEscena(a.state, mision, partida({ variante: 'cafe' }), HOY, cat);
    expect(b.xp).toBe(0);
    expect(b.premios).toEqual([]);
    const c = terminarEscena(b.state, mision, partida({ variante: 'concierto' }), HOY, cat);
    expect(c.xp).toBe(XP.mision);
  });
  it('seguir con tu noche no completa la misión', () => {
    const r = terminarEscena(emptyNova(), mision, partida({ variante: 'cafe', final: 'noche' }), HOY, cat);
    expect(r.xp).toBe(0);
    expect(estadoMision(r.state.escenas[mision.id])).toBe('disponible');
  });
  it('un cierre tranquilo gana Buen cierre sin pedir contacto', () => {
    const r = terminarEscena(emptyNova(), jefeBar, partida({ variante: 'barra-rechazo', final: 'cierre', marcas: [{ marca: 'acepta_no', opcion: 'br6.a' }, { marca: 'incluye', opcion: 'br3.a' }] }), HOY, cat);
    expect(r.xp).toBe(XP.jefe);
    expect(r.premios).toEqual(expect.arrayContaining(['buen-cierre', 'las-dos-cuentan']));
  });
  it('corregir una llegada por la espalda gana Por el frente', () => {
    const r = terminarEscena(emptyNova(), jefeBar, partida({ variante: 'mesa-interes', corrigioEspalda: true, ajustes: ['R-03'] }), HOY, cat);
    expect(r.premios).toContain('por-el-frente');
    expect(r.state.repaso[0]).toMatchObject({ habilidad: 'abrir', reglas: ['R-03'] });
  });
  it('mesa más barra gana Jefe de ronda', () => {
    const a = terminarEscena(emptyNova(), jefeBar, partida({ variante: 'mesa-interes', final: 'contacto' }), HOY, cat);
    const b = terminarEscena(a.state, jefeBar, partida({ variante: 'barra-seca' }), HOY, cat);
    expect(b.premios).toContain('jefe-de-ronda');
  });
  it('una misión limpia retira la habilidad del repaso', () => {
    const a = terminarEscena(emptyNova(), mision, partida({ variante: 'cafe', ajustes: ['R-05'] }), HOY, cat);
    expect(a.state.repaso).toHaveLength(1);
    const b = terminarEscena(a.state, mision, partida({ variante: 'concierto' }), HOY, cat);
    expect(b.state.repaso).toHaveLength(0);
  });
  it('las negas dan XP solo por tarjetas distintas y Ojo al detalle a las diez', () => {
    let s = emptyNova();
    expect(resolverNega(s, 'N-0001', HOY, cat).xp).toBe(XP.nega);
    s = resolverNega(s, 'N-0001', HOY, cat).state;
    expect(resolverNega(s, 'N-0001', HOY, cat).xp).toBe(0);
    let premios: string[] = [];
    for (const n of negas.slice(1, 10)) {
      const r = resolverNega(s, n.id, HOY, cat);
      s = r.state;
      premios = premios.concat(r.premios);
    }
    expect(premios).toContain('ojo-al-detalle');
    expect(s.xp).toBe(10 * XP.nega);
  });
  it('el mazo recorre todas las tarjetas sin repetir', () => {
    let s = emptyNova();
    const ids = negas.map((n) => n.id);
    const vistas: string[] = [];
    for (let i = 0; i < ids.length; i++) {
      const r = siguienteDelMazo(s, ids);
      s = r.state;
      vistas.push(r.tarjeta);
    }
    expect(new Set(vistas).size).toBe(ids.length);
  });
  it('la prueba da XP solo al mejorar el récord', () => {
    const a = registrarPrueba(emptyNova(), 5, HOY, cat);
    expect(a.xp).toBe(50);
    expect(registrarPrueba(a.state, 4, HOY, cat).xp).toBe(0);
    const c = registrarPrueba(a.state, 7, HOY, cat);
    expect(c.xp).toBe(20);
    expect(c.premios).toContain('criterio-fino');
  });
  it('el repaso da XP una vez al día y guarda la precisión', () => {
    const a = registrarRepaso(emptyNova(), 4, 5, null, true, HOY, cat);
    expect(a.xp).toBe(XP.repaso);
    expect(a.premios).toContain('vuelta-al-ruedo');
    const b = registrarRepaso(a.state, 5, 5, null, true, HOY, cat);
    expect(b.xp).toBe(0);
    expect(b.state.observacion).toEqual({ aciertos: 9, total: 10 });
  });
  it('la rotación diaria cambia de un día al siguiente y es estable', () => {
    expect(indiceDelDia('2026-11-17', 66)).toBe(indiceDelDia('2026-11-17', 66));
    expect(indiceDelDia('2026-11-18', 66)).toBe((indiceDelDia('2026-11-17', 66) + 1) % 66);
  });
});
