import styles from './StatusTag.module.css';

export type StatusKind = 'ok' | 'warn' | 'alarm' | 'read-only';

export interface StatusTagProps {
  kind: StatusKind;
  label: string;
  /** Precede the label with a 10px tick mark (oxblood for alarm, ink-3 otherwise). */
  tick?: boolean;
  /** Precede the label with a mono check glyph (integration "✓ sync"). */
  check?: boolean;
}

const toneClass: Record<StatusKind, string> = {
  ok: styles.ok,
  warn: styles.warn,
  alarm: styles.alarm,
  'read-only': styles.readonly,
};

/** Typographic status — never a colored dot or chip. */
export function StatusTag({ kind, label, tick = false, check = false }: StatusTagProps) {
  const tickColor = kind === 'alarm' ? 'var(--accent)' : 'var(--ink-3)';
  return (
    <span className={`${styles.tag} ${toneClass[kind]}`}>
      {tick && (
        <span className={styles.tick} aria-hidden="true">
          <svg width="4" height="11" viewBox="0 0 4 11">
            <line x1="2" y1="0" x2="2" y2="11" stroke={tickColor} strokeWidth="2" />
          </svg>
        </span>
      )}
      {check ? `✓ ${label}` : label}
    </span>
  );
}
