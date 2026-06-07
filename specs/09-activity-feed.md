# Spec 09 — Built-in Lore Log Activity Feed

**Phase 3 · Medium priority · Status: [ ] Pending**

## User Story / Context

> As a player, I want a running log of score changes ("Alex +2 → 14") so we can settle "wait,
> what's the score?" disputes and glance at what just happened, without it covering the board.

## Existing Code Integration

- **Device-local, derived from the existing event stream.** The feed does **not** add server
  state. It listens to the Pusher events already bound in `src/app/game/[id]/page.tsx` and
  appends an entry locally:
  - `score-update` `{ playerId, score }` is the primary source. The event carries the new
    `score` but **not the delta** — compute `delta = newScore - prevScoreForThatPlayer`
    using the player's previous score from `gameState` *before* applying the update. Capture
    the player name from `gameState.players`.
  - Optionally also log `game-won`, `game-reset`, `host-transferred`, `player-joined`.
- Lift a `log` array into the game page (or a small `useActivityLog` hook) populated inside
  the existing `channel.bind('score-update', …)` handler — right where `prev.players` is
  still available to read the old score.

## UI/UX Layout & Responsive Design Requirements

- **Collapsed (default):** a slim bottom bar pinned to the viewport bottom showing **only the
  single most recent event**, e.g. `Alex +2 → 14` with a relative timestamp and a chevron.
  Must not overlap the score controls — sits below them, respects safe-area insets
  (`env(safe-area-inset-bottom)`).
- **Expanded (on tap):** slides up into a scrollable drawer (max `60dvh`) listing entries
  newest-first. Tap chevron / backdrop / `Escape` to collapse.
- Each row: timestamp · player (with their accent color dot) · delta (`+2`/`−1`) · resulting
  score. Tokens only; rows readable but compact.
- Coexists with the `GameMenu` (F01) and reconnect banner — define z-order (feed below menu
  drawer, above board).

## Technical & State Logic

- **Schema (local, in-memory):**
  ```ts
  interface LogEntry { id: string; ts: number; playerId: string; playerName: string;
                       delta: number; score: number; }
  ```
- **State:** `const [log, setLog] = useState<LogEntry[]>([])`, `const [expanded, setExpanded] = useState(false)`.
- **Ephemeral by design** (matches the "no database / scores reset" constraint) — the log is
  **not** persisted to `localStorage` here; cleared on unmount/reset. (Completed-match
  summaries are Feature 13's job, separately.)
- **Cap** the array (e.g. last 200 entries) to bound memory.
- **Edge cases:**
  - Delta computation when the player isn't yet in local state (race on join) → skip the
    entry rather than log `NaN`.
  - Reconnect re-fetch replaces `gameState` wholesale — don't retroactively fabricate log
    entries for changes missed while offline; just resume logging live events (note the gap
    is acceptable for a casual feed).
  - `game-reset` → push a "Game reset" entry and optionally clear prior entries.
  - Reduced motion → cross-fade instead of slide.
- **DOM hooks:** `.activity-feed`, `.activity-feed-latest`, `.activity-feed-list`.
