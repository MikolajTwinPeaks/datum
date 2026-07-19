import { useEffect, useState } from 'react';
import { clockString } from '../lib/format';

/** CET (UTC+1) wall clock as "HH:MM:SS", updated every second. */
export function useClock(): string {
  const [time, setTime] = useState(() => currentCet());

  useEffect(() => {
    const id = window.setInterval(() => setTime(currentCet()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

function currentCet(): string {
  const now = new Date();
  const cet = new Date(now.getTime() + (now.getTimezoneOffset() + 60) * 60000);
  const seconds = cet.getHours() * 3600 + cet.getMinutes() * 60 + cet.getSeconds();
  return clockString(seconds);
}
