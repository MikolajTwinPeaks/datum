import { rulerTicks } from '../lib/svg';

export interface RulerProps {
  /** Natural width in px; the SVG scales down responsively below this. */
  width: number;
  /** Marker position as a fraction 0–1. Omit for a plain (unmarked) ruler. */
  fraction?: number | null;
  /** Larger tick geometry for the full-width fleet gauge. */
  big?: boolean;
}

/**
 * The measurement-tick ruler — Datum's house element. A row of fine vertical
 * ticks (every 10th major), optionally marked at `fraction` with an oxblood
 * down-triangle and line. Doubles as a gauge.
 */
export function Ruler({ width, fraction = null, big = false }: RulerProps) {
  const height = big ? 34 : 26;
  const base = 7;
  const spacing = big ? 8 : 9;
  const ticks = rulerTicks(width, spacing);
  const markerX = fraction != null ? fraction * width : null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMinYMid meet"
      style={{ display: 'block', width: '100%', maxWidth: width, height: 'auto' }}
      role="img"
      aria-label={
        markerX != null ? `Gauge at ${Math.round((fraction ?? 0) * 100)} percent` : 'Ruler'
      }
    >
      {ticks.map((tick, index) => (
        <line
          key={index}
          x1={tick.x}
          y1={base}
          x2={tick.x}
          y2={base + tick.length}
          stroke="var(--ink-3)"
          strokeWidth={1}
        />
      ))}
      {markerX != null && (
        <>
          <polygon points={`${markerX - 5},0 ${markerX + 5},0 ${markerX},6`} fill="var(--accent)" />
          <line
            x1={markerX}
            y1={6}
            x2={markerX}
            y2={base + 16}
            stroke="var(--accent)"
            strokeWidth={2}
          />
        </>
      )}
    </svg>
  );
}
