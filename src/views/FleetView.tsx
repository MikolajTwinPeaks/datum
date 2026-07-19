import { KpiBand, Kpi } from '../components/Kpi';
import { TickGauge } from '../components/TickGauge';
import { LedgerTable, LedgerRow, Cell } from '../components/LedgerTable';
import { StatusTag, type StatusKind } from '../components/StatusTag';
import { portfolio, fleetKpis, alarmSummary, fleetPower } from '../data/fleet';
import { assets, type AssetStatus } from '../data/assets';
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
      <div className="eyebrow">01 · Portfolio</div>
      <h1 className="view-title">{portfolio.title}</h1>

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
          {alarmSummary.critical} <span className="accent">critical</span> · {alarmSummary.warning}{' '}
          warning
        </Kpi>
      </KpiBand>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Fleet power</div>
          <div className="sec-note">
            {fleetPower.now} of {fleetPower.installed} MW installed
          </div>
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
          <div className="sec-idx">
            <b>—</b> Assets
          </div>
          <div className="sec-note">7 of {portfolio.assetCount} shown</div>
        </div>
        <LedgerTable
          columns="2.4fr 1fr 1fr 1.3fr 1.3fr"
          head={[
            { label: 'Asset' },
            { label: 'Power' },
            { label: 'Type' },
            { label: 'PR · SoC' },
            { label: 'Status' },
          ]}
        >
          {assets.map((asset) => (
            <LedgerRow key={asset.name}>
              <Cell name>{asset.name}</Cell>
              <Cell tone="ink">{asset.power}</Cell>
              <Cell>{asset.type}</Cell>
              <Cell tone={asset.metricAlarm ? 'accent' : undefined}>{asset.metric}</Cell>
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
          <div className="sec-note">
            {alarmSummary.open} open · {alarmSummary.critical} critical
          </div>
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
