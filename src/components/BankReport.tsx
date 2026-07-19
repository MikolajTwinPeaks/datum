import { createPortal } from 'react-dom';
import type { AssetDetail } from '../data/assets';
import { decimal } from '../lib/format';

export interface BankReportProps {
  asset: AssetDetail;
}

/**
 * A print-only bank-report one-pager, portalled to <body> and hidden on screen.
 * `@media print` (printing.css) hides the live app and lays this out on white.
 */
export function BankReport({ asset }: BankReportProps) {
  const generated = new Date().toISOString().slice(0, 10);

  return createPortal(
    <div className="print-report" aria-hidden="true">
      <div className="pr-top">
        <div className="pr-mark">DATUM</div>
        <div className="pr-meta">Bank report, generated {generated}, CET</div>
      </div>
      <hr className="pr-rule-strong" />

      <h1 className="pr-title">{asset.name}</h1>
      <div className="pr-spec">{asset.specLine}</div>
      <div className="pr-period">{asset.pnl.period}</div>

      <div className="pr-section-title">Key figures</div>
      <div className="pr-kpis">
        {asset.kpis.map((kpi) => (
          <div key={kpi.label} className="pr-kpi">
            <div className="pr-kpi-lbl">{kpi.label}</div>
            <div className="pr-kpi-num">
              {kpi.value}
              {kpi.unit && <span>{kpi.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="pr-section-title">Income statement</div>
      <div className="pr-ledger">
        {asset.pnl.lines.map((line) => (
          <div
            key={line.label}
            className={['pr-row', line.total ? 'pr-total' : '', line.accent ? 'pr-accent' : '']
              .filter(Boolean)
              .join(' ')}
          >
            <span>
              {line.label}
              {line.sub ? `, ${line.sub}` : ''}
            </span>
            <span>{line.value}</span>
          </div>
        ))}
      </div>

      <div className="pr-avail">
        Availability, 30 days: <b>{decimal(asset.availabilityPct)} %</b>
      </div>

      <div className="pr-foot">
        DATUM, single reference for the whole fleet, figures in m PLN unless noted, demo data
        (fictional)
      </div>
    </div>,
    document.body,
  );
}
