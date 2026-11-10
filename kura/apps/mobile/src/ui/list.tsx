import { StyleSheet, TextInput, View } from 'react-native';
import { color, font } from '@/theme/tokens';
import { Icon } from './Icon';
import { Body, Card, Display, IconBadge, Tap } from './kit';

export const normalize = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={s.search}>
      <Icon name="buscar" size={22} tint={color.text} />
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={color.muted} style={s.searchText} testID="buscar" />
      {value !== '' && (
        <Tap onPress={() => onChange('')} accessibilityLabel="Borrar búsqueda" style={{ padding: 6 }}>
          <Icon name="cerrar" size={18} tint={color.muted} />
        </Tap>
      )}
    </View>
  );
}

export function LinkRow({ title, text, icon, onPress, testID }: { title: string; text: string; icon: string; onPress: () => void; testID?: string }) {
  return (
    <Tap onPress={onPress} accessibilityLabel={title} testID={testID}>
      <Card style={s.row}>
        <IconBadge name={icon} />
        <View style={{ flex: 1 }}>
          <Display size={27}>{title}</Display>
          <Body muted size={14}>{text}</Body>
        </View>
        <Icon name="chevron" size={22} weight={1.8} />
      </Card>
    </Tap>
  );
}

const s = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, borderColor: color.faint, backgroundColor: color.card, paddingHorizontal: 16, minHeight: 52 },
  searchText: { flex: 1, fontFamily: font.body, fontSize: 16, color: color.text, minHeight: 44 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 20 },
});
