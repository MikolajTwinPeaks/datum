import { useState, type FormEvent } from 'react';
import styles from './LoginView.module.css';

export interface LoginViewProps {
  onLogin: () => void;
}

/** Single-operator sign-in. Demo credentials: admin / admin. */
export function LoginView({ onLogin }: LoginViewProps) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (user.trim() === 'admin' && pass === 'admin') {
      onLogin();
    } else {
      setError(true);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <span className="crop tl" />
        <span className="crop tr" />
        <span className="crop bl" />
        <span className="crop br" />

        <div className={styles.brandwrap}>
          <h1 className={styles.wordmark}>DATUM</h1>
          <p className={styles.tagline}>One reference for the whole fleet.</p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field}>
            <span className={styles.k}>Operator</span>
            <input
              className={styles.input}
              type="text"
              autoComplete="username"
              autoFocus
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
                setError(false);
              }}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.k}>Passphrase</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError(false);
              }}
            />
          </label>

          <div className={styles.foot}>
            <button type="submit" className="textlink">
              Sign in
            </button>
            <span className={error ? styles.err : styles.hint}>
              {error ? 'Credentials not recognised' : 'Demo access, admin / admin'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
