import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { avanceNegas, escenasSerio, jefeBar, premios, reglas, unidades } from '@/content/nova';
import { estadoMision, nivelNova } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { Icon } from '@/ui/Icon';
import { Body, Display } from '@/ui/kit';
import { Accion, Barra, Entrada, EstadoBadge, Eyebrow, NovaHeader, NovaScreen, Panel, Sube, XpPill } from '@/ui/nova';

function Intro({ onDone }: { onDone: () => void }) {
  return (
    <NovaScreen footer={<Accion label="Va, a jugar" icon="flecha" onPress={onDone} testID="nova-intro-va" />}>
      <NovaHeader title="NOVA" />
      <Sube style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 1.4, borderColor: nova.accent, alignItems: 'center', justifyContent: 'center', backgroundColor: nova.accentSoft }}>
          <Icon name="nova" size={40} tint={nova.accent} />
        </View>
        <Display size={32} style={{ textAlign: 'center' }}>Qué onda. Soy NOVA.</Display>
        <Body style={{ textAlign: 'center', color: nova.muted }}>
          Soy el compa que te dice qué viste, qué puedes decir y cómo ajustar cuando cambia la respuesta. Aquí se juega en escenas cortas: tú decides, yo te explico. Antes de la primera, las reglas de la casa.
        </Body>
      </Sube>
      <Panel>
        <Eyebrow tint={nova.gold}>Reglas de oro · versión corta</Eyebrow>
        {reglas.map((r, i) => (
          <View key={r.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 5 }}>
            <Body size={13} bold style={{ color: nova.gold, width: 22 }}>{i + 1}</Body>
            <View style={{ flex: 1 }}>
              <Body size={15} bold>{r.titulo}</Body>
              <Body size={13.5} style={{ color: nova.muted }}>{r.corta}</Body>
            </View>
          </View>
        ))}
      </Panel>
      <Body size={13} style={{ color: nova.muted, textAlign: 'center' }}>Después viven completas en Reglas de Oro y reaparecen en el juego cuando aplican.</Body>
    </NovaScreen>
  );
}

export default function NovaHub() {
  const router = useRouter();
  const st = useNova();
  if (!st.introVista) return <Intro onDone={st.verIntro} />;

  const n = nivelNova(st.xp);
  const hechas = unidades.filter((u) => u.escenas.some((e) => estadoMision(st.escenas[e]) === 'completada')).length;
  const ganados = Object.keys(st.premios).length;
  const serias = escenasSerio.filter((e) => estadoMision(st.escenas[e.id]) === 'completada').length;
  const ramasJefe = Object.keys(st.escenas[jefeBar.id]?.variantes ?? {}).length;

  return (
    <NovaScreen>
      <NovaHeader title="NOVA" right={<XpPill xp={st.xp} />} onBack={() => router.navigate('/mundos')} />
      <Sube>
        <Panel strong>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 1.4, borderColor: nova.accent, alignItems: 'center', justifyContent: 'center', backgroundColor: nova.accentSoft }}>
              <Icon name="nova" size={30} tint={nova.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>Conversación · atracción · lectura social</Eyebrow>
              <Display size={26} testID="nova-nivel">Nivel {n.nivel}</Display>
              <Body size={13} style={{ color: nova.muted }}>{n.enNivel} / {n.paraSubir} XP para el siguiente</Body>
            </View>
          </View>
          <Barra value={n.enNivel / n.paraSubir} tint={nova.gold} />
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <Body size={13} testID="nova-conteo-misiones" style={{ color: nova.muted }}>Misiones {hechas}/{unidades.length}</Body>
            <Body size={13} testID="nova-conteo-premios" style={{ color: nova.muted }}>Premios {ganados}/{premios.length}</Body>
            <Body size={13} style={{ color: nova.muted }}>Negas {st.negasResueltas.length}/{avanceNegas.revisadas}</Body>
          </View>
        </Panel>
      </Sube>

      <Eyebrow>Juego</Eyebrow>
      <Sube order={1}><Entrada testID="nova-mapa" icon="mapa" titulo="Mapa CHAD" detalle={`Ocho habilidades · ${hechas} completadas`} onPress={() => router.push('/nova/mapa')} /></Sube>
      <Sube order={2}><Entrada testID="nova-prueba" icon="escenarios" titulo="Prueba de Escenarios" detalle={st.recordPrueba ? `Tu mejor resultado: ${st.recordPrueba} de 8` : 'Ocho situaciones, una acción por cada una'} onPress={() => router.push('/nova/prueba')} /></Sube>
      <Sube order={3}><Entrada testID="nova-arena" icon="nega" titulo="Arena de Negas" detalle={`${st.negasResueltas.length} tarjetas distintas resueltas`} onPress={() => router.push('/nova/arena')} /></Sube>
      <Sube order={4}>
        <Entrada testID="nova-jefe" icon="corona" tint={nova.gold} titulo="Jefe de ronda" detalle={ramasJefe ? `Dos amigas en el bar · ${ramasJefe} de ${jefeBar.variantes.length} variantes` : 'Dos amigas en el bar: de ubicar al grupo al cierre'}
          onPress={() => router.push(`/nova/jugar/${jefeBar.id}`)} right={<EstadoBadge estado={estadoMision(st.escenas[jefeBar.id])} />} />
      </Sube>
      <Sube order={5}><Entrada testID="nova-repaso" icon="repaso" titulo="Repaso" detalle={st.repaso.length ? `${st.repaso.length} habilidad${st.repaso.length > 1 ? 'es' : ''} en agenda` : 'Practica lo que te costó'} onPress={() => router.push('/nova/repaso')} /></Sube>

      <Eyebrow>Tu criterio</Eyebrow>
      <Entrada testID="nova-reglas" icon="reglas" tint={nova.gold} titulo="Reglas de Oro" detalle="Las trece reglas de la casa" onPress={() => router.push('/nova/reglas')} />
      <Entrada testID="nova-premios" icon="premios" tint={nova.gold} titulo="Premios" detalle={`${ganados} de ${premios.length} desbloqueados`} onPress={() => router.push('/nova/premios')} />

      <Eyebrow tint={nova.salida}>Ruta aparte</Eyebrow>
      <Entrada testID="nova-serio" icon="serio" tint={nova.salida} titulo="Cuando buscas algo más serio" detalle={`Idealización, reciprocidad, expectativas y compatibilidad · ${serias}/${escenasSerio.length}`} onPress={() => router.push('/nova/serio')} />

      <Eyebrow>Biblioteca</Eyebrow>
      <Entrada testID="nova-catalogo" icon="catalogo" titulo="Catálogo de negas" detalle={`${avanceNegas.revisadas} revisadas de ${avanceNegas.meta.toLocaleString('es-MX')}`} onPress={() => router.push('/nova/catalogo')} />
      <Entrada testID="nova-fuentes" icon="libro" titulo="Fuentes" detalle="Índice de los ocho libros" onPress={() => router.push('/nova/fuentes')} />
      <Entrada testID="nova-widget" icon="widget" titulo="Widget de inicio" detalle="Nega del día o regla clave en tu pantalla" onPress={() => router.push('/nova/widget')} />
      <Entrada testID="nova-editorial" icon="lapiz" tint={nova.muted} titulo="Flujo editorial" detalle="Borradores, tandas y validación" onPress={() => router.push('/nova/editorial')} />
    </NovaScreen>
  );
}
