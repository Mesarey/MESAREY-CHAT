import { View } from 'react-native';
import { useKura } from '@/state/store';
import { Body, Card, Header, Screen } from '@/ui/kit';

const fmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export default function Memoria() {
  const memory = useKura((s) => s.memory);
  return (
    <Screen>
      <Header title="Mi memoria" />
      {memory.length === 0 && (
        <Body muted style={{ textAlign: 'center', marginTop: 40 }}>Lo que le cuentes a Alaira en «Hoy» se guarda aquí, solo en este dispositivo.</Body>
      )}
      <View style={{ gap: 12, marginTop: 8 }}>
        {memory.map((m) => (
          <Card key={m.id} style={{ padding: 16 }}>
            <Body muted size={12.5}>{fmt.format(m.at)}</Body>
            <Body size={16} style={{ marginTop: 4 }}>{m.text}</Body>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
