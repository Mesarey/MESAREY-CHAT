import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { escenaPorId, libros, reglaPorId, unidades } from '@/content/nova';
import { estadoMision } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { Icon } from '@/ui/Icon';
import { Body, Display } from '@/ui/kit';
import { Accion, Chip, EstadoBadge, etiquetaEstado, Eyebrow, NovaHeader, NovaScreen, Panel, Sube } from '@/ui/nova';

export default function Unidad() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const u = unidades.find((x) => x.id === id);
  const st = useNova();
  if (!u) return <NovaScreen><NovaHeader title="Mapa CHAD" /><Body>No encontré esa habilidad.</Body></NovaScreen>;
  const regla = reglaPorId(u.regla)!;
  const hecho = st.ejercicios.includes(u.ejercicio.id);
  return (
    <NovaScreen>
      <NovaHeader title={`Habilidad ${u.orden}`} />
      <Sube style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1.4, borderColor: nova.accent, backgroundColor: nova.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={u.icono} size={28} tint={nova.accent} />
          </View>
          <Display size={27} style={{ flex: 1 }}>{u.titulo}</Display>
        </View>
        <Body size={15.5} style={{ color: nova.muted }}>{u.intro}</Body>
      </Sube>
      <Panel>
        <Eyebrow tint={nova.gold}>Regla de oro</Eyebrow>
        <Body size={16} bold>{regla.titulo}</Body>
        <Body size={14.5} style={{ color: nova.muted }}>{regla.texto}</Body>
      </Panel>
      <Panel>
        <Eyebrow>Microenseñanzas</Eyebrow>
        {u.micro.map((m) => (
          <View key={m} style={{ flexDirection: 'row', gap: 8 }}>
            <Icon name="chispa" size={15} tint={nova.accent} weight={1.8} />
            <Body size={14.5} style={{ flex: 1 }}>{m}</Body>
          </View>
        ))}
      </Panel>
      {u.escenas.map((eid) => {
        const e = escenaPorId(eid)!;
        const p = st.escenas[eid];
        const estado = estadoMision(p);
        const hechas = Object.keys(p?.variantes ?? {}).length;
        return (
          <Panel key={eid} strong>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Eyebrow>Misión</Eyebrow>
              <View style={{ flex: 1 }} />
              <Body size={12.5} style={{ color: estado === 'completada' ? nova.gold : nova.accent }}>{etiquetaEstado[estado]}</Body>
              <EstadoBadge estado={estado} size={22} />
            </View>
            <Display size={23}>{e.titulo}</Display>
            <Body size={14.5} style={{ color: nova.muted }}>{e.resumen}</Body>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {e.variantes.map((v) => <Chip key={v.id} label={v.nombre} tint={p?.variantes[v.id] ? nova.gold : nova.muted} icon={p?.variantes[v.id] ? 'check' : undefined} />)}
            </View>
            <Body size={12.5} style={{ color: nova.muted }}>{hechas} de {e.variantes.length} variantes · al volver a jugar cambia la escena. En cada decisión puede haber más de una respuesta que funcione; NOVA te dice qué comunica cada una.</Body>
            <Accion label={estado === 'completada' ? 'Jugar otra variante' : estado === 'en_progreso' ? 'Retomar misión' : 'Jugar misión'} icon="flecha" onPress={() => router.push(`/nova/jugar/${eid}`)} testID={`jugar-${eid}`} />
            <View style={{ gap: 3 }}>
              {e.referencias.map((r, i) => {
                const l = libros.find((x) => x.id === r.libro);
                return (
                  <Body key={i} size={12} style={{ color: nova.muted }}>
                    {r.clase === 'adaptacion' ? 'Adaptación' : 'Original de NOVA'}{l ? ` · ${l.titulo}, ${l.autor}` : ''}{r.pagina ? ` · ${r.pagina}` : ''}. {r.nota}
                  </Body>
                );
              })}
            </View>
          </Panel>
        );
      })}
      <Panel>
        <Eyebrow tint={nova.encaja}>Ejercicio de aplicación</Eyebrow>
        <Body size={16} bold>{u.ejercicio.titulo}</Body>
        <Body size={14.5} style={{ color: nova.muted }}>{u.ejercicio.texto}</Body>
        <Accion kind="ghost" label={hecho ? 'Hecho · +10 XP ya contados' : 'Ya lo hice'} icon="check" disabled={hecho} onPress={() => st.ejercicio(u.ejercicio.id)} testID="ejercicio-hecho" />
      </Panel>
    </NovaScreen>
  );
}
