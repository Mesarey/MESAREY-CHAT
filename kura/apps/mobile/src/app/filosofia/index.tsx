import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { allQuotes, works } from '@/content/alaira';
import { Icon } from '@/ui/Icon';
import { Body, Card, Display, GoldButton, Header, IconBadge, Rise, Screen, Tap } from '@/ui/kit';
import { normalize, SearchBox } from '@/ui/list';

export default function Filosofia() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const n = normalize(q.trim());
  const found = useMemo(() => (n ? allQuotes.filter((x) => normalize(`${x.text} ${x.work.title} ${x.work.author}`).includes(n)) : []), [n]);
  const open = (workId: string, quoteId?: string) => router.push({ pathname: '/filosofia/[obra]', params: { obra: workId, ...(quoteId ? { frase: quoteId } : {}) } });
  const surprise = () => {
    const pick = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    open(pick.work.id, pick.id);
  };

  return (
    <Screen moon="right">
      <Header />
      <Rise style={{ minHeight: 150, justifyContent: 'center' }}>
        <Display size={26}>Filosofía</Display>
        <Display size={36} style={{ maxWidth: 270, marginTop: 8 }}>Ideas para mirar la vida desde otro lugar.</Display>
      </Rise>
      <View style={{ gap: 12 }}>
        <GoldButton label="Sorpréndeme con una frase" onPress={surprise} testID="sorprendeme" />
        <SearchBox value={q} onChange={setQ} placeholder="Buscar autor, libro o frase" />
      </View>

      {n ? (
        <View style={{ gap: 10, marginTop: 16 }}>
          {found.length === 0 && <Body muted style={{ textAlign: 'center' }}>Ninguna frase coincide con «{q.trim()}».</Body>}
          {found.map((x) => (
            <Tap key={x.id} onPress={() => open(x.work.id, x.id)} accessibilityLabel={x.text}>
              <Card style={{ padding: 14 }}>
                <Display size={20}>{x.text}</Display>
                <Body muted size={13} style={{ marginTop: 4 }}>{x.work.author} · {x.source}</Body>
              </Card>
            </Tap>
          ))}
        </View>
      ) : (
        <>
          <Display size={26} style={{ marginTop: 20, marginBottom: 10 }}>Explora las obras</Display>
          <View style={{ gap: 12 }}>
            {works.map((w, i) => (
              <Rise key={w.id} order={i + 1}>
                <Tap onPress={() => open(w.id)} accessibilityLabel={w.title} testID={`obra-${w.id}`}>
                  <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <IconBadge name={w.icon} size={52} />
                    <View style={{ flex: 1 }}>
                      <Display size={27}>{w.title}</Display>
                      <Body muted size={14}>{w.author} · {w.quotes.length} frases</Body>
                    </View>
                    <Icon name="chevron" size={22} weight={1.8} />
                  </Card>
                </Tap>
              </Rise>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
