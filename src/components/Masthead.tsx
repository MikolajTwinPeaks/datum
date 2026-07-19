import { useClock } from '../hooks/useClock';
import styles from './Masthead.module.css';

export interface MastheadProps {
  assetCount: number;
}

/** DATUM wordmark, tagline and the live mono status line. */
export function Masthead({ assetCount }: MastheadProps) {
  const clock = useClock();
  return (
    <header className={styles.masthead}>
      <div>
        <div className={styles.wordmark}>DATUM</div>
        <div className={styles.sub}>fleet control</div>
      </div>
      <div className={styles.status}>
        {assetCount} ASSETS · <span className={styles.ok}>{clock}</span> CET · SYNDIS{' '}
        <span className={styles.ok}>✓</span>
      </div>
    </header>
  );
}
