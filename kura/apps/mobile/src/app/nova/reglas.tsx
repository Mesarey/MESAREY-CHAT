import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { reglas } from '@/content/nova';
import { nova } from '@/theme/nova';
import { Icon } from '@/ui/Icon';
import { Body, Tap } from '@/ui/kit';
import { Eyebrow, NovaHeader, NovaScreen, Sube } from '@/ui/nova';

export default function Reglas() {
  const router = useRouter();
  return (
    <NovaScreen>
      <NovaHeader title="Reglas de Oro" />
      <Body size={14} style={{ color: nova.muted }}>Las reglas de la casa. Reaparecen en el juego cada vez que aplican.</Body>
      {reglas.map((r, i) => (
        <Sube key={r.id} order={i % 8}>
          <Tap onPress={() => router.push(`/nova/ficha/${r.id}`)} testID={`regla-${r.id}`} accessibilityLabel={r.titulo}
            style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(243,207,138,0.35)', backgroundColor: nova.card }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1.2, borderColor: nova.gold, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={r.icono} size={22} tint={nova.gold} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Eyebrow tint={nova.gold}>Regla {i + 1}</Eyebrow>
              <Body size={16} bold>{r.titulo}</Body>
              <Body size={14.5} style={{ color: nova.muted }}>{r.texto}</Body>
            </View>
          </Tap>
        </Sube>
      ))}
    </NovaScreen>
  );
}
