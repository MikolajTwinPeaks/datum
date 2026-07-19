/** Day-ahead price, dispatch schedule and storage position. All data is fictional. */

export type DispatchAction = 'Charge' | 'Discharge';
export type DispatchStatus = 'done' | 'running' | 'scheduled';

export interface DispatchWindow {
  window: string;
  action: DispatchAction;
  energy: string;
  avg: string;
  status: DispatchStatus;
  /** When running, the whole row is oxblood. */
  active?: boolean;
}

/** PSE rce-pln, PLN/MWh, 24 hourly points. */
export const priceSeries: number[] = [
  280, 265, 250, 245, 250, 270, 310, 360, 390, 370, 330, 300, 280, 275, 290, 330, 400, 520, 690,
  810, 740, 560, 420, 340,
];

/** State of charge, %, 24 hourly points. */
export const socSeries: number[] = [
  46, 42, 39, 52, 63, 71, 70, 66, 62, 68, 76, 84, 90, 93, 92, 88, 84, 79, 70, 52, 38, 33, 44, 61,
];

/** Charge window hours (ink up-ticks) and discharge hours (oxblood down-ticks). */
export const chargeHours: number[] = [9, 10, 11, 12, 13, 14];
export const dischargeHours: number[] = [18, 19, 20, 21];

export const heroProfit = '384 100';

export const dispatchSchedule: DispatchWindow[] = [
  { window: '02:00–05:00', action: 'Charge', energy: '318 MWh', avg: '248', status: 'done' },
  { window: '09:00–14:00', action: 'Charge', energy: '412 MWh', avg: '291', status: 'done' },
  {
    window: '18:00–21:00',
    action: 'Discharge',
    energy: '388 MWh',
    avg: '742',
    status: 'running',
    active: true,
  },
];

export interface StoragePosition {
  socPct: number;
  storedMwh: number;
  capacityMwh: number;
}

export const storagePosition: StoragePosition = { socPct: 61, storedMwh: 522, capacityMwh: 856 };
