import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, TextInput, View } from 'react-native';
import { useKura } from '@/state/store';
import { color, font } from '@/theme/tokens';
import { Body, Card, Display, GoldButton, Rise, Screen, Wordmark } from '@/ui/kit';

export default function Bienvenida() {
  const router = useRouter();
  const setName = useKura((s) => s.setName);
  const [value, setValue] = useState('');
  const enter = () => {
    if (!value.trim()) return;
    setName(value);
    router.replace('/');
  };
  return (
    <Screen moon="right">
      <View style={{ marginTop: 12 }}>
        <Wordmark />
      </View>
      <Rise style={{ alignItems: 'center', marginTop: 8 }}>
        <Image source={require('../../assets/alaira/alaira-full.png')} style={{ width: 172, height: 398 }} resizeMode="contain" accessibilityLabel="Alaira" />
      </Rise>
      <Rise order={1}>
        <Display size={34} style={{ textAlign: 'center' }}>Te doy la bienvenida a KURA</Display>
        <Body muted style={{ textAlign: 'center', marginTop: 8 }}>Soy Alaira. Antes de empezar, ¿cómo quieres que te llame?</Body>
      </Rise>
      <Rise order={2} style={{ marginTop: 20, gap: 14 }}>
        <Card style={{ paddingVertical: 4 }}>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Tu nombre"
            placeholderTextColor={color.muted}
            maxLength={24}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={enter}
            testID="nombre"
            style={{ fontFamily: font.body, fontSize: 18, color: color.text, minHeight: 50 }}
          />
        </Card>
        <GoldButton label="Entrar" icon="flecha" filled onPress={enter} disabled={!value.trim()} testID="entrar" />
      </Rise>
    </Screen>
  );
}
