/**
 * Portfolio-level summary and the Fleet KPI band.
 * All figures are DERIVED from the fleet in ./assets so the headline always
 * matches the asset table. All data is fictional.
 */
import { assets, type AssetDetail } from './assets';

function pvPeak(a: AssetDetail): number {
  if (a.type === 'PV') return a.spec.powerMw;
  if (a.type === 'Hybrid' && a.hybrid) return a.hybrid.pvPeakMw;
  return 0;
}
function bessPower(a: AssetDetail): number {
  if (a.type === 'BESS') return a.spec.powerMw;
  if (a.type === 'Hybrid' && a.hybrid) return a.hybrid.bessPowerMw;
  return 0;
}
function bessEnergy(a: AssetDetail): number {
  if (a.type === 'BESS') return a.spec.energyMwh ?? 0;
  if (a.type === 'Hybrid' && a.hybrid) return a.hybrid.bessEnergyMwh;
  return 0;
}

const total = (f: (a: AssetDetail) => number) => assets.reduce((n, a) => n + f(a), 0);

const pvMw = Math.round(total(pvPeak));
const bessMw = Math.round(total(bessPower));
const bessMwh = Math.round(total(bessEnergy));
const combinedMw = Math.round(total((a) => a.spec.powerMw));
const hybridCount = assets.filter((a) => a.type === 'Hybrid').length;
const avgAvail = Math.round((total((a) => a.availabilityPct) / assets.length) * 10) / 10;

const socAssets = assets.filter((a) => a.socPct != null);
const avgSoc = Math.round(
  socAssets.reduce((n, a) => n + (a.socPct ?? 0), 0) / Math.max(1, socAssets.length),
);

// Snapshot "now": a plausible mid-load fraction of installed capacity.
const nowMw = Math.round(combinedMw * 0.53);
const revenueTodayM = combinedMw * 0.0015;

export interface PortfolioSummary {
  title: string;
  assetCount: number;
}

export const portfolio: PortfolioSummary = {
  title: `${pvMw} MW PV, ${bessMw} MW / ${bessMwh} MWh BESS, ${hybridCount} hybrid sites, ${assets.length} assets`,
  assetCount: assets.length,
};

export interface FleetKpi {
  label: string;
  value: string;
  unit?: string;
  /** Ruler marker position, 0–1. */
  fraction: number;
}

export const fleetKpis: FleetKpi[] = [
  { label: 'Instant power', value: String(nowMw), unit: 'MW', fraction: 0.53 },
  { label: 'State of charge', value: String(avgSoc), unit: '%', fraction: avgSoc / 100 },
  { label: 'Revenue today', value: revenueTodayM.toFixed(2), unit: 'm PLN', fraction: 0.41 },
  { label: 'Availability 30d', value: avgAvail.toFixed(1), unit: '%', fraction: avgAvail / 100 },
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

export const fleetPower: PowerGauge = { now: nowMw, installed: combinedMw };
