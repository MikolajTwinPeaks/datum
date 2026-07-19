/** Portfolio-level summary and the Fleet KPI band. All data is fictional. */

export interface PortfolioSummary {
  title: string;
  assetCount: number;
  markets: number;
}

export const portfolio: PortfolioSummary = {
  title: '612 MW PV · 214 MW / 856 MWh BESS · 47 assets · 6 markets',
  assetCount: 47,
  markets: 6,
};

export interface FleetKpi {
  label: string;
  value: string;
  unit?: string;
  /** Ruler marker position, 0–1. */
  fraction: number;
}

export const fleetKpis: FleetKpi[] = [
  { label: 'Instant power', value: '438', unit: 'MW', fraction: 0.53 },
  { label: 'State of charge', value: '61', unit: '%', fraction: 0.61 },
  { label: 'Revenue today', value: '1.24', unit: 'm PLN', fraction: 0.41 },
  { label: 'Availability 30d', value: '98.7', unit: '%', fraction: 0.987 },
];

export interface AlarmSummary {
  open: number;
  critical: number;
  warning: number;
}

export const alarmSummary: AlarmSummary = { open: 12, critical: 3, warning: 9 };

export interface PowerGauge {
  now: number;
  installed: number;
}

export const fleetPower: PowerGauge = { now: 438, installed: 826 };
