import { useEffect, useState } from 'react';
import { LedgerTable, LedgerRow, Cell } from '../components/LedgerTable';
import { BankReport } from '../components/BankReport';
import { assets, type AssetDetail } from '../data/assets';
import { dispatchSchedule, heroProfit } from '../data/arbitrage';
import { downloadCsv } from '../lib/csv';
import styles from './views.module.css';

const GENERATED = new Date().toISOString().slice(0, 10);

function totalRevenue(asset: AssetDetail): string {
  return asset.pnl.lines.find((line) => line.label === 'Total revenue')?.value ?? '0';
}

function ebitda(asset: AssetDetail): string {
  return asset.pnl.lines.find((line) => line.label === 'EBITDA')?.value ?? '0';
}

function exportPortfolio() {
  downloadCsv(
    'datum-portfolio-rollup.csv',
    [
      'Asset',
      'Type',
      'Power',
      'Unit',
      'Metric',
      'Availability %',
      'Revenue m PLN',
      'EBITDA m PLN',
      'Status',
    ],
    assets.map((asset) => [
      asset.name,
      asset.type,
      asset.spec.powerMw,
      asset.type === 'BESS' ? 'MW' : 'MWp',
      asset.fleetMetric,
      asset.availabilityPct,
      totalRevenue(asset),
      ebitda(asset),
      asset.status,
    ]),
  );
}

function exportAvailability() {
  downloadCsv(
    'datum-availability-30d.csv',
    ['Asset', 'Type', 'Availability 30d %', 'PR / SoC', 'Status'],
    assets.map((asset) => [
      asset.name,
      asset.type,
      asset.availabilityPct,
      asset.fleetMetric,
      asset.status,
    ]),
  );
}

function exportArbitrage() {
  const rows: (string | number)[][] = dispatchSchedule.map((window) => [
    window.window,
    window.action,
    parseInt(window.energy, 10),
    window.avg,
    window.status,
  ]);
  rows.push(['Arbitrage profit today (PLN)', heroProfit.replace(/\s/g, ''), '', '', '']);
  downloadCsv(
    'datum-arbitrage-pnl.csv',
    ['Window', 'Action', 'Energy MWh', 'Avg PLN/MWh', 'Status'],
    rows,
  );
}

interface FleetReport {
  name: string;
  scope: string;
  onExport: () => void;
}

const fleetReports: FleetReport[] = [
  {
    name: 'Portfolio rollup',
    scope: '47 assets, power, PR/SoC, availability, revenue',
    onExport: exportPortfolio,
  },
  { name: 'Availability & PR', scope: 'Fleet, 30 days', onExport: exportAvailability },
  {
    name: 'Arbitrage P&L',
    scope: 'Aurora BESS, dispatch & profit, today',
    onExport: exportArbitrage,
  },
];

export function ReportsView() {
  const [printAsset, setPrintAsset] = useState<AssetDetail | null>(null);

  useEffect(() => {
    if (!printAsset) {
      return;
    }
    window.print();
    setPrintAsset(null);
  }, [printAsset]);

  return (
    <section className={styles.view}>
      <h1 className="view-title">Exportable reference</h1>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Fleet reports</div>
        </div>
        <LedgerTable
          columns="2.4fr 2.2fr 1.1fr 1fr"
          head={[
            { label: 'Report' },
            { label: 'Scope' },
            { label: 'Generated' },
            { label: 'Export', right: true },
          ]}
        >
          {fleetReports.map((report) => (
            <LedgerRow key={report.name}>
              <Cell name>{report.name}</Cell>
              <Cell>{report.scope}</Cell>
              <Cell>{GENERATED}</Cell>
              <Cell right>
                <button type="button" className="link-inline" onClick={report.onExport}>
                  CSV
                </button>
              </Cell>
            </LedgerRow>
          ))}
        </LedgerTable>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Bank reports</div>
        </div>
        <LedgerTable
          columns="1.6fr 2.6fr 1.1fr 1fr"
          head={[
            { label: 'Asset' },
            { label: 'Scope' },
            { label: 'Period' },
            { label: 'Export', right: true },
          ]}
        >
          {assets.map((asset) => (
            <LedgerRow key={asset.id}>
              <Cell name>{asset.name}</Cell>
              <Cell>
                {asset.type}, {asset.spec.location}
              </Cell>
              <Cell>Q2 2026</Cell>
              <Cell right>
                <button type="button" className="link-inline" onClick={() => setPrintAsset(asset)}>
                  PDF
                </button>
              </Cell>
            </LedgerRow>
          ))}
        </LedgerTable>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Last export</div>
        </div>
        <hr className="rule" />
        <div className={styles.metricBlock} style={{ marginTop: 18 }}>
          <div className="grotesk" style={{ fontSize: 40, letterSpacing: '-0.02em' }}>
            6.4
            <span className="i3" style={{ fontSize: 22 }}>
              {' '}
              m PLN revenue, 5.2 EBITDA
            </span>
          </div>
          <div className="mono i3" style={{ fontSize: 12, letterSpacing: '0.1em', marginTop: 14 }}>
            DATUM, single reference for the whole fleet
          </div>
        </div>
      </div>

      {printAsset && <BankReport asset={printAsset} />}
    </section>
  );
}
