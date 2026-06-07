# Feature: Player Identity

The app must be able to distinguish which connected client is which player, so it can enforce score control permissions and delegation.

---

## Behavior

- When a player joins a session, the client generates a UUID and stores it in `localStorage` under the key `player-id`
- If a player refreshes or reconnects, the same UUID is retrieved from `localStorage` — they rejoin as the same player
- The UUID is sent with every API request (`X-Player-Id` header or request body field) so the server can identify the caller
- The server maps `playerId → playerSlot` in the in-memory game store (see `features/state-sync.md`)
- The UUID is never displayed to users — it is an internal identifier only

## Decisions

- **No auth or accounts** — the UUID is a device-level identity, not a persistent user account. Clearing `localStorage` loses identity.
- **Host identity** — the first player to join a session is recorded as host by their UUID in the game store. Host status persists across reconnects (same UUID).
- **Collision handling** — UUID collisions are astronomically unlikely; no collision detection needed.

## Implementation

**Status: ✅ Done** (commit `40e2d4d`)

| File | Role |
|---|---|
| `src/lib/usePlayerId.ts` | React hook — `useState` lazy initializer reads/writes `localStorage['player-id']` |
| `src/lib/gameStore.ts` | `SessionState.hostPlayerId` added; `setHost()` exported |
| `src/app/api/game/route.ts` | Accepts `{ playerId }` in POST body; calls `setHost()` after `createSession()` |
| `src/app/page.tsx` | Calls `usePlayerId()`, passes UUID in create-game body |

**Implementation note:** `useState` lazy initializer is used (not `useEffect`) to avoid the `react-hooks/set-state-in-effect` lint rule. The initializer returns `''` during SSR (`typeof window === 'undefined'`) and the real UUID on the client. Since the UUID is never rendered in the DOM, there is no visible hydration mismatch.

## Dependencies

- None — can be implemented alongside session management
