import type { ReactNode } from 'react';
import { Ruler } from './Ruler';
import styles from './Kpi.module.css';

export interface KpiProps {
  label: string;
  value: string;
  unit?: string;
  /** When set, a small ruler is drawn under the number at this fraction (0–1). */
  fraction?: number;
  /** Alternative footnote (used instead of a ruler), e.g. an alarm breakdown. */
  children?: ReactNode;
}

/** The five-up KPI band container. */
export function KpiBand({ children }: { children: ReactNode }) {
  return <div className={styles.band}>{children}</div>;
}

/** A single KPI cell: mono label, big Archivo number, ruler or footnote. */
export function Kpi({ label, value, unit, fraction, children }: KpiProps) {
  return (
    <div className={styles.kpi}>
      <div className={styles.label}>{label}</div>
      <div className={styles.num}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {fraction != null ? (
        <div className={styles.rulerSlot}>
          <Ruler width={220} fraction={fraction} />
        </div>
      ) : (
        children && <div className={styles.sub}>{children}</div>
      )}
    </div>
  );
}
