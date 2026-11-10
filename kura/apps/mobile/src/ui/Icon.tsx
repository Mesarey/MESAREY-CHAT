import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { color } from '@/theme/tokens';

type Draw = (c: string) => React.ReactNode;

function line(d: string): Draw {
  return function drawLine(c) {
    return <Path d={d} stroke={c} />;
  };
}

const icons: Record<string, Draw> = {
  estrella: (c) => (
    <Path
      d="M12 2C12.6 8 16 11.4 22 12C16 12.6 12.6 16 12 22C11.4 16 8 12.6 2 12C8 11.4 11.4 8 12 2Z"
      fill={c}
      stroke="none"
    />
  ),
  casa: line('M4 11l8-7 8 7v8.5a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1V11Z'),
  grid: (c) => (
    <>
      {[4, 13.5].flatMap((x) => [4, 13.5].map((y) => <Rect key={`${x}-${y}`} x={x} y={y} width={6.5} height={6.5} rx={1.4} stroke={c} />))}
    </>
  ),
  perfil: (c) => (
    <>
      <Circle cx={12} cy={8} r={3.6} stroke={c} />
      <Path d="M5 20.5c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" stroke={c} />
    </>
  ),
  campana: line('M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.2h-15L6 16ZM10 20.5a2 2 0 0 0 4 0'),
  buscar: (c) => (
    <>
      <Circle cx={11} cy={11} r={6.2} stroke={c} />
      <Path d="M15.8 15.8l4.7 4.7" stroke={c} />
    </>
  ),
  mic: (c) => (
    <>
      <Rect x={9} y={3} width={6} height={11} rx={3} stroke={c} />
      <Path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke={c} />
    </>
  ),
  enviar: line('M4 12l16-7-6 16-3-6.5L4 12Z'),
  sonido: line('M4 10v4h3l5 4V6L7 10H4ZM16 9a4.2 4.2 0 0 1 0 6M18.6 6.5a8 8 0 0 1 0 11'),
  marcador: line('M7 4h10v16l-5-4-5 4V4Z'),
  flecha: line('M5 12h14M13 6l6 6-6 6'),
  chevron: line('M9 5l7 7-7 7'),
  atras: line('M15 5l-7 7 7 7'),
  corazon: line('M12 20s-7-4.4-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.6 12 20 12 20Z'),
  loto: line(
    'M12 4.5c2.3 2.8 2.3 8 0 11.5c-2.3-3.5-2.3-8.7 0-11.5ZM12 16c-3.6 0-6.6-2.3-7.5-6.2c3.1 .2 5.6 1.8 7.5 6.2ZM12 16c3.6 0 6.6-2.3 7.5-6.2c-3.1 .2-5.6 1.8-7.5 6.2ZM3 15c1.6 3 5 4.5 9 4.5s7.4-1.5 9-4.5',
  ),
  luna: line('M19 14.5A8 8 0 1 1 9.5 5a6.5 6.5 0 0 0 9.5 9.5Z'),
  hoja: line('M5 19C5 10 10 5 19 5c0 9-5 14-14 14ZM5 19l8-8'),
  enfoque: (c) => (
    <>
      <Circle cx={12} cy={12} r={8} stroke={c} />
      <Circle cx={12} cy={12} r={3} stroke={c} />
      <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={c} />
    </>
  ),
  montana: line('M3 19l6-10 3.5 5.5L15 11l6 8H3ZM9 9V5l2.5 1.2L9 7.4'),
  sol: (c) => (
    <>
      <Circle cx={12} cy={12} r={3.6} stroke={c} />
      <Path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M5 5l2.4 2.4M16.6 16.6L19 19M19 5l-2.4 2.4M7.4 16.6L5 19" stroke={c} />
    </>
  ),
  brote: line('M12 20v-8M12 12c0-3.5-2.5-6-6-6c0 3.5 2.5 6 6 6ZM12 14.5c0-3 2-5 5.5-5c0 3-2 5-5.5 5ZM7 20h10'),
  orbita: (c) => (
    <>
      <Circle cx={12} cy={12} r={2.6} stroke={c} />
      <Ellipse cx={12} cy={12} rx={9.5} ry={4.2} stroke={c} transform="rotate(-28 12 12)" />
      <Circle cx={19.5} cy={7.2} r={1.1} fill={c} stroke="none" />
    </>
  ),
  libro: line('M12 7c-2-1.5-5-2-8-1.5v12c3-.5 6 0 8 1.5c2-1.5 5-2 8-1.5v-12c-3-.5-6 0-8 1.5ZM12 7v12'),
  brujula: (c) => (
    <>
      <Circle cx={12} cy={12} r={9} stroke={c} />
      <Path d="M12 5.5l1.8 4.7 4.7 1.8-4.7 1.8-1.8 4.7-1.8-4.7-4.7-1.8 4.7-1.8 1.8-4.7Z" stroke={c} />
    </>
  ),
  reloj: (c) => (
    <>
      <Circle cx={12} cy={12} r={8.5} stroke={c} />
      <Path d="M12 7.5V12l3 2" stroke={c} />
    </>
  ),
  check: line('M5 12.5l4.5 4.5L19 7.5'),
  notas: (c) => (
    <>
      <Rect x={5} y={4} width={14} height={16} rx={2} stroke={c} />
      <Path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" stroke={c} />
    </>
  ),
  barras: line('M6 20v-8M12 20V5M18 20v-5M4 20h16'),
  pagoda: line('M4 10l8-5 8 5M6.5 10v3M17.5 10v3M3 16l9-3.5 9 3.5M7 16v4M17 16v4M5 20h14'),
  columna: line('M6 5h12M7.5 5c0 2 1 2 1 3.5V17M16.5 5c0 2-1 2-1 3.5V17M12 8v9M6 17h12M5 20h14'),
  lapiz: line('M5 19l1-4L16 5l3 3L9 18l-4 1Z'),
  cerrar: line('M6 6l12 12M18 6L6 18'),
  ajustes: line('M4 7h10M18 7h2M4 17h2M10 17h10M16 4.5v5M8 14.5v5'),
};

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size = 24,
  tint = color.gold,
  weight = 1.4,
}: {
  name: string;
  size?: number;
  tint?: string;
  weight?: number;
}) {
  const draw = icons[name] ?? icons.estrella;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
      {draw(tint)}
    </Svg>
  );
}
