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

## Implementation

**Status: ✅ Done** (commit `959164f`)

| File | Role |
|---|---|
| `src/lib/generateCode.ts` | Pure code generator — 6 chars from 32-char unambiguous charset |
| `src/lib/gameStore.ts` | In-memory `Map<string, SessionState>`; `createSession` / `sessionExists` |
| `src/app/api/game/route.ts` | `POST /api/game` — creates session, returns `{ code }` |
| `src/app/api/game/[id]/route.ts` | `GET /api/game/[id]` — returns 200/404 based on session existence |
| `src/app/page.tsx` | Client component; "Create game" + "Join" flows with inline error states |
| `src/app/game/[id]/page.tsx` | Uses Next.js 16 async `params` API |

**Implementation note:** Server components and API route handlers run in separate Turbopack module contexts, so `gameStore.ts` cannot be imported directly by server components to validate sessions. All state reads from page/component code must go through the API routes. See `features/state-sync.md` for the full architectural note and the path to an external store.

## Dependencies

- None — first feature to build
