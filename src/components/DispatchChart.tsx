import { linearScale, toPoints } from '../lib/svg';

export interface DispatchChartProps {
  /** 24 hourly SoC %, drawn as a dashed ink line. */
  soc: number[];
  /** Hours charged — ink up-ticks. */
  chargeHours: number[];
  /** Hours discharged — oxblood down-ticks. */
  dischargeHours: number[];
}

const WIDTH = 1344;
const HEIGHT = 170;
const MID = 92;
const TICK = 44;

/** Battery schedule as ticks on a baseline, plus a dashed SoC line. */
export function DispatchChart({ soc, chargeHours, dischargeHours }: DispatchChartProps) {
  const last = soc.length - 1;
  const x = linearScale(0, last, 0, WIDTH);
  const ySoc = linearScale(0, 100, HEIGHT - 12, 12);
  const socPoints = toPoints(soc.map((value, index) => [x(index), ySoc(value)] as const));

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', width: '100%', height: 'auto' }}
      role="img"
      aria-label="Dispatch schedule and state of charge"
    >
      <line x1={0} y1={MID} x2={WIDTH} y2={MID} stroke="var(--ink-2)" strokeWidth={1} />

      {chargeHours.map((hour) => (
        <line
          key={`c${hour}`}
          x1={x(hour)}
          y1={MID}
          x2={x(hour)}
          y2={MID - TICK}
          stroke="var(--ink)"
          strokeWidth={6}
        />
      ))}

      {dischargeHours.map((hour) => (
        <line
          key={`d${hour}`}
          x1={x(hour)}
          y1={MID}
          x2={x(hour)}
          y2={MID + TICK}
          stroke="var(--accent)"
          strokeWidth={6}
        />
      ))}

      <polyline
        fill="none"
        stroke="var(--ink)"
        strokeWidth={1.25}
        strokeDasharray="4 4"
        points={socPoints}
      />

      <text x={6} y={16} fontFamily="Space Mono, monospace" fontSize={11} fill="var(--ink-3)">
        CHARGE (ink) · DISCHARGE (oxblood) · SoC (dashed)
      </text>
    </svg>
  );
}
