# Feature: State Sync on Join

Pusher delivers events in real time but does not replay history. A player who joins mid-game, refreshes, or reconnects after a network drop must receive the current game state from the server.

---

## Behavior

- The server maintains a module-level `Map<gameId, GameState>` (the game store) with the authoritative state for every active session
- `GameState` includes: player list (id, name, score, color), score control mode, delegation assignments, host player id, and winner (if any)
- On client mount, the game page calls `GET /api/game/[id]` to fetch the current state before subscribing to Pusher events; this prevents a race condition where Pusher events arrive before the client has initial state
- The server updates the game store on every score change, player join, mode change, and win event — state is always current
- Pusher events remain the delivery mechanism for live updates; the REST endpoint is only used on initial load and reconnect

## Session Expiry (P3)

- The game store entry for a session is deleted after 60 minutes of inactivity (no Pusher events on the channel)
- A lightweight background interval in the server module handles cleanup
- This prevents unbounded memory growth in a long-running Vercel serverless deployment

## Dependencies

- Session management
- Player identity
