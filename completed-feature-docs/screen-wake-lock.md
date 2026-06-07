# Feature: Screen Wake Lock

Players keep the app open on their phones for the length of a game. Without intervention, the screen dims and locks after the OS idle timeout, forcing players to repeatedly wake and unlock their device just to bump a score. The app should hold a wake lock so the display stays on while a game is in view.

---

## Behavior

- While the user is on the game route (`/game/[id]` — lobby and active play), the screen is kept awake.
- The lock is re-acquired automatically when the page becomes visible again (the OS releases a wake lock whenever the tab/app is backgrounded or the device is locked, so returning to the tab must re-request it).
- The lock is released when the user leaves the game route (component unmount).
- Where the API is unavailable or the request is denied (older browsers, low battery, no user activation), it silently does nothing — pure progressive enhancement, never an error or blocking prompt.

## Approach

- Native [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) (`navigator.wakeLock.request('screen')`) — **no new dependency**.
- New `useWakeLock` hook in `src/lib/useWakeLock.ts`, following the existing `usePlayerId` convention (named export, browser-API access guarded for SSR). It requests on mount, re-requests on `visibilitychange`, and releases the sentinel on cleanup.
- Called once from `src/app/game/[id]/page.tsx` (`useWakeLock()`), so the whole game route is covered.

## Caveats

- iOS Safari supports the Screen Wake Lock API from **iOS 16.4+**; older iOS devices fall back to no-op (screen sleeps as before). No JS-timer/video hack fallback is added — not worth the dependency/battery cost.
- `WakeLockSentinel` / `navigator.wakeLock` types ship with modern `lib.dom.d.ts` (TypeScript ≥ 4.4); no extra type packages required.

## Dependencies

- None beyond the existing game route.
