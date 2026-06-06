# Feature: State Sync on Join

Pusher delivers events in real time but does not replay history. A player who joins mid-game, refreshes, or reconnects after a network drop must receive the current game state from the server.

---

## Architectural note

Next.js (Turbopack) runs server components and API route handlers in separate module contexts. A module-level `Map` in `gameStore.ts` is **not shared** between the two — meaning a session created via an API route is invisible to a server component that imports the same file directly. All game state reads in server/client components must therefore go through the API routes, not via direct imports. On Vercel, serverless function isolation makes this worse: even two API route invocations may hit different instances. The in-memory store is only reliable for local dev; production correctness will require an external store (e.g. Upstash Redis) before or alongside this feature.

## Behavior

- The server maintains a `Map<gameId, GameState>` (the game store), currently in-memory in `src/lib/gameStore.ts`; will need an external store for production
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
