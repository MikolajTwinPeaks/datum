import { linearScale, toPoints } from '../lib/svg';

export interface ProductionChartProps {
  /** 24 hourly actual output, MW. */
  output: number[];
  /** 24 hourly budget/plan, MW. */
  budget: number[];
}

const WIDTH = 1344;
const HEIGHT = 220;
const PAD_TOP = 26;
const PAD_BOTTOM = 18;

/**
 * PV production versus budget — budget as a dashed muted line, actual as a solid
 * ink line. The same flat, marker-light idiom as PriceChart.
 */
export function ProductionChart({ output, budget }: ProductionChartProps) {
  const last = Math.max(output.length, budget.length) - 1;
  const max = Math.max(...budget, ...output) || 1;
  const x = linearScale(0, last, 0, WIDTH);
  const y = linearScale(0, max, HEIGHT - PAD_BOTTOM, PAD_TOP);

  const budgetPoints = toPoints(budget.map((v, i) => [x(i), y(v)] as const));
  const outputPoints = toPoints(output.map((v, i) => [x(i), y(v)] as const));

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', width: '100%', height: 'auto' }}
      role="img"
      aria-label="Production versus budget"
    >
      <line
        x1={0}
        y1={HEIGHT - PAD_BOTTOM}
        x2={WIDTH}
        y2={HEIGHT - PAD_BOTTOM}
        stroke="var(--hairline)"
        strokeWidth={1}
      />
      <polyline
        fill="none"
        stroke="var(--ink-3)"
        strokeWidth={1.25}
        strokeDasharray="4 4"
        points={budgetPoints}
      />
      <polyline fill="none" stroke="var(--ink)" strokeWidth={1.5} points={outputPoints} />
      <text
        x={6}
        y={16}
        style={{ fontFamily: 'var(--font-mono)' }}
        fontSize={11}
        fill="var(--ink-3)"
      >
        ACTUAL (ink), BUDGET (dashed), MW
      </text>
    </svg>
  );
}
