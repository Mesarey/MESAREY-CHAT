import * as Speech from 'expo-speech';
import { View } from 'react-native';
import { affirmations, themes } from '@/content/alaira';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Card, Display, Header, Screen, Tap } from '@/ui/kit';

export default function Guardadas() {
  const saved = useKura((s) => s.savedAffirmations);
  const toggle = useKura((s) => s.toggleSavedAffirmation);
  const list = saved.map((id) => affirmations.find((a) => a.id === id)).filter((a) => a !== undefined);

  return (
    <Screen>
      <Header title="Mis guardadas" />
      {list.length === 0 && (
        <Body muted style={{ textAlign: 'center', marginTop: 40 }}>Aún no guardas afirmaciones. Toca «Guardar» en la afirmación de hoy para verla aquí.</Body>
      )}
      <View style={{ gap: 12, marginTop: 8 }}>
        {list.map((a) => (
          <Card key={a.id}>
            <Body size={12} style={{ color: color.gold, letterSpacing: 2 }}>{(themes.find((t) => t.id === a.theme)?.name ?? '').toUpperCase()}</Body>
            <Display size={26} style={{ marginVertical: 8 }}>{a.text}</Display>
            <View style={{ flexDirection: 'row', gap: 22 }}>
              <Tap onPress={() => { Speech.stop(); Speech.speak(a.text, { language: 'es-MX', rate: 0.9 }); }} accessibilityLabel="Escuchar" style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 4 }}>
                <Icon name="sonido" size={20} tint={color.text} />
                <Body size={14}>Escuchar</Body>
              </Tap>
              <Tap onPress={() => toggle(a.id)} accessibilityLabel="Quitar de guardadas" style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 4 }}>
                <Icon name="cerrar" size={18} tint={color.muted} />
                <Body size={14} muted>Quitar</Body>
              </Tap>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
