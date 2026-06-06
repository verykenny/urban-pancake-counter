# Feature: Session Management

Players need a way to create a game session and share it with others so everyone lands on the same score board.

---

## Behavior

- Host visits `/` and clicks "Create game" → generates a short alphanumeric code (6 characters, e.g. `XK4D2R`) → redirects to `/game/[code]`
- Other players visit `/` and enter the code → redirected to the same `/game/[code]`
- No auth, no accounts — the code is the only key to a session
- Sessions are backed by an in-memory server store (see `features/state-sync.md`) keyed by game code; Pusher channel lifetime matches the session

## Decisions

- **Code format** — short 6-character alphanumeric (uppercase, no ambiguous chars like `0`/`O`/`I`/`1`). Human-readable and easily shared verbally.
- **Session creation** — any player can create a session; the first to join is implicitly the host.
- **Session expiry** — in-memory state is cleaned up after inactivity (see `features/state-sync.md` for details). No database persistence.
- **Max players** — enforced at 2–4 at join time; fifth joiner is redirected to an error state.

## Dependencies

- None — first feature to build
