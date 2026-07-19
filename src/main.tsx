import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Self-hosted fonts (no CDN, no runtime network calls).
import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

import './styles/tokens.css';
import './styles/global.css';

import { App } from './App';
import { FleetView } from './views/FleetView';
import { AssetView } from './views/AssetView';
import { ArbitrageView } from './views/ArbitrageView';
import { ServiceView } from './views/ServiceView';
import { ReportsView } from './views/ReportsView';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/fleet" replace />} />
          <Route path="/fleet" element={<FleetView />} />
          <Route path="/asset" element={<AssetView />} />
          <Route path="/arbitrage" element={<ArbitrageView />} />
          <Route path="/service" element={<ServiceView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="*" element={<Navigate to="/fleet" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
);
