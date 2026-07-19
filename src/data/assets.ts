/** Fleet assets and the flagship income statement. All data is fictional. */

export type AssetType = 'PV' | 'BESS';
export type AssetStatus = 'online' | 'derated' | 'alarm';

export interface Asset {
  name: string;
  power: string;
  type: AssetType;
  /** Performance metric shown in the ledger, e.g. "PR 84%" or "SoC 61%". */
  metric: string;
  status: AssetStatus;
  /** When true the metric is rendered in oxblood (a degraded reading). */
  metricAlarm?: boolean;
}

export const assets: Asset[] = [
  { name: 'Aurora BESS', power: '200 MW', type: 'BESS', metric: 'SoC 61%', status: 'online' },
  { name: 'Vega', power: '86 MW', type: 'PV', metric: 'PR 84%', status: 'online' },
  { name: 'Orion', power: '68 MW', type: 'PV', metric: 'PR 82%', status: 'online' },
  { name: 'Lyra', power: '92 MW', type: 'PV', metric: 'PR 80%', status: 'derated' },
  {
    name: 'Corvus',
    power: '46 MW',
    type: 'PV',
    metric: 'PR 71%',
    status: 'alarm',
    metricAlarm: true,
  },
  { name: 'Pollux', power: '51 MW', type: 'PV', metric: 'PR 83%', status: 'online' },
  { name: 'Draco', power: '34 MW', type: 'PV', metric: 'PR 85%', status: 'online' },
];

export interface IncomeLine {
  label: string;
  sub?: string;
  value: string;
  /** Emphasise as a subtotal/total (larger, Space Grotesk Medium). */
  total?: boolean;
  /** The arbitrage moat line — rendered in oxblood. */
  accent?: boolean;
}

export interface FlagshipAsset {
  name: string;
  spec: string;
  period: string;
  income: IncomeLine[];
  composition: { label: string; value: string; percent: number; shade: 'a' | 'accent' | 'b' }[];
  availabilityPct: number;
  roundTripPct: number;
  cyclesPerMonth: number;
}

export const flagship: FlagshipAsset = {
  name: 'Aurora BESS',
  spec: 'Aurora BESS 200 MW / 800 MWh',
  period: 'June 2026 · m PLN',
  income: [
    { label: 'Energy sales', sub: 'PV + discharge', value: '1.9' },
    { label: 'BESS arbitrage', sub: 'the moat', value: '3.4', accent: true },
    { label: 'Ancillary', sub: 'mFRR · aFRR', value: '1.1' },
    { label: 'Total revenue', value: '6.4', total: true },
    { label: 'O&M costs & fees', sub: 'opex', value: '−1.2' },
    { label: 'EBITDA', value: '5.2', total: true },
  ],
  composition: [
    { label: 'Energy 1.9', value: '1.9', percent: 29.7, shade: 'a' },
    { label: 'Arbitrage 3.4', value: '3.4', percent: 53.1, shade: 'accent' },
    { label: 'Ancillary 1.1', value: '1.1', percent: 17.2, shade: 'b' },
  ],
  availabilityPct: 99.1,
  roundTripPct: 87.4,
  cyclesPerMonth: 41,
};
