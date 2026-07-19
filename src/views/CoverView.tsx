import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ruler } from '../components/Ruler';
import { useClock } from '../hooks/useClock';
import { portfolio, fleetPower } from '../data/fleet';
import { routeList } from '../routes';
import styles from './CoverView.module.css';

/**
 * The start screen — a spec-sheet cover for the whole instrument.
 * Full-bleed, no app chrome. Enter the console via the text link,
 * a module in the index, or the Enter / → key.
 */
export function CoverView() {
  const clock = useClock();
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === 'ArrowRight') {
        navigate('/fleet');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <span className="crop tl" />
        <span className="crop tr" />
        <span className="crop bl" />
        <span className="crop br" />
        {/* Document header */}
        <header className={styles.top}>
          <div className={styles.tag}>
            {portfolio.assetCount} ASSETS, <span className={styles.ink}>{clock}</span> CET, SYNDIS{' '}
            <span className={styles.ink}>✓</span>
          </div>
        </header>
        <hr className="rule" />

        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={styles.wordmark}>DATUM</h1>
          <p className={styles.tagline}>One reference for the whole fleet.</p>
        </div>

        {/* Signature ruler — power gauge */}
        <div className={styles.gauge}>
          <div className={styles.gaugeHead}>
            <span className={styles.gaugeLabel}>Fleet power</span>
            <span className={styles.gaugeValue}>
              {fleetPower.now}
              <span className={styles.ink3}> / {fleetPower.installed} MW</span>
            </span>
          </div>
          <Ruler width={1344} fraction={fleetPower.now / fleetPower.installed} big />
        </div>

        {/* Portfolio spec line */}
        <div className={styles.spec}>{portfolio.title}</div>

        <hr className="rule" />

        {/* Module index — doubles as entry navigation */}
        <nav className={styles.index}>
          {routeList.map((route) => (
            <Link key={route.path} to={route.path} className={styles.row}>
              <span className={styles.label}>{route.label}</span>
            </Link>
          ))}
        </nav>

        <hr className="rule" />

        {/* Footer + primary entry */}
        <footer className={styles.foot}>
          <Link to="/fleet" className="textlink">
            Enter console
          </Link>
          <div className={styles.build}>v0.1, PRESS ENTER</div>
        </footer>
      </div>
    </div>
  );
}
