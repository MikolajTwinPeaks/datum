import { LedgerTable, LedgerRow, Cell } from '../components/LedgerTable';
import { StatusTag } from '../components/StatusTag';
import { useCountdown } from '../hooks/useCountdown';
import { alarms, orchestration, type Severity } from '../data/alarms';
import { integrations } from '../data/integrations';
import { automationRules } from '../data/automation';
import styles from './views.module.css';

const severityTone: Record<Severity, 'accent' | 'i2' | 'i3'> = {
  CRIT: 'accent',
  WARN: 'i2',
  INFO: 'i3',
};

export function ServiceView() {
  const sla = useCountdown(orchestration.slaSeconds);

  return (
    <section className={styles.view}>
      <h1 className="view-title">One alarm, one work order, one P&amp;L line</h1>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Alarm ledger</div>
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

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Orchestration</div>
        </div>
        <hr className="rule" />
        <div className={styles.orch}>
          <div className={styles.orchFlow}>
            <div className={styles.orchNode}>
              <div className={styles.orchK}>Alarm</div>
              <div className={`${styles.orchV} accent`}>{orchestration.alarmLabel}</div>
              <div className={styles.orchTime}>{orchestration.alarmTime}</div>
            </div>
            <div className={styles.orchMid}>
              <div className={styles.orchRule}>
                RULE 07, <b>{orchestration.rule}</b>
              </div>
              <div className={styles.orchConn} />
            </div>
            <div className={`${styles.orchNode} ${styles.orchRight}`}>
              <div className={styles.orchK}>Work order</div>
              <div className={styles.orchV}>{orchestration.workOrder}</div>
              <div style={{ marginTop: 6 }}>
                <span className={styles.slaLabel}>SLA </span>
                <span className={styles.sla}>{sla}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Automation rules</div>
          <div className="sec-note">armed</div>
        </div>
        <LedgerTable
          columns="0.8fr 2fr 2.4fr 1.4fr 1fr"
          head={[
            { label: 'Rule' },
            { label: 'Trigger' },
            { label: 'Action' },
            { label: 'Scope' },
            { label: 'Fired today', right: true },
          ]}
        >
          {automationRules.map((rule) => (
            <LedgerRow key={rule.id}>
              <Cell name size={16}>
                {rule.id}
              </Cell>
              <Cell>{rule.trigger}</Cell>
              <Cell tone="ink">{rule.action}</Cell>
              <Cell>{rule.scope}</Cell>
              <Cell right tone="ink">
                {rule.firedToday}
              </Cell>
            </LedgerRow>
          ))}
        </LedgerTable>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Integrations</div>
        </div>
        <LedgerTable
          columns="2fr 3fr 1.4fr"
          head={[{ label: 'System' }, { label: 'Scope' }, { label: 'Status', right: true }]}
        >
          {integrations.map((integration) => (
            <LedgerRow key={integration.system}>
              <Cell name size={17}>
                {integration.system}
              </Cell>
              <Cell>{integration.scope}</Cell>
              <Cell right>
                {integration.status === 'sync' ? (
                  <StatusTag kind="ok" label="sync" check />
                ) : (
                  <StatusTag kind="read-only" label="read-only" />
                )}
              </Cell>
            </LedgerRow>
          ))}
        </LedgerTable>
      </div>
    </section>
  );
}
