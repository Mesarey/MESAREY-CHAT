import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { premios as catalogoPremios, type Linea, type Tono } from '@/content/nova';
import type { EstadoMision } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova, tonoColor, tonoEtiqueta } from '@/theme/nova';
import { color, font, MAX_WIDTH } from '@/theme/tokens';
import { Icon } from './Icon';
import { Body, Display, Tap } from './kit';
import { nativeDriver } from './WorldBackground';

/** Respeta el ajuste «reducir movimiento» del sistema: sin deslizamientos ni rebotes. */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduce(v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

/** Entrada breve: sube y aparece. Con movimiento reducido solo aparece. */
export function Sube({ order = 0, k, children, style }: { order?: number; k?: string | number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: reduce ? 1 : 260, delay: reduce ? 0 : order * 55, easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver }).start();
  }, [v, order, reduce, k]);
  return (
    <Animated.View style={[style, { opacity: v, transform: reduce ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

export function NovaScreen({ children, footer, scroll = true }: { children: React.ReactNode; footer?: React.ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const inner = <View style={[s.column, !scroll && { flex: 1 }]}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: nova.sky[0] }}>
      <LinearGradient colors={nova.sky} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: footer ? 16 : Math.max(insets.bottom, 12) + 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
        {footer && <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}><View style={s.footerInner}>{footer}</View></View>}
      </SafeAreaView>
    </View>
  );
}

export function NovaHeader({ title, right, onBack }: { title: string; right?: React.ReactNode; onBack?: () => void }) {
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/nova')));
  return (
    <View style={s.header}>
      <Tap onPress={back} accessibilityLabel="Volver" testID="nova-volver" style={s.headerBtn}>
        <Icon name="atras" size={24} tint={nova.text} weight={1.8} />
      </Tap>
      <Display size={22} style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>{title}</Display>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function Panel({ children, style, strong }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; strong?: boolean }) {
  return <View style={[s.panel, strong && { backgroundColor: nova.cardStrong }, style]}>{children}</View>;
}

export function Eyebrow({ children, tint = nova.accent }: { children: React.ReactNode; tint?: string }) {
  return <Body size={11.5} bold style={{ color: tint, letterSpacing: 1.6, textTransform: 'uppercase' }}>{children}</Body>;
}

export function Chip({ icon, label, tint = nova.accent }: { icon?: string; label: string; tint?: string }) {
  return (
    <View style={[s.chip, { borderColor: tint }]}>
      {icon && <Icon name={icon} size={14} tint={tint} weight={1.6} />}
      <Body size={12.5} style={{ color: tint }}>{label}</Body>
    </View>
  );
}

export function XpPill({ xp }: { xp: number }) {
  return (
    <View style={s.xp} accessibilityLabel={`${xp} puntos de experiencia`}>
      <Icon name="chispa" size={13} tint={nova.gold} weight={1.8} />
      <Body size={13} bold style={{ color: nova.gold }}>{xp} XP</Body>
    </View>
  );
}

/** Barra de avance: crece con una animación breve. */
export function Barra({ value, tint = nova.accent, height = 6 }: { value: number; tint?: string; height?: number }) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(value));
  useEffect(() => {
    Animated.timing(v, { toValue: value, duration: reduce ? 1 : 320, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [v, value, reduce]);
  return (
    <View style={[s.barra, { height, borderRadius: height / 2 }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Animated.View style={{ height, borderRadius: height / 2, backgroundColor: tint, width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

/** Botón principal de NOVA. */
export function Accion({ label, onPress, icon, kind = 'solid', disabled, testID }: { label: string; onPress: () => void; icon?: string; kind?: 'solid' | 'ghost'; disabled?: boolean; testID?: string }) {
  const solid = kind === 'solid';
  return (
    <Tap onPress={onPress} disabled={disabled} testID={testID} accessibilityLabel={label} style={[s.accion, solid ? { backgroundColor: nova.accent } : { borderWidth: 1.3, borderColor: nova.accent, backgroundColor: nova.accentSoft }]}>
      <Body size={16.5} bold style={{ color: solid ? nova.ink : nova.accent }}>{label}</Body>
      {icon && <Icon name={icon} size={19} tint={solid ? nova.ink : nova.accent} weight={1.9} />}
    </Tap>
  );
}

/** Opción de una decisión: zona táctil amplia, letra guía y texto legible. */
export function Opt({ letra, texto, onPress, descartada, testID }: { letra: string; texto: string; onPress: () => void; descartada?: boolean; testID?: string }) {
  return (
    <Tap onPress={onPress} testID={testID} accessibilityLabel={texto} accessibilityHint={descartada ? 'Ya la probaste; NOVA te explicó qué faltó.' : undefined} style={[s.opt, descartada && s.optOff]}>
      <View style={[s.letra, descartada && { borderColor: nova.ajusta }]}>
        <Body size={13} bold style={{ color: descartada ? nova.ajusta : nova.accent }}>{letra}</Body>
      </View>
      <Body size={15.5} style={{ flex: 1, color: descartada ? nova.muted : nova.text }}>{texto}</Body>
    </Tap>
  );
}

/** Estado de una misión: disponible, en progreso o completada. */
export function EstadoBadge({ estado, size = 26 }: { estado: EstadoMision; size?: number }) {
  const label = { disponible: 'Disponible', en_progreso: 'En progreso', completada: 'Completada' }[estado];
  return (
    <View accessibilityLabel={label} testID={`estado-${estado}`}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {estado === 'disponible' && <Circle cx={12} cy={12} r={9} stroke={nova.accent} strokeWidth={1.6} strokeDasharray="3.2 3.2" />}
        {estado === 'en_progreso' && (
          <>
            <Circle cx={12} cy={12} r={9} stroke={nova.line} strokeWidth={1.6} />
            <Path d="M12 3a9 9 0 0 1 0 18" stroke={nova.accent} strokeWidth={2.2} strokeLinecap="round" />
            <Circle cx={12} cy={12} r={2.6} fill={nova.accent} />
          </>
        )}
        {estado === 'completada' && (
          <>
            <Circle cx={12} cy={12} r={10} fill={nova.gold} />
            <Path d="M7 12.4l3.4 3.4L17.2 8.8" stroke={nova.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </Svg>
    </View>
  );
}
export const etiquetaEstado: Record<EstadoMision, string> = { disponible: 'Disponible', en_progreso: 'En progreso', completada: 'Completada' };

/** Medalla: cinta, aro y emblema. Bloqueada se dibuja en línea tenue. */
export function Medalla({ icono, ganada, size = 64 }: { icono: string; ganada: boolean; size?: number }) {
  const c = ganada ? nova.gold : 'rgba(180,198,228,0.45)';
  return (
    <View style={{ width: size, height: size * 1.18, alignItems: 'center' }}>
      <Svg width={size} height={size * 1.18} viewBox="0 0 64 76" fill="none" style={StyleSheet.absoluteFill}>
        <Path d="M22 2h20l-5 20H27L22 2Z" fill={ganada ? nova.accent : 'none'} stroke={ganada ? nova.accent : c} strokeWidth={1.4} opacity={ganada ? 0.9 : 1} />
        <Circle cx={32} cy={46} r={26} fill={ganada ? 'rgba(243,207,138,0.16)' : 'rgba(7,22,43,0.5)'} stroke={c} strokeWidth={ganada ? 2.4 : 1.4} />
        <Circle cx={32} cy={46} r={20.5} stroke={c} strokeWidth={0.8} opacity={0.6} strokeDasharray={ganada ? undefined : '2.5 3'} />
      </Svg>
      <View style={{ position: 'absolute', top: size * 1.18 * (46 / 76) - size * 0.2, width: size * 0.4, height: size * 0.4 }}>
        <Icon name={ganada ? icono : 'candado'} size={size * 0.4} tint={c} weight={1.5} />
      </View>
    </View>
  );
}

/**
 * Ventana emergente anclada abajo. En pantallas anchas conserva el ancho de la columna.
 * Se desliza hacia arriba; con movimiento reducido aparece sin desplazarse.
 */
export function Sheet({ visible, onClose, children, tint = nova.accent, testID }: { visible: boolean; onClose?: () => void; children: React.ReactNode; tint?: string; testID?: string }) {
  const reduce = useReduceMotion();
  const insets = useSafeAreaInsets();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!visible) return;
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: reduce ? 1 : 240, easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver }).start();
  }, [visible, v, reduce]);
  if (!visible) return null;
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={s.sheetRoot}>
        <Animated.View style={[StyleSheet.absoluteFill, s.veil, { opacity: v }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Cerrar" />
        </Animated.View>
        <Animated.View
          testID={testID}
          accessibilityViewIsModal
          style={[s.sheet, { borderTopColor: tint, paddingBottom: Math.max(insets.bottom, 14) + 8, opacity: v, transform: reduce ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }]}>
          <View style={[s.grip, { backgroundColor: tint }]} />
          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Reacción de la escena y criterio de NOVA, con una sola acción clara. */
export function Feedback({ visible, tono, reaccion, novaTexto, regla, accion, onAccion, extra }: { visible: boolean; tono: Tono; reaccion: Linea[]; novaTexto: string; regla?: string; accion: string; onAccion: () => void; extra?: React.ReactNode }) {
  const tint = tonoColor[tono];
  useEffect(() => {
    if (!visible || Platform.OS === 'web') return;
    Haptics.impactAsync(tono === 'ajusta' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [visible, tono]);
  return (
    <Sheet visible={visible} tint={tint} testID="nova-feedback">
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[s.dot, { backgroundColor: tint }]} />
          <Eyebrow tint={tint}>{tonoEtiqueta[tono]}</Eyebrow>
        </View>
        {reaccion.map((l, i) => (
          <Sube key={i} order={i}>
            {l.quien === 'Escena' ? (
              <Body size={15} muted style={{ fontStyle: 'italic' }}>{l.texto}</Body>
            ) : (
              <Body size={16}><Body size={16} bold style={{ color: nova.text }}>{l.quien}: </Body>{l.texto}</Body>
            )}
          </Sube>
        ))}
        <Sube order={reaccion.length} style={s.novaDice}>
          <View style={s.novaAvatar}><Icon name="nova" size={18} tint={nova.accent} weight={1.6} /></View>
          <View style={{ flex: 1 }}>
            <Body size={12} bold style={{ color: nova.accent, letterSpacing: 1 }}>NOVA</Body>
            <Body size={15.5} testID="nova-dice">{novaTexto}</Body>
            {regla && <Body size={12.5} style={{ color: nova.gold, marginTop: 6 }}>Regla de oro · {regla}</Body>}
          </View>
        </Sube>
        {extra}
        <View style={{ marginTop: 6 }}>
          <Accion label={accion} onPress={onAccion} icon={tono === 'ajusta' ? 'repaso' : 'flecha'} testID="nova-feedback-accion" />
        </View>
      </View>
    </Sheet>
  );
}

/** Aviso breve al desbloquear un premio. Lee la cola guardada: si la app se cierra, aparece al volver. */
export function PremioPopup() {
  const cola = useNova((st) => st.porMostrar);
  const vistos = useNova((st) => st.premiosVistos);
  const router = useRouter();
  const ganados = cola.map((id) => catalogoPremios.find((x) => x.id === id)).filter((x) => !!x);
  const p = ganados[0];
  const clave = cola.join(',');
  useEffect(() => {
    if (clave && Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [clave]);
  if (!p) return null;
  const resto = ganados.slice(1);
  return (
    <Sheet visible tint={nova.gold} onClose={vistos} testID="nova-premio">
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Eyebrow tint={nova.gold}>{resto.length ? `${ganados.length} premios desbloqueados` : 'Premio desbloqueado'}</Eyebrow>
        <Sube k={p.id}><Medalla icono={p.icono} ganada size={84} /></Sube>
        <Display size={30} style={{ textAlign: 'center' }} testID="nova-premio-titulo">{p.titulo}</Display>
        <Body muted style={{ textAlign: 'center' }}>{p.frase}</Body>
        {resto.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 6 }} testID="nova-premio-resto">
            {resto.map((x) => <Chip key={x.id} icon={x.icono} label={x.titulo} tint={nova.gold} />)}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 12 }}>
          <View style={{ flex: 1 }}><Accion kind="ghost" label="Ver sala" onPress={() => { vistos(); router.push('/nova/premios'); }} testID="nova-premio-sala" /></View>
          <View style={{ flex: 1 }}><Accion label="Va" onPress={vistos} testID="nova-premio-va" /></View>
        </View>
      </View>
    </Sheet>
  );
}

/** Fila de entrada a un modo: ícono, título, detalle y flecha. */
export function Entrada({ icon, titulo, detalle, onPress, tint = nova.accent, right, testID }: { icon: string; titulo: string; detalle?: string; onPress: () => void; tint?: string; right?: React.ReactNode; testID?: string }) {
  return (
    <Tap onPress={onPress} testID={testID} accessibilityLabel={titulo} style={s.entrada}>
      <View style={[s.entradaIcon, { borderColor: tint }]}><Icon name={icon} size={24} tint={tint} /></View>
      <View style={{ flex: 1 }}>
        <Body size={16.5} bold>{titulo}</Body>
        {detalle && <Body size={13} muted style={{ color: nova.muted }}>{detalle}</Body>}
      </View>
      {right ?? <Icon name="chevron" size={18} tint={nova.muted} weight={1.8} />}
    </Tap>
  );
}

const s = StyleSheet.create({
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 6, gap: 12 },
  footer: { borderTopWidth: 1, borderTopColor: nova.lineSoft, backgroundColor: nova.cardStrong, paddingTop: 12 },
  footerInner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 50, gap: 4 },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  panel: { backgroundColor: nova.card, borderColor: nova.line, borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' },
  xp: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(243,207,138,0.5)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(243,207,138,0.10)' },
  barra: { backgroundColor: 'rgba(111,195,255,0.16)', overflow: 'hidden', alignSelf: 'stretch' },
  accion: { minHeight: 54, borderRadius: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 20 },
  opt: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.2, borderColor: nova.line, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: nova.card },
  optOff: { borderColor: 'rgba(255,199,115,0.45)', borderStyle: 'dashed', backgroundColor: 'rgba(16,42,80,0.3)' },
  letra: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.2, borderColor: nova.accent, alignItems: 'center', justifyContent: 'center' },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  veil: { backgroundColor: 'rgba(3,9,20,0.62)' },
  sheet: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', backgroundColor: nova.cardStrong, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 2, paddingHorizontal: 20, paddingTop: 10 },
  grip: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14, opacity: 0.7 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  novaDice: { flexDirection: 'row', gap: 10, backgroundColor: nova.accentSoft, borderRadius: 16, padding: 12, marginTop: 4 },
  novaAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.2, borderColor: nova.accent, alignItems: 'center', justifyContent: 'center' },
  entrada: { flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 68, backgroundColor: nova.card, borderWidth: 1, borderColor: nova.line, borderRadius: 20, paddingVertical: 11, paddingHorizontal: 14 },
  entradaIcon: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7,22,43,0.45)' },
});

export { color, font };
