# DATUM

**A light, editorial fleet control layer for a PV solar + BESS battery portfolio.**

Datum is an independent concept product: a single reference surface that sits over a
fleet of photovoltaic farms and battery-storage (BESS) assets and pulls their telemetry,
finance and service workflows into one place. It is deliberately anti-"AI-look" —
instrument-panel typography, data resting directly on paper, one restrained accent.
This repository promotes the original single-file demo into a structured
Vite + React + TypeScript application.

> **Demo data is fictional.** Every asset (Aurora BESS, Vega, Orion, Lyra, Corvus,
> Pollux, Draco, Sirius), all revenues, alarms, prices and dispatch windows are invented
> for illustration. The integration targets named in the UI (SYNDIS, meteocontrol,
> OpenEMS, Fiix, SAP, PSE, ENTSO-E) are real systems, but nothing here connects to them.
> Datum is not affiliated with any of them.

## Tech stack

- **Vite** + **React 19** + **TypeScript** (`strict: true`)
- **react-router-dom** with `HashRouter` (deploys to static hosts with no server config)
- Self-hosted fonts via **@fontsource** — Space Grotesk, Space Mono, Inter (no CDN, no runtime network calls)
- **CSS custom properties** for design tokens + **CSS Modules** per component
- **oxlint** (Vite's default linter) + **Prettier**

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check (tsc -b) and produce a production build in dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
npm run format   # prettier --write .
```

Requires Node 20.19+ / 22.12+ (any recent LTS works).

## Static hosting

`vite.config.ts` sets `base: './'` (relative assets) and the app uses `HashRouter`, so the built `dist/` folder can be served from any static host or subpath without server config.

## Design notes

- **Instrument / Swiss, light.** A warm bone paper (`#ECE8DE`), near-black ink, and a
  two-step gray scale. No rounded panels, borders, shadows, gradients, colored chips or emoji.
- **Type.** Space Grotesk for display and hero numbers, Space Mono for telemetry and labels,
  Inter for running text. Decimals use a period; thousands a thin space.
- **One accent.** Oxblood (`#9E3B2E`), used ~3× per surface: the ruler marker, one section
  index, and the single most important or alarming value.
- **The tick-ruler motif.** A row of fine measurement ticks doubles as every gauge — an
  oxblood marker line and down-triangle sit at the value. It replaces any progress bar or
  kicker dot and is Datum's house element.
- **Ruled ledgers.** Tables are rows separated by full-width hairlines: label left, value
  right in tabular mono. Totals and EBITDA are emphasised by size and weight, never a box.

## Project structure

```
src/
  components/   reusable UI (Masthead, Nav, Footer, Ruler, LedgerTable, Kpi,
                StatusTag, CompositionBar, PriceChart, DispatchChart, TickGauge)
  views/        FleetView, AssetView, ArbitrageView, ServiceView, ReportsView
  data/         typed mock data (fleet, assets, arbitrage, alarms, integrations)
  hooks/        useClock (live CET clock), useCountdown (SLA timer)
  lib/          SVG geometry + number-formatting helpers
  styles/       tokens.css (design tokens) + global.css (reset & primitives)
```

## License

MIT © 2026 Mikołaj Okuła. See [LICENSE](./LICENSE).
