import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { contextosTensos, negaPorId, publicado, type Tono } from '@/content/nova';
import { barajar, siguienteDelMazo } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { Body, Display } from '@/ui/kit';
import { Accion, Barra, Chip, Eyebrow, Feedback, NovaHeader, NovaScreen, Opt, Panel, Sube } from '@/ui/nova';

const negas = publicado.negas;
/** Tarjetas tensas: el mismo detalle de una nega revisada, en un momento donde toca dejarla pasar. */
const tensas = contextosTensos.map((t, i) => ({ id: `T:${negas[(i * 11 + 5) % negas.length].id}`, tenso: t }));
const MAZO = [...negas.map((n) => n.id), ...tensas.map((t) => t.id)];
const PASAR = 'pasar';

interface Juicio { tono: Tono; texto: string; resuelve: boolean; espero: boolean }

/** Arma la mano: la tarjeta de arriba y sus tres opciones (el remate, otro remate y «Dejar pasar»). */
function mano(cola: string[]) {
  const nega = negaPorId(cola[0].replace('T:', ''))!;
  const otra = barajar(negas.filter((n) => n.id !== nega.id))[0];
  return { cola, ops: [...barajar([nega.id, otra.id]), PASAR] };
}
/** Mazo de la sesión: primero las tarjetas que faltan por resolver; no repite hasta agotarlo. */
function nuevoMazo(primera?: string) {
  const r = siguienteDelMazo({ ...useNova.getState(), mazo: [] }, MAZO);
  const orden = [r.tarjeta, ...r.state.mazo];
  return primera && MAZO.includes(primera) ? [primera, ...orden.filter((x) => x !== primera)] : orden;
}

export default function Arena() {
  const { c } = useLocalSearchParams<{ c?: string }>();
  return <Juego key={c ?? 'mazo'} c={c} />;
}

function Juego({ c }: { c?: string }) {
  const router = useRouter();
  const resueltas = useNova((s) => s.negasResueltas);
  const guardadas = useNova((s) => s.guardadas);
  const [m, setM] = useState(() => mano(nuevoMazo(c)));
  const [juicio, setJuicio] = useState<Juicio | null>(null);
  const [xp, setXp] = useState(0);
  const [descartadas, setDescartadas] = useState<string[]>([]);

  const robar = () => {
    setDescartadas([]);
    setM(mano(m.cola.length > 1 ? m.cola.slice(1) : nuevoMazo()));
  };

  const tarjeta = m.cola[0];
  const opciones = m.ops;
  const tensa = tensas.find((t) => t.id === tarjeta);
  const nega = negaPorId(tarjeta.replace('T:', ''))!;

  const elegir = (op: string) => {
    if (op === PASAR) {
      setJuicio(tensa
        ? { tono: 'encaja', texto: tensa.tenso.nova, resuelve: true, espero: true }
        : { tono: 'valida', texto: `Se vale dejarla pasar. Aquí el detalle estaba a la vista y el ambiente era bueno: «${nega.texto}» habría cabido. Esta tarjeta regresa más adelante.`, resuelve: false, espero: false });
    } else if (op === nega.id) {
      setJuicio(tensa
        ? { tono: 'ajusta', texto: `La frase encaja con el detalle, pero el momento no. ${tensa.tenso.nova}`, resuelve: false, espero: false }
        : { tono: 'encaja', texto: 'Encaja: repite lo que los dos acaban de ver, sin calificar a la persona. Dila con calidez.', resuelve: true, espero: false });
    } else {
      const otra = negaPorId(op)!;
      setJuicio({ tono: 'ajusta', texto: `Ese remate es para otro momento: «${otra.queObservar}» Aquí pasó otra cosa. La nega sale del detalle que sí viste.`, resuelve: false, espero: false });
    }
    if (op !== PASAR && (op !== nega.id || tensa)) setDescartadas((d) => [...d, op]);
  };
  const seguir = () => {
    const j = juicio!;
    setJuicio(null);
    if (j.tono === 'ajusta') return;
    if (j.resuelve) setXp(useNova.getState().nega(tarjeta, j.espero).xp);
    else setXp(0);
    robar();
  };

  const total = MAZO.length;
  const guardada = guardadas.includes(nega.id);
  return (
    <NovaScreen>
      <NovaHeader title="Arena de Negas" />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip icon="nega" label={tensa ? 'Momento tenso' : 'Momento ligero'} tint={tensa ? nova.ajusta : nova.accent} />
          <Body size={12.5} style={{ color: nova.muted }} testID="arena-conteo">{resueltas.length} de {total} resueltas{xp ? ` · +${xp} XP` : ''}</Body>
        </View>
        <Barra value={resueltas.length / total} tint={nova.gold} />
      </View>
      <Sube k={tarjeta} style={{ gap: 12 }}>
        <Panel strong>
          <Eyebrow>Qué pasó</Eyebrow>
          <Body size={17} testID="arena-situacion">{nega.queObservar.replace(/^Ejemplo de Mitsuo\.\s*/, '')}</Body>
          {tensa && <Body size={15.5} style={{ color: nova.ajusta }} testID="arena-tension">{tensa.tenso.texto}</Body>}
        </Panel>
        <Display size={24}>¿Qué remate encaja?</Display>
        <View style={{ gap: 10 }}>
          {opciones.map((op, i) => (
            <Opt key={op} letra={'ABC'[i]} descartada={descartadas.includes(op)} testID={op === PASAR ? 'arena-pasar' : op === nega.id ? 'arena-correcta' : 'arena-otra'}
              texto={op === PASAR ? 'Dejar pasar' : `«${negaPorId(op)!.texto}»`} onPress={() => elegir(op)} />
          ))}
        </View>
      </Sube>
      <Feedback
        visible={!!juicio}
        tono={juicio?.tono ?? 'encaja'}
        reaccion={[]}
        novaTexto={juicio?.texto ?? ''}
        accion={juicio?.tono === 'ajusta' ? 'Reintentar' : 'Siguiente tarjeta'}
        onAccion={seguir}
        extra={juicio && juicio.tono !== 'ajusta' ? (
          <Panel>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Eyebrow tint={nova.gold}>{nega.id}</Eyebrow>
              <View style={{ flex: 1 }} />
              <Body size={12.5} style={{ color: nova.muted }}>Revisada</Body>
            </View>
            <Body size={15.5} testID="arena-frase">«{nega.texto}»</Body>
            <Body size={13} style={{ color: nova.muted }}>Qué observar: {nega.queObservar}</Body>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Accion kind="ghost" label={guardada ? 'Guardada' : 'Guardar'} icon="marcador" onPress={() => useNova.getState().guardar(nega.id)} testID="arena-guardar" /></View>
              <View style={{ flex: 1 }}><Accion kind="ghost" label="Ver ficha" onPress={() => { setJuicio(null); router.push(`/nova/ficha/${nega.id}`); }} testID="arena-ficha" /></View>
            </View>
          </Panel>
        ) : undefined}
      />
    </NovaScreen>
  );
}
