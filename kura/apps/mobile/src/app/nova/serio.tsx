import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { escenasSerio, introSerio, libros } from '@/content/nova';
import { estadoMision } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { Icon } from '@/ui/Icon';
import { Body, Display } from '@/ui/kit';
import { Entrada, EstadoBadge, Eyebrow, NovaHeader, NovaScreen, Panel, Sube } from '@/ui/nova';

export default function Serio() {
  const router = useRouter();
  const escenas = useNova((s) => s.escenas);
  const stendhal = libros.find((l) => l.id === 'del-amor')!;
  return (
    <NovaScreen>
      <NovaHeader title="Algo más serio" />
      <Sube style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1.4, borderColor: nova.salida, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,182,255,0.12)' }}>
            <Icon name="serio" size={28} tint={nova.salida} />
          </View>
          <Display size={26} style={{ flex: 1 }}>{introSerio.titulo}</Display>
        </View>
        <Body size={15} style={{ color: nova.muted }}>{introSerio.texto}</Body>
      </Sube>
      <Panel>
        <Eyebrow tint={nova.salida}>Qué se trabaja</Eyebrow>
        {introSerio.puntos.map((p) => <Body key={p} size={14.5}>· {p}</Body>)}
      </Panel>
      {escenasSerio.map((e, i) => (
        <Sube key={e.id} order={i}>
          <Entrada icon="serio" tint={nova.salida} titulo={e.titulo} detalle={e.resumen} onPress={() => router.push(`/nova/jugar/${e.id}`)} testID={`serio-${e.id}`} right={<EstadoBadge estado={estadoMision(escenas[e.id])} />} />
        </Sube>
      ))}
      <Entrada icon="libro" tint={nova.salida} titulo={`${stendhal.titulo} · ${stendhal.autor}`} detalle="Fuente de esta ruta. Excluido de CHAD." onPress={() => router.push(`/nova/libro/${stendhal.id}`)} testID="serio-libro" />
    </NovaScreen>
  );
}
