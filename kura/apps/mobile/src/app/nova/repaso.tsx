import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { afirmaciones, reformulaciones, reglaPorId, unidades } from '@/content/nova';
import { barajar, type Resultado } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { font } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Display, Tap } from '@/ui/kit';
import { Accion, Barra, Eyebrow, Feedback, NovaHeader, NovaScreen, Panel, Sube } from '@/ui/nova';

const N = 5;

export default function Repaso() {
  const router = useRouter();
  const st = useNova();
  const [ronda, setRonda] = useState(0);
  const items = useMemo(() => barajar(afirmaciones).slice(0, N), [ronda]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [pick, setPick] = useState<'observacion' | 'suposicion' | null>(null);
  const [fin, setFin] = useState<Resultado | null>(null);

  const pendiente = st.repaso[0];
  const ref = useMemo(() => reformulaciones.find((r) => r.habilidad === pendiente?.habilidad) ?? reformulaciones[ronda % reformulaciones.length], [pendiente?.habilidad, ronda]);
  const [texto, setTexto] = useState('');
  const [dicho, setDicho] = useState(false);
  const [checks, setChecks] = useState<number[]>([]);
  const [guardada, setGuardada] = useState(false);

  const item = items[i];
  const acierta = pick === item?.clase;
  const seguir = () => {
    const total = ok + (acierta ? 1 : 0);
    setOk(total);
    setPick(null);
    if (i + 1 >= N) setFin(st.repasar(total, N, null, total >= N - 1));
    else setI(i + 1);
  };
  const otra = () => { setRonda(ronda + 1); setI(0); setOk(0); setFin(null); setDicho(false); setChecks([]); setTexto(''); setGuardada(false); };
  const precision = st.observacion.total ? Math.round((st.observacion.aciertos / st.observacion.total) * 100) : null;

  return (
    <NovaScreen>
      <NovaHeader title="Repaso" />
      <Panel>
        <Eyebrow tint={nova.ajusta}>En agenda</Eyebrow>
        {st.repaso.length === 0 && <Body size={14.5} style={{ color: nova.muted }} testID="repaso-vacio">Nada agendado. Cuando NOVA te corrija en una escena, la habilidad aparece aquí con otra escena para practicar el mismo criterio.</Body>}
        {st.repaso.map((r) => {
          const u = unidades.find((x) => x.id === r.habilidad)!;
          return (
            <View key={r.habilidad} style={{ gap: 6, paddingVertical: 4 }} testID={`repaso-${r.habilidad}`}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Icon name={u.icono} size={22} tint={nova.ajusta} />
                <View style={{ flex: 1 }}>
                  <Body size={15.5} bold>{u.titulo}</Body>
                  <Body size={12.5} style={{ color: nova.muted }}>Te costó: {r.reglas.map((x) => reglaPorId(x)?.titulo).filter(Boolean).join(' · ') || 'leer el detalle'} · {r.fallos} reintento{r.fallos > 1 ? 's' : ''}</Body>
                </View>
              </View>
              <Accion kind="ghost" label="Practicar con otra escena" icon="flecha" onPress={() => router.push(`/nova/jugar/${u.escenas[0]}`)} testID={`repaso-jugar-${r.habilidad}`} />
              <Body size={12} style={{ color: nova.muted }}>Sale de la agenda cuando completes la escena sin reintentos.</Body>
            </View>
          );
        })}
      </Panel>

      <Panel strong>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Eyebrow>¿Observación o suposición?</Eyebrow>
          <View style={{ flex: 1 }} />
          {precision !== null && <Body size={12.5} style={{ color: nova.muted }} testID="repaso-precision">Tu precisión: {precision}%</Body>}
        </View>
        {fin ? (
          <Sube style={{ gap: 8, alignItems: 'center' }}>
            <Display size={44} style={{ color: nova.gold }} testID="repaso-resultado">{ok}/{N}</Display>
            <Body style={{ color: nova.muted, textAlign: 'center' }}>{ok >= N - 1 ? 'Distingues lo que viste de lo que le pusiste tú.' : 'Ojo con los «porque» y los «seguro»: casi siempre son tuyos.'}</Body>
            <Body bold style={{ color: nova.gold }} testID="repaso-xp">{fin.xp > 0 ? `+${fin.xp} XP` : 'El repaso da XP una vez al día'}</Body>
            <View style={{ alignSelf: 'stretch' }}><Accion kind="ghost" label="Otra ronda" icon="repaso" onPress={otra} testID="repaso-otra" /></View>
          </Sube>
        ) : (
          <Sube k={item.id} style={{ gap: 10 }}>
            <Barra value={i / N} />
            <Body size={18} testID="repaso-afirmacion">«{item.texto}»</Body>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Accion kind="ghost" label="La vi" onPress={() => setPick('observacion')} testID={`repaso-${item.clase === 'observacion' ? 'ok' : 'no'}-obs`} /></View>
              <View style={{ flex: 1 }}><Accion kind="ghost" label="La supuse" onPress={() => setPick('suposicion')} testID={`repaso-${item.clase === 'suposicion' ? 'ok' : 'no'}-sup`} /></View>
            </View>
          </Sube>
        )}
      </Panel>

      <Panel>
        <Eyebrow tint={nova.encaja}>Dilo con tus palabras · opcional</Eyebrow>
        <Body size={15}>{ref.situacion}</Body>
        <Body size={14.5} bold>{ref.pide}</Body>
        {!dicho ? (
          <>
            <TextInput
              value={texto} onChangeText={setTexto} multiline placeholder="Si prefieres, escríbelo aquí. No se envía a ningún lado." placeholderTextColor="rgba(180,198,228,0.6)"
              style={{ minHeight: 70, borderWidth: 1, borderColor: nova.line, borderRadius: 14, padding: 12, color: nova.text, fontFamily: font.body, fontSize: 15, textAlignVertical: 'top' }}
              testID="repaso-texto" accessibilityLabel="Tu reformulación"
            />
            <Accion kind="ghost" label="Ya lo dije" icon="mic" onPress={() => setDicho(true)} testID="repaso-dicho" />
          </>
        ) : (
          <View style={{ gap: 8 }}>
            {texto.trim() !== '' && <Body size={14.5} style={{ color: nova.muted, fontStyle: 'italic' }}>«{texto.trim()}»</Body>}
            <Body size={13} style={{ color: nova.muted }}>Autoevalúate: marca lo que sí cumpliste.</Body>
            {ref.revisa.map((c, k) => {
              const on = checks.includes(k);
              return (
                <Tap key={c} onPress={() => setChecks(on ? checks.filter((x) => x !== k) : [...checks, k])} accessibilityLabel={c} accessibilityState={{ checked: on }} testID={`repaso-check-${k}`}
                  style={{ flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 44 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.4, borderColor: nova.encaja, backgroundColor: on ? nova.encaja : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <Icon name="check" size={16} tint={nova.ink} weight={2.4} />}
                  </View>
                  <Body size={14.5} style={{ flex: 1 }}>{c}</Body>
                </Tap>
              );
            })}
            {guardada
              ? <Body bold style={{ color: nova.encaja }} testID="repaso-auto">{checks.length} de {ref.revisa.length}. {checks.length === ref.revisa.length ? 'Así sale en la calle.' : 'Dilo otra vez cuidando lo que faltó.'}</Body>
              : <Accion kind="ghost" label="Listo" icon="check" onPress={() => setGuardada(true)} testID="repaso-listo" />}
          </View>
        )}
      </Panel>

      <Feedback
        visible={pick !== null}
        tono={acierta ? 'encaja' : 'ajusta'}
        reaccion={[{ quien: 'Escena', texto: item ? `Es ${item.clase === 'observacion' ? 'una observación: se puede ver u oír' : 'una suposición: una lectura que le pusiste tú'}.` : '' }]}
        novaTexto={item?.nova ?? ''}
        accion={i + 1 >= N ? 'Ver resultado' : 'Siguiente'}
        onAccion={seguir}
      />
    </NovaScreen>
  );
}
