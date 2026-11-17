import { useRouter } from 'expo-router';
import { libros, pasajes } from '@/content/nova';
import { nova } from '@/theme/nova';
import { Body } from '@/ui/kit';
import { Chip, Entrada, NovaHeader, NovaScreen, Sube } from '@/ui/nova';

export default function Fuentes() {
  const router = useRouter();
  return (
    <NovaScreen>
      <NovaHeader title="Fuentes" />
      <Body size={14} style={{ color: nova.muted }}>
        Índice de los ocho libros del Banco Oficial. Cada pasaje conserva libro, autor y página cuando está registrada. Las escenas y frases de NOVA van marcadas como adaptación u original.
      </Body>
      {libros.map((l, i) => (
        <Sube key={l.id} order={i}>
          <Entrada icon="libro" tint={l.ruta === 'principal' ? nova.accent : nova.salida} titulo={l.titulo} testID={`libro-${l.id}`}
            detalle={`${l.autor} · ${pasajes.filter((p) => p.libro === l.id).length} pasajes${l.ruta === 'principal' ? '' : ' · Ruta seria'}`} onPress={() => router.push(`/nova/libro/${l.id}`)} />
        </Sube>
      ))}
      <Chip label="Del amor pertenece a «Cuando buscas algo más serio» y está excluido de CHAD" tint={nova.salida} />
    </NovaScreen>
  );
}
