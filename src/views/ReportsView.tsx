import { LedgerTable, LedgerRow, Cell } from '../components/LedgerTable';
import { reports } from '../data/integrations';
import styles from './views.module.css';

function exportReport(name: string, format: 'PDF' | 'CSV') {
  // Demo: no real file is produced.
  console.log(`Export ${name} — ${format} (demo)`);
}

export function ReportsView() {
  return (
    <section className={styles.view}>
      <div className="eyebrow">05 · Reports</div>
      <h1 className="view-title">Exportable reference</h1>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Report index</div>
          <div className="sec-note">generated · CET</div>
        </div>
        <LedgerTable
          columns="2.6fr 1.4fr 1.3fr 1.4fr"
          head={[
            { label: 'Report' },
            { label: 'Scope' },
            { label: 'Generated' },
            { label: 'Export', right: true },
          ]}
        >
          {reports.map((report) => (
            <LedgerRow key={report.name}>
              <Cell name>{report.name}</Cell>
              <Cell>{report.scope}</Cell>
              <Cell>{report.generated}</Cell>
              <Cell right>
                <button
                  type="button"
                  className="link-inline"
                  onClick={() => exportReport(report.name, 'PDF')}
                >
                  PDF
                </button>
                <button
                  type="button"
                  className="link-inline"
                  onClick={() => exportReport(report.name, 'CSV')}
                >
                  CSV
                </button>
              </Cell>
            </LedgerRow>
          ))}
        </LedgerTable>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Last export</div>
          <div className="sec-note">Bank report · Aurora BESS</div>
        </div>
        <hr className="rule" />
        <div className={styles.metricBlock} style={{ marginTop: 18 }}>
          <div className="grotesk" style={{ fontSize: 40, letterSpacing: '-0.02em' }}>
            6.4
            <span className="i3" style={{ fontSize: 22 }}>
              {' '}
              m PLN revenue · 5.2 EBITDA
            </span>
          </div>
          <div className="mono i3" style={{ fontSize: 12, letterSpacing: '0.1em', marginTop: 14 }}>
            DATUM · single reference for the whole fleet
          </div>
        </div>
      </div>
    </section>
  );
}
