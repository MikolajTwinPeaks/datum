import type { CSSProperties, ReactNode } from 'react';
import styles from './LedgerTable.module.css';

export interface LedgerColumn {
  label: string;
  right?: boolean;
}

export interface LedgerTableProps {
  /** A CSS grid-template-columns string, e.g. "2.4fr 1fr 1fr 1.3fr 1.3fr". */
  columns: string;
  head: LedgerColumn[];
  children: ReactNode;
}

/** A ruled ledger: rows separated by full-width hairlines, header in mono. */
export function LedgerTable({ columns, head, children }: LedgerTableProps) {
  const style = { '--ledger-cols': columns } as CSSProperties;
  return (
    <div className={styles.scroll}>
      <div className={styles.ledger} style={style}>
        <div className={`${styles.row} ${styles.head}`}>
          {head.map((col, index) => (
            <span key={index} className={`${styles.headCell} ${col.right ? styles.right : ''}`}>
              {col.label}
            </span>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

export interface LedgerRowProps {
  children: ReactNode;
}

/** A single ledger row. Compose it from <Cell> children. */
export function LedgerRow({ children }: LedgerRowProps) {
  return <div className={styles.row}>{children}</div>;
}

export type CellTone = 'ink' | 'i2' | 'i3' | 'accent';

export interface CellProps {
  children?: ReactNode;
  /** Render as a Space Grotesk asset/label name instead of mono data. */
  name?: boolean;
  right?: boolean;
  tone?: CellTone;
  /** Override font-size (px) — used for the smaller in-row asset names. */
  size?: number;
}

const toneClass: Record<CellTone, string> = {
  ink: styles.ink,
  i2: styles.i2,
  i3: styles.i3,
  accent: styles.accent,
};

/** A ledger cell. Mono/tabular by default; `name` switches to Space Grotesk. */
export function Cell({ children, name = false, right = false, tone, size }: CellProps) {
  const classNames = [
    name ? styles.name : styles.cell,
    right ? styles.right : '',
    tone ? toneClass[tone] : '',
  ]
    .filter(Boolean)
    .join(' ');
  const style = size ? { fontSize: `${size}px` } : undefined;
  return (
    <span className={classNames} style={style}>
      {children}
    </span>
  );
}
