import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useMemo, useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { quickThemes, themes } from '@/content/alaira';
import { dayPartOf } from '@/domain/dates';
import { pickAffirmations } from '@/domain/selection';
import { useAffirmationPool, useStreak, useToday } from '@/state/hooks';
import { useKura } from '@/state/store';
import { color, font } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Card, Display, Divider, GoldButton, Rise, Screen, Tap } from '@/ui/kit';

const greeting = { manana: 'Buenos días,', tarde: 'Buenas tardes,', noche: 'Buenas noches,' };

export default function Hoy() {
  const router = useRouter();
  const today = useToday();
  const pool = useAffirmationPool();
  const { name, focusTheme, favoriteThemes, savedAffirmations } = useKura();
  const setFocus = useKura((s) => s.setFocusTheme);
  const toggleSaved = useKura((s) => s.toggleSavedAffirmation);
  const addMemory = useKura((s) => s.addMemory);
  const { streak, practicedToday } = useStreak();
  const [feeling, setFeeling] = useState('');
  const [kept, setKept] = useState(false);

  const affirmation = useMemo(() => {
    const themed = pool.filter((a) => a.theme === focusTheme);
    return pickAffirmations(themed.length ? themed : pool, 1, `hoy:${today}:${focusTheme}`, {
      focusThemes: [focusTheme],
      favoriteThemes,
      savedIds: [],
      recentIds: [],
    })[0];
  }, [pool, focusTheme, today, favoriteThemes]);
  const saved = savedAffirmations.includes(affirmation.id);

  const keep = () => {
    if (!feeling.trim()) return;
    addMemory(feeling);
    setFeeling('');
    setKept(true);
  };

  return (
    <Screen moon="right">
      <View style={s.hero}>
        <Image source={require('../../../assets/alaira/alaira-bust.png')} style={s.alaira} resizeMode="contain" accessibilityLabel="Alaira" />
        <Rise>
          <Body style={s.logo}>KURA</Body>
          <Body size={17} style={{ marginTop: 28 }}>{greeting[dayPartOf(new Date())]}</Body>
          <Display size={38} testID="saludo-nombre">{name}</Display>
          <View style={s.rule} />
          <Display size={30} style={{ maxWidth: 190 }}>¿Qué quieres reforzar hoy?</Display>
        </Rise>
      </View>

      <Rise order={1} style={s.chips}>
        {quickThemes.map((id) => {
          const t = themes.find((x) => x.id === id)!;
          const active = id === focusTheme;
          return (
            <Tap key={id} onPress={() => setFocus(id)} accessibilityLabel={t.name} accessibilityState={{ selected: active }} testID={`foco-${id}`} style={[s.chip, active && s.chipActive]}>
              <Icon name={t.icon} size={26} />
              <Body size={12.5} style={active && { color: color.gold }}>{t.name}</Body>
            </Tap>
          );
        })}
      </Rise>

      <Rise order={2}>
        <View style={s.input}>
          <TextInput
            value={feeling}
            onChangeText={(v) => { setFeeling(v); setKept(false); }}
            placeholder="Cuéntale a Alaira cómo te sientes…"
            placeholderTextColor={color.muted}
            maxLength={280}
            returnKeyType="send"
            onSubmitEditing={keep}
            testID="sentir"
            style={s.inputText}
          />
          <Tap onPress={keep} disabled={!feeling.trim()} accessibilityLabel="Guardar en mi memoria" testID="sentir-enviar" style={s.send}>
            <Icon name="enviar" size={18} />
          </Tap>
        </View>
        {kept && <Body muted size={13} style={{ marginTop: 6, marginLeft: 8 }}>Alaira lo guardó en tu memoria.</Body>}
      </Rise>

      <Rise order={3}>
        <Card style={{ marginTop: 16, paddingVertical: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Body size={11.5} style={{ color: color.gold, letterSpacing: 2 }}>AFIRMACIÓN DE HOY</Body>
            <View style={{ width: 40, height: 1, backgroundColor: color.goldDeep, opacity: 0.6 }} />
          </View>
          <Display size={36} style={{ marginTop: 14, marginBottom: 10 }} testID="afirmacion-hoy">{affirmation.text}</Display>
          <Divider />
          <View style={s.actions}>
            <Tap onPress={() => { Speech.stop(); Speech.speak(affirmation.text, { language: 'es-MX', rate: 0.9 }); }} accessibilityLabel="Escuchar" style={s.action}>
              <Icon name="sonido" size={22} tint={color.text} />
              <Body>Escuchar</Body>
            </Tap>
            <View style={{ width: 1, height: 22, backgroundColor: color.faint }} />
            <Tap onPress={() => toggleSaved(affirmation.id)} accessibilityLabel={saved ? 'Quitar de guardadas' : 'Guardar'} testID="guardar-hoy" style={s.action}>
              <Icon name="marcador" size={22} tint={saved ? color.gold : color.text} />
              <Body style={saved && { color: color.gold }}>{saved ? 'Guardada' : 'Guardar'}</Body>
            </Tap>
          </View>
        </Card>
      </Rise>

      <Rise order={4} style={{ marginTop: 18 }}>
        <GoldButton label="Iniciar ritual · 2 min" icon="flecha" filled onPress={() => router.push('/ritual')} testID="iniciar-ritual" />
        <Body muted size={13} style={{ textAlign: 'center', marginTop: 10 }}>
          {practicedToday
            ? `Hoy ya practicaste. Llevas ${streak} ${streak === 1 ? 'día' : 'días seguidos'}.`
            : streak > 0
              ? `Llevas ${streak} ${streak === 1 ? 'día' : 'días seguidos'}. Tu práctica de hoy te espera.`
              : 'Tu primera práctica te espera.'}
        </Body>
      </Rise>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { minHeight: 284, justifyContent: 'flex-start' },
  alaira: { position: 'absolute', right: -58, top: 0, width: 240, height: 311 },
  logo: { fontFamily: font.body, letterSpacing: 6, fontSize: 16 },
  rule: { width: 30, height: 1.5, backgroundColor: color.gold, marginVertical: 12 },
  chips: { flexDirection: 'row', gap: 10, marginTop: 6 },
  chip: { width: 76, height: 68, borderRadius: 14, borderWidth: 1, borderColor: color.faint, backgroundColor: color.card, alignItems: 'center', justifyContent: 'center', gap: 4 },
  chipActive: { borderColor: color.gold, backgroundColor: 'rgba(243,207,138,0.14)' },
  input: { marginTop: 16, flexDirection: 'row', alignItems: 'center', borderRadius: 27, borderWidth: 1, borderColor: color.faint, backgroundColor: color.card, paddingLeft: 20, paddingRight: 8, minHeight: 54 },
  inputText: { flex: 1, fontFamily: font.body, fontSize: 15, color: color.text, minHeight: 44 },
  send: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: color.gold, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 12 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingHorizontal: 14 },
});
