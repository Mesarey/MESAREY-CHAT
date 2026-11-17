import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { reglaPorId, unidades } from '@/content/nova';
import { estadoMision, type EstadoMision } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { Icon } from '@/ui/Icon';
import { Body, Display, Tap } from '@/ui/kit';
import { Barra, EstadoBadge, etiquetaEstado, Eyebrow, NovaHeader, NovaScreen, Sube } from '@/ui/nova';

export default function Mapa() {
  const router = useRouter();
  const escenas = useNova((s) => s.escenas);
  const estados = unidades.map((u): EstadoMision => {
    const es = u.escenas.map((e) => estadoMision(escenas[e]));
    return es.includes('completada') ? 'completada' : es.includes('en_progreso') ? 'en_progreso' : 'disponible';
  });
  const hechas = estados.filter((e) => e === 'completada').length;
  return (
    <NovaScreen>
      <NovaHeader title="Mapa CHAD" />
      <View style={{ gap: 6 }}>
        <Eyebrow>Ruta de ocho habilidades</Eyebrow>
        <Body size={14} style={{ color: nova.muted }}>Juega en el orden que quieras. Cada habilidad trae una regla de oro, una misión con variantes y un ejercicio para la calle.</Body>
        <Barra value={hechas / unidades.length} tint={nova.gold} />
        <Body size={12.5} style={{ color: nova.muted }} testID="mapa-avance">{hechas} de {unidades.length} completadas</Body>
      </View>
      <View>
        {unidades.map((u, i) => {
          const estado = estados[i];
          const tint = estado === 'completada' ? nova.gold : nova.accent;
          return (
            <Sube key={u.id} order={i}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'center', width: 52 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: tint, backgroundColor: estado === 'completada' ? 'rgba(243,207,138,0.14)' : nova.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={u.icono} size={26} tint={tint} />
                  </View>
                  {i < unidades.length - 1 && <View style={{ width: 2, flex: 1, minHeight: 18, backgroundColor: estado === 'completada' ? nova.gold : nova.line, opacity: 0.7 }} />}
                </View>
                <Tap onPress={() => router.push(`/nova/unidad/${u.id}`)} testID={`unidad-${u.id}`} accessibilityLabel={`${u.titulo}, ${etiquetaEstado[estado]}`} outerStyle={{ flex: 1, marginBottom: 12 }}
                  style={{ backgroundColor: nova.card, borderWidth: 1, borderColor: nova.line, borderRadius: 18, padding: 13, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Body size={12} bold style={{ color: tint }}>{u.orden}</Body>
                    <Display size={21} style={{ flex: 1 }}>{u.titulo}</Display>
                    <EstadoBadge estado={estado} size={22} />
                  </View>
                  <Body size={13} style={{ color: nova.muted }}>{reglaPorId(u.regla)?.titulo}</Body>
                  <Body size={12} style={{ color: tint }}>{etiquetaEstado[estado]}</Body>
                </Tap>
              </View>
            </Sube>
          );
        })}
      </View>
    </NovaScreen>
  );
}
