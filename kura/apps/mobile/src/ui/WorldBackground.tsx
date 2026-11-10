import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useId, useMemo, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';
import { seededRandom } from '@/domain/selection';
import { useKura } from '@/state/store';
import { ambiences } from '@/theme/tokens';

export const nativeDriver = Platform.OS !== 'web';

/** Ids de degradados únicos por instancia: varias pantallas montadas a la vez no deben compartirlos. */
export const useSvgId = () => useId().replace(/[^a-zA-Z0-9]/g, '');

function useLoop(duration: number, delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: nativeDriver }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: nativeDriver }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, duration, delay]);
  return v;
}

function Stars({ w, h, seed, count }: { w: number; h: number; seed: string; count: number }) {
  const stars = useMemo(() => {
    const r = seededRandom(seed);
    return Array.from({ length: count }, () => ({ x: r() * w, y: r() * h * 0.62, s: 0.5 + r() * 1.3, o: 0.35 + r() * 0.6 }));
  }, [w, h, seed, count]);
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      {stars.map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#FFF6E0" opacity={s.o} />
      ))}
    </Svg>
  );
}

function CloudBand({ w, top, tint, opacity, seed }: { w: number; top: number; tint: string; opacity: number; seed: string }) {
  const puffs = useMemo(() => {
    const r = seededRandom(seed);
    return Array.from({ length: 7 }, (_, i) => ({ cx: (i / 6) * w * 1.3, cy: 70 + r() * 50, rx: 120 + r() * 110, ry: 34 + r() * 30 }));
  }, [w, seed]);
  const id = useSvgId();
  return (
    <Svg width={w * 1.3} height={200} style={{ position: 'absolute', top, left: -w * 0.15, opacity }}>
      <Defs>
        <RadialGradient id={`puff${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={tint} stopOpacity={0.75} />
          <Stop offset="0.55" stopColor={tint} stopOpacity={0.28} />
          <Stop offset="1" stopColor={tint} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {puffs.map((p, i) => (
        <Ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={`url(#puff${id})`} />
      ))}
    </Svg>
  );
}

function Petal({ w, h, index }: { w: number; h: number; index: number }) {
  const [fall] = useState(() => new Animated.Value(0));
  const r = useMemo(() => seededRandom(`petalo${index}`), [index]);
  const cfg = useMemo(() => ({ x: r() * w, drift: 40 + r() * 80, time: 14000 + r() * 12000, wait: r() * 9000, size: 5 + r() * 5 }), [r, w]);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(cfg.wait),
        Animated.timing(fall, { toValue: 1, duration: cfg.time, easing: Easing.linear, useNativeDriver: nativeDriver }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [fall, cfg]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: cfg.x,
        top: -20,
        width: cfg.size,
        height: cfg.size * 1.5,
        borderRadius: cfg.size,
        backgroundColor: '#E7B6F2',
        opacity: fall.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.75, 0.6, 0] }),
        transform: [
          { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [0, h * 0.9] }) },
          { translateX: fall.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, cfg.drift, cfg.drift * 0.4] }) },
          { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '320deg'] }) },
        ],
      }}
    />
  );
}

/** El cielo del mundo de Alaira: luna, estrellas que titilan, nubes a la deriva, pétalos y reflejos en el lago. */
export function WorldBackground({ moon = 'right', dim = false }: { moon?: 'right' | 'center' | 'none'; dim?: boolean }) {
  const { width: w, height: h } = useWindowDimensions();
  const amb = ambiences[useKura((s) => s.ambience)] ?? ambiences.base;
  const id = useSvgId();
  const twinkle = useLoop(2600);
  const twinkle2 = useLoop(3400, 900);
  const driftA = useLoop(26000);
  const driftB = useLoop(34000, 2000);
  const breathe = useLoop(5200);
  const moonSize = Math.min(w * 0.3, 130);
  const moonLeft = moon === 'center' ? (w - moonSize) / 2 : w - moonSize * 1.15;

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: amb.sky[0] }]} pointerEvents="none">
      <LinearGradient colors={amb.sky} locations={[0, 0.34, 0.7, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }]}>
        <Stars w={w} h={h} seed="a" count={46} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: twinkle2.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }]}>
        <Stars w={w} h={h} seed="b" count={34} />
      </Animated.View>

      {moon !== 'none' && (
        <Animated.View
          style={{
            position: 'absolute',
            top: (moon === 'center' ? h * 0.12 : h * 0.07) - moonSize * 0.5,
            left: moonLeft - moonSize * 0.5,
            width: moonSize * 2,
            height: moonSize * 2,
            opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }),
          }}>
          <Svg width={moonSize * 2} height={moonSize * 2} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id={`halo${id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0.3" stopColor={amb.glow} stopOpacity={0.55} />
                <Stop offset="1" stopColor={amb.glow} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={`disc${id}`} cx="40%" cy="36%" r="70%">
                <Stop offset="0" stopColor={amb.moon[0]} />
                <Stop offset="1" stopColor={amb.moon[1]} />
              </RadialGradient>
            </Defs>
            <Circle cx={100} cy={100} r={100} fill={`url(#halo${id})`} />
            <Circle cx={100} cy={100} r={48} fill={`url(#disc${id})`} />
            <Circle cx={86} cy={88} r={9} fill={amb.moon[1]} opacity={0.35} />
            <Circle cx={114} cy={112} r={13} fill={amb.moon[1]} opacity={0.28} />
            <Circle cx={108} cy={80} r={5} fill={amb.moon[1]} opacity={0.3} />
          </Svg>
        </Animated.View>
      )}

      <Animated.View style={{ transform: [{ translateX: driftA.interpolate({ inputRange: [0, 1], outputRange: [-28, 28] }) }] }}>
        <CloudBand w={w} top={h * 0.16} tint={amb.cloud} opacity={0.75} seed="n1" />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: driftB.interpolate({ inputRange: [0, 1], outputRange: [36, -36] }) }] }}>
        <CloudBand w={w} top={h * 0.4} tint={amb.cloud} opacity={0.5} seed="n2" />
        <CloudBand w={w} top={h * 0.66} tint={amb.cloud} opacity={0.34} seed="n3" />
      </Animated.View>

      <Svg width={w} height={h * 0.3} style={{ position: 'absolute', bottom: 0, opacity: 0.5 }}>
        {Array.from({ length: 9 }, (_, i) => {
          const r = seededRandom(`lago${i}`);
          const lw = 30 + r() * 110;
          return <Rect key={i} x={r() * (w - lw)} y={20 + i * ((h * 0.3) / 10)} width={lw} height={1.2} rx={0.6} fill="#F3CF8A" opacity={0.18 + r() * 0.3} />;
        })}
      </Svg>

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Petal key={i} w={w} h={h} index={i} />
      ))}
      {dim && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(12,10,40,0.45)' }]} />}
    </View>
  );
}
