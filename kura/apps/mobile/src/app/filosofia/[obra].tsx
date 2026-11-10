import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { PRACTICE, works } from '@/content/alaira';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Display, Divider, GoldButton, Header, Rise, Screen, Tap } from '@/ui/kit';

/** Tiempo mínimo frente a la frase antes de poder marcarla: contemplar no es deslizar. */
const CONTEMPLATE_SEC = 4;

export default function Obra() {
  const { obra, frase } = useLocalSearchParams<{ obra: string; frase?: string }>();
  const work = works.find((w) => w.id === obra);
  const [index, setIndex] = useState(() => Math.max(0, work?.quotes.findIndex((q) => q.id === frase) ?? 0));
  const [readyId, setReadyId] = useState<string | null>(null);
  const [gained, setGained] = useState<Record<string, number>>({});
  const shownAt = useRef(0);
  const quoteId = work?.quotes[index]?.id ?? null;

  useEffect(() => {
    shownAt.current = Date.now();
    const t = setTimeout(() => setReadyId(quoteId), CONTEMPLATE_SEC * 1000);
    return () => clearTimeout(t);
  }, [quoteId]);
  useEffect(() => () => { Speech.stop(); }, []);

  if (!work) {
    return (
      <Screen>
        <Header title="Filosofía" />
        <Body muted style={{ textAlign: 'center', marginTop: 40 }}>No encontré esa obra.</Body>
      </Screen>
    );
  }
  const quote = work.quotes[index];
  const done = quote.id in gained;
  const ready = readyId === quote.id;
  const contemplate = () => {
    const r = useKura.getState().completePractice(PRACTICE.frase, (Date.now() - shownAt.current) / 1000);
    setGained((g) => ({ ...g, [quote.id]: r.xpGained }));
  };
  const go = (d: number) => setIndex((i) => (i + d + work.quotes.length) % work.quotes.length);

  return (
    <Screen moon="center" scroll={false}>
      <Header title={work.title} />
      <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
        <Body size={12} style={{ color: color.gold, letterSpacing: 2.5, textAlign: 'center' }}>{`FRASE ${index + 1} DE ${work.quotes.length}`}</Body>
        <Rise key={quote.id}>
          <Display size={quote.text.length > 110 ? 26 : 34} style={{ textAlign: 'center' }} testID="frase-texto">«{quote.text}»</Display>
        </Rise>
        <View style={{ alignItems: 'center' }}>
          <Divider />
          <Body muted style={{ marginTop: 6 }}>{work.author} · {quote.source}</Body>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 26, marginTop: 6 }}>
          <Tap onPress={() => go(-1)} accessibilityLabel="Frase anterior" style={{ padding: 10 }}>
            <Icon name="atras" size={26} weight={1.8} />
          </Tap>
          <Tap onPress={() => { Speech.stop(); Speech.speak(quote.text, { language: 'es-MX', rate: 0.9 }); }} accessibilityLabel="Escuchar" style={{ padding: 10 }}>
            <Icon name="sonido" size={26} tint={color.text} />
          </Tap>
          <Tap onPress={() => go(1)} accessibilityLabel="Frase siguiente" testID="frase-siguiente" style={{ padding: 10 }}>
            <Icon name="chevron" size={26} weight={1.8} />
          </Tap>
        </View>
      </View>
      {done ? (
        <Body style={{ color: color.gold, textAlign: 'center', minHeight: 54 }} testID="frase-xp">
          {gained[quote.id] > 0 ? `Contemplada · +${gained[quote.id]} de resonancia` : 'Contemplada'}
        </Body>
      ) : (
        <GoldButton label={ready ? 'La contemplé' : 'Quédate un momento con ella…'} filled={ready} disabled={!ready} onPress={contemplate} testID="contemplar" />
      )}
    </Screen>
  );
}
