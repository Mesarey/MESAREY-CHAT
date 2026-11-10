import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { PRACTICE, themes } from '@/content/alaira';
import type { ApplyResult } from '@/domain/progression';
import { pickAffirmations } from '@/domain/selection';
import { useAffirmationPool } from '@/state/hooks';
import { useKura } from '@/state/store';
import { Body, Header, Screen } from '@/ui/kit';
import { PracticeDone, SealStep } from '@/ui/practice';

const COUNT = 3;

export default function TemaSesion() {
  const { tema } = useLocalSearchParams<{ tema: string }>();
  const router = useRouter();
  const theme = themes.find((t) => t.id === tema);
  const pool = useAffirmationPool();
  const [startedAt] = useState(() => Date.now());
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ApplyResult | null>(null);

  // La selección se fija al entrar: no debe cambiar a mitad de la sesión.
  const picked = useMemo(() => {
    const st = useKura.getState();
    const themed = pool.filter((a) => a.theme === tema);
    return pickAffirmations(themed, COUNT, `tema:${tema}:${startedAt}`, {
      focusThemes: [],
      favoriteThemes: [],
      savedIds: st.savedAffirmations,
      recentIds: st.recentAffirmations,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema, startedAt]);

  if (!theme || picked.length === 0) {
    return (
      <Screen>
        <Header title="Afirmaciones" />
        <Body muted style={{ textAlign: 'center', marginTop: 40 }}>No encontré esa categoría.</Body>
      </Screen>
    );
  }

  const next = () => {
    if (step + 1 < picked.length) return setStep(step + 1);
    const st = useKura.getState();
    st.noteAffirmationsShown(picked.map((a) => a.id));
    setResult(st.completePractice(PRACTICE.afirmaciones, (Date.now() - startedAt) / 1000));
  };

  return (
    <Screen moon="center" scroll={false}>
      <Header title={theme.name} />
      {result ? (
        <PracticeDone result={result} title="Afirmaciones selladas" onClose={() => router.back()} />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <SealStep text={picked[step].text} index={step + 1} total={picked.length} onSealed={next} />
        </View>
      )}
    </Screen>
  );
}
