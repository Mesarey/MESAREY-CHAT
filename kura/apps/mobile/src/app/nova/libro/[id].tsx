import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { libros, pasajes, type Pasaje } from '@/content/nova';
import { nova } from '@/theme/nova';
import { Body, Display } from '@/ui/kit';
import { Accion, Chip, Eyebrow, NovaHeader, NovaScreen, Panel } from '@/ui/nova';

const clase: Record<Pasaje['clase'], { label: string; tint: string }> = {
  cita_textual: { label: 'Cita del libro', tint: nova.gold },
  resumen_del_libro: { label: 'Resumen del libro', tint: nova.accent },
  original_nova: { label: 'Frase original de NOVA', tint: nova.encaja },
};

export default function Libro() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const l = libros.find((x) => x.id === id);
  if (!l) return <NovaScreen><NovaHeader title="Fuentes" /><Body>No encontré ese libro.</Body></NovaScreen>;
  const ps = pasajes.filter((p) => p.libro === l.id);
  return (
    <NovaScreen>
      <NovaHeader title="Fuente" />
      <Display size={28} testID="libro-titulo">{l.titulo}</Display>
      <Body size={16} bold style={{ color: nova.accent }}>{l.autor}</Body>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Chip label={l.ruta === 'principal' ? 'Ruta CHAD' : 'Ruta seria · excluido de CHAD'} tint={l.ruta === 'principal' ? nova.accent : nova.salida} />
        <Chip label={`${ps.length} pasajes`} tint={nova.muted} />
      </View>
      <Body size={14} style={{ color: nova.muted }}>{l.nota}</Body>
      {l.pdf && <Accion kind="ghost" label="Abrir PDF de lectura" icon="libro" onPress={() => Linking.openURL(l.pdf!)} testID="libro-pdf" />}
      <Panel>
        <Eyebrow>Índice</Eyebrow>
        {l.secciones.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            <Body size={14} style={{ flex: 1 }}>{s.titulo}</Body>
            {s.paginas && <Body size={12.5} style={{ color: nova.gold }}>{s.paginas}</Body>}
          </View>
        ))}
      </Panel>
      {ps.map((p) => (
        <Panel key={p.id}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Eyebrow tint={clase[p.clase].tint}>{clase[p.clase].label}</Eyebrow>
            {p.pagina && <Body size={12.5} style={{ color: nova.gold }}>{/^\d/.test(p.pagina) ? `PDF ${p.pagina}` : p.pagina}</Body>}
          </View>
          <Body size={15.5}>{p.clase === 'resumen_del_libro' ? p.texto : `«${p.texto}»`}</Body>
          {p.contexto !== '' && <Body size={13} style={{ color: nova.muted }}>{p.clase === 'resumen_del_libro' ? `Adaptación de NOVA: ${p.contexto}` : p.contexto}</Body>}
          <Body size={11.5} style={{ color: nova.muted }}>{l.titulo} · {l.autor} · {p.seccion} · {p.id}</Body>
        </Panel>
      ))}
    </NovaScreen>
  );
}
