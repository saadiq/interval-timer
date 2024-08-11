import { useState, useCallback, useEffect } from 'react';

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) return;

    try {
      const wl = await (navigator as any).wakeLock.request('screen');
      setWakeLock(wl);
    } catch (err) {
      console.error(`Failed to request wake lock: ${err}`);
    }
  }, [isSupported]);

  const release = useCallback(() => {
    if (wakeLock) {
      wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  return {
    isSupported,
    isActive: !!wakeLock,
    request,
    release,
  };
}