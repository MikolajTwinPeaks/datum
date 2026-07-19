/**
 * Per-asset detail for the fleet. All data is fictional and internally consistent.
 * PV assets carry an hourly output/budget curve; the BESS asset carries storage
 * and cycling figures (its price/dispatch/SoC series live in ./arbitrage).
 */
import { decimal } from '../lib/format';

export type AssetType = 'PV' | 'BESS' | 'Hybrid';
export type AssetStatus = 'online' | 'derated' | 'alarm';
export type ControlMode = 'AUTO' | 'MANUAL' | 'STANDBY';

/** How Datum is actively running the asset — the automation surfaced as data. */
export interface AssetControl {
  mode: ControlMode;
  /** The live optimisation strategy, e.g. "Arbitrage + grid cap". */
  strategy: string;
  /** Autonomous control actions executed today. */
  actionsToday: number;
  /** Setpoints written to SCADA today. */
  setpointsToday: number;
  /** The last automatic action. */
  lastTime: string;
  lastAction: string;
  /** The next scheduled automatic action, with a live countdown. */
  nextAction: string;
  nextInSeconds: number;
}

/** Co-located PV + BESS behind one grid connection — where automation earns most. */
export interface HybridDetail {
  pvPeakMw: number;
  bessPowerMw: number;
  bessEnergyMwh: number;
  /** Point-of-interconnection export cap, MW. */
  poiCapMw: number;
  socPct: number;
  /** PV clipping the battery captured today instead of spilling, MWh. */
  clippingCapturedMwh: number;
  /** PV energy shifted to the evening peak today, MWh. */
  shiftedMwh: number;
}

export interface AssetSpec {
  powerMw: number;
  /** BESS energy capacity. */
  energyMwh?: number;
  location: string;
  commissioned: string;
}

export interface DeviceStatus {
  id: string;
  kind: string;
  status: AssetStatus;
  note: string;
}

export interface PnlLine {
  label: string;
  sub?: string;
  value: string;
  /** Emphasise as a subtotal/total (larger, Archivo Medium). */
  total?: boolean;
  /** The most important / contracted line — rendered in oxblood. */
  accent?: boolean;
}

export interface CompositionSegment {
  label: string;
  percent: number;
  shade: 'a' | 'accent' | 'b';
}

export interface AssetKpi {
  label: string;
  value: string;
  unit?: string;
  fraction: number;
}

export interface AssetPnl {
  period: string;
  lines: PnlLine[];
  composition: CompositionSegment[];
}

export interface AssetDetail {
  id: string;
  name: string;
  type: AssetType;
  spec: AssetSpec;
  /** Chivo Mono spec line under the asset name. */
  specLine: string;
  status: AssetStatus;
  /** Metric shown in the Fleet ledger, e.g. "PR 84%" or "SoC 61%". */
  fleetMetric: string;
  fleetMetricAlarm?: boolean;
  availabilityPct: number;
  prPct?: number;
  kpis: AssetKpi[];
  /** PV: hourly output (MW) actual vs budget. */
  output?: number[];
  budget?: number[];
  pnl: AssetPnl;
  devices: DeviceStatus[];
  /** How Datum is running this asset right now. */
  control: AssetControl;
  /** BESS extras. */
  socPct?: number;
  cyclesToday?: number;
  roundTripPct?: number;
  /** Hybrid PV + BESS extras. */
  hybrid?: HybridDetail;
}

// ---- helpers -------------------------------------------------------------

/** Normalised PV generation shape across 24 hours (0 at night, 1 at noon). */
const PV_SHAPE = [
  0, 0, 0, 0, 0, 0.04, 0.16, 0.34, 0.54, 0.72, 0.86, 0.95, 1, 0.98, 0.9, 0.77, 0.6, 0.4, 0.2, 0.06,
  0, 0, 0, 0,
];

const round1 = (n: number) => Math.round(n * 10) / 10;
const sum = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0));
const clamp = (n: number) => Math.max(0, Math.min(1, n));

function pvSeries(peakMw: number, factor: number): number[] {
  return PV_SHAPE.map((s) => round1(s * peakMw * factor));
}

function pvComposition(spot: number, ppa: number, goo: number): CompositionSegment[] {
  const total = spot + ppa + goo;
  return [
    { label: `Spot ${spot.toFixed(1)}`, percent: round1((spot / total) * 100), shade: 'a' },
    { label: `PPA ${ppa.toFixed(1)}`, percent: round1((ppa / total) * 100), shade: 'accent' },
    { label: `GoO ${goo.toFixed(1)}`, percent: round1((goo / total) * 100), shade: 'b' },
  ];
}

function pvPnl(spot: number, ppa: number, goo: number, om: number): PnlLine[] {
  const total = round1(spot + ppa + goo);
  const ebitda = round1(total - om);
  return [
    { label: 'Spot sales', sub: 'day-ahead + intraday', value: spot.toFixed(1) },
    { label: 'PPA / CfD', sub: 'contracted', value: ppa.toFixed(1), accent: true },
    { label: 'Guarantees of origin', sub: 'GoO', value: goo.toFixed(1) },
    { label: 'Total revenue', value: total.toFixed(1), total: true },
    { label: 'O&M costs & fees', sub: 'opex', value: `−${om.toFixed(1)}` },
    { label: 'EBITDA', value: ebitda.toFixed(1), total: true },
  ];
}

interface PvInput {
  id: string;
  name: string;
  powerMw: number;
  location: string;
  commissioned: string;
  status: AssetStatus;
  prPct: number;
  availabilityPct: number;
  /** Actual capacity factor at noon vs nameplate (drives the output curve). */
  actualFactor: number;
  revenue: { spot: number; ppa: number; goo: number; om: number };
  devices: DeviceStatus[];
}

/** PV control profile: Datum guards PR and curtails only on negative prices. */
function pvControl(status: AssetStatus): AssetControl {
  if (status === 'alarm') {
    return {
      mode: 'MANUAL',
      strategy: 'Operator override, fault isolation',
      actionsToday: 0,
      setpointsToday: 0,
      lastTime: '14:02',
      lastAction: 'Auto-control released to operator on trip',
      nextAction: 'Awaiting clearance',
      nextInSeconds: 0,
    };
  }
  return {
    mode: 'AUTO',
    strategy: 'PR guard, price-aware curtailment',
    actionsToday: status === 'derated' ? 2 : 4,
    setpointsToday: status === 'derated' ? 2 : 4,
    lastTime: '12:00',
    lastAction: 'Setpoint 100%, price above floor',
    nextAction: 'Curtail only if price < 0',
    nextInSeconds: 0,
  };
}

function makePv(input: PvInput): AssetDetail {
  const budget = pvSeries(input.powerMw, 0.9);
  const output = pvSeries(input.powerMw, input.actualFactor);
  const instant = Math.round(output[12]);
  const yieldMwh = sum(output);
  const budgetMwh = sum(budget);
  const { spot, ppa, goo, om } = input.revenue;

  return {
    id: input.id,
    name: input.name,
    type: 'PV',
    spec: { powerMw: input.powerMw, location: input.location, commissioned: input.commissioned },
    specLine: `${input.powerMw} MWp, ${input.location}, commissioned ${input.commissioned}`,
    status: input.status,
    fleetMetric: `PR ${input.prPct}%`,
    fleetMetricAlarm: input.status === 'alarm',
    availabilityPct: input.availabilityPct,
    prPct: input.prPct,
    kpis: [
      {
        label: 'Instant power',
        value: String(instant),
        unit: 'MW',
        fraction: clamp(instant / input.powerMw),
      },
      {
        label: "Today's yield",
        value: String(yieldMwh),
        unit: 'MWh',
        fraction: clamp(yieldMwh / budgetMwh),
      },
      {
        label: 'Performance ratio',
        value: String(input.prPct),
        unit: '%',
        fraction: clamp(input.prPct / 100),
      },
      {
        label: 'Availability 30d',
        value: decimal(input.availabilityPct),
        unit: '%',
        fraction: clamp(input.availabilityPct / 100),
      },
      {
        label: 'Yield vs budget',
        value: String(Math.round((yieldMwh / budgetMwh) * 100)),
        unit: '%',
        fraction: clamp(yieldMwh / budgetMwh),
      },
    ],
    output,
    budget,
    pnl: {
      period: 'June 2026, m PLN',
      lines: pvPnl(spot, ppa, goo, om),
      composition: pvComposition(spot, ppa, goo),
    },
    devices: input.devices,
    control: pvControl(input.status),
  };
}

// ---- hybrids (co-located PV + BESS) --------------------------------------

interface HybridInput {
  id: string;
  name: string;
  pvPeakMw: number;
  bessPowerMw: number;
  bessEnergyMwh: number;
  poiCapMw: number;
  location: string;
  commissioned: string;
  prPct: number;
  socPct: number;
  availabilityPct: number;
  actualFactor: number;
  clippingCapturedMwh: number;
  shiftedMwh: number;
  /** Revenue split, m PLN: PV spot/ppa, BESS arbitrage, ancillary, O&M. */
  revenue: { spot: number; ppa: number; arbitrage: number; ancillary: number; om: number };
  actionsToday: number;
  setpointsToday: number;
  devices: DeviceStatus[];
}

function makeHybrid(input: HybridInput): AssetDetail {
  // PV output is capped at the grid connection; the excess is what the battery captures.
  const rawOutput = pvSeries(input.pvPeakMw, input.actualFactor);
  const output = rawOutput.map((v) => Math.min(v, input.poiCapMw));
  const budget = pvSeries(input.pvPeakMw, 0.9).map((v) => Math.min(v, input.poiCapMw));
  const instant = Math.round(output[12]);
  const { spot, ppa, arbitrage, ancillary, om } = input.revenue;
  const total = round1(spot + ppa + arbitrage + ancillary);
  const ebitda = round1(total - om);
  const combinedMw = input.pvPeakMw + input.bessPowerMw;

  return {
    id: input.id,
    name: input.name,
    type: 'Hybrid',
    spec: {
      powerMw: combinedMw,
      energyMwh: input.bessEnergyMwh,
      location: input.location,
      commissioned: input.commissioned,
    },
    specLine: `${input.pvPeakMw} MWp PV + ${input.bessPowerMw} MW / ${input.bessEnergyMwh} MWh BESS, cap ${input.poiCapMw} MW, ${input.location}`,
    status: 'online',
    fleetMetric: `PR ${input.prPct}%, SoC ${input.socPct}%`,
    availabilityPct: input.availabilityPct,
    prPct: input.prPct,
    socPct: input.socPct,
    kpis: [
      {
        label: 'Net export',
        value: String(Math.min(instant, input.poiCapMw)),
        unit: 'MW',
        fraction: clamp(Math.min(instant, input.poiCapMw) / input.poiCapMw),
      },
      { label: 'State of charge', value: String(input.socPct), unit: '%', fraction: input.socPct / 100 },
      {
        label: 'Clipping captured',
        value: String(input.clippingCapturedMwh),
        unit: 'MWh',
        fraction: clamp(input.clippingCapturedMwh / 60),
      },
      {
        label: 'Shifted to peak',
        value: String(input.shiftedMwh),
        unit: 'MWh',
        fraction: clamp(input.shiftedMwh / 60),
      },
      {
        label: 'Availability 30d',
        value: decimal(input.availabilityPct),
        unit: '%',
        fraction: clamp(input.availabilityPct / 100),
      },
    ],
    output,
    budget,
    pnl: {
      period: 'June 2026, m PLN',
      lines: [
        { label: 'PV spot sales', sub: 'day-ahead + intraday', value: spot.toFixed(1) },
        { label: 'PV PPA / CfD', sub: 'contracted', value: ppa.toFixed(1) },
        { label: 'BESS arbitrage', sub: 'the moat', value: arbitrage.toFixed(1), accent: true },
        { label: 'Ancillary', sub: 'mFRR, aFRR', value: ancillary.toFixed(1) },
        { label: 'Total revenue', value: total.toFixed(1), total: true },
        { label: 'O&M costs & fees', sub: 'opex', value: `−${om.toFixed(1)}` },
        { label: 'EBITDA', value: ebitda.toFixed(1), total: true },
      ],
      composition: [
        { label: `PV ${round1(spot + ppa)}`, percent: round1(((spot + ppa) / total) * 100), shade: 'a' },
        { label: `Arbitrage ${arbitrage.toFixed(1)}`, percent: round1((arbitrage / total) * 100), shade: 'accent' },
        { label: `Ancillary ${ancillary.toFixed(1)}`, percent: round1((ancillary / total) * 100), shade: 'b' },
      ],
    },
    devices: input.devices,
    control: {
      mode: 'AUTO',
      strategy: 'Grid-cap capture + price arbitrage',
      actionsToday: input.actionsToday,
      setpointsToday: input.setpointsToday,
      lastTime: '13:15',
      lastAction: `Charge ${input.bessPowerMw} MW, PV above ${input.poiCapMw} MW cap`,
      nextAction: 'Discharge at evening peak',
      nextInSeconds: 21 * 60 + 40,
    },
    hybrid: {
      pvPeakMw: input.pvPeakMw,
      bessPowerMw: input.bessPowerMw,
      bessEnergyMwh: input.bessEnergyMwh,
      poiCapMw: input.poiCapMw,
      socPct: input.socPct,
      clippingCapturedMwh: input.clippingCapturedMwh,
      shiftedMwh: input.shiftedMwh,
    },
  };
}

// ---- the fleet -----------------------------------------------------------

const aurora: AssetDetail = {
  id: 'aurora',
  name: 'Aurora BESS',
  type: 'BESS',
  spec: { powerMw: 200, energyMwh: 800, location: 'Świętokrzyskie, PL', commissioned: '2024' },
  specLine: '200 MW / 800 MWh, Świętokrzyskie, PL, commissioned 2024',
  status: 'online',
  fleetMetric: 'SoC 61%',
  availabilityPct: 99.1,
  socPct: 61,
  cyclesToday: 1.4,
  roundTripPct: 87.4,
  kpis: [
    { label: 'Power now', value: '180', unit: 'MW', fraction: 0.9 },
    { label: 'State of charge', value: '61', unit: '%', fraction: 0.61 },
    { label: 'Cycles today', value: '1.4', unit: 'full-equiv', fraction: 0.7 },
    { label: 'Availability 30d', value: '99.1', unit: '%', fraction: 0.991 },
    { label: 'Round-trip', value: '87.4', unit: '%', fraction: 0.874 },
  ],
  pnl: {
    period: 'June 2026, m PLN',
    lines: [
      { label: 'Energy sales', sub: 'PV + discharge', value: '1.9' },
      { label: 'BESS arbitrage', sub: 'the moat', value: '3.4', accent: true },
      { label: 'Ancillary', sub: 'mFRR, aFRR', value: '1.1' },
      { label: 'Total revenue', value: '6.4', total: true },
      { label: 'O&M costs & fees', sub: 'opex', value: '−1.2' },
      { label: 'EBITDA', value: '5.2', total: true },
    ],
    composition: [
      { label: 'Energy 1.9', percent: 29.7, shade: 'a' },
      { label: 'Arbitrage 3.4', percent: 53.1, shade: 'accent' },
      { label: 'Ancillary 1.1', percent: 17.2, shade: 'b' },
    ],
  },
  devices: [
    { id: 'Rack 05', kind: 'rack', status: 'online', note: 'Balanced, 24 °C' },
    { id: 'Rack 07', kind: 'rack', status: 'derated', note: 'Cell imbalance, monitoring' },
    { id: 'Rack 12', kind: 'rack', status: 'online', note: 'Balanced, 25 °C' },
    { id: 'PCS A', kind: 'converter', status: 'online', note: 'Nominal, 92 MW' },
    { id: 'PCS B', kind: 'converter', status: 'online', note: 'Nominal, 88 MW' },
    { id: 'Thermal loop', kind: 'cooling', status: 'online', note: 'Setpoint 24 °C' },
  ],
  control: {
    mode: 'AUTO',
    strategy: 'Price arbitrage + mFRR/aFRR bidding',
    actionsToday: 38,
    setpointsToday: 96,
    lastTime: '13:45',
    lastAction: 'Charge 90 MW, midday price trough',
    nextAction: 'Discharge 40 MW, peak window',
    nextInSeconds: 14 * 60 + 26,
  },
};

const helios = makeHybrid({
  id: 'helios',
  name: 'Helios Hybrid',
  pvPeakMw: 120,
  bessPowerMw: 60,
  bessEnergyMwh: 120,
  poiCapMw: 90,
  location: 'Zachodniopomorskie, PL',
  commissioned: '2025',
  prPct: 85,
  socPct: 58,
  availabilityPct: 99.3,
  actualFactor: 0.86,
  clippingCapturedMwh: 41,
  shiftedMwh: 38,
  revenue: { spot: 1.1, ppa: 1.3, arbitrage: 1.8, ancillary: 0.6, om: 0.7 },
  actionsToday: 29,
  setpointsToday: 74,
  devices: [
    { id: 'Inverter block A', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter block B', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Rack 01–08', kind: 'rack', status: 'online', note: 'Balanced, 23 °C' },
    { id: 'PCS 1', kind: 'converter', status: 'online', note: 'Nominal, 60 MW' },
    { id: 'POI controller', kind: 'grid', status: 'online', note: 'Export 90 MW cap, holding' },
  ],
});

const rigel = makeHybrid({
  id: 'rigel',
  name: 'Rigel Hybrid',
  pvPeakMw: 90,
  bessPowerMw: 45,
  bessEnergyMwh: 90,
  poiCapMw: 70,
  location: 'Kujawsko-Pomorskie, PL',
  commissioned: '2025',
  prPct: 83,
  socPct: 47,
  availabilityPct: 99.0,
  actualFactor: 0.82,
  clippingCapturedMwh: 28,
  shiftedMwh: 25,
  revenue: { spot: 0.8, ppa: 1.0, arbitrage: 1.3, ancillary: 0.4, om: 0.5 },
  actionsToday: 24,
  setpointsToday: 61,
  devices: [
    { id: 'Inverter block A', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter block B', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Rack 01–06', kind: 'rack', status: 'online', note: 'Balanced, 24 °C' },
    { id: 'PCS 1', kind: 'converter', status: 'online', note: 'Nominal, 45 MW' },
    { id: 'POI controller', kind: 'grid', status: 'online', note: 'Export 70 MW cap, holding' },
  ],
});

const antares = makeHybrid({
  id: 'antares',
  name: 'Antares Hybrid',
  pvPeakMw: 64,
  bessPowerMw: 30,
  bessEnergyMwh: 60,
  poiCapMw: 50,
  location: 'Lubuskie, PL',
  commissioned: '2024',
  prPct: 82,
  socPct: 72,
  availabilityPct: 98.9,
  actualFactor: 0.8,
  clippingCapturedMwh: 19,
  shiftedMwh: 17,
  revenue: { spot: 0.6, ppa: 0.7, arbitrage: 0.9, ancillary: 0.3, om: 0.4 },
  actionsToday: 21,
  setpointsToday: 53,
  devices: [
    { id: 'Inverter block A', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Rack 01–04', kind: 'rack', status: 'online', note: 'Balanced, 25 °C' },
    { id: 'PCS 1', kind: 'converter', status: 'online', note: 'Nominal, 30 MW' },
    { id: 'POI controller', kind: 'grid', status: 'online', note: 'Export 50 MW cap, holding' },
  ],
});

const vega = makePv({
  id: 'vega',
  name: 'Vega',
  powerMw: 86,
  location: 'Wielkopolska, PL',
  commissioned: '2022',
  status: 'online',
  prPct: 84,
  availabilityPct: 99.4,
  actualFactor: 0.84,
  revenue: { spot: 0.9, ppa: 1.0, goo: 0.2, om: 0.4 },
  devices: [
    { id: 'Inverter 1', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter 2', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'String block A', kind: 'string', status: 'online', note: 'Nominal' },
    { id: 'String block B', kind: 'string', status: 'online', note: 'Nominal' },
    { id: 'Tracker rows', kind: 'tracker', status: 'online', note: 'Tracking' },
  ],
});

const orion = makePv({
  id: 'orion',
  name: 'Orion',
  powerMw: 68,
  location: 'Łódzkie, PL',
  commissioned: '2021',
  status: 'online',
  prPct: 82,
  availabilityPct: 99.0,
  actualFactor: 0.82,
  revenue: { spot: 0.7, ppa: 0.8, goo: 0.1, om: 0.3 },
  devices: [
    { id: 'Inverter 1', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter 2', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'String block A', kind: 'string', status: 'online', note: 'Nominal' },
    { id: 'String block B', kind: 'string', status: 'online', note: 'Nominal' },
  ],
});

const lyra = makePv({
  id: 'lyra',
  name: 'Lyra',
  powerMw: 92,
  location: 'Mazowieckie, PL',
  commissioned: '2023',
  status: 'derated',
  prPct: 80,
  availabilityPct: 97.8,
  actualFactor: 0.72,
  revenue: { spot: 0.9, ppa: 0.9, goo: 0.2, om: 0.5 },
  devices: [
    { id: 'Inverter 1', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter 2', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'String block B7', kind: 'string', status: 'derated', note: 'Underperformance −4%' },
    { id: 'Combiner C', kind: 'combiner', status: 'online', note: 'Nominal' },
  ],
});

const corvus = makePv({
  id: 'corvus',
  name: 'Corvus',
  powerMw: 46,
  location: 'Dolnośląskie, PL',
  commissioned: '2022',
  status: 'alarm',
  prPct: 71,
  availabilityPct: 96.2,
  actualFactor: 0.6,
  revenue: { spot: 0.4, ppa: 0.4, goo: 0.1, om: 0.3 },
  devices: [
    { id: 'Inverter 1', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter 2', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter 3', kind: 'inverter', status: 'alarm', note: 'Overtemperature, tripped' },
    { id: 'String block D', kind: 'string', status: 'online', note: 'Nominal' },
  ],
});

const pollux = makePv({
  id: 'pollux',
  name: 'Pollux',
  powerMw: 51,
  location: 'Śląskie, PL',
  commissioned: '2023',
  status: 'online',
  prPct: 83,
  availabilityPct: 99.2,
  actualFactor: 0.83,
  revenue: { spot: 0.5, ppa: 0.6, goo: 0.1, om: 0.3 },
  devices: [
    { id: 'Inverter 1', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter 2', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'String block A', kind: 'string', status: 'online', note: 'Nominal' },
    { id: 'String block B', kind: 'string', status: 'online', note: 'Nominal' },
  ],
});

const draco = makePv({
  id: 'draco',
  name: 'Draco',
  powerMw: 34,
  location: 'Podkarpackie, PL',
  commissioned: '2021',
  status: 'online',
  prPct: 85,
  availabilityPct: 99.5,
  actualFactor: 0.85,
  revenue: { spot: 0.3, ppa: 0.4, goo: 0.1, om: 0.2 },
  devices: [
    { id: 'Inverter 1', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter 2', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'String block A', kind: 'string', status: 'online', note: 'Nominal' },
  ],
});

const sirius = makePv({
  id: 'sirius',
  name: 'Sirius',
  powerMw: 39,
  location: 'Lubelskie, PL',
  commissioned: '2024',
  status: 'online',
  prPct: 82,
  availabilityPct: 99.0,
  actualFactor: 0.82,
  revenue: { spot: 0.4, ppa: 0.4, goo: 0.1, om: 0.2 },
  devices: [
    { id: 'Inverter 1', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'Inverter 2', kind: 'inverter', status: 'online', note: 'Nominal' },
    { id: 'String block A', kind: 'string', status: 'online', note: 'Nominal' },
    { id: 'String block B', kind: 'string', status: 'online', note: 'Nominal' },
  ],
});

// ---- generated fleet (fills the portfolio to 47 assets) ------------------

const STD_PV_DEVICES: DeviceStatus[] = [
  { id: 'Inverter 1', kind: 'inverter', status: 'online', note: 'Nominal' },
  { id: 'Inverter 2', kind: 'inverter', status: 'online', note: 'Nominal' },
  { id: 'String block A', kind: 'string', status: 'online', note: 'Nominal' },
  { id: 'String block B', kind: 'string', status: 'online', note: 'Nominal' },
];

const STD_HYB_DEVICES: DeviceStatus[] = [
  { id: 'Inverter block A', kind: 'inverter', status: 'online', note: 'Nominal' },
  { id: 'Inverter block B', kind: 'inverter', status: 'online', note: 'Nominal' },
  { id: 'Rack 01–08', kind: 'rack', status: 'online', note: 'Balanced' },
  { id: 'PCS 1', kind: 'converter', status: 'online', note: 'Nominal' },
  { id: 'POI controller', kind: 'grid', status: 'online', note: 'Holding export cap' },
];

/** Compact PV factory: revenue scales with nameplate, standard device set. */
function qpv(
  id: string,
  name: string,
  mw: number,
  loc: string,
  year: string,
  pr: number,
  avail: number,
  f: number,
): AssetDetail {
  return makePv({
    id,
    name,
    powerMw: mw,
    location: loc,
    commissioned: year,
    status: 'online',
    prPct: pr,
    availabilityPct: avail,
    actualFactor: f,
    revenue: { spot: round1(mw * 0.011), ppa: round1(mw * 0.012), goo: round1(mw * 0.003), om: round1(mw * 0.006) },
    devices: STD_PV_DEVICES,
  });
}

/** Compact hybrid factory. */
function qhy(
  id: string,
  name: string,
  pv: number,
  bp: number,
  be: number,
  cap: number,
  loc: string,
  year: string,
  pr: number,
  soc: number,
  avail: number,
  f: number,
): AssetDetail {
  return makeHybrid({
    id,
    name,
    pvPeakMw: pv,
    bessPowerMw: bp,
    bessEnergyMwh: be,
    poiCapMw: cap,
    location: loc,
    commissioned: year,
    prPct: pr,
    socPct: soc,
    availabilityPct: avail,
    actualFactor: f,
    clippingCapturedMwh: Math.round(pv * 0.3),
    shiftedMwh: Math.round(pv * 0.28),
    revenue: {
      spot: round1(pv * 0.009),
      ppa: round1(pv * 0.011),
      arbitrage: round1(bp * 0.03),
      ancillary: round1(bp * 0.01),
      om: round1((pv + bp) * 0.004),
    },
    actionsToday: Math.round(bp * 0.5),
    setpointsToday: Math.round(bp * 1.2),
    devices: STD_HYB_DEVICES,
  });
}

const moreHybrids: AssetDetail[] = [
  qhy('polaris', 'Polaris Hybrid', 110, 55, 110, 85, 'Zachodniopomorskie, PL', '2025', 84, 54, 99.2, 0.85),
  qhy('alioth', 'Alioth Hybrid', 95, 48, 96, 72, 'Kujawsko-Pomorskie, PL', '2025', 83, 61, 99.0, 0.83),
  qhy('alkaid', 'Alkaid Hybrid', 80, 40, 80, 60, 'Pomorskie, PL', '2024', 82, 49, 98.9, 0.82),
];

const morePv: AssetDetail[] = [
  qpv('altair', 'Altair', 72, 'Wielkopolska, PL', '2023', 84, 99.3, 0.84),
  qpv('deneb', 'Deneb', 64, 'Łódzkie, PL', '2022', 83, 99.1, 0.82),
  qpv('capella', 'Capella', 58, 'Mazowieckie, PL', '2021', 82, 98.9, 0.8),
  qpv('arcturus', 'Arcturus', 88, 'Dolnośląskie, PL', '2024', 85, 99.4, 0.85),
  qpv('spica', 'Spica', 41, 'Śląskie, PL', '2020', 81, 98.7, 0.79),
  qpv('regulus', 'Regulus', 76, 'Podkarpackie, PL', '2023', 84, 99.2, 0.83),
  qpv('bellatrix', 'Bellatrix', 33, 'Lubelskie, PL', '2019', 80, 98.4, 0.78),
  qpv('mizar', 'Mizar', 69, 'Zachodniopomorskie, PL', '2022', 85, 99.5, 0.85),
  qpv('castor', 'Castor', 52, 'Kujawsko-Pomorskie, PL', '2021', 82, 98.8, 0.81),
  qpv('procyon', 'Procyon', 47, 'Lubuskie, PL', '2020', 81, 98.6, 0.8),
  qpv('fomalhaut', 'Fomalhaut', 91, 'Małopolskie, PL', '2024', 84, 99.3, 0.84),
  qpv('aldebaran', 'Aldebaran', 28, 'Pomorskie, PL', '2019', 79, 98.2, 0.77),
  qpv('canopus', 'Canopus', 83, 'Warmińsko-Mazurskie, PL', '2023', 85, 99.4, 0.85),
  qpv('achernar', 'Achernar', 44, 'Opolskie, PL', '2021', 82, 98.9, 0.81),
  qpv('hadar', 'Hadar', 60, 'Świętokrzyskie, PL', '2022', 83, 99.0, 0.82),
  qpv('mira', 'Mira', 37, 'Podlaskie, PL', '2020', 80, 98.5, 0.79),
  qpv('elnath', 'Elnath', 74, 'Wielkopolska, PL', '2023', 84, 99.2, 0.84),
  qpv('alnilam', 'Alnilam', 55, 'Łódzkie, PL', '2022', 83, 99.0, 0.82),
  qpv('alnitak', 'Alnitak', 48, 'Mazowieckie, PL', '2021', 81, 98.7, 0.8),
  qpv('mintaka', 'Mintaka', 66, 'Dolnośląskie, PL', '2022', 84, 99.3, 0.83),
  qpv('saiph', 'Saiph', 31, 'Śląskie, PL', '2019', 79, 98.3, 0.78),
  qpv('nunki', 'Nunki', 79, 'Podkarpackie, PL', '2024', 85, 99.5, 0.85),
  qpv('atria', 'Atria', 43, 'Lubelskie, PL', '2020', 81, 98.6, 0.8),
  qpv('menkar', 'Menkar', 57, 'Zachodniopomorskie, PL', '2022', 83, 99.1, 0.82),
  qpv('naos', 'Naos', 24, 'Kujawsko-Pomorskie, PL', '2019', 78, 98.0, 0.76),
  qpv('wezen', 'Wezen', 70, 'Lubuskie, PL', '2023', 84, 99.2, 0.84),
  qpv('adhara', 'Adhara', 50, 'Małopolskie, PL', '2021', 82, 98.8, 0.81),
  qpv('alphard', 'Alphard', 62, 'Pomorskie, PL', '2022', 83, 99.0, 0.82),
  qpv('alphecca', 'Alphecca', 39, 'Warmińsko-Mazurskie, PL', '2020', 80, 98.5, 0.79),
  qpv('kochab', 'Kochab', 85, 'Opolskie, PL', '2024', 85, 99.4, 0.85),
  qpv('merak', 'Merak', 53, 'Świętokrzyskie, PL', '2022', 82, 98.9, 0.81),
  qpv('phecda', 'Phecda', 68, 'Podlaskie, PL', '2023', 84, 99.2, 0.83),
  qpv('dubhe', 'Dubhe', 46, 'Wielkopolska, PL', '2021', 81, 98.7, 0.8),
];

/** The full fictional fleet (47 assets: 1 BESS, 6 hybrids, 40 PV). */
export const assets: AssetDetail[] = [
  aurora,
  helios,
  rigel,
  antares,
  ...moreHybrids,
  vega,
  orion,
  lyra,
  corvus,
  pollux,
  draco,
  sirius,
  ...morePv,
];

/** Compact preview (first rows), kept for any summary use. */
export const fleetPreview: AssetDetail[] = assets.slice(0, 8);

export function assetById(id: string | undefined): AssetDetail | undefined {
  return assets.find((asset) => asset.id === id);
}
