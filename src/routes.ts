/** The five modules, in order. Drives the nav, the numbering and the footer. */
export interface RouteMeta {
  index: string;
  label: string;
  path: string;
}

export const routeList: RouteMeta[] = [
  { index: '01', label: 'FLEET', path: '/fleet' },
  { index: '02', label: 'ASSET', path: '/asset' },
  { index: '03', label: 'ARBITRAGE', path: '/arbitrage' },
  { index: '04', label: 'SERVICE', path: '/service' },
  { index: '05', label: 'CONTROL', path: '/control' },
  { index: '06', label: 'REPORTS', path: '/reports' },
];
