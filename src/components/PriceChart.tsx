import { linearScale, toPoints } from '../lib/svg';

export interface PriceChartProps {
  /** 24 hourly PLN/MWh points. */
  data: number[];
  min?: number;
  max?: number;
}

const WIDTH = 1344;
const HEIGHT = 220;
const PAD_TOP = 26;
const PAD_BOTTOM = 18;

/** A flat ink day-ahead price line with the peak marked in oxblood. */
export function PriceChart({ data, min = 220, max = 840 }: PriceChartProps) {
  const last = data.length - 1;
  const x = linearScale(0, last, 0, WIDTH);
  const y = linearScale(min, max, HEIGHT - PAD_BOTTOM, PAD_TOP);

  const points = toPoints(data.map((value, index) => [x(index), y(value)] as const));

  let peak = -Infinity;
  let peakIndex = 0;
  data.forEach((value, index) => {
    if (value > peak) {
      peak = value;
      peakIndex = index;
    }
  });
  const peakX = x(peakIndex);
  const peakY = y(peak);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', width: '100%', height: 'auto' }}
      role="img"
      aria-label={`Day-ahead price, peak ${peak} at ${peakIndex}h`}
    >
      <line
        x1={0}
        y1={HEIGHT - PAD_BOTTOM}
        x2={WIDTH}
        y2={HEIGHT - PAD_BOTTOM}
        stroke="var(--hairline)"
        strokeWidth={1}
      />
      <polyline fill="none" stroke="var(--ink)" strokeWidth={1.5} points={points} />
      <line
        x1={peakX}
        y1={peakY}
        x2={peakX}
        y2={HEIGHT - PAD_BOTTOM}
        stroke="var(--accent)"
        strokeWidth={1}
      />
      <circle cx={peakX} cy={peakY} r={3.5} fill="var(--accent)" />
      <text
        x={peakX - 4}
        y={peakY - 10}
        textAnchor="end"
        fontFamily="Space Mono, monospace"
        fontSize={13}
        fill="var(--accent)"
      >
        {peak} · {peakIndex}h
      </text>
    </svg>
  );
}
