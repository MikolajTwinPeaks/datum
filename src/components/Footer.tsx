import styles from './Footer.module.css';

export interface FooterProps {
  /** Breadcrumb text, e.g. "FLEET / 01–05". */
  crumb: string;
}

export function Footer({ crumb }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.mark}>DATUM</div>
      <div className={styles.crumb}>{crumb}</div>
    </footer>
  );
}
