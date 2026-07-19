import { useEffect, useState } from 'react';
import { Ruler } from '../components/Ruler';
import { integrations } from '../data/integrations';
import styles from './Loader.module.css';

export interface LoaderProps {
  onDone: () => void;
}

/**
 * Boot animation. The ruler marker sweeps 0 → 100 while the source systems
 * light up one by one — Datum drawing many systems into one reference.
 */
export function Loader({ onDone }: LoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((value) => (value >= 100 ? 100 : value + 2));
    }, 26);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = window.setTimeout(onDone, 420);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [progress, onDone]);

  const linked = Math.round((progress / 100) * integrations.length);

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <span className="crop tl" />
        <span className="crop tr" />
        <span className="crop bl" />
        <span className="crop br" />

        <div className={styles.center}>
          <div className={styles.label}>Initialising fleet control</div>
          <h1 className={styles.wordmark}>DATUM</h1>

          <div className={styles.sources}>
            {integrations.map((system, index) => (
              <span key={system.system} className={index < linked ? styles.on : styles.off}>
                {system.system.split(' ')[0]}
              </span>
            ))}
          </div>

          <div className={styles.gauge}>
            <Ruler width={1344} fraction={progress / 100} big />
          </div>
          <div className={styles.meta}>
            <span>Linking sources</span>
            <span className={styles.pct}>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
