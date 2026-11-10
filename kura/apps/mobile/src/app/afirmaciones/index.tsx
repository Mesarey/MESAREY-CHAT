import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { themes } from '@/content/alaira';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Card, Display, GoldButton, Header, IconBadge, Rise, Screen, Tap } from '@/ui/kit';
import { normalize, SearchBox } from '@/ui/list';

export default function Afirmaciones() {
  const router = useRouter();
  const favorites = useKura((s) => s.favoriteThemes);
  const savedCount = useKura((s) => s.savedAffirmations.length);
  const toggle = useKura((s) => s.toggleFavoriteTheme);
  const [q, setQ] = useState('');
  const shown = useMemo(() => themes.filter((t) => normalize(`${t.name} ${t.tagline}`).includes(normalize(q.trim()))), [q]);

  return (
    <Screen moon="right">
      <Header title="Afirmaciones" />
      <Rise style={{ minHeight: 130, justifyContent: 'center' }}>
        <Display size={38} style={{ maxWidth: 260 }}>Elige lo que necesitas hoy</Display>
        <Body muted>Explora y guarda tus temas favoritos.</Body>
      </Rise>
      <SearchBox value={q} onChange={setQ} placeholder="Buscar afirmaciones" />

      {favorites.length > 0 && (
        <Rise order={1} style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="corazon" size={22} />
            <Display size={24}>Tus favoritas</Display>
          </View>
          <View style={s.favRow}>
            {favorites.map((id) => {
              const t = themes.find((x) => x.id === id);
              if (!t) return null;
              return (
                <Tap key={id} onPress={() => router.push(`/afirmaciones/${id}`)} accessibilityLabel={t.name} style={s.fav}>
                  <Icon name={t.icon} size={22} />
                  <Body>{t.name}</Body>
                </Tap>
              );
            })}
          </View>
        </Rise>
      )}

      <Rise order={2} style={{ marginTop: 18 }}>
        <Display size={24}>Explorar categorías</Display>
        <Body muted size={14}>Toca el corazón para elegir tus favoritas.</Body>
      </Rise>
      <View style={s.grid}>
        {shown.map((t, i) => {
          const fav = favorites.includes(t.id);
          return (
            <Rise key={t.id} order={3 + i} style={s.cell}>
              <Tap onPress={() => router.push(`/afirmaciones/${t.id}`)} accessibilityLabel={t.name} testID={`tema-${t.id}`}>
                <Card style={s.theme}>
                  <IconBadge name={t.icon} size={42} />
                  <Display size={21} style={{ marginTop: 8 }}>{t.name}</Display>
                  <Body muted size={12.5}>{t.tagline}</Body>
                </Card>
              </Tap>
              <Tap onPress={() => toggle(t.id)} accessibilityLabel={fav ? `Quitar ${t.name} de favoritas` : `Agregar ${t.name} a favoritas`} testID={`fav-${t.id}`} outerStyle={s.heart} style={{ padding: 8 }}>
                <Icon name="corazon" size={20} tint={fav ? color.gold : color.text} weight={fav ? 2.4 : 1.4} />
              </Tap>
            </Rise>
          );
        })}
      </View>
      {shown.length === 0 && <Body muted style={{ textAlign: 'center', marginTop: 16 }}>No hay categorías con ese nombre.</Body>}

      <View style={{ marginTop: 20 }}>
        <GoldButton label={`Ver mis guardadas (${savedCount})`} icon="chevron" onPress={() => router.push('/afirmaciones/guardadas')} testID="ver-guardadas" />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  favRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  fav: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 22, borderWidth: 1.2, borderColor: color.gold, paddingVertical: 9, paddingHorizontal: 16, backgroundColor: 'rgba(243,207,138,0.08)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  cell: { flexBasis: '47%', flexGrow: 1 },
  theme: { padding: 14 },
  heart: { position: 'absolute', top: 6, right: 6 },
});
