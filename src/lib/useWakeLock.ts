import { useEffect } from 'react';

export function useWakeLock(active = true) {
  useEffect(() => {
    if (!active) return;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        sentinel = await navigator.wakeLock.request('screen');
        // Re-acquire when the browser/OS releases the lock (e.g. iOS dimming the screen).
        // Without this listener, the lock is gone and we never know to re-request it.
        sentinel.addEventListener('release', () => {
          sentinel = null;
          request();
        });
      } catch {
        // denied / blocked (low battery, no user activation) — silent, progressive enhancement
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') request();
    };

    request();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
