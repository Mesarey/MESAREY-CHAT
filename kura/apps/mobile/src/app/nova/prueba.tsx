import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { casosPrueba, etiquetaCategoria, reglaPorId, type CasoPrueba } from '@/content/nova';
import { barajar, type Resultado } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { Body, Display } from '@/ui/kit';
import { Accion, Barra, Chip, Eyebrow, Feedback, NovaHeader, NovaScreen, Opt, Panel, Sube } from '@/ui/nova';

const RONDA = 8;

/** Una ronda mezcla las seis categorías y no repite casos. */
function armarRonda(): CasoPrueba[] {
  const cats = [...new Set(casosPrueba.map((c) => c.categoria))];
  const uno = cats.map((cat) => barajar(casosPrueba.filter((c) => c.categoria === cat))[0]);
  const resto = barajar(casosPrueba.filter((c) => !uno.includes(c))).slice(0, RONDA - uno.length);
  return barajar([...uno, ...resto]);
}

export default function Prueba() {
  const router = useRouter();
  const record = useNova((s) => s.recordPrueba);
  const [n, setN] = useState(0);
  const ronda = useMemo(() => armarRonda(), [n]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [fin, setFin] = useState<Resultado | null>(null);
  const caso = ronda[i];
  const opciones = useMemo(() => barajar(caso.opciones.map((o, k) => ({ ...o, k }))), [caso]);

  const siguiente = () => {
    const ok = pick !== null && opciones[pick].acierta;
    const total = aciertos + (ok ? 1 : 0);
    setAciertos(total);
    setPick(null);
    if (i + 1 >= ronda.length) setFin(useNova.getState().prueba(total));
    else setI(i + 1);
  };
  const otra = () => { setN(n + 1); setI(0); setAciertos(0); setPick(null); setFin(null); };

  if (fin) {
    return (
      <NovaScreen footer={<View style={{ gap: 10 }}><Accion label="Otra ronda" icon="repaso" onPress={otra} testID="prueba-otra" /><Accion kind="ghost" label="Volver" onPress={() => router.back()} /></View>}>
        <NovaHeader title="Prueba de Escenarios" />
        <Sube style={{ alignItems: 'center', gap: 8, marginTop: 20 }}>
          <Eyebrow tint={nova.gold}>Resultado</Eyebrow>
          <Display size={64} style={{ color: nova.gold }} testID="prueba-resultado">{aciertos}/{ronda.length}</Display>
          <Body style={{ color: nova.muted }} testID="prueba-record">Tu mejor resultado: {Math.max(record, aciertos)} de {RONDA}</Body>
          <Body bold style={{ color: nova.gold }} testID="prueba-xp">{fin.xp > 0 ? `+${fin.xp} XP por mejorar tu récord` : 'Sin XP: el récord sigue igual. Repetir no multiplica puntos.'}</Body>
        </Sube>
      </NovaScreen>
    );
  }

  const o = pick !== null ? opciones[pick] : null;
  const mejor = caso.opciones.find((x) => x.acierta)!;
  return (
    <NovaScreen>
      <NovaHeader title="Prueba de Escenarios" />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip label={etiquetaCategoria[caso.categoria]} />
          <Body size={12.5} style={{ color: nova.muted }} testID="prueba-paso">{i + 1} de {ronda.length} · récord {record}</Body>
        </View>
        <Barra value={i / ronda.length} />
      </View>
      <Sube k={caso.id} style={{ gap: 12 }}>
        <Panel strong><Body size={17} testID="prueba-situacion">{caso.situacion}</Body></Panel>
        <Display size={24}>¿Qué haces?</Display>
        <View style={{ gap: 10 }}>
          {opciones.map((x, k) => <Opt key={x.k} letra={'ABC'[k]} texto={x.texto} onPress={() => setPick(k)} testID={`prueba-op-${x.acierta ? 'ok' : `no${x.k}`}`} />)}
        </View>
      </Sube>
      <Feedback
        visible={!!o}
        tono={o?.acierta ? 'encaja' : 'ajusta'}
        reaccion={o && !o.acierta ? [{ quien: 'Escena', texto: `Lo que mejor encajaba: ${mejor.texto}` }] : []}
        novaTexto={o ? (o.acierta ? o.nova : `${o.nova} ${mejor.nova}`) : ''}
        regla={caso.regla ? reglaPorId(caso.regla)?.titulo : undefined}
        accion={i + 1 >= ronda.length ? 'Ver resultado' : 'Siguiente'}
        onAccion={siguiente}
      />
    </NovaScreen>
  );
}
