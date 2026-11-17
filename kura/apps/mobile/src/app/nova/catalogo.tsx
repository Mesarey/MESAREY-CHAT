import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { avanceNegas, publicado } from '@/content/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { font } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Body, Display, Tap } from '@/ui/kit';
import { Barra, Chip, Eyebrow, NovaHeader, NovaScreen, Panel } from '@/ui/nova';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Catalogo() {
  const router = useRouter();
  const st = useNova();
  const [q, setQ] = useState('');
  const [solo, setSolo] = useState(false);
  const lista = publicado.negas.filter((n) => (!solo || st.guardadas.includes(n.id)) && (!q || norm(`${n.id} ${n.texto} ${n.queObservar}`).includes(norm(q))));
  return (
    <NovaScreen>
      <NovaHeader title="Catálogo de negas" />
      <Panel strong>
        <Eyebrow tint={nova.gold}>Avance hacia {avanceNegas.meta.toLocaleString('es-MX')}</Eyebrow>
        <Display size={26} testID="catalogo-revisadas">{avanceNegas.revisadas} negas base revisadas</Display>
        <Barra value={avanceNegas.revisadas / avanceNegas.meta} tint={nova.gold} />
        <Body size={13} style={{ color: nova.muted }} testID="catalogo-aparte">Aparte: {avanceNegas.variantes} variantes · {avanceNegas.borradores} borradores en el flujo editorial (no cuentan ni se muestran aquí).</Body>
      </Panel>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: nova.line, borderRadius: 16, paddingHorizontal: 12, minHeight: 48 }}>
          <Icon name="buscar" size={18} tint={nova.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Buscar frase, ID o detalle" placeholderTextColor="rgba(180,198,228,0.6)" style={{ flex: 1, color: nova.text, fontFamily: font.body, fontSize: 15, paddingVertical: 8 }} testID="catalogo-buscar" accessibilityLabel="Buscar negas" />
        </View>
        <Tap onPress={() => setSolo(!solo)} testID="catalogo-guardadas" accessibilityLabel="Ver solo guardadas" accessibilityState={{ selected: solo }}
          style={{ width: 48, height: 48, borderRadius: 16, borderWidth: 1, borderColor: solo ? nova.gold : nova.line, alignItems: 'center', justifyContent: 'center', backgroundColor: solo ? 'rgba(243,207,138,0.14)' : 'transparent' }}>
          <Icon name="marcador" size={20} tint={solo ? nova.gold : nova.muted} />
        </Tap>
      </View>
      <Body size={12.5} style={{ color: nova.muted }} testID="catalogo-conteo">{lista.length} de {publicado.negas.length}</Body>
      {lista.map((n) => (
        <Tap key={n.id} onPress={() => router.push(`/nova/ficha/${n.id}`)} testID={`nega-${n.id}`} accessibilityLabel={n.texto}
          style={{ gap: 5, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: nova.line, backgroundColor: nova.card }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Eyebrow tint={nova.gold}>{n.id}</Eyebrow>
            {st.negasResueltas.includes(n.id) && <Chip icon="check" label="Resuelta" tint={nova.encaja} />}
            <View style={{ flex: 1 }} />
            {st.guardadas.includes(n.id) && <Icon name="marcador" size={16} tint={nova.gold} />}
          </View>
          <Body size={16}>«{n.texto}»</Body>
          <Body size={13} style={{ color: nova.muted }}>Qué observar: {n.queObservar}</Body>
        </Tap>
      ))}
    </NovaScreen>
  );
}
