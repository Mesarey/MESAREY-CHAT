import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { avanceNegas, borradores, escenas, fichasTanda, NOVA_CONTENT_VERSION, publicado, tandas, validarContenido, type FichaTanda } from '@/content/nova';
import { nova } from '@/theme/nova';
import { Body, Display, Tap } from '@/ui/kit';
import { Barra, Chip, Eyebrow, NovaHeader, NovaScreen, Panel } from '@/ui/nova';

const tipos: FichaTanda['tipo'][] = ['nega', 'escenario', 'frase', 'tip', 'ejercicio'];

/** Flujo editorial: el único lugar donde se consultan los borradores. */
export default function Editorial() {
  const router = useRouter();
  const hallazgos = useMemo(() => validarContenido(), []);
  const [tipo, setTipo] = useState<FichaTanda['tipo']>('nega');
  const lista = fichasTanda.filter((f) => f.tipo === tipo);
  return (
    <NovaScreen>
      <NovaHeader title="Flujo editorial" />
      <Body size={13.5} style={{ color: nova.muted }}>Esta sección es de trabajo. Lo que aparece aquí como borrador no sale en el juego, en el catálogo ni en el widget.</Body>
      <Panel strong>
        <Eyebrow tint={hallazgos.length ? nova.ajusta : nova.encaja}>Validación · contenido v{NOVA_CONTENT_VERSION}</Eyebrow>
        <Display size={22} testID="editorial-validacion">{hallazgos.length === 0 ? 'Sin hallazgos' : `${hallazgos.length} hallazgos`}</Display>
        <Body size={13} style={{ color: nova.muted }}>Revisa IDs duplicados, relaciones rotas y borradores en la experiencia pública.</Body>
        {hallazgos.slice(0, 20).map((h, i) => <Body key={i} size={12.5} style={{ color: nova.ajusta }}>{h.tipo} · {h.id} · {h.detalle}</Body>)}
        <Body size={12.5} style={{ color: nova.muted }}>Público: {publicado.escenas.length} escenas · {escenas.reduce((n, e) => n + e.variantes.length, 0)} variantes · {publicado.negas.length} negas · {publicado.reglas.length} reglas · {publicado.casos.length} casos de prueba.</Body>
      </Panel>
      <Panel>
        <Eyebrow tint={nova.gold}>Avance hacia {avanceNegas.meta.toLocaleString('es-MX')} negas</Eyebrow>
        <Barra value={avanceNegas.revisadas / avanceNegas.meta} tint={nova.gold} />
        <Body size={14.5} testID="editorial-avance">{avanceNegas.revisadas} base revisadas · {avanceNegas.variantes} variantes (aparte) · {avanceNegas.borradores} borradores (aparte)</Body>
      </Panel>
      {tandas.map((t) => (
        <Panel key={t.tanda}>
          <Eyebrow>Tanda {t.tanda} · {t.fuente}</Eyebrow>
          <Body size={14.5} testID="editorial-tanda">{t.total} fichas · {t.contenido.filter((f) => f.estado === 'borrador').length} en borrador</Body>
          <Body size={13} style={{ color: nova.muted }}>{Object.entries(t.conteo).map(([k, v]) => `${v} ${k}`).join(' · ')}</Body>
          <Body size={13} style={{ color: nova.muted }}>Rutas: {t.contenido.filter((f) => f.ruta === 'principal').length} CHAD · {t.contenido.filter((f) => f.ruta !== 'principal').length} ruta seria</Body>
        </Panel>
      ))}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {tipos.map((t) => (
          <Tap key={t} onPress={() => setTipo(t)} testID={`editorial-tipo-${t}`} accessibilityLabel={t} accessibilityState={{ selected: tipo === t }}
            style={{ paddingHorizontal: 14, minHeight: 40, justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: tipo === t ? nova.accent : nova.line, backgroundColor: tipo === t ? nova.accentSoft : 'transparent' }}>
            <Body size={13.5} style={{ color: tipo === t ? nova.accent : nova.muted }}>{t} · {fichasTanda.filter((f) => f.tipo === t).length}</Body>
          </Tap>
        ))}
      </View>
      <Body size={12.5} style={{ color: nova.muted }} testID="editorial-conteo">{lista.length} fichas · {tipo === 'nega' ? `${borradores.negas.length} negas en borrador` : 'todas en borrador'}</Body>
      {lista.map((f) => (
        <Tap key={f.id} onPress={() => router.push(`/nova/ficha/${f.id}`)} testID={`borrador-${f.id}`} accessibilityLabel={f.titulo}
          style={{ gap: 4, padding: 13, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,199,115,0.45)', backgroundColor: 'rgba(16,42,80,0.35)' }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Chip label={f.estado} tint={nova.ajusta} />
            <Body size={11.5} style={{ color: nova.muted, flex: 1 }} numberOfLines={1}>{f.id} · {f.modulo}</Body>
          </View>
          <Body size={14.5}>{f.contenido}</Body>
        </Tap>
      ))}
    </NovaScreen>
  );
}
