import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'notifications:lastSeenAt';

export function useNotificationVisibility() {
  const [lastSeenAt, setLastSeenAt] = useState<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      const val = raw ? Number(raw) : 0;
      setLastSeenAt(Number.isFinite(val) ? val : 0);
      setReady(true);
    })();
  }, []);

  const clearNow = useCallback(async () => {
    const now = Date.now();
    await AsyncStorage.setItem(KEY, String(now));
    setLastSeenAt(now);
  }, []);

  return { lastSeenAt, clearNow, ready };
}
