const STORAGE_KEY = 'lt:haptics';

export function hapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export function hapticsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // private mode / quota — ignore
  }
}

// Fire-and-forget tactile feedback. Silent no-op where the Vibration API is
// absent (iOS Safari, desktop) or the user opted out — pure progressive
// enhancement; never throws, never blocks gameplay.
export function vibrate(pattern: number | number[]): void {
  if (!hapticsSupported() || !hapticsEnabled()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}
