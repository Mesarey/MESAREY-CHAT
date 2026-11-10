import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { rules } from '@/content/alaira';
import type { Presentation } from '@/domain/types';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Icon } from './Icon';
import { Body, Display, Divider, GoldButton } from './kit';
import { nativeDriver } from './WorldBackground';

const kindIcon: Record<string, string> = { ambientacion: 'sol', afirmaciones: 'loto', fragmento: 'libro', titulo: 'estrella' };

function describe(p: Presentation) {
  if (p.kind === 'nivel') {
    return {
      eyebrow: 'VÍNCULO CON ALAIRA',
      title: `Nivel ${p.level}`,
      text: 'Tu resonancia con Alaira creció. Su mundo te reconoce un poco más.',
      icon: 'brujula',
      items: [],
      xp: 0,
    };
  }
  const m = rules.milestones.find((x) => x.id === p.milestoneId);
  return {
    eyebrow: 'LOGRO OBTENIDO',
    title: m?.title ?? 'Logro',
    text: m?.description ?? '',
    icon: m?.icon ?? 'estrella',
    items: p.items.map((id) => rules.items[id]).filter(Boolean),
    xp: p.xp,
  };
}

function Burst({ progress }: { progress: Animated.Value }) {
  const rays = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        opacity: progress.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0.55] }),
        transform: [
          { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
          { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] }) },
        ],
      }}>
      <Svg width={300} height={300} viewBox="-150 -150 300 300">
        {rays.map((a, i) => (
          <Line
            key={i}
            x1={Math.cos(a) * 78}
            y1={Math.sin(a) * 78}
            x2={Math.cos(a) * (i % 2 ? 112 : 140)}
            y2={Math.sin(a) * (i % 2 ? 112 : 140)}
            stroke={color.gold}
            strokeWidth={i % 2 ? 1 : 1.6}
            strokeLinecap="round"
            opacity={i % 2 ? 0.5 : 0.9}
          />
        ))}
        <Circle r={72} stroke={color.gold} strokeWidth={1.2} fill="rgba(243,207,138,0.10)" />
        <Circle r={92} stroke={color.gold} strokeWidth={0.6} opacity={0.5} fill="none" />
      </Svg>
    </Animated.View>
  );
}

/**
 * Puesta en escena de recompensas. Lee la cola persistida: si la app se cierra antes de mostrarla,
 * la celebración aparece al volver. Cada una se descarta solo cuando el usuario la ve.
 */
export function RewardOverlay() {
  const current = useKura((s) => s.player.presentations[0]);
  const dismiss = useKura((s) => s.dismissPresentation);
  const [enter] = useState(() => new Animated.Value(0));

  const currentId = current?.id;
  useEffect(() => {
    if (!currentId) return;
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 900, easing: Easing.out(Easing.back(1.4)), useNativeDriver: nativeDriver }).start();
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [currentId, enter]);

  if (!current) return null;
  const d = describe(current);

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent onRequestClose={() => dismiss(current.id)}>
      <View style={s.veil} testID="recompensa">
        <View style={s.stage}>
          <Burst progress={enter} />
          <Animated.View style={{ transform: [{ scale: enter }] }}>
            <Icon name={d.icon} size={76} weight={1.1} />
          </Animated.View>
        </View>
        <Animated.View style={{ alignItems: 'center', opacity: enter, maxWidth: 360 }}>
          <Body size={12} style={s.eyebrow}>{d.eyebrow}</Body>
          <Display size={40} style={{ textAlign: 'center' }}>{d.title}</Display>
          <Divider />
          <Body muted style={{ textAlign: 'center', marginTop: 6 }}>{d.text}</Body>
          {d.items.map((item) => (
            <View key={item.id} style={s.item}>
              <Icon name={kindIcon[item.kind] ?? 'estrella'} size={26} />
              <View style={{ flex: 1 }}>
                <Body bold>{item.name}</Body>
                <Body muted size={13}>{item.description}</Body>
              </View>
            </View>
          ))}
          {d.xp > 0 && <Body style={{ color: color.gold, marginTop: 14 }}>+{d.xp} de resonancia</Body>}
        </Animated.View>
        <View style={{ width: '100%', maxWidth: 320, marginTop: 28 }}>
          <GoldButton label="Continuar" filled onPress={() => dismiss(current.id)} testID="recompensa-continuar" />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  veil: { flex: 1, backgroundColor: '#0B0A26', alignItems: 'center', justifyContent: 'center', padding: 28 },
  stage: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: color.gold, letterSpacing: 2.5, marginBottom: 6 },
  item: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.faint,
    backgroundColor: color.card,
    alignSelf: 'stretch',
  },
});
