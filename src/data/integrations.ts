/** Integration targets and the report index. All data is fictional. */

export type IntegrationStatus = 'sync' | 'read-only';

export interface Integration {
  system: string;
  scope: string;
  status: IntegrationStatus;
}

export const integrations: Integration[] = [
  { system: 'SYNDIS OZE', scope: 'SCADA · telemetry & setpoints', status: 'sync' },
  { system: 'meteocontrol VCOM', scope: 'PV monitoring · PR', status: 'sync' },
  { system: 'OpenEMS', scope: 'BESS control · dispatch', status: 'sync' },
  { system: 'Fiix', scope: 'CMMS · work orders', status: 'sync' },
  { system: 'SAP', scope: 'Finance · P&L posting', status: 'read-only' },
  { system: 'PSE', scope: 'Market · rce-pln & balancing', status: 'sync' },
];

export interface Report {
  name: string;
  scope: string;
  generated: string;
}

export const reports: Report[] = [
  { name: 'Bank report', scope: 'Aurora BESS · Q2 2026', generated: '2026-06-30' },
  { name: 'Portfolio rollup', scope: '47 assets · June 2026', generated: '2026-07-01' },
  { name: 'Availability & PR', scope: 'Fleet · 30 days', generated: '2026-07-18' },
  { name: 'Arbitrage P&L', scope: 'BESS · YTD', generated: '2026-07-19' },
];
