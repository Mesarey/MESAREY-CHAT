import { useState } from 'react';
import { View } from 'react-native';
import { premios, type Premio } from '@/content/nova';
import { nivelNova } from '@/domain/nova';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { Body, Display, Tap } from '@/ui/kit';
import { Accion, Eyebrow, Medalla, NovaHeader, NovaScreen, Panel, Sheet, Sube, XpPill } from '@/ui/nova';

const reconoce: Record<Premio['reconoce'], string> = { observacion: 'Observación', claridad: 'Claridad', conversacion: 'Conversación', reciprocidad: 'Reciprocidad', cierre: 'Cierre', constancia: 'Constancia' };

export default function Premios() {
  const st = useNova();
  const [ver, setVer] = useState<Premio | null>(null);
  const ganados = Object.keys(st.premios).length;
  return (
    <NovaScreen>
      <NovaHeader title="Premios" right={<XpPill xp={st.xp} />} />
      <Panel strong>
        <Eyebrow tint={nova.gold}>Sala de premios</Eyebrow>
        <Display size={26} testID="premios-conteo">{ganados} de {premios.length}</Display>
        <Body size={14} style={{ color: nova.muted }}>Nivel {nivelNova(st.xp).nivel}. Los premios reconocen observación, claridad, conversación, reciprocidad y cierre. Ninguno pide un número de teléfono.</Body>
      </Panel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {premios.map((p, i) => {
          const g = !!st.premios[p.id];
          return (
            <Sube key={p.id} order={i % 6} style={{ flexBasis: 150, flexGrow: 1 }}>
              <Tap onPress={() => setVer(p)} testID={`premio-${p.id}${g ? '-ganado' : ''}`} accessibilityLabel={`${p.titulo}, ${g ? 'desbloqueado' : 'por desbloquear'}`}
                style={{ alignItems: 'center', gap: 6, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: g ? 'rgba(243,207,138,0.55)' : nova.lineSoft, backgroundColor: nova.card, minHeight: 168 }}>
                <Medalla icono={p.icono} ganada={g} size={66} />
                <Body size={14.5} bold style={{ textAlign: 'center', color: g ? nova.text : nova.muted }}>{p.titulo}</Body>
                <Body size={11.5} style={{ color: g ? nova.gold : nova.muted }}>{reconoce[p.reconoce]}</Body>
              </Tap>
            </Sube>
          );
        })}
      </View>
      <Sheet visible={!!ver} onClose={() => setVer(null)} tint={nova.gold} testID="premio-detalle">
        {ver && (
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Medalla icono={ver.icono} ganada={!!st.premios[ver.id]} size={84} />
            <Display size={28} style={{ textAlign: 'center' }}>{ver.titulo}</Display>
            <Eyebrow tint={nova.gold}>{st.premios[ver.id] ? `Desbloqueado el ${st.premios[ver.id]}` : 'Por desbloquear'}</Eyebrow>
            <Body style={{ textAlign: 'center' }} testID="premio-como">{st.premios[ver.id] ? 'Lo desbloqueó: ' : 'Cómo se gana: '}{ver.como}</Body>
            <Body style={{ textAlign: 'center', color: nova.muted, fontStyle: 'italic' }}>{ver.frase}</Body>
            <View style={{ alignSelf: 'stretch', marginTop: 10 }}><Accion label="Cerrar" onPress={() => setVer(null)} testID="premio-cerrar" /></View>
          </View>
        )}
      </Sheet>
    </NovaScreen>
  );
}
