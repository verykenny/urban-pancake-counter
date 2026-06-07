# Spec 05 — Pre-Game Player Reordering

**Phase 2 · Medium-High priority · Status: [ ] Pending**

## User Story / Context

> As the host setting up a round, I want to choose who goes first (and the seating order),
> because turn order matters in Lorcana and we want the app's turn tracker to start on the
> right player.

## Existing Code Integration

- **Lobby-only feature** in `src/components/LobbyView.tsx`, before `handleStart` fires. Host
  reorders the player list / picks the first player.
- **Shared state → needs a server route + Pusher event** (this is multiplayer state, so it
  goes through Redis, per the [sync contract](../PROJECT.md#sync-contract)):
  - Add **optional** `turnOrder: string[]` (player ids, defaults to join order) and
    `firstPlayerId: string | null` to `GameState` in `src/lib/gameStore.ts`. Default-safe on
    read (`?? players.map(p=>p.id)` / `?? null`) so existing sessions keep working.
  - New endpoint `POST /api/game/[id]/order` `{ playerId, turnOrder }` → host-only auth
    (mirror `setControlMode`'s `hostPlayerId` check) → broadcasts a new `order-updated` event
    `{ turnOrder, firstPlayerId }`.
  - Bind `order-updated` in `page.tsx` alongside the existing channel binds; reconcile into
    `gameState`.
  - Fold `firstPlayerId` into the existing `startGame` so it's persisted when the host hits
    Start (extend `start/route.ts` payload).
- **Hand-off to Feature 08:** `firstPlayerId` is the player whose turn timer auto-starts on
  game start. F08 reads it; this spec only sets it.

## UI/UX Layout & Responsive Design Requirements

- **Lobby reorder UI (host only):** a vertical list of joined players with drag handles, plus
  a "1st" badge. Provide a **non-drag fallback** (up/down chevrons, ≥44px) because drag on
  touch is finicky — chevrons are the primary mobile interaction, drag is the enhancement.
- A quick "Set as first" action per row that just sets `firstPlayerId` without full reorder.
- Non-host players see the order **read-only** (with the 1st-player badge) so everyone agrees
  before start.
- Tokens only; rows ≥44px; clear drag affordance; respects mobile-first layout.

## Technical & State Logic

- **State:** local optimistic `turnOrder` while dragging; commit to the server on drop /
  chevron tap (debounce rapid reorders to ~1 update per ~300ms to avoid Pusher spam).
- **Schema additions:** `turnOrder: string[]`, `firstPlayerId: string | null` (both optional
  on read).
- **Auth:** only `hostPlayerId` may reorder (server-enforced, like `setControlMode`).
- **Edge cases:**
  - Player joins/leaves after a reorder → server must reconcile `turnOrder` against the live
    `players` array (append new ids, drop missing ids) on every join and on `startGame`.
  - If `firstPlayerId` points at a player who left, fall back to `turnOrder[0]`.
  - 2-player games: reorder still meaningful (who's first).
  - Reordering is **disabled once `phase === 'playing'`** (turn order is locked for the round;
    changes require play-again/reset).
  - Non-host attempts → 403, surfaced via the existing `setError` toast.
