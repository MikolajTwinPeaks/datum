import styles from './CompositionBar.module.css';

export type Shade = 'a' | 'accent' | 'b';

export interface CompositionSegment {
  label: string;
  percent: number;
  shade: Shade;
}

export interface CompositionBarProps {
  title?: string;
  segments: CompositionSegment[];
}

const shadeVar: Record<Shade, string> = {
  a: 'var(--bar-a)',
  accent: 'var(--accent)',
  b: 'var(--bar-b)',
};

/** A thin composition bar in ink shades, with the moat segment in oxblood. */
export function CompositionBar({ title, segments }: CompositionBarProps) {
  return (
    <div className={styles.comp}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.bar}>
        {segments.map((segment, index) => (
          <span
            key={index}
            style={{ width: `${segment.percent}%`, background: shadeVar[segment.shade] }}
          />
        ))}
      </div>
      <div className={styles.legend}>
        {segments.map((segment, index) => (
          <span key={index} className={styles.key}>
            <span className={styles.swatch} style={{ background: shadeVar[segment.shade] }} />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
}
