import { useEffect, useState } from 'react';
export function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const total = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(total / (24 * 3600 * 1000));
  const hours = Math.floor((total % (24 * 3600 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((total % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((total % (60 * 1000)) / 1000);
  return { days, hours, minutes, seconds };
}
