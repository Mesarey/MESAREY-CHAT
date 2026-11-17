import { useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { publicado, reglas } from '@/content/nova';
import { indiceDelDia } from '@/domain/nova';
import { useToday } from '@/state/hooks';
import { nova } from '@/theme/nova';
import { Icon } from '@/ui/Icon';
import { Body } from '@/ui/kit';
import { Accion, Eyebrow, NovaHeader, NovaScreen, Panel } from '@/ui/nova';

/** Explica el widget y muestra lo mismo que verá hoy en la pantalla de inicio. */
export default function Widget() {
  const router = useRouter();
  const hoy = useToday();
  const nega = publicado.negas[indiceDelDia(hoy, publicado.negas.length)];
  const regla = reglas[indiceDelDia(hoy, reglas.length)];
  return (
    <NovaScreen>
      <NovaHeader title="Widget de inicio" />
      <Body size={14.5} style={{ color: nova.muted }}>
        {Platform.OS === 'android'
          ? 'Mantén presionada tu pantalla de inicio, entra a Widgets y busca KURA. Hay dos tamaños: «NOVA · compacto» y «NOVA · amplio». Los dos se pueden redimensionar.'
          : 'El widget está disponible en la app de Android.'}
      </Body>
      <Panel strong>
        <Eyebrow>Nega del día</Eyebrow>
        <Body size={17} testID="widget-nega">«{nega.texto}»</Body>
        <Body size={13} style={{ color: nova.muted }}>Qué observar: {nega.queObservar}</Body>
        <Accion kind="ghost" label={`Abrir ${nega.id}`} onPress={() => router.push(`/nova/ficha/${nega.id}`)} testID="widget-abrir-nega" />
      </Panel>
      <Panel strong>
        <Eyebrow tint={nova.gold}>Regla o frase clave</Eyebrow>
        <Body size={17} testID="widget-regla">{regla.titulo}</Body>
        <Body size={13} style={{ color: nova.muted }}>{regla.texto}</Body>
        <Accion kind="ghost" label={`Abrir ${regla.id}`} onPress={() => router.push(`/nova/ficha/${regla.id}`)} testID="widget-abrir-regla" />
      </Panel>
      <Panel>
        <Eyebrow>Cómo se usa</Eyebrow>
        {[
          ['widget', 'Tocar la tarjeta abre esta ficha dentro de NOVA.'],
          ['repaso', '«Otra» cambia la frase sin esperar al día siguiente.'],
          ['ajustes', '«Modo» alterna entre nega del día y regla clave. El engrane abre más opciones: tema y texto discreto.'],
          ['ojo', 'Texto discreto quita la marca NOVA y el ID, y muestra solo reglas de conversación.'],
          ['reloj', 'La frase rota sola cada día. Solo usa contenido revisado.'],
        ].map(([icon, t]) => (
          <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name={icon} size={18} tint={nova.accent} />
            <Body size={14} style={{ flex: 1 }}>{t}</Body>
          </View>
        ))}
      </Panel>
    </NovaScreen>
  );
}
