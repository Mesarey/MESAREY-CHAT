import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { escenas, fichasTanda, negaPorId, reglaPorId, reglas, unidades } from '@/content/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { Icon } from '@/ui/Icon';
import { Body, Display } from '@/ui/kit';
import { Accion, Chip, Eyebrow, NovaHeader, NovaScreen, Panel, Sube } from '@/ui/nova';

/** Ficha de una nega (N-…), una regla (R-…) o una ficha de tanda. Es el destino de los toques del widget. */
export default function Ficha() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const st = useNova();
  const nega = negaPorId(id);
  const regla = reglaPorId(id);
  const tanda = fichasTanda.find((f) => f.id === id);
  const guardada = st.guardadas.includes(id);
  const guardar = <Accion kind="ghost" label={guardada ? 'Guardada' : 'Guardar ficha'} icon="marcador" onPress={() => st.guardar(id)} testID="ficha-guardar" />;

  if (nega) {
    return (
      <NovaScreen footer={<View style={{ gap: 10 }}><Accion label="Practicar en la Arena" icon="nega" onPress={() => router.push(`/nova/arena?c=${nega.id}`)} testID="ficha-practicar" />{guardar}</View>}>
        <NovaHeader title="Nega" />
        <Sube style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label={nega.id} tint={nova.gold} />
            <Chip icon="check" label="Revisada" tint={nova.encaja} />
            {nega.procedencia === 'ejemplo_mitsuo' && <Chip label="Ejemplo de Mitsuo" />}
          </View>
          <Display size={30} testID="ficha-texto">«{nega.texto}»</Display>
          <Panel>
            <Eyebrow>Qué observar</Eyebrow>
            <Body size={16} testID="ficha-observar">{nega.queObservar}</Body>
          </Panel>
          <Panel>
            <Eyebrow tint={nova.gold}>Regla de oro</Eyebrow>
            <Body size={14.5} style={{ color: nova.muted }}>{reglaPorId('R-10')!.texto}</Body>
          </Panel>
        </Sube>
      </NovaScreen>
    );
  }
  if (regla) {
    const n = reglas.indexOf(regla) + 1;
    const us = unidades.filter((u) => u.regla === regla.id || u.escenas.some((e) => escenas.find((x) => x.id === e)?.reglas.includes(regla.id)));
    return (
      <NovaScreen footer={<View style={{ gap: 10 }}><Accion label={us[0] ? `Practicar: ${us[0].titulo}` : 'Ir al Mapa CHAD'} icon="flecha" onPress={() => router.push(us[0] ? `/nova/unidad/${us[0].id}` : '/nova/mapa')} testID="ficha-practicar" />{guardar}</View>}>
        <NovaHeader title="Regla de Oro" />
        <Sube style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label={`Regla ${n} · ${regla.id}`} tint={nova.gold} />
            <Chip icon="check" label="Revisada" tint={nova.encaja} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Icon name={regla.icono} size={36} tint={nova.gold} />
            <Display size={28} style={{ flex: 1 }} testID="ficha-texto">{regla.titulo}</Display>
          </View>
          <Panel><Body size={16.5} testID="ficha-observar">{regla.texto}</Body></Panel>
          {us.length > 0 && <Body size={13} style={{ color: nova.muted }}>Aparece en: {us.map((u) => u.titulo).join(' · ')}</Body>}
        </Sube>
      </NovaScreen>
    );
  }
  if (tanda) {
    return (
      <NovaScreen>
        <NovaHeader title="Ficha editorial" />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label={tanda.estado === 'borrador' ? 'Borrador · solo flujo editorial' : tanda.estado} tint={nova.ajusta} />
          <Chip label={tanda.tipo} />
          <Chip label={tanda.ruta === 'principal' ? `CHAD · ${tanda.modulo}` : 'Ruta seria'} tint={nova.salida} />
        </View>
        <Eyebrow tint={nova.gold}>{tanda.id}</Eyebrow>
        <Display size={24}>{tanda.titulo}</Display>
        {tanda.escena && <Panel><Eyebrow>Escena</Eyebrow><Body size={15}>{tanda.escena}</Body></Panel>}
        <Panel><Body size={16} testID="ficha-texto">{tanda.contenido}</Body></Panel>
        {tanda.que_observar && <Panel><Eyebrow>Qué observar</Eyebrow><Body size={15}>{tanda.que_observar}</Body></Panel>}
        <Body size={12.5} style={{ color: nova.muted }}>Procedencia: {tanda.procedencia}</Body>
        {tanda.relacionados.length > 0 && <Eyebrow>Relacionadas</Eyebrow>}
        {tanda.relacionados.map((r) => <Accion key={r} kind="ghost" label={r} onPress={() => router.push(`/nova/ficha/${r}`)} />)}
      </NovaScreen>
    );
  }
  return (
    <NovaScreen>
      <NovaHeader title="NOVA" />
      <Body testID="ficha-no">No encontré la ficha {id}.</Body>
      <Accion label="Ir a NOVA" onPress={() => router.replace('/nova')} />
    </NovaScreen>
  );
}
