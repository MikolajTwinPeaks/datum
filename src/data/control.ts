/**
 * Manual control layer — the operator's line to the O&M partner that runs each
 * asset in the field. Datum composes a command and dispatches it to the right
 * O&M company (over the same integration bus the autopilot uses). All fictional.
 */

export interface OmProvider {
  code: string;
  name: string;
}

/** Fictional O&M field-service companies. */
export const omProviders: OmProvider[] = [
  { code: 'NSV', name: 'NordServ O&M' },
  { code: 'HFS', name: 'Heliotech Field Services' },
  { code: 'VLT', name: 'Voltara O&M' },
  { code: 'MAC', name: 'Meridian Asset Care' },
  { code: 'KFT', name: 'Kraft Energy O&M' },
];

/** Deterministic O&M assignment per asset id (stable across renders). */
export function omForAsset(id: string): OmProvider {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return omProviders[h % omProviders.length];
}

export type CommandStatus = 'Queued' | 'Acknowledged' | 'Executing' | 'Done';

export interface Command {
  id: number;
  time: string;
  asset: string;
  om: string;
  text: string;
  status: CommandStatus;
}

/** A few recent (completed) commands so the log is never empty. */
export const seedCommands: Command[] = [
  { id: 1, time: '13:12', asset: 'Aurora BESS', om: 'NordServ O&M', text: 'Discharge at 40 MW, peak window', status: 'Done' },
  { id: 2, time: '12:47', asset: 'Corvus', om: 'Voltara O&M', text: 'Take offline, inverter 3 fault', status: 'Done' },
  { id: 3, time: '11:30', asset: 'Helios Hybrid', om: 'Meridian Asset Care', text: 'Charge 60 MW from clipping', status: 'Done' },
];
