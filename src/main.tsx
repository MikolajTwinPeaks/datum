import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Self-hosted fonts (no CDN, no runtime network calls).
// Archivo — display + UI; Chivo Mono — all figures / telemetry.
import '@fontsource/archivo/300.css';
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/600.css';
import '@fontsource/chivo-mono/400.css';
import '@fontsource/chivo-mono/500.css';
import '@fontsource/chivo-mono/700.css';

import './styles/tokens.css';
import './styles/global.css';
import './styles/printing.css';

import { Boot } from './Boot';
import { App } from './App';
import { CoverView } from './views/CoverView';
import { FleetView } from './views/FleetView';
import { AssetView } from './views/AssetView';
import { ArbitrageView } from './views/ArbitrageView';
import { ServiceView } from './views/ServiceView';
import { ControlView } from './views/ControlView';
import { ReportsView } from './views/ReportsView';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <Boot>
      <HashRouter>
      <Routes>
        <Route index element={<CoverView />} />
        <Route element={<App />}>
          <Route path="/fleet" element={<FleetView />} />
          <Route path="/asset" element={<Navigate to="/asset/aurora" replace />} />
          <Route path="/asset/:assetId" element={<AssetView />} />
          <Route path="/arbitrage" element={<ArbitrageView />} />
          <Route path="/service" element={<ServiceView />} />
          <Route path="/control" element={<ControlView />} />
          <Route path="/control/:assetId" element={<ControlView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="*" element={<Navigate to="/fleet" replace />} />
        </Route>
      </Routes>
      </HashRouter>
    </Boot>
  </StrictMode>,
);
