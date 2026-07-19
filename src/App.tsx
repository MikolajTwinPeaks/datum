import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Masthead } from './components/Masthead';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { routeList } from './routes';
import { portfolio } from './data/fleet';

/** App shell: masthead, numbered nav, the active view, and a footer breadcrumb. */
export function App() {
  const location = useLocation();
  const active =
    routeList.find(
      (route) => location.pathname === route.path || location.pathname.startsWith(`${route.path}/`),
    ) ?? routeList[0];

  // Match the demo: return to the top of the page on each view switch.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="page-bg">
      <div className="frame">
        <span className="crop tl" />
        <span className="crop tr" />
        <span className="crop bl" />
        <span className="crop br" />

        <Masthead assetCount={portfolio.assetCount} />
        <hr className="rule-ink" />
        <Nav />
        <hr className="rule" />
        <main>
          <Outlet />
        </main>
        <Footer crumb={active.label} />
      </div>
    </div>
  );
}
