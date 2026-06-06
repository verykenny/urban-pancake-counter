# Feature: Score Tracking

The core feature — each player's lore count is displayed and updated in real time across all connected devices.

---

## Behavior

- Each player has a lore counter (0–20)
- Any connected player can increment or decrement any player's score
- Score updates broadcast instantly to all clients via Pusher (`game-{id}` channel, `score-update` event)
- No undo / history — scores are live state only

## Open Questions

- **Who can edit scores?** Any player, or only the player whose score it is?
- **Negative scores** — should the counter floor at 0, or allow going below?

## Technical Notes

- Score state lives in React `useState` on the game page
- Updates flow: button click → `POST /api/score` → Pusher trigger → all clients receive `score-update` and update local state
- No database; scores are lost when all clients disconnect

## Dependencies

- Session management
- Player setup
