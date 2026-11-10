import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { worlds } from '@/content/worlds';
import { levelInfo } from '@/domain/progression';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Display, Divider, Rise, Screen, Tap, Wordmark } from '@/ui/kit';

export default function Mundos() {
  const router = useRouter();
  const xp = useKura((s) => s.player.xp);
  return (
    <Screen moon="right">
      <Wordmark />
      <Rise style={{ alignItems: 'center', marginBottom: 14 }}>
        <Display size={44}>Mundos</Display>
        <Body muted size={16} style={{ textAlign: 'center' }}>Cada guía te acompaña en un área distinta.</Body>
        <Divider />
      </Rise>
      <View style={s.grid}>
        {worlds.map((w, i) => (
          <Rise key={w.id} order={i + 1} style={s.cell}>
            <Tap
              onPress={() => router.navigate('/')}
              disabled={!w.available}
              accessibilityLabel={w.available ? `Entrar al mundo de ${w.name}` : `${w.name}, próximamente`}
              testID={`mundo-${w.id}`}>
              <View style={[s.card, { backgroundColor: w.deep, borderColor: w.accent }]}>
                <View style={[s.emblem, { borderColor: w.accent }]}>
                  <Icon name={w.icon} size={30} tint={w.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Display size={30} style={{ color: w.accent }}>{w.name}</Display>
                  <Body bold size={13}>{w.role}</Body>
                  <Body muted size={13} style={{ marginTop: 4 }}>{w.pitch}</Body>
                  <Body size={12} style={[s.state, { color: w.available ? color.ink : w.accent, backgroundColor: w.available ? w.accent : 'transparent', borderColor: w.accent }]}>
                    {w.available ? `Nivel ${levelInfo(xp).level} · Entrar` : 'Próximamente'}
                  </Body>
                </View>
              </View>
            </Tap>
          </Rise>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { flexBasis: 300, flexGrow: 1 },
  card: { flexDirection: 'row', gap: 14, borderWidth: 1.2, borderRadius: 22, padding: 16, alignItems: 'center' },
  emblem: { width: 62, height: 62, borderRadius: 31, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.22)' },
  state: { alignSelf: 'flex-start', marginTop: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, overflow: 'hidden' },
});
