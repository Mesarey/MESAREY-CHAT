import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { BreathPattern } from '@/content/alaira';
import type { ApplyResult } from '@/domain/progression';
import { color } from '@/theme/tokens';
import { Icon } from './Icon';
import { Body, Display, Divider, GoldButton, Rise } from './kit';
import { nativeDriver, useSvgId } from './WorldBackground';

const buzz = (style = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
};

export type BreathPhase = 'inhala' | 'sosten' | 'exhala';
export const phaseLabel: Record<BreathPhase, string> = { inhala: 'Inhala', sosten: 'Sostén', exhala: 'Exhala' };

export function phasesOf(p: BreathPattern): { phase: BreathPhase; seconds: number }[] {
  return (
    [
      { phase: 'inhala', seconds: p.inhala },
      { phase: 'sosten', seconds: p.sosten },
      { phase: 'exhala', seconds: p.exhala },
    ] as const
  ).filter((x) => x.seconds > 0);
}

/**
 * Marca el ritmo de la respiración a partir del reloj real (no de contadores acumulados),
 * así no se desfasa aunque el dispositivo vaya lento.
 */
export function useBreath(pattern: BreathPattern, cycles: number, running: boolean, onDone: (elapsedSec: number) => void) {
  const phases = phasesOf(pattern);
  const cycleSec = phases.reduce((a, p) => a + p.seconds, 0);
  const idle = { phase: phases[0].phase, left: phases[0].seconds, cycle: 0 };
  const [tick, setTick] = useState(idle);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    let lastPhase = '';
    const timer = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      if (elapsed >= cycleSec * cycles) {
        clearInterval(timer);
        done.current(elapsed);
        return;
      }
      let t = elapsed % cycleSec;
      let current = phases[0];
      for (const p of phases) {
        if (t < p.seconds) {
          current = p;
          break;
        }
        t -= p.seconds;
      }
      const cycle = Math.floor(elapsed / cycleSec);
      const key = `${cycle}:${current.phase}`;
      if (key !== lastPhase) {
        lastPhase = key;
        buzz();
      }
      setTick({ phase: current.phase, left: Math.ceil(current.seconds - t), cycle });
    }, 100);
    return () => {
      clearInterval(timer);
      setTick({ phase: phases[0].phase, left: phases[0].seconds, cycle: 0 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, cycles, pattern.inhala, pattern.sosten, pattern.exhala]);

  return running ? tick : idle;
}

export function BreathOrb({ pattern, phase, left, running, size = 250 }: { pattern: BreathPattern; phase: BreathPhase; left: number; running: boolean; size?: number }) {
  const id = useSvgId();
  const [scale] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!running) {
      Animated.timing(scale, { toValue: 0, duration: 600, useNativeDriver: nativeDriver }).start();
      return;
    }
    if (phase === 'sosten') return;
    Animated.timing(scale, {
      toValue: phase === 'inhala' ? 1 : 0,
      duration: (phase === 'inhala' ? pattern.inhala : pattern.exhala) * 1000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: nativeDriver,
    }).start();
  }, [phase, running, scale, pattern.inhala, pattern.exhala]);

  return (
    <View style={{ width: size * 1.3, height: size * 1.3, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size * 1.3} height={size * 1.3} viewBox="0 0 130 130" style={StyleSheet.absoluteFill}>
        <Circle cx={65} cy={65} r={63} stroke={color.gold} strokeWidth={0.3} strokeDasharray="1 2.2" fill="none" opacity={0.8} />
        <Circle cx={65} cy={65} r={56} stroke={color.gold} strokeWidth={0.45} fill="none" opacity={0.7} />
      </Svg>
      <Animated.View style={{ transform: [{ scale: scale.interpolate({ inputRange: [0, 1], outputRange: [0.74, 1] }) }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id={`orb${id}`} cx="50%" cy="45%" r="55%">
              <Stop offset="0" stopColor="#6B5AD0" stopOpacity={0.95} />
              <Stop offset="0.75" stopColor="#3A2F8E" stopOpacity={0.92} />
              <Stop offset="1" stopColor="#C9B6FF" stopOpacity={0.55} />
            </RadialGradient>
          </Defs>
          <Circle cx={50} cy={50} r={49} fill={`url(#orb${id})`} stroke="#E9DCFF" strokeWidth={0.8} />
        </Svg>
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
        <Display size={44} testID="fase">{phaseLabel[phase]}</Display>
        <Body size={18} muted>{running ? `${left} ${left === 1 ? 'segundo' : 'segundos'}` : `${pattern.inhala} segundos`}</Body>
      </View>
    </View>
  );
}

const SEAL_MS = 1300;

/** Afirmación que se "sella" manteniendo presionado: el gesto obliga a quedarse un momento con la frase. */
export function SealStep(props: SealProps) {
  // Cada afirmación es una instancia nueva: el sello siempre empieza vacío.
  return <Seal key={props.text} {...props} />;
}

interface SealProps {
  text: string;
  index: number;
  total: number;
  onSealed: () => void;
}

function Seal({ text, index, total, onSealed }: SealProps) {
  const [fill] = useState(() => new Animated.Value(0));
  const sealed = useRef(false);
  const [done, setDone] = useState(false);

  const start = () => {
    if (sealed.current) return;
    Animated.timing(fill, { toValue: 1, duration: SEAL_MS, easing: Easing.linear, useNativeDriver: nativeDriver }).start(({ finished }) => {
      if (!finished || sealed.current) return;
      sealed.current = true;
      setDone(true);
      buzz(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(onSealed, 650);
    });
  };
  const cancel = () => {
    if (sealed.current) return;
    fill.stopAnimation();
    Animated.timing(fill, { toValue: 0, duration: 220, useNativeDriver: nativeDriver }).start();
  };

  return (
    <View style={{ alignItems: 'center', gap: 22 }}>
      <Body size={12} style={{ color: color.gold, letterSpacing: 2.5 }}>{`AFIRMACIÓN ${index} DE ${total}`}</Body>
      <Rise>
        <Display size={36} style={{ textAlign: 'center' }} testID="afirmacion-texto">{text}</Display>
      </Rise>
      <Divider />
      <Pressable
        onPressIn={start}
        onPressOut={cancel}
        testID="sellar"
        accessibilityRole="button"
        accessibilityLabel="Mantén presionado para sellar la afirmación"
        style={s.seal}>
        <Animated.View style={[s.sealFill, { opacity: fill, transform: [{ scale: fill.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }] }]} />
        <Icon name={done ? 'check' : 'estrella'} size={34} tint={done ? color.ink : color.gold} weight={2} />
      </Pressable>
      <Body muted size={14}>{done ? 'Sellada' : 'Repítela para ti y mantén presionado'}</Body>
    </View>
  );
}

export function PracticeDone({ result, title, onClose }: { result: ApplyResult; title: string; onClose: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }} testID="practica-completa">
      <Rise>
        <Icon name="loto" size={84} weight={1} />
      </Rise>
      <Rise order={1}>
        <Display size={38} style={{ textAlign: 'center' }}>{title}</Display>
      </Rise>
      <Divider />
      <Rise order={2}>
        {result.status === 'aplicado' ? (
          <Body size={18} style={{ color: color.gold }} testID="xp-ganada">+{result.xpGained} de resonancia con Alaira</Body>
        ) : (
          <Body muted style={{ textAlign: 'center' }}>Esta vez fue muy breve para sumar resonancia. Vuelve cuando quieras.</Body>
        )}
      </Rise>
      <View style={{ alignSelf: 'stretch', marginTop: 24 }}>
        <GoldButton label="Volver" filled onPress={onClose} testID="practica-volver" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  seal: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.4,
    borderColor: color.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sealFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 48, backgroundColor: color.gold },
});
