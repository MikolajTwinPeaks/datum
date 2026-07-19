import type { ReactNode } from 'react';
import { Ruler } from './Ruler';
import styles from './TickGauge.module.css';

export interface TickGaugeProps {
  /** Hero value markup (numbers + units). */
  value: ReactNode;
  /** Ruler marker position 0–1. */
  fraction: number;
  /** Natural ruler width in px. */
  width: number;
  /** Optional three-part scale caption: left, mid, right. */
  captions?: [string, string, string];
  big?: boolean;
}

/** A ringless, tick-ruler gauge: a hero value above a marked measurement ruler. */
export function TickGauge({ value, fraction, width, captions, big = false }: TickGaugeProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.value}>{value}</div>
      <div className={styles.rulerSlot}>
        <Ruler width={width} fraction={fraction} big={big} />
      </div>
      {captions && (
        <div className={styles.caption} style={{ maxWidth: width }}>
          <span>{captions[0]}</span>
          <span>{captions[1]}</span>
          <span>{captions[2]}</span>
        </div>
      )}
    </div>
  );
}
