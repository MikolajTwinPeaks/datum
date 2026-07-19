/** Integration targets. All data is fictional. */

export type IntegrationStatus = 'sync' | 'read-only';

export interface Integration {
  system: string;
  scope: string;
  status: IntegrationStatus;
}

export const integrations: Integration[] = [
  { system: 'SYNDIS OZE', scope: 'SCADA, telemetry & setpoints', status: 'sync' },
  { system: 'meteocontrol VCOM', scope: 'PV monitoring, PR', status: 'sync' },
  { system: 'OpenEMS', scope: 'BESS control, dispatch', status: 'sync' },
  { system: 'Fiix', scope: 'CMMS, work orders', status: 'sync' },
  { system: 'SAP', scope: 'Finance, P&L posting', status: 'read-only' },
  { system: 'PSE', scope: 'Market, rce-pln & balancing', status: 'sync' },
];
