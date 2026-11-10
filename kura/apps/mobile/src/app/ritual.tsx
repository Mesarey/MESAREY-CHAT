import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Image, View } from 'react-native';
import { breath, PRACTICE, themes } from '@/content/alaira';
import type { ApplyResult } from '@/domain/progression';
import { pickAffirmations } from '@/domain/selection';
import { useAffirmationPool, useToday } from '@/state/hooks';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Body, Display, Divider, GoldButton, Header, Rise, Screen } from '@/ui/kit';
import { BreathOrb, PracticeDone, SealStep, useBreath } from '@/ui/practice';

const BREATH_CYCLES = 5;
const AFFIRMATIONS = 3;
type Stage = 'intro' | 'respira' | 'afirma' | 'fin';

/** El ritual diario de Alaira: una pausa, un minuto de respiración y tres afirmaciones selladas. */
export default function Ritual() {
  const router = useRouter();
  const today = useToday();
  const pool = useAffirmationPool();
  const focusTheme = useKura((s) => s.focusTheme);
  const theme = themes.find((t) => t.id === focusTheme);
  const [stage, setStage] = useState<Stage>('intro');
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const started = useRef(0);

  const picked = useMemo(() => {
    const st = useKura.getState();
    return pickAffirmations(pool, AFFIRMATIONS, `ritual:${today}:${focusTheme}`, {
      focusThemes: [focusTheme],
      favoriteThemes: st.favoriteThemes,
      savedIds: st.savedAffirmations,
      recentIds: st.recentAffirmations,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, focusTheme]);

  const tick = useBreath(breath, BREATH_CYCLES, stage === 'respira', () => setStage('afirma'));

  const sealed = () => {
    if (step + 1 < picked.length) return setStep(step + 1);
    const st = useKura.getState();
    st.noteAffirmationsShown(picked.map((a) => a.id));
    setResult(st.completePractice(PRACTICE.ritual, (Date.now() - started.current) / 1000));
    setStage('fin');
  };

  return (
    <Screen moon={stage === 'respira' ? 'none' : 'center'} scroll={false}>
      <Header title="Ritual de hoy" />
      {stage === 'intro' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <Rise>
            <Image source={require('../../assets/alaira/alaira-face.jpg')} style={{ width: 132, height: 132, borderRadius: 66, borderWidth: 1.4, borderColor: color.gold }} accessibilityLabel="Alaira" />
          </Rise>
          <Rise order={1}>
            <Display size={34} style={{ textAlign: 'center' }}>Hagamos una pausa</Display>
          </Rise>
          <Divider />
          <Rise order={2}>
            <Body muted size={16} style={{ textAlign: 'center', maxWidth: 320 }}>
              Primero respiramos un minuto para volver al cuerpo. Después sellamos tres afirmaciones de {theme?.name.toLowerCase() ?? 'hoy'}.
            </Body>
          </Rise>
          <View style={{ alignSelf: 'stretch', marginTop: 18 }}>
            <GoldButton label="Estoy aquí" icon="flecha" filled onPress={() => { started.current = Date.now(); setStage('respira'); }} testID="ritual-empezar" />
          </View>
        </View>
      )}
      {stage === 'respira' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <BreathOrb pattern={breath} phase={tick.phase} left={tick.left} running />
          <Body muted testID="ritual-ciclo">Respiración {Math.min(tick.cycle + 1, BREATH_CYCLES)} de {BREATH_CYCLES}</Body>
        </View>
      )}
      {stage === 'afirma' && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <SealStep text={picked[step].text} index={step + 1} total={picked.length} onSealed={sealed} />
        </View>
      )}
      {stage === 'fin' && result && <PracticeDone result={result} title="Ritual completo" onClose={() => router.back()} />}
    </Screen>
  );
}
