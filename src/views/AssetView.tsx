import { TickGauge } from '../components/TickGauge';
import { CompositionBar } from '../components/CompositionBar';
import { flagship } from '../data/assets';
import { decimal } from '../lib/format';
import styles from './views.module.css';

function handleExport() {
  // Demo: no real file is produced.
  console.log('Export bank report — PDF (demo)');
}

export function AssetView() {
  return (
    <section className={styles.view}>
      <div className="eyebrow">02 · Asset · {flagship.spec}</div>
      <h1 className="view-title">{flagship.name}</h1>

      <div className="two-col">
        <div>
          <div className="sec-head" style={{ marginTop: 34 }}>
            <div className="sec-title">Income statement</div>
            <div className="sec-note">{flagship.period}</div>
          </div>

          <div className={styles.income}>
            <div className={`${styles.incRow} ${styles.incHead}`}>
              <span>Revenue</span>
              <span />
            </div>
            {flagship.income.map((line) => (
              <div
                key={line.label}
                className={[
                  styles.incRow,
                  line.total ? styles.incTotal : '',
                  line.accent ? styles.incArb : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={styles.lbl}>
                  {line.label}
                  {line.sub && <span className={styles.sub}>{line.sub}</span>}
                </span>
                <span className={styles.val}>{line.value}</span>
              </div>
            ))}
          </div>

          <CompositionBar title="Revenue composition" segments={flagship.composition} />
        </div>

        <div>
          <div className="sec-head" style={{ marginTop: 34 }}>
            <div className="sec-title">Availability</div>
            <div className="sec-note">30 days</div>
          </div>
          <hr className="rule" />
          <TickGauge
            value={
              <>
                <span className="accent">{decimal(flagship.availabilityPct)}</span>
                <span className="i3" style={{ fontSize: 22 }}>
                  {' '}
                  %
                </span>
              </>
            }
            fraction={flagship.availabilityPct / 100}
            width={620}
            captions={['95.0', '97.5', '100 %']}
          />

          <div className={styles.metricBlock} style={{ marginTop: 44 }}>
            <div className={styles.metricLabel}>Round-trip efficiency</div>
            <div className={styles.metricValue}>
              {decimal(flagship.roundTripPct)}
              <span className={styles.metricUnit}> %</span>
            </div>
          </div>

          <div className={styles.metricBlock}>
            <div className={styles.metricLabel}>Cycles, month</div>
            <div className={styles.metricValue}>
              {flagship.cyclesPerMonth}
              <span className={styles.metricUnit}> full-equiv</span>
            </div>
          </div>

          <button type="button" className="textlink" onClick={handleExport}>
            Export bank report <span className="accent">—</span> PDF
          </button>
        </div>
      </div>
    </section>
  );
}
