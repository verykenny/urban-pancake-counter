# Feature: Reconnection / State Recovery

Mobile browsers drop WebSocket connections when a tab is backgrounded, the device sleeps, or the network changes. The app must recover gracefully so a player can pick up their phone and continue without confusion.

---

## Behavior

- The Pusher client emits a `pusher:connection_state_change` event when the connection is lost or restored
- When the connection transitions to `connected` after a prior `disconnected` or `unavailable` state, the client re-fetches the current game state from `GET /api/game/[id]` (see `features/state-sync.md`) and overwrites local React state
- While disconnected, the UI shows a subtle "Reconnecting…" indicator so the player knows their connection is interrupted
- Score updates made by other players while this client was disconnected are recovered via the state-sync fetch — no Pusher event replay is needed

## Approach

- Subscribe to `pusher.connection.bind('state_change', ...)` in the game page's `useEffect`
- Track previous connection state in a ref; only re-fetch on transition *to* `connected`, not on every `connected` event
- The "Reconnecting…" indicator can be a small banner or a subtle opacity change on the score board — decision deferred to implementation

## Dependencies

- State sync on join (the same `GET /api/game/[id]` endpoint is reused)
- Score tracking (game page must exist)
