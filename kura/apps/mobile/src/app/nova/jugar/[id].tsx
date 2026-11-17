import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { escenaPorId, reglaPorId, unidades, type Escena, type Final, type Opcion } from '@/content/nova';
import { barajar, elegirVariante, type Marca, type Resultado } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova, tonoColor } from '@/theme/nova';
import { Icon } from '@/ui/Icon';
import { Body, Display, Tap } from '@/ui/kit';
import { Accion, Barra, Chip, Eyebrow, Feedback, NovaHeader, NovaScreen, Opt, Panel, Sube } from '@/ui/nova';

const iconoFinal = { contacto: 'intencion', conversacion: 'sostener', cierre: 'cierre', noche: 'luna' } as const;

interface Run {
  variante: string;
  orden: Record<string, string[]>;
  paso: string;
  empezo: boolean;
  descartadas: string[];
  historial: { pregunta: string; texto: string }[];
  marcas: { marca: Marca; opcion: string }[];
  ajustes: string[];
  espaldaEn: string | null;
  corrigio: boolean;
  final: Final | null;
  resultado: Resultado | null;
}

export default function Jugar() {
  const { id, v } = useLocalSearchParams<{ id: string; v?: string }>();
  const escena = escenaPorId(id);
  const [vuelta, setVuelta] = useState(0);
  if (!escena) {
    return (
      <NovaScreen>
        <NovaHeader title="NOVA" />
        <Body>No encontré esa escena.</Body>
      </NovaScreen>
    );
  }
  // Cada vuelta monta una partida nueva: otra variante y decisiones en blanco.
  return <Partida key={`${escena.id}-${vuelta}`} escena={escena} pedida={vuelta === 0 ? v : undefined} onOtra={() => setVuelta((n) => n + 1)} />;
}

function Partida({ escena, pedida, onOtra }: { escena: Escena; pedida?: string; onOtra: () => void }) {
  const router = useRouter();
  const [elegida, setElegida] = useState<Opcion | null>(null);
  const [run, setRun] = useState<Run>(() => {
    const prog = useNova.getState().escenas[escena.id];
    const variante = pedida && escena.variantes.some((x) => x.id === pedida) ? pedida : elegirVariante(escena, prog);
    const def = escena.variantes.find((x) => x.id === variante)!;
    // Se barajan las opciones; la reacción y el consejo viajan con cada opción, así que no se descuadran.
    const orden = Object.fromEntries(def.pasos.map((p) => [p.id, barajar(p.opciones.map((o) => o.id))]));
    return { variante, orden, paso: def.inicio, empezo: false, descartadas: [], historial: [], marcas: [], ajustes: [], espaldaEn: null, corrigio: false, final: null, resultado: null };
  });
  useEffect(() => {
    useNova.getState().iniciar(escena, run.variante);
  }, [escena, run.variante]);

  const variante = escena.variantes.find((x) => x.id === run.variante)!;
  const paso = variante.pasos.find((p) => p.id === run.paso);
  const opciones = paso ? run.orden[paso.id].map((oid) => paso.opciones.find((o) => o.id === oid)!) : [];

  const otraVez = onOtra;

  const reiniciar = (
    <Tap onPress={otraVez} accessibilityLabel="Reiniciar con otra variante" testID="nova-reiniciar" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="repaso" size={22} tint={nova.accent} weight={1.7} />
    </Tap>
  );

  /* ------------------------------ Final ------------------------------ */
  if (run.final) {
    const unidad = unidades.find((u) => u.id === escena.habilidad);
    const xp = run.resultado?.xp ?? 0;
    return (
      <NovaScreen footer={
        <View style={{ gap: 10 }}>
          {escena.variantes.length > 1 && <Accion label="Jugar otra variante" icon="repaso" onPress={otraVez} testID="nova-otra-variante" />}
          <Accion kind="ghost" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/nova'))} testID="nova-fin-volver" />
        </View>
      }>
        <NovaHeader title={escena.titulo} />
        <Sube style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 1.6, borderColor: nova.gold, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(243,207,138,0.12)' }}>
            <Icon name={iconoFinal[run.final.tipo]} size={42} tint={nova.gold} />
          </View>
          <Eyebrow tint={nova.gold}>Desenlace</Eyebrow>
          <Display size={32} style={{ textAlign: 'center' }} testID="nova-final-titulo">{run.final.titulo}</Display>
          <Body style={{ textAlign: 'center', color: nova.muted }}>{run.final.texto}</Body>
          <Body bold style={{ color: nova.gold }} testID="nova-final-xp">
            {xp > 0 ? `+${xp} XP` : run.final.tipo === 'noche' ? 'Sin XP esta vez: la misión sigue disponible' : 'Ya habías completado esta variante: sin XP extra'}
          </Body>
        </Sube>
        <Panel>
          <Eyebrow>Tus decisiones · {variante.nombre}</Eyebrow>
          {run.historial.map((h, i) => (
            <View key={i} style={{ gap: 1, paddingVertical: 4 }}>
              <Body size={12.5} style={{ color: nova.muted }}>{h.pregunta}</Body>
              <Body size={14.5}>{h.texto}</Body>
            </View>
          ))}
        </Panel>
        {run.ajustes.length > 0 && escena.habilidad !== 'serio' && (
          <Panel>
            <Eyebrow tint={nova.ajusta}>Agendado en Repaso</Eyebrow>
            <Body size={14.5}>{unidad?.titulo ?? escena.titulo}. NOVA te señaló: {[...new Set(run.ajustes)].map((r) => reglaPorId(r)?.titulo).filter(Boolean).join(' · ')}.</Body>
          </Panel>
        )}
        <Panel>
          <Eyebrow tint={nova.gold}>Lo que deja esta escena</Eyebrow>
          {escena.micro.map((m) => (
            <View key={m} style={{ flexDirection: 'row', gap: 8 }}>
              <Icon name="check" size={16} tint={nova.gold} weight={2} />
              <Body size={14.5} style={{ flex: 1 }}>{m}</Body>
            </View>
          ))}
        </Panel>
      </NovaScreen>
    );
  }

  /* ------------------------------ Contexto inicial ------------------------------ */
  if (!run.empezo) {
    return (
      <NovaScreen footer={<Accion label="Ubicado. Empezar" icon="flecha" onPress={() => setRun({ ...run, empezo: true })} testID="nova-empezar" />}>
        <NovaHeader title={escena.titulo} right={escena.variantes.length > 1 ? reiniciar : undefined} />
        <Sube k={run.variante} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Chip icon="brujula" label={variante.lugar} />
            <Chip label={variante.nombre} tint={nova.gold} />
          </View>
          <Panel strong>
            <Eyebrow>Dónde estás</Eyebrow>
            <Body size={17} testID="nova-contexto">{variante.contexto}</Body>
          </Panel>
          <Panel>
            <Eyebrow tint={nova.gold}>Qué vas a practicar</Eyebrow>
            <Body size={15}>{escena.resumen}</Body>
            <Body size={13} style={{ color: nova.muted }}>{variante.pasos.length} decisiones · una a la vez</Body>
          </Panel>
        </Sube>
      </NovaScreen>
    );
  }
  if (!paso) return null;

  /* ------------------------------ Decisión ------------------------------ */
  const idx = variante.pasos.findIndex((p) => p.id === paso.id);
  const accion = !elegida ? '' : elegida.tono === 'ajusta' ? 'Reintentar' : elegida.ir?.startsWith('fin:') ? 'Ver desenlace' : 'Seguir';

  const resolver = () => {
    const o = elegida;
    if (!o) return;
    setElegida(null);
    if (o.tono === 'ajusta') {
      setRun({ ...run, descartadas: [...run.descartadas, o.id], ajustes: o.regla ? [...run.ajustes, o.regla] : [...run.ajustes, ''].filter(Boolean), espaldaEn: o.regla === 'R-03' ? paso.id : run.espaldaEn });
      return;
    }
    const marcas = o.marca ? [...run.marcas, { marca: o.marca, opcion: o.id }] : run.marcas;
    const corrigio = run.corrigio || run.espaldaEn === paso.id;
    const historial = [...run.historial, { pregunta: paso.pregunta, texto: o.texto }];
    if (o.ir?.startsWith('fin:')) {
      const final = variante.finales.find((f) => f.id === o.ir!.slice(4))!;
      const resultado = useNova.getState().terminar(escena, { variante: variante.id, final: final.tipo, marcas, ajustes: run.ajustes, corrigioEspalda: corrigio });
      setRun({ ...run, marcas, corrigio, historial, final, resultado });
    } else {
      setRun({ ...run, marcas, corrigio, historial, paso: o.ir! });
    }
  };

  const ultima = run.historial[run.historial.length - 1];
  return (
    <NovaScreen>
      <NovaHeader title={escena.titulo} right={escena.variantes.length > 1 ? reiniciar : undefined} />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Chip icon="brujula" label={variante.lugar} />
          <Body size={12.5} style={{ color: nova.muted }} testID="nova-paso">Decisión {idx + 1} de {variante.pasos.length}</Body>
        </View>
        <Barra value={idx / variante.pasos.length} />
      </View>
      <Sube k={paso.id} style={{ gap: 12 }}>
        {ultima && <Body size={12.5} style={{ color: nova.muted }} numberOfLines={2}>Vienes de: {ultima.texto}</Body>}
        <Panel strong>
          <Body size={16.5} testID="nova-escena">{paso.escena}</Body>
          {paso.abre && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="ojo" size={16} tint={nova.encaja} weight={1.7} />
              <Body size={13} style={{ flex: 1, color: nova.encaja }}>Abre: {paso.abre}</Body>
            </View>
          )}
          {paso.espera && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="reloj" size={16} tint={nova.ajusta} weight={1.7} />
              <Body size={13} style={{ flex: 1, color: nova.ajusta }}>Sugiere esperar: {paso.espera}</Body>
            </View>
          )}
        </Panel>
        <Display size={26} testID="nova-pregunta">{paso.pregunta}</Display>
        <View style={{ gap: 10 }}>
          {opciones.map((o, i) => (
            <Sube key={o.id} order={i + 1}>
              <Opt letra={'ABC'[i]} texto={o.texto} descartada={run.descartadas.includes(o.id)} onPress={() => setElegida(o)} testID={`opcion-${o.id}`} />
            </Sube>
          ))}
        </View>
        {run.descartadas.some((d) => paso.opciones.some((o) => o.id === d)) && (
          <Body size={12.5} style={{ color: tonoColor.ajusta }}>Las opciones punteadas ya las probaste. Puedes reintentar las veces que quieras.</Body>
        )}
      </Sube>
      <Feedback
        visible={!!elegida}
        tono={elegida?.tono ?? 'encaja'}
        reaccion={elegida?.reaccion ?? []}
        novaTexto={elegida?.nova ?? ''}
        regla={elegida?.tono === 'ajusta' && elegida.regla ? reglaPorId(elegida.regla)?.titulo : undefined}
        accion={accion}
        onAccion={resolver}
      />
    </NovaScreen>
  );
}
