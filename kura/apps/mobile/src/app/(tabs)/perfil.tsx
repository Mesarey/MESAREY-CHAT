import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { rules } from '@/content/alaira';
import { levelInfo } from '@/domain/progression';
import { useKura } from '@/state/store';
import { ambiences, color, font } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Card, Display, Divider, Rise, Screen, Tap, Wordmark } from '@/ui/kit';

const kindIcon: Record<string, string> = { ambientacion: 'sol', afirmaciones: 'loto', fragmento: 'libro', titulo: 'estrella' };

export default function Perfil() {
  const { name, player, ambience } = useKura();
  const setName = useKura((s) => s.setName);
  const setAmbience = useKura((s) => s.setAmbience);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const lv = levelInfo(player.xp);
  const minutes = Math.round(player.sessions.reduce((a, x) => a + x.durationSec, 0) / 60);
  const owned = player.inventory.map((id) => rules.items[id]).filter(Boolean);
  const save = () => {
    if (draft.trim()) setName(draft);
    setEditing(false);
  };

  return (
    <Screen moon="right">
      <Wordmark />
      <Rise style={{ alignItems: 'center', marginTop: 6 }}>
        {editing ? (
          <TextInput value={draft} onChangeText={setDraft} autoFocus maxLength={24} onSubmitEditing={save} onBlur={save} style={s.nameInput} testID="perfil-nombre-input" />
        ) : (
          <Tap onPress={() => { setDraft(name); setEditing(true); }} accessibilityLabel="Cambiar nombre" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Display size={42} testID="perfil-nombre">{name}</Display>
            <Icon name="lapiz" size={18} tint={color.muted} />
          </Tap>
        )}
      </Rise>

      <Rise order={1}>
        <Card style={{ marginTop: 16, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <Image source={require('../../../assets/alaira/alaira-face.jpg')} style={s.face} accessibilityLabel="Alaira" />
          <View style={{ flex: 1, gap: 6 }}>
            <Body size={12} style={{ color: color.gold, letterSpacing: 2 }}>VÍNCULO CON ALAIRA</Body>
            <Display size={30} testID="nivel">Nivel {lv.level}</Display>
            <View style={s.bar}>
              <View style={[s.barFill, { width: `${(lv.into / lv.needed) * 100}%` }]} />
            </View>
            <Body muted size={13} testID="resonancia">{lv.into} de {lv.needed} de resonancia</Body>
          </View>
        </Card>
      </Rise>

      <Rise order={2} style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        {[
          { n: player.counters.sesiones ?? 0, l: 'sesiones' },
          { n: player.bestStreak, l: 'mejor racha' },
          { n: minutes, l: 'minutos' },
        ].map((x) => (
          <Card key={x.l} style={{ flex: 1, alignItems: 'center', padding: 12 }}>
            <Display size={32} style={{ color: color.gold }}>{x.n}</Display>
            <Body muted size={13}>{x.l}</Body>
          </Card>
        ))}
      </Rise>

      <View style={s.section}>
        <Display size={24}>Ambientación</Display>
        <Divider />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {Object.values(ambiences).map((a) => {
          const unlocked = a.id === 'base' || player.inventory.includes(a.id);
          const active = ambience === a.id;
          return (
            <Tap key={a.id} onPress={() => setAmbience(a.id)} disabled={!unlocked} accessibilityLabel={a.name} accessibilityState={{ selected: active }} testID={`amb-${a.id}`} outerStyle={{ flex: 1 }}>
              <Card style={[{ alignItems: 'center', gap: 8, padding: 14 }, active && { borderColor: color.gold }]}>
                <View style={[s.swatch, { backgroundColor: a.sky[2], borderColor: a.moon[1] }]} />
                <Body bold>{a.name}</Body>
                <Body muted size={12.5} style={{ textAlign: 'center' }}>{active ? 'Activa' : unlocked ? 'Toca para activarla' : '10 días seguidos'}</Body>
              </Card>
            </Tap>
          );
        })}
      </View>

      <View style={s.section}>
        <Display size={24}>Colección</Display>
        <Divider />
      </View>
      {owned.length === 0 && <Body muted style={{ textAlign: 'center' }}>Lo que desbloquees con Alaira aparecerá aquí.</Body>}
      <View style={{ gap: 10 }}>
        {owned.map((item) => (
          <Card key={item.id} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 14 }}>
            <Icon name={kindIcon[item.kind] ?? 'estrella'} size={28} />
            <View style={{ flex: 1 }}>
              <Body bold>{item.name}</Body>
              <Body muted size={13}>{item.description}</Body>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  nameInput: { fontFamily: font.display, fontSize: 38, color: color.text, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: color.gold, minWidth: 180, paddingVertical: 2 },
  face: { width: 84, height: 84, borderRadius: 42, borderWidth: 1.4, borderColor: color.gold },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(200,192,255,0.25)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: color.gold },
  section: { alignItems: 'center', marginTop: 26, marginBottom: 12 },
  swatch: { width: 46, height: 46, borderRadius: 23, borderWidth: 2 },
});
