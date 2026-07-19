import { NavLink } from 'react-router-dom';
import { routeList } from '../routes';
import styles from './Nav.module.css';

/** Numbered 01–05 module nav; the active index is oxblood with an underline tick. */
export function Nav() {
  return (
    <nav className={styles.nav}>
      {routeList.map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.idx}>{route.index}</span>
          <span className={styles.label}>{route.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
