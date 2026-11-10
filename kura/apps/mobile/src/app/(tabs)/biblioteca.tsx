import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { themes, works } from '@/content/alaira';
import { color } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Display, Divider, Rise, Screen, Tap } from '@/ui/kit';
import { LinkRow, normalize, SearchBox } from '@/ui/list';

const sections: { title: string; text: string; icon: string; href: Href }[] = [
  { title: 'Afirmaciones', text: 'Explora por categoría', icon: 'loto', href: '/afirmaciones' },
  { title: 'Filosofía', text: 'Autores, libros e ideas para hoy', icon: 'libro', href: '/filosofia' },
  { title: 'Respiración', text: 'Ejercicios para volver a tu ritmo', icon: 'orbita', href: '/respiracion' },
];

export default function Biblioteca() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const n = normalize(q.trim());
    if (!n) return null;
    return [
      ...themes.filter((t) => normalize(`${t.name} ${t.tagline}`).includes(n)).map((t) => ({ key: t.id, title: t.name, text: 'Afirmaciones · ' + t.tagline, icon: t.icon, href: `/afirmaciones/${t.id}` as Href })),
      ...works.filter((w) => normalize(`${w.title} ${w.author}`).includes(n)).map((w) => ({ key: w.id, title: w.title, text: `Filosofía · ${w.author}`, icon: w.icon, href: `/filosofia/${w.id}` as Href })),
      ...sections.filter((x) => normalize(x.title).includes(n)).map((x) => ({ key: x.title, ...x })),
    ];
  }, [q]);

  return (
    <Screen moon="right">
      <Rise style={{ minHeight: 190, justifyContent: 'center' }}>
        <Body style={{ letterSpacing: 6, fontSize: 16 }}>KURA</Body>
        <Display size={50} style={{ marginTop: 26 }}>Biblioteca</Display>
        <Body muted>Encuentra lo que necesitas hoy.</Body>
      </Rise>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Display size={19}>Elige tu camino</Display>
        <Divider />
      </View>
      <SearchBox value={q} onChange={setQ} placeholder="Buscar un tema" />

      <View style={{ gap: 12, marginTop: 16 }}>
        {(results ?? sections.map((x) => ({ key: x.title, ...x }))).map((x, i) => (
          <Rise key={x.key} order={i + 1}>
            <LinkRow title={x.title} text={x.text} icon={x.icon} onPress={() => router.push(x.href)} testID={`ir-${x.key}`} />
          </Rise>
        ))}
        {results?.length === 0 && <Body muted style={{ textAlign: 'center', marginTop: 12 }}>No encontré nada con «{q.trim()}». Prueba con otro tema.</Body>}
      </View>

      <View style={s.footer}>
        <Tap onPress={() => router.push('/memoria')} accessibilityLabel="Mi memoria" testID="ir-memoria" style={s.footerItem}>
          <Icon name="notas" size={24} />
          <Body size={16}>Mi memoria</Body>
          <Icon name="chevron" size={18} weight={1.8} />
        </Tap>
        <View style={{ width: 1, height: 26, backgroundColor: color.faint }} />
        <Tap onPress={() => router.push('/sesiones')} accessibilityLabel="Mis sesiones" testID="ir-sesiones" style={s.footerItem}>
          <Icon name="barras" size={24} />
          <Body size={16}>Mis sesiones</Body>
          <Icon name="chevron" size={18} weight={1.8} />
        </Tap>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: color.faint },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 6 },
});
