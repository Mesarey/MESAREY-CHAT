import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { breath, PRACTICE } from '@/content/alaira';
import type { ApplyResult } from '@/domain/progression';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Display, Divider, GoldButton, Header, Screen, Tap } from '@/ui/kit';
import { BreathOrb, phaseLabel, phasesOf, PracticeDone, useBreath } from '@/ui/practice';

const cycleSec = breath.inhala + breath.sosten + breath.exhala;
const options = [
  { minutes: 1, practice: PRACTICE.respira1 },
  { minutes: 5, practice: PRACTICE.respira5 },
];

export default function Respiracion() {
  const router = useRouter();
  const [choice, setChoice] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const opt = options[choice];
  const cycles = Math.round((opt.minutes * 60) / cycleSec);

  const tick = useBreath(breath, cycles, running, (elapsed) => {
    setRunning(false);
    setResult(useKura.getState().completePractice(opt.practice, elapsed));
  });

  if (result) {
    return (
      <Screen moon="center" scroll={false}>
        <Header />
        <PracticeDone result={result} title="Volviste a tu ritmo" onClose={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen moon="none">
      <Header />
      <View style={{ alignItems: 'center' }}>
        <Display size={46}>Respiración</Display>
        <Divider />
        <Body muted size={17}>Vuelve a tu ritmo</Body>
        <View style={{ marginVertical: 10 }}>
          <BreathOrb pattern={breath} phase={tick.phase} left={tick.left} running={running} />
        </View>
      </View>

      <View style={s.phases}>
        <View style={s.track} />
        {phasesOf(breath).map((p) => {
          const active = running && tick.phase === p.phase;
          return (
            <View key={p.phase} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
              <View style={[s.dot, active && { backgroundColor: color.gold, borderColor: color.gold }]} />
              <Body style={active && { color: color.gold }}>{phaseLabel[p.phase]}</Body>
              <Body muted size={13}>{p.seconds} segundos</Body>
            </View>
          );
        })}
      </View>

      {running ? (
        <View style={{ marginTop: 22, gap: 10 }}>
          <Body muted style={{ textAlign: 'center' }} testID="ciclo">Ciclo {Math.min(tick.cycle + 1, cycles)} de {cycles}</Body>
          <GoldButton label="Terminar" onPress={() => setRunning(false)} testID="terminar" />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
            {options.map((o, i) => (
              <Tap key={o.minutes} onPress={() => setChoice(i)} accessibilityLabel={`${o.minutes} ${o.minutes === 1 ? 'minuto' : 'minutos'}`} accessibilityState={{ selected: i === choice }} testID={`dur-${o.minutes}`} style={[s.option, i === choice && s.optionActive]}>
                <Icon name="reloj" size={20} tint={i === choice ? color.gold : color.text} />
                <Body style={i === choice && { color: color.gold }}>{o.minutes} {o.minutes === 1 ? 'minuto' : 'minutos'}</Body>
              </Tap>
            ))}
          </View>
          <View style={{ marginTop: 16 }}>
            <GoldButton label="Comenzar" icon="flecha" onPress={() => setRunning(true)} testID="comenzar" />
          </View>
        </>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  phases: { flexDirection: 'row', marginTop: 6 },
  track: { position: 'absolute', top: 6, left: '16.6%', right: '16.6%', height: 1, backgroundColor: color.faint },
  dot: { width: 13, height: 13, borderRadius: 7, borderWidth: 1.4, borderColor: color.text, backgroundColor: color.ink },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 24, borderWidth: 1.2, borderColor: color.faint, paddingVertical: 11, paddingHorizontal: 20, backgroundColor: color.card },
  optionActive: { borderColor: color.gold, backgroundColor: 'rgba(243,207,138,0.14)' },
});
