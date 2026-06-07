# Feature: Score Tracking

The core feature — each player's lore count is displayed and updated in real time across all connected devices.

---

## Behavior

- Each player has a lore counter starting at 0
- Score increments and decrements are controlled according to the active score control mode (see `features/score-control-mode.md`)
- Score updates broadcast instantly to all clients via Pusher (`game-{id}` channel, `score-update` event)
- Score floor is 0 — decrement button is disabled when a player's score is already 0
- No undo / history — scores are live state only

## Decisions

- **Who can edit scores** — determined by score control mode, not hardcoded here. The mode is chosen by the host at game start.
- **Negative scores** — floored at 0. The game has no mechanic for negative lore.

## Technical Notes

- Score state lives in React `useState` on the game page, initialized from the state-sync endpoint on mount (see `features/state-sync.md`)
- Updates flow: button click → `POST /api/score` → server updates in-memory store + triggers Pusher event → all clients receive `score-update` and update local state
- No database; scores are lost when the session expires

## Dependencies

- Session management
- Player identity
- Player setup / lobby
- State sync on join
- Score control mode
