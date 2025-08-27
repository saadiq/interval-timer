import { useState, useCallback, useEffect } from 'react';

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  }, []);

  const request = useCallback(async () => {
    if (!isSupported || !navigator.wakeLock) return;

    try {
      const wl = await navigator.wakeLock.request('screen');
      setWakeLock(wl);
    } catch (err) {
      console.warn('Failed to request wake lock:', err);
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