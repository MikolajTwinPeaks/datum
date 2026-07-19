/** Alarm ledger and the service orchestration entry. All data is fictional. */

export type Severity = 'CRIT' | 'WARN' | 'INFO';

export interface Alarm {
  time: string;
  asset: string;
  note: string;
  severity: Severity;
}

export const alarms: Alarm[] = [
  { time: '14:02', asset: 'Corvus 46 MW', note: 'Inverter 3 overtemperature', severity: 'CRIT' },
  {
    time: '13:41',
    asset: 'Lyra 92 MW',
    note: 'String block underperformance −4%',
    severity: 'WARN',
  },
  { time: '12:20', asset: 'Aurora BESS', note: 'Cell imbalance, rack 7', severity: 'WARN' },
  { time: '09:05', asset: 'Vega 86 MW', note: 'Comms timeout, SYNDIS gateway', severity: 'INFO' },
];

export interface Orchestration {
  asset: string;
  subsystem: string;
  alarmLabel: string;
  alarmTime: string;
  rule: string;
  workOrder: string;
  slaSeconds: number;
}

export const orchestration: Orchestration = {
  asset: 'Corvus',
  subsystem: 'Inverter 3',
  alarmLabel: 'Overtemperature',
  alarmTime: '14:02 · CRIT',
  rule: 'critical ↦ Fiix work order + SMS + P&L',
  workOrder: 'Fiix #4821',
  slaSeconds: 3 * 3600 + 47 * 60 + 12,
};
