# Spec 06 — Quick-Tap Lore Modifiers (`+2` / `+3`)

**Phase 2 · Medium-High priority · Status: [ ] Pending**

## User Story / Context

> As a player whose character quested for 2 or 3 lore, I want a single tap to add it instead
> of pressing `+` two or three times — that's the most common action in the game.

## Existing Code Integration

- **Pure client UI** in `src/components/PlayerCard.tsx` (and optionally `MiniPlayerCard.tsx`).
  No server or schema change is needed: the score pipeline already accepts an arbitrary
  `delta`.
  - `PlayerCard` calls `onIncrement` / `onDecrement` (fixed ±1). Add `onAdd(delta)` wired to
    `ScoreBoard`'s `onScoreChange(player.id, delta)`.
  - `ScoreBoard` already passes `onScoreChange`; add `+2`/`+3` handlers next to the existing
    `() => onScoreChange(player.id, 1)`.
  - `POST /api/score` and `updateScore()` already do `player.score + delta` with a `max(0,…)`
    clamp and win check — `+2`/`+3` flow through unchanged and broadcast `score-update`
    normally.
- The existing `disabled`/`locked`/`canControl` gating must apply to the new buttons too.

## UI/UX Layout & Responsive Design Requirements

- **Auxiliary buttons** sit inline with the primary `+`/`−`, but **visually secondary**:
  smaller, lower-emphasis (outlined/`bg-ink-mid` rather than the solid `--gold` fill of the
  primary `+`). Labels exactly `+2` and `+3`.
- **Layout (own/hero card):** row becomes `[ − ] [ + ] [ +2 ] [ +3 ]`. The primary `+`/`−`
  keep their prominence (64px on mobile); aux buttons ≥**44px** but visually smaller weight.
- **Opponent / mini cards:** keep just `−`/`+` to avoid crowding; `+2`/`+3` are own-card only
  (and host cards when host-controls-all). Document this scope.
- Tokens only; aux buttons reuse the secondary-button token style defined in Feature 03.
- Active/press feedback (`active:scale-95`) so rapid tapping feels responsive.

## Technical & State Logic

- **No new state.** Reuses the existing optimistic→broadcast→reconcile flow.
- **No `−2`/`−3`** in v1 of this feature (correcting an over-add is rare; keep the cluster
  small). Note as a possible future toggle.
- **Edge cases:**
  - Win threshold: `+3` may cross `loreTarget` — server already sets `winner` and locks the
    board; the extra overshoot (e.g. target 20, score goes 18→21) is fine and expected.
  - Disabled state: aux buttons respect `disabled || locked` exactly like `+`.
  - Rapid multi-tap: each tap is an independent POST; the server is authoritative and
    `score-update` reconciles — no client-side accumulation needed.
  - Decrement still clamps at 0 (`score === 0` disables `−`); aux buttons never go negative.
