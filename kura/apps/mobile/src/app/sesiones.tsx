import { View } from 'react-native';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Card, Header, Screen } from '@/ui/kit';

const fmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const kinds: Record<string, { label: string; icon: string }> = {
  respiracion: { label: 'Respiración', icon: 'orbita' },
  afirmaciones: { label: 'Afirmaciones', icon: 'loto' },
  ritual: { label: 'Ritual', icon: 'estrella' },
  filosofia: { label: 'Filosofía', icon: 'libro' },
};
const duration = (sec: number) => (sec < 60 ? `${sec} s` : `${Math.round(sec / 60)} min`);

export default function Sesiones() {
  const sessions = useKura((s) => s.player.sessions);
  const list = [...sessions].reverse();
  return (
    <Screen>
      <Header title="Mis sesiones" />
      {list.length === 0 && <Body muted style={{ textAlign: 'center', marginTop: 40 }}>Tus prácticas completadas aparecerán aquí.</Body>}
      <View style={{ gap: 10, marginTop: 8 }}>
        {list.map((x) => {
          const k = kinds[x.kind] ?? kinds.ritual;
          return (
            <Card key={x.eventId} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
              <Icon name={k.icon} size={26} />
              <View style={{ flex: 1 }}>
                <Body bold>{k.label}</Body>
                <Body muted size={13}>{fmt.format(x.at)} · {duration(x.durationSec)}</Body>
              </View>
              <Body style={{ color: color.gold }}>+{x.xp}</Body>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
