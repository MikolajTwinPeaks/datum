/** Small SVG geometry helpers for the ruler and the arbitrage charts. */

export interface RulerTick {
  x: number;
  length: number;
}

/**
 * Build the measurement-tick ruler: a row of fine vertical ticks,
 * minor by default, every 10th one major.
 */
export function rulerTicks(
  width: number,
  spacing: number,
  minorLength = 7,
  majorLength = 14,
): RulerTick[] {
  const ticks: RulerTick[] = [];
  let index = 0;
  for (let x = 0.5; x <= width; x += spacing, index += 1) {
    const isMajor = index % 10 === 0;
    ticks.push({ x, length: isMajor ? majorLength : minorLength });
  }
  return ticks;
}

/** A linear scale from a data domain to a pixel range. */
export function linearScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (value: number) => number {
  const span = domainMax - domainMin || 1;
  return (value: number) => rangeMin + ((value - domainMin) / span) * (rangeMax - rangeMin);
}

/** Turn [x, y] pairs into an SVG polyline/polygon `points` string. */
export function toPoints(pairs: Array<readonly [number, number]>): string {
  return pairs.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}
