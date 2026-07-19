import { useCountdown } from '../hooks/useCountdown';
import styles from './Autopilot.module.css';

export interface AutopilotCell {
  k: string;
  v: string;
}

export interface AutopilotProps {
  /** Small strip label, e.g. "Autopilot" or "Fleet autopilot". */
  label: string;
  /** Mode word — AUTO / MANUAL / STANDBY. */
  mode: string;
  /** The live strategy line. */
  strategy: string;
  /** Labelled readout cells. */
  cells: AutopilotCell[];
  /** Seconds to the next autonomous action (0 = none queued). */
  nextInSeconds: number;
  nextAction: string;
}

/**
 * The autonomy band — Datum stated as an operator, not a viewer. Mode, live
 * strategy, today's autonomous action counts, and a ticking countdown to the
 * next action the system will take on its own.
 */
export function Autopilot({ label, mode, strategy, cells, nextInSeconds, nextAction }: AutopilotProps) {
  const countdown = useCountdown(nextInSeconds);
  const manual = mode !== 'AUTO';

  return (
    <section className={styles.band}>
      <div className={styles.state}>
        <div className={styles.label}>{label}</div>
        <div className={`${styles.mode} ${manual ? styles.manual : ''}`}>{mode}</div>
        <div className={styles.strategy}>{strategy}</div>
      </div>
      <div className={styles.cells}>
        {cells.map((cell) => (
          <div key={cell.k} className={styles.cell}>
            <span className={styles.k}>{cell.k}</span>
            <span className={styles.v}>{cell.v}</span>
          </div>
        ))}
        <div className={`${styles.cell} ${styles.next}`}>
          <span className={styles.k}>Next action</span>
          <span className={styles.v}>
            {nextInSeconds > 0 ? (
              <>
                <span className={styles.count}>{countdown}</span>, {nextAction}
              </>
            ) : (
              <span className={styles.idle}>{nextAction}</span>
            )}
          </span>
        </div>
      </div>
    </section>
  );
}
