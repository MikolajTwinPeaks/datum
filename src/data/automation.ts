/**
 * The automation layer. Datum does not just display the fleet — it runs it:
 * it optimises dispatch against PSE day-ahead prices, holds hybrids under their
 * grid-export cap by parking PV clipping in the battery, and routes every alarm
 * to a work order by rule. This file is the data behind that autonomy.
 * All data is fictional and internally consistent.
 */

export interface AutomationRule {
  /** Rule id, e.g. "R-02". */
  id: string;
  trigger: string;
  action: string;
  scope: string;
  /** Times the rule fired automatically today. */
  firedToday: number;
  armed: boolean;
}

/** The armed rule set — the engine that runs the fleet without an operator. */
export const automationRules: AutomationRule[] = [
  {
    id: 'R-01',
    trigger: 'Day-ahead price peak',
    action: 'Discharge dispatch',
    scope: 'BESS, hybrid',
    firedToday: 6,
    armed: true,
  },
  {
    id: 'R-02',
    trigger: 'PV above grid cap',
    action: 'Charge from clipping',
    scope: 'Hybrid',
    firedToday: 23,
    armed: true,
  },
  {
    id: 'R-03',
    trigger: 'Negative price',
    action: 'Curtail PV, charge',
    scope: 'Fleet',
    firedToday: 4,
    armed: true,
  },
  {
    id: 'R-05',
    trigger: 'State of charge below 8%',
    action: 'Block discharge',
    scope: 'BESS, hybrid',
    firedToday: 1,
    armed: true,
  },
  {
    id: 'R-07',
    trigger: 'Critical alarm',
    action: 'Work order, SMS, P&L flag',
    scope: 'Fleet',
    firedToday: 3,
    armed: true,
  },
  {
    id: 'R-09',
    trigger: 'Performance ratio drop > 5%',
    action: 'Derate flag, inspection ticket',
    scope: 'PV',
    firedToday: 2,
    armed: true,
  },
];

export interface FleetAutomation {
  assetsAuto: number;
  assetsTotal: number;
  /** Autonomous control actions executed today across the fleet. */
  actionsToday: number;
  /** Setpoints written to SCADA today. */
  setpointsToday: number;
  /** Alarms auto-routed to work orders, "done / total". */
  alarmsRouted: string;
  /** PV clipping captured by hybrid batteries today, MWh. */
  clippingCapturedMwh: number;
  /** The next scheduled autonomous action. */
  nextAsset: string;
  nextAction: string;
  nextInSeconds: number;
}

export const fleetAutomation: FleetAutomation = {
  assetsAuto: 45,
  assetsTotal: 47,
  actionsToday: 318,
  setpointsToday: 1204,
  alarmsRouted: '12 / 12',
  clippingCapturedMwh: 47,
  nextAsset: 'Aurora BESS',
  nextAction: 'Discharge 40 MW, peak window',
  nextInSeconds: 14 * 60 + 26,
};
