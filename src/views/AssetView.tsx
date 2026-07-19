import { Navigate, NavLink, Link, useParams } from 'react-router-dom';
import { KpiBand, Kpi } from '../components/Kpi';
import { TickGauge } from '../components/TickGauge';
import { Autopilot } from '../components/Autopilot';
import { LedgerTable, LedgerRow, Cell } from '../components/LedgerTable';
import { StatusTag, type StatusKind } from '../components/StatusTag';
import { CompositionBar } from '../components/CompositionBar';
import { PriceChart } from '../components/PriceChart';
import { DispatchChart } from '../components/DispatchChart';
import { ProductionChart } from '../components/ProductionChart';
import { BankReport } from '../components/BankReport';
import { assets, assetById, type AssetStatus } from '../data/assets';
import { alarmsForAsset, type Severity } from '../data/alarms';
import {
  priceSeries,
  socSeries,
  chargeHours,
  dischargeHours,
  storagePosition,
} from '../data/arbitrage';
import { decimal } from '../lib/format';
import styles from './AssetView.module.css';
import vstyles from './views.module.css';

const HOURS = ['00', '06', '12', '18', '24'];

const statusKind: Record<AssetStatus, StatusKind> = {
  online: 'ok',
  derated: 'warn',
  alarm: 'alarm',
};

const severityTone: Record<Severity, 'accent' | 'i2' | 'i3'> = {
  CRIT: 'accent',
  WARN: 'i2',
  INFO: 'i3',
};

function ChartHours() {
  return (
    <div className="chart-hours">
      {HOURS.map((hour) => (
        <span key={hour}>{hour}</span>
      ))}
    </div>
  );
}

export function AssetView() {
  const { assetId } = useParams();
  const asset = assetById(assetId);

  if (!asset) {
    return <Navigate to="/asset/aurora" replace />;
  }

  const isBess = asset.type === 'BESS';
  const openAlarms = alarmsForAsset(asset.name);
  const yieldMwh = (asset.output ?? []).reduce((a, b) => a + b, 0);
  const specificYield = asset.spec.powerMw
    ? Math.round((yieldMwh / asset.spec.powerMw) * 10) / 10
    : 0;

  function handleExport() {
    // Print-to-PDF: printing.css hides the app and renders the BankReport one-pager.
    window.print();
  }

  return (
    <section className={vstyles.view}>
      <div className={styles.header}>
        <div>
          <h1 className="view-title">{asset.name}</h1>
          <div className={styles.specLine}>{asset.specLine}</div>
        </div>
        <StatusTag kind={statusKind[asset.status]} label={asset.status} tick />
      </div>

      <div className={styles.switcher}>
        {assets.map((item) => (
          <NavLink
            key={item.id}
            to={`/asset/${item.id}`}
            className={({ isActive }) =>
              `${styles.switchItem} ${isActive ? styles.switchActive : ''}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      <KpiBand>
        {asset.kpis.map((kpi) => (
          <Kpi
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            fraction={kpi.fraction}
          />
        ))}
      </KpiBand>

      <Autopilot
        label="Autopilot"
        mode={asset.control.mode}
        strategy={asset.control.strategy}
        cells={[
          { k: 'Actions today', v: String(asset.control.actionsToday) },
          { k: 'Setpoints written', v: String(asset.control.setpointsToday) },
          { k: 'Last action', v: `${asset.control.lastTime}, ${asset.control.lastAction}` },
        ]}
        nextInSeconds={asset.control.nextInSeconds}
        nextAction={asset.control.nextAction}
      />

      {isBess ? (
        <>
          <div className="sec">
            <div className="sec-head">
              <div className="sec-title">Day-ahead price</div>
              <div className="sec-note">PLN/MWh</div>
            </div>
            <hr className="rule" />
            <div style={{ marginTop: 14 }}>
              <PriceChart data={priceSeries} />
            </div>
            <ChartHours />
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
            <ChartHours />
          </div>
        </>
      ) : (
        asset.output &&
        asset.budget && (
          <div className="sec">
            <div className="sec-head">
              <div className="sec-title">Production vs budget</div>
              <div className="sec-note">MW</div>
            </div>
            <hr className="rule" />
            <div style={{ marginTop: 14 }}>
              <ProductionChart output={asset.output} budget={asset.budget} />
            </div>
            <ChartHours />
          </div>
        )
      )}

      <div className="two-col" style={{ marginTop: 56, alignItems: 'start' }}>
        <div>
          <div className="sec-head">
            <div className="sec-title">{isBess ? 'Income statement' : 'Revenue & EBITDA'}</div>
            <div className="sec-note">{asset.pnl.period}</div>
          </div>
          <div className={vstyles.income}>
            <div className={`${vstyles.incRow} ${vstyles.incHead}`}>
              <span>Revenue</span>
              <span />
            </div>
            {asset.pnl.lines.map((line) => (
              <div
                key={line.label}
                className={[
                  vstyles.incRow,
                  line.total ? vstyles.incTotal : '',
                  line.accent ? vstyles.incArb : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={vstyles.lbl}>
                  {line.label}
                  {line.sub && <span className={vstyles.sub}>{line.sub}</span>}
                </span>
                <span className={vstyles.val}>{line.value}</span>
              </div>
            ))}
          </div>

          <CompositionBar title="Revenue composition" segments={asset.pnl.composition} />
        </div>

        <div>
          <div className="sec-head">
            <div className="sec-title">Availability</div>
          </div>
          <hr className="rule" />
          <TickGauge
            value={
              <>
                <span className="accent">{decimal(asset.availabilityPct)}</span>
                <span className="i3" style={{ fontSize: 22 }}>
                  {' '}
                  %
                </span>
              </>
            }
            fraction={asset.availabilityPct / 100}
            width={620}
            captions={['95.0', '97.5', '100 %']}
          />

          {isBess ? (
            <>
              <div className={vstyles.metricBlock} style={{ marginTop: 44 }}>
                <div className={vstyles.metricLabel}>Round-trip efficiency</div>
                <div className={vstyles.metricValue}>
                  {decimal(asset.roundTripPct ?? 0)}
                  <span className={vstyles.metricUnit}> %</span>
                </div>
              </div>
              <div className={vstyles.metricBlock}>
                <div className={vstyles.metricLabel}>Cycles today</div>
                <div className={vstyles.metricValue}>
                  {decimal(asset.cyclesToday ?? 0)}
                  <span className={vstyles.metricUnit}> full-equiv</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={vstyles.metricBlock} style={{ marginTop: 44 }}>
                <div className={vstyles.metricLabel}>Performance ratio</div>
                <div className={vstyles.metricValue}>
                  {asset.prPct}
                  <span className={vstyles.metricUnit}> %</span>
                </div>
              </div>
              <div className={vstyles.metricBlock}>
                <div className={vstyles.metricLabel}>Specific yield, today</div>
                <div className={vstyles.metricValue}>
                  {decimal(specificYield)}
                  <span className={vstyles.metricUnit}> kWh/kWp</span>
                </div>
              </div>
            </>
          )}

          {isBess && (
            <div className={vstyles.metricBlock}>
              <div className={vstyles.metricLabel}>Storage now</div>
              <div className={vstyles.metricValue}>
                {storagePosition.storedMwh}
                <span className={vstyles.metricUnit}> of {storagePosition.capacityMwh} MWh</span>
              </div>
            </div>
          )}

          <button type="button" className="textlink" onClick={handleExport}>
            Export bank report, PDF
          </button>
          <Link className="textlink" to={`/control/${asset.id}`} style={{ marginLeft: 28 }}>
            Dispatch command to O&amp;M
          </Link>
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">
            {isBess ? 'Rack & converter status' : 'Device & string status'}
          </div>
        </div>
        <LedgerTable
          columns="1.5fr 1fr 2.6fr 1fr"
          head={[
            { label: 'Unit' },
            { label: 'Type' },
            { label: 'Note' },
            { label: 'Status', right: true },
          ]}
        >
          {asset.devices.map((device) => (
            <LedgerRow key={device.id}>
              <Cell name size={16}>
                {device.id}
              </Cell>
              <Cell>{device.kind}</Cell>
              <Cell>{device.note}</Cell>
              <Cell right>
                <StatusTag kind={statusKind[device.status]} label={device.status} tick />
              </Cell>
            </LedgerRow>
          ))}
        </LedgerTable>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Open alarms</div>
        </div>
        {openAlarms.length > 0 ? (
          <LedgerTable
            columns="1fr 1.6fr 3.4fr 1fr"
            head={[
              { label: 'Time' },
              { label: 'Asset' },
              { label: 'Note' },
              { label: 'Severity', right: true },
            ]}
          >
            {openAlarms.map((alarm) => (
              <LedgerRow key={alarm.time}>
                <Cell>{alarm.time}</Cell>
                <Cell name size={16}>
                  {alarm.asset}
                </Cell>
                <Cell>{alarm.note}</Cell>
                <Cell right tone={severityTone[alarm.severity]}>
                  {alarm.severity}
                </Cell>
              </LedgerRow>
            ))}
          </LedgerTable>
        ) : (
          <div className={styles.emptyNote}>No open alarms.</div>
        )}
      </div>

      <BankReport asset={asset} />
    </section>
  );
}
