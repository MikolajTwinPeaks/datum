import { Link } from 'react-router-dom';
import { KpiBand, Kpi } from '../components/Kpi';
import { TickGauge } from '../components/TickGauge';
import { Autopilot } from '../components/Autopilot';
import { LedgerTable, LedgerRow, Cell } from '../components/LedgerTable';
import { StatusTag, type StatusKind } from '../components/StatusTag';
import { portfolio, fleetKpis, alarmSummary, fleetPower } from '../data/fleet';
import { assets, type AssetStatus } from '../data/assets';
import { fleetAutomation } from '../data/automation';
import { alarms, type Severity } from '../data/alarms';
import styles from './views.module.css';

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

export function FleetView() {
  return (
    <section className={styles.view}>
      <h1 className="view-title">Portfolio</h1>
      <div className={styles.specLine}>{portfolio.title}</div>

      <KpiBand>
        {fleetKpis.map((kpi) => (
          <Kpi
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            fraction={kpi.fraction}
          />
        ))}
        <Kpi label="Active alarms" value={String(alarmSummary.open)}>
          {alarmSummary.critical} <span className="accent">critical</span>, {alarmSummary.warning}{' '}
          warning
        </Kpi>
      </KpiBand>

      <Autopilot
        label="Fleet autopilot"
        mode="AUTO"
        strategy="Price optimisation, grid-cap capture, alarm routing"
        cells={[
          { k: 'Assets in auto', v: `${fleetAutomation.assetsAuto} / ${fleetAutomation.assetsTotal}` },
          { k: 'Actions today', v: String(fleetAutomation.actionsToday) },
          { k: 'Setpoints written', v: String(fleetAutomation.setpointsToday) },
          { k: 'Alarms routed', v: fleetAutomation.alarmsRouted },
          { k: 'Clipping captured', v: `${fleetAutomation.clippingCapturedMwh} MWh` },
        ]}
        nextInSeconds={fleetAutomation.nextInSeconds}
        nextAction={`${fleetAutomation.nextAsset}, ${fleetAutomation.nextAction}`}
      />

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Fleet power</div>
        </div>
        <hr className="rule" />
        <TickGauge
          value={
            <>
              {fleetPower.now}
              <span className="i3" style={{ fontSize: 24 }}>
                {' '}
                / {fleetPower.installed} MW
              </span>
            </>
          }
          fraction={fleetPower.now / fleetPower.installed}
          width={1344}
          big
          captions={[
            '0',
            String(Math.round(fleetPower.installed / 2)),
            `${fleetPower.installed} MW`,
          ]}
        />
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Assets</div>
        </div>
        <LedgerTable
          columns="2.4fr 1fr 1fr 1.3fr 1.3fr"
          head={[
            { label: 'Asset' },
            { label: 'Power' },
            { label: 'Type' },
            { label: 'PR, SoC' },
            { label: 'Status' },
          ]}
        >
          {assets.map((asset) => (
            <LedgerRow key={asset.id}>
              <Cell name>
                <Link className="asset-link" to={`/asset/${asset.id}`}>
                  {asset.name}
                </Link>
              </Cell>
              <Cell tone="ink">{asset.spec.powerMw} MW</Cell>
              <Cell>{asset.type}</Cell>
              <Cell tone={asset.fleetMetricAlarm ? 'accent' : undefined}>{asset.fleetMetric}</Cell>
              <Cell>
                <StatusTag kind={statusKind[asset.status]} label={asset.status} tick />
              </Cell>
            </LedgerRow>
          ))}
        </LedgerTable>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Active alarms</div>
        </div>
        <LedgerTable
          columns="1fr 1.6fr 3.4fr 1fr"
          head={[
            { label: 'Time' },
            { label: 'Asset' },
            { label: 'Note' },
            { label: 'Severity', right: true },
          ]}
        >
          {alarms.map((alarm) => (
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
      </div>
    </section>
  );
}
