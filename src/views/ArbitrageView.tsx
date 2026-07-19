import { PriceChart } from '../components/PriceChart';
import { DispatchChart } from '../components/DispatchChart';
import { TickGauge } from '../components/TickGauge';
import { LedgerTable, LedgerRow, Cell } from '../components/LedgerTable';
import {
  priceSeries,
  socSeries,
  chargeHours,
  dischargeHours,
  heroProfit,
  dispatchSchedule,
  storagePosition,
} from '../data/arbitrage';
import styles from './views.module.css';

const HOURS = ['00', '06', '12', '18', '24'];

export function ArbitrageView() {
  return (
    <section className={styles.view}>
      <div className={styles.hero}>
        <div className={styles.heroLbl}>Aurora BESS, arbitrage profit today</div>
        <div className={styles.heroNum}>
          {heroProfit}
          <span className={styles.heroUnit}>PLN</span>
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Day-ahead price</div>
          <div className="sec-note">PLN/MWh</div>
        </div>
        <hr className="rule" />
        <div style={{ marginTop: 14 }}>
          <PriceChart data={priceSeries} />
        </div>
        <div className="chart-hours">
          {HOURS.map((hour) => (
            <span key={hour}>{hour}</span>
          ))}
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Dispatch &amp; state of charge</div>
        </div>
        <hr className="rule" />
        <div style={{ marginTop: 14 }}>
          <DispatchChart
            soc={socSeries}
            chargeHours={chargeHours}
            dischargeHours={dischargeHours}
          />
        </div>
        <div className="chart-hours">
          {HOURS.map((hour) => (
            <span key={hour}>{hour}</span>
          ))}
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 56, alignItems: 'start' }}>
        <div>
          <div className="sec-head">
            <div className="sec-title">Dispatch schedule</div>
          </div>
          <LedgerTable
            columns="1.6fr 1.2fr 1fr 1.3fr 1.1fr"
            head={[
              { label: 'Window' },
              { label: 'Action' },
              { label: 'Energy' },
              { label: 'Avg' },
              { label: 'Status', right: true },
            ]}
          >
            {dispatchSchedule.map((row) => {
              const tone = row.active ? 'accent' : undefined;
              return (
                <LedgerRow key={row.window}>
                  <Cell tone={row.active ? 'accent' : 'ink'}>{row.window}</Cell>
                  <Cell tone={tone}>{row.action}</Cell>
                  <Cell tone={tone}>{row.energy}</Cell>
                  <Cell tone={tone}>{row.avg}</Cell>
                  <Cell right tone={tone}>
                    {row.status}
                  </Cell>
                </LedgerRow>
              );
            })}
          </LedgerTable>
        </div>

        <div>
          <div className="sec-head">
            <div className="sec-title">Storage position</div>
          </div>
          <hr className="rule" />
          <TickGauge
            value={
              <>
                {storagePosition.socPct}
                <span className="i3" style={{ fontSize: 22 }}>
                  {' '}
                  %
                </span>{' '}
                <span className="mono i3" style={{ fontSize: 13 }}>
                 , {storagePosition.storedMwh} of {storagePosition.capacityMwh} MWh
                </span>
              </>
            }
            fraction={storagePosition.socPct / 100}
            width={620}
            captions={['0', '50', '100 %']}
          />
        </div>
      </div>
    </section>
  );
}
