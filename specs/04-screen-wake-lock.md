# Spec 04 — Screen Wake Lock API

**Phase 1 · High priority · Status: [x] Implemented — this spec is documentation + hardening**

## User Story / Context

> As a player, I don't want my phone to dim or lock mid-match while I'm watching the scores,
> forcing me to keep tapping to wake it.

> ⚠️ **This feature already shipped.** It lives in `src/lib/useWakeLock.ts` and is consumed by
> `src/app/game/[id]/page.tsx`. The iOS "sentinel released mid-session → re-acquire" fix is
> commit `3dbcdff` on branch `fix-wakelock-ios`. This spec exists to (a) record the design so
> the archived v1 doc isn't the only reference, and (b) define the remaining hardening:
> **explicit release when leaving an active room.**

## Existing Code Integration

- **`useWakeLock(active = true)`** (`src/lib/useWakeLock.ts`):
  - No-ops when `navigator.wakeLock` is unavailable (progressive enhancement).
  - Requests `'screen'` only while `document.visibilityState === 'visible'`.
  - Re-requests on the sentinel's `release` event (iOS dims and silently drops the lock) and
    on `visibilitychange` back to visible.
  - Cleans up on unmount: removes the listener and releases the sentinel.
- **`game/[id]/page.tsx`** calls `useWakeLock()` unconditionally at the top of the component
  (line ~33). Because the game route only mounts on an active session, the lock is tied to
  the route's lifetime.

## UI/UX Layout & Responsive Design Requirements

- **No UI surface.** The lock is invisible and silent; no toast, no toggle in v2.
- Optional (future, not required): a tiny status hint inside the `GameMenu` (F01) — "Screen
  stays awake during the match." Keep it out of the always-visible chrome.

## Technical & State Logic

- **Hardening task (the actual remaining work):** make activation explicitly scoped to an
  *active room*, not just route mount, so it releases the moment the player conceptually
  leaves the match — not only on full route unmount.
  - Change the call site to `useWakeLock(gameState?.phase === 'playing')`, so the lobby and
    the post-win idle states don't hold the lock unnecessarily, and returning to the lobby
    (`/`) or the main menu releases it. The hook already releases when `active` flips false
    (its effect cleanup runs on dependency change) — verify this path.
- **Edge cases (already handled — keep as regression checks):**
  - API absent (older Safari, some embedded webviews) → silent no-op.
  - Permission denied (low battery, no user activation) → caught, silent.
  - Tab backgrounded → lock released by the OS; re-acquired on return via `visibilitychange`.
  - iOS auto-release mid-session → re-acquired via the sentinel `release` listener.
  - Strict-mode double-invoke / unmount → `cancelled` flag + cleanup prevent dangling locks.
- **Do not** add timers or polling; rely on the event-driven model already in place.
- **Verification:** real iOS Safari + Android Chrome; confirm screen stays awake during play
  and the lock is gone after navigating back to `/`.
