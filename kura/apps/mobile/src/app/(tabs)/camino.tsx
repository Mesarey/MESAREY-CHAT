import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { rules } from '@/content/alaira';
import { useStreak } from '@/state/hooks';
import { useKura } from '@/state/store';
import { color } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Card, Display, Divider, IconBadge, Rise, Screen, Wordmark } from '@/ui/kit';

const STOPS = 10;

/** Sendero serpenteante con diez faroles: se enciende uno por cada día seguido. */
function Lanterns({ lit }: { lit: number }) {
  const W = 130;
  const H = 300;
  const pts = useMemo(
    () =>
      Array.from({ length: STOPS }, (_, i) => {
        const t = i / (STOPS - 1);
        return { x: W / 2 + Math.sin(t * Math.PI * 2.4) * 40 * (1 - t * 0.4), y: H - 18 - t * (H - 36), r: 10 - t * 4.5 };
      }),
    [],
  );
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return (
    <Svg width={W} height={H}>
      <Path d={d} stroke="rgba(200,192,255,0.22)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={d} stroke={color.gold} strokeWidth={1} strokeDasharray="2 5" fill="none" opacity={0.7} />
      {pts.map((p, i) =>
        i < lit ? (
          <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill={color.gold} stroke="#FFF6E0" strokeWidth={1.4} />
        ) : (
          <Circle key={i} cx={p.x} cy={p.y} r={p.r * 0.72} fill={color.ink} stroke={color.gold} strokeWidth={1} opacity={0.9} />
        ),
      )}
    </Svg>
  );
}

export default function Camino() {
  const { streak, target, next, practicedToday } = useStreak();
  const done = useKura((s) => s.player.milestonesDone);
  const best = useKura((s) => s.player.bestStreak);
  const lastDone = [...done].reverse().map((id) => rules.milestones.find((m) => m.id === id)).find(Boolean);
  const goal = target ?? Math.max(streak, 1);
  const reward = next?.grants.flatMap((g) => ('item' in g ? [rules.items[g.item]] : []))[0];

  return (
    <Screen moon="right">
      <Wordmark />
      <Rise style={{ alignItems: 'center' }}>
        <Display size={44}>Mi camino</Display>
        <Body muted size={17}>Cada día cuenta.</Body>
      </Rise>

      <Rise order={1} style={s.stage}>
        <View style={s.path}>
          <Lanterns lit={Math.min(streak, STOPS)} />
        </View>
        <View style={s.ring}>
          <Icon name="luna" size={20} />
          <Display size={84} style={{ color: color.gold, lineHeight: 84 }} testID="racha">{streak}</Display>
          <Display size={21}>{streak === 1 ? 'día seguido' : 'días seguidos'}</Display>
        </View>
        <Image source={require('../../../assets/alaira/alaira-full.png')} style={s.alaira} resizeMode="contain" accessibilityLabel="Alaira" />
      </Rise>
      <Body muted size={14} style={{ textAlign: 'center', marginBottom: 14 }}>
        {streak === 0 ? 'Hoy puede ser el primero.' : practicedToday ? 'Tu luz sigue creciendo.' : 'Practica hoy para mantenerla.'}
      </Body>

      <Rise order={2}>
        <Card style={s.progress}>
          <IconBadge name="estrella" size={44} />
          <View style={{ flex: 1, gap: 8 }}>
            <Body size={17} testID="progreso-racha">{target ? `${Math.min(streak, target)} de ${target} días` : `Mejor racha: ${best} días`}</Body>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: Math.min(goal, 10) }, (_, i) => (
                <View key={i} style={[s.seg, i < Math.round((Math.min(streak, goal) / goal) * Math.min(goal, 10)) && { backgroundColor: color.gold }]} />
              ))}
            </View>
          </View>
        </Card>
      </Rise>

      <Rise order={3} style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <Card style={s.half}>
          <IconBadge name={lastDone?.icon ?? 'brote'} size={46} />
          <View style={{ flex: 1 }}>
            <Body bold size={14}>{lastDone ? 'Logro obtenido' : 'Primer logro'}</Body>
            <Body muted size={12.5}>{lastDone ? lastDone.description : 'Completa tu primera sesión.'}</Body>
          </View>
        </Card>
        <Card style={s.half}>
          <IconBadge name={next?.icon ?? 'estrella'} size={46} />
          <View style={{ flex: 1 }}>
            <Body bold size={14}>{target ? `Recompensa al día ${target}` : 'Camino completo'}</Body>
            <Body muted size={12.5}>{reward ? reward.name : 'Alaira prepara nuevas paradas.'}</Body>
          </View>
        </Card>
      </Rise>

      <View style={{ alignItems: 'center', marginTop: 26, marginBottom: 10 }}>
        <Display size={24}>Logros</Display>
        <Divider />
      </View>
      <View style={{ gap: 10 }}>
        {rules.milestones.map((m) => {
          const got = done.includes(m.id);
          return (
            <Card key={m.id} style={[s.logro, !got && { opacity: 0.6 }]}>
              <IconBadge name={m.icon} size={44} active={got} />
              <View style={{ flex: 1 }}>
                <Body bold>{m.title}</Body>
                <Body muted size={13}>{m.description}</Body>
              </View>
              {got && <Icon name="check" size={22} weight={2} />}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  stage: { height: 310, marginTop: 6, alignItems: 'center', justifyContent: 'center' },
  path: { position: 'absolute', right: -26, top: 4 },
  alaira: { position: 'absolute', left: -26, bottom: 0, width: 120, height: 278 },
  ring: { width: 184, height: 184, borderRadius: 92, borderWidth: 1.4, borderColor: color.gold, backgroundColor: 'rgba(26,22,84,0.72)', alignItems: 'center', justifyContent: 'center', marginLeft: 8, marginBottom: 40 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  seg: { flex: 1, height: 7, borderRadius: 4, backgroundColor: 'rgba(200,192,255,0.25)' },
  half: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  logro: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
});
