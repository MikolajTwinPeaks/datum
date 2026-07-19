import { Link } from 'react-router-dom';
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
      <Link to="/" className={styles.brand}>
        <div className={styles.wordmark}>DATUM</div>
        <div className={styles.sub}>Fleet control</div>
      </Link>
      <div className={styles.readout}>
        <div className={styles.cell}>
          <span className={styles.k}>Assets</span>
          <span className={styles.v}>{assetCount}</span>
        </div>
        <div className={styles.cell}>
          <span className={styles.k}>Time, CET</span>
          <span className={styles.v}>{clock}</span>
        </div>
      </div>
    </header>
  );
}
