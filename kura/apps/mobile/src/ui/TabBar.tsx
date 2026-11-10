import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, MAX_WIDTH } from '@/theme/tokens';
import { Icon } from './Icon';
import { Tap } from './kit';

const tabs: Record<string, { label: string; icon: string }> = {
  index: { label: 'Hoy', icon: 'casa' },
  mundos: { label: 'Mundos', icon: 'orbita' },
  camino: { label: 'Mi camino', icon: 'estrella' },
  biblioteca: { label: 'Biblioteca', icon: 'libro' },
  perfil: { label: 'Perfil', icon: 'perfil' },
};

interface Props {
  state: { index: number; routes: { key: string; name: string }[] };
  navigateToTab: (routeKey: string) => void;
}

export function TabBar({ state, navigateToTab }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={s.row}>
        {state.routes.map((route, i) => {
          const tab = tabs[route.name];
          if (!tab) return null;
          const active = state.index === i;
          const tint = active ? color.gold : color.text;
          return (
            <Tap
              key={route.key}
              onPress={() => navigateToTab(route.key)}
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              testID={`tab-${route.name}`}
              outerStyle={{ flex: 1 }}
              style={s.item}>
              <Icon name={tab.icon} size={25} tint={tint} />
              <Text style={[s.label, { color: tint }]}>{tab.label}</Text>
              <View style={[s.mark, active && { backgroundColor: color.gold }]} />
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { backgroundColor: color.cardStrong, borderTopWidth: 1, borderTopColor: color.faint, paddingTop: 10 },
  row: { flexDirection: 'row', width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  item: { alignItems: 'center', gap: 4 },
  label: { fontFamily: font.body, fontSize: 11.5 },
  mark: { width: 44, height: 2, borderRadius: 1, marginTop: 4, backgroundColor: 'transparent' },
});
