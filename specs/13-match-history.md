# Spec 13 — Local Match History & Ink Statistics

**Phase 4 · Low-Medium priority · Status: [ ] Pending**

## User Story / Context

> As a regular player, I want this device to remember my past matches — who won, final scores,
> which inks, how many turns — so I can see a little dashboard of my play history, even though
> the live game itself keeps no database.

> Note: the core app is intentionally **database-free** (scores are ephemeral). This feature
> respects that — it persists only a **per-device** summary to `localStorage` *after* a match
> ends. It never adds server state and never makes the live game depend on history.

## Existing Code Integration

- **Hooks into the existing win flow.** A match "completes" when `gameState.winner` becomes
  non-null (the page already tracks this via `prevWinner` for the confetti effect at
  `page.tsx:43`). At that transition, snapshot the match and append to history.
- Read the data already in `gameState`: `players[] {name, score, color, avatarName}`,
  `winner`, `loreTarget`. Ink (Feature 10) and turn count (Feature 08) are added if those
  ship; otherwise record what's available and leave them optional.
- **Device-local only**: `localStorage`, no Pusher/`GameState`/Redis. Must guard against
  **double-recording**: the `winner` transition fires on every connected client. Record only
  on the **local player's own device for matches they were in**, and dedupe by a stable
  `matchId` (see below) so reconnects/re-renders don't append twice.

## UI/UX Layout & Responsive Design Requirements

- **Dashboard** at a new route `/history` (server component shell + client component that
  reads `localStorage`), reachable from the landing page (`/`) and the `GameMenu` *Match*
  section. Not shown mid-match.
- **Cards/table** of past matches, newest first: date, winner (highlighted), each player's
  final score, ink(s), turn count. Plus simple aggregates: total games, win count/rate,
  most-used ink.
- Mobile-first: stacked cards on phones, table on `≥ sm`. Tokens only; ≥44px controls.
- A **"Clear history"** button with a confirm step (it's the only copy of this data).

## Technical & State Logic

- **Schema (localStorage):** key `lt:matchHistory` → `MatchRecord[]`:
  ```ts
  interface MatchRecord {
    matchId: string;       // `${gameId}:${winnerId}:${createdAt}` — stable dedupe key
    date: number;          // epoch ms when recorded
    gameId: string;
    players: { name: string; score: number; inks?: string[] }[];
    winnerName: string;
    loreTarget: number;
    turnCount?: number;    // from Feature 08, if present
  }
  ```
- **Write path:** in the `winner`-transition effect, build the record, read the array, dedupe
  by `matchId`, push, write back. Wrap all access in try/catch (quota / private mode).
- **Cap** to the most recent N (e.g. 100) to stay well under the ~5MB quota; drop oldest.
- **Versioning:** store `{ v: 1, records: [...] }` so the shape can migrate later; on read,
  ignore/upgrade unknown versions rather than throwing.
- **Edge cases:**
  - `localStorage` unavailable → dashboard shows an empty state, recording silently no-ops.
  - Multiple devices → each keeps its own history (expected; no sync).
  - Play-again resets `winner` to null then a new winner later → that's a **new** match
    (`matchId` differs because the win identity/time differ); record both.
  - Spectator-free app, but a player who joined late still records the match they finished in.
  - Corrupt/parse-fail JSON → treat as empty, optionally back up the bad blob before
    overwriting.
- **DOM hooks:** `.match-history`, `.match-record`, `.history-stats`.
