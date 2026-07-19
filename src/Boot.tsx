import { useState, type ReactNode } from 'react';
import { LoginView } from './views/LoginView';
import { Loader } from './views/Loader';

type Phase = 'login' | 'loading' | 'app';

function initialPhase(): Phase {
  try {
    return sessionStorage.getItem('datum-auth') === '1' ? 'app' : 'login';
  } catch {
    return 'login';
  }
}

/** Gates the app behind sign-in, then plays the boot loader once per session. */
export function Boot({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>(initialPhase);

  if (phase === 'login') {
    return (
      <LoginView
        onLogin={() => {
          try {
            sessionStorage.setItem('datum-auth', '1');
          } catch {
            /* ignore storage failure */
          }
          setPhase('loading');
        }}
      />
    );
  }

  if (phase === 'loading') {
    return <Loader onDone={() => setPhase('app')} />;
  }

  return <>{children}</>;
}
