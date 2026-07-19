import { useEffect, useState } from 'react';
import { clockString } from '../lib/format';

/**
 * Countdown timer decrementing once per second, formatted "HH:MM:SS".
 * Stops at zero.
 */
export function useCountdown(initialSeconds: number): string {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return clockString(remaining);
}
