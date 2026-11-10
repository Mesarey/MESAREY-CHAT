import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, font, MAX_WIDTH } from '@/theme/tokens';
import { Icon } from './Icon';
import { nativeDriver, WorldBackground } from './WorldBackground';

/** Los tamaños de título se definieron para una serif estrecha; Montserrat es más ancha y se compensa aquí. */
const DISPLAY_SCALE = 0.78;

export function Display({ size = 34, style, ...p }: TextProps & { size?: number }) {
  return <RNText {...p} style={[{ fontFamily: font.display, fontSize: size * DISPLAY_SCALE, lineHeight: size * DISPLAY_SCALE * 1.18, letterSpacing: -0.4, color: color.text }, style]} />;
}

export function Body({ size = 15, muted, bold, style, ...p }: TextProps & { size?: number; muted?: boolean; bold?: boolean }) {
  return (
    <RNText
      {...p}
      style={[{ fontFamily: bold ? font.bodyBold : font.body, fontSize: size * 0.95, lineHeight: size * 1.4, color: muted ? color.muted : color.text }, style]}
    />
  );
}

/** Entrada suave: cada bloque sube y aparece con un pequeño retraso según su orden. */
export function Rise({ order = 0, children, style }: { order?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 520, delay: 60 + order * 70, easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver }).start();
  }, [v, order]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/**
 * Pressable con respuesta táctil: se encoge un poco al tocar.
 * `style` decora el contenido; lo que afecta al acomodo (flex, posición absoluta) va en `outerStyle`.
 */
export function Tap({ style, outerStyle, children, ...p }: Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; outerStyle?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(1));
  const to = (toValue: number) => Animated.spring(v, { toValue, useNativeDriver: nativeDriver, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable accessibilityRole="button" {...p} style={outerStyle} onPressIn={(e) => { to(0.965); p.onPressIn?.(e); }} onPressOut={(e) => { to(1); p.onPressOut?.(e); }}>
      <Animated.View style={[style, { transform: [{ scale: v }] }, p.disabled && { opacity: 0.45 }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function IconBadge({ name, size = 58, active }: { name: string; size?: number; active?: boolean }) {
  return (
    <View style={[s.badge, { width: size, height: size, borderRadius: size / 2 }, active && { backgroundColor: 'rgba(243,207,138,0.14)' }]}>
      <Icon name={name} size={size * 0.52} />
    </View>
  );
}

export function GoldButton({ label, icon, onPress, filled, disabled, testID }: { label: string; icon?: string; onPress: () => void; filled?: boolean; disabled?: boolean; testID?: string }) {
  return (
    <Tap onPress={onPress} disabled={disabled} testID={testID} accessibilityLabel={label} style={[s.button, filled ? s.buttonFilled : s.buttonOutline]}>
      <RNText style={[s.buttonLabel, { color: filled ? color.ink : color.gold }]}>{label}</RNText>
      {icon && <Icon name={icon} size={20} tint={filled ? color.ink : color.gold} weight={1.8} />}
    </Tap>
  );
}

export function Divider() {
  return (
    <View style={s.divider}>
      <View style={s.dividerLine} />
      <Icon name="estrella" size={10} />
      <View style={s.dividerLine} />
    </View>
  );
}

export function Wordmark() {
  return (
    <View style={{ alignItems: 'center' }}>
      <RNText style={s.wordmark}>KURA</RNText>
      <Divider />
    </View>
  );
}

export function Header({ title, back = true, right }: { title?: string; back?: boolean; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <View style={s.header}>
      <View style={s.headerSide}>
        {back && (
          <Tap onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityLabel="Volver" style={{ padding: 6 }}>
            <Icon name="atras" size={26} tint={color.text} weight={1.8} />
          </Tap>
        )}
      </View>
      {title ? <Display size={24}>{title}</Display> : <Wordmark />}
      <View style={[s.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function Screen({
  children,
  moon,
  scroll = true,
  bottomSpace = 32,
}: {
  children: React.ReactNode;
  moon?: 'right' | 'center' | 'none';
  scroll?: boolean;
  bottomSpace?: number;
}) {
  const inner = <View style={[s.column, !scroll && { flex: 1 }, { paddingBottom: bottomSpace }]}>{children}</View>;
  return (
    <View style={{ flex: 1 }}>
      <WorldBackground moon={moon} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8 },
  card: { backgroundColor: color.card, borderColor: color.faint, borderWidth: 1, borderRadius: 22, padding: 18 },
  badge: { borderWidth: 1.2, borderColor: color.gold, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 54, borderRadius: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 },
  buttonFilled: { backgroundColor: color.cream },
  buttonOutline: { borderWidth: 1.4, borderColor: color.gold, backgroundColor: 'rgba(243,207,138,0.08)' },
  buttonLabel: { fontFamily: font.bodyBold, fontSize: 17 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  dividerLine: { width: 34, height: 1, backgroundColor: 'rgba(243,207,138,0.55)' },
  wordmark: { fontFamily: font.body, color: color.text, fontSize: 17, letterSpacing: 6, paddingLeft: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, marginBottom: 6 },
  headerSide: { width: 48 },
});
