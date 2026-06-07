# Spec 08 — Turn Tracker & Stopwatch Timer

**Phase 2 · Medium priority · Status: [ ] Pending**

## User Story / Context

> As a player, I want a shared "whose turn is it" indicator and a stopwatch for the current
> turn, so we both know it's my turn and roughly how long turns are taking — without a
> physical timer.

## Existing Code Integration

- **Shared state → server route + Pusher event** (turn ownership is multiplayer state, per the
  [sync contract](../PROJECT.md#sync-contract)).
  - Extend `GameState` (`src/lib/gameStore.ts`) with **optional**: `activePlayerId: string | null`
    and `turnStartedAt: number | null` (epoch ms, server clock). Default-safe on read.
  - On `startGame`, initialize `activePlayerId = firstPlayerId ?? turnOrder[0]` (from
    Feature 05) and `turnStartedAt = Date.now()`.
  - New endpoint `POST /api/game/[id]/turn` `{ playerId }` → advances to the next player in
    `turnOrder`, sets `turnStartedAt = Date.now()`, broadcasts `turn-changed`
    `{ activePlayerId, turnStartedAt }`.
  - Bind `turn-changed` in `page.tsx` and reconcile into `gameState`.
- **Why server-authoritative time:** broadcasting `turnStartedAt` (not elapsed seconds) lets
  every client compute elapsed locally with one timer — no per-tick network traffic, and
  clients that join late or reconnect (existing reconnect re-fetch) get the correct base.

## UI/UX Layout & Responsive Design Requirements

- **"End Turn" button:** prominent, in the active player's panel only (others see it disabled
  / hidden). ≥44px, token-styled, on the own/hero card.
- **Active indicator:** the active player's `.player-card` gets a highlighted border/glow
  (token `--glow-accent`) and an "Your turn" / "{name}'s turn" label.
- **Stopwatch:** `mm:ss`, monospace `tabular-nums`, near the active indicator; resets to
  `00:00` visually when `turn-changed` fires. Readable from distance (fluid type, smaller
  than the score).
- Mini cards show a small active dot rather than the full timer.

## Technical & State Logic

- **Local ticking:** a single `setInterval(…, 1000)` (or `requestAnimationFrame` throttled to
  1s) computes `elapsed = Date.now() - turnStartedAt`. **Do not** store elapsed in React state
  per tick beyond what's needed to render; clear the interval on unmount and when no active
  turn.
- **Whose turn / who can end:** only the active player (or the host in host-control mode) may
  POST `/turn`. Server enforces (reject if `playerId !== activePlayerId` and not host).
- **Edge cases:**
  - Clock skew between client and server: small drift is acceptable for a casual stopwatch;
    base off the server `turnStartedAt` to keep all clients consistent with each other.
  - Reconnect (existing `state_change` re-fetch) restores `activePlayerId`/`turnStartedAt`, so
    the stopwatch resumes at the correct elapsed value.
  - Win / board lock (`winner !== null`): freeze the stopwatch and disable "End Turn".
  - Play-again reset: clear `activePlayerId`/`turnStartedAt` (or re-init to first player) and
    zero the stopwatch.
  - Player leaves on their turn: `End Turn`/host advances past the missing id (reconcile vs
    live `players`, like Feature 05).
  - `prefers-reduced-motion` doesn't affect a numeric timer; no animation dependency.
- **DOM hooks:** `.turn-timer`, `.turn-indicator`, `.end-turn-btn`.
