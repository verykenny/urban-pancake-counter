# Feature: Win Condition

Lorcana ends when a player reaches 20 lore. The app should handle this moment clearly.

---

## Open Questions

- **Auto-detect or manual?** Should the app automatically declare a winner when someone hits 20, or just display the score and let players decide?
- **Board lock** — when a winner is declared, should score changes be blocked, or can players keep adjusting (e.g. to correct a mistake)?
- **Restart** — should there be a "play again" button that resets all scores to 0 in the same session?
- **Lore target** — is 20 always the target, or should the host be able to configure it (some play to a different number)?

## Proposed Approach (to confirm during planning)

- Auto-detect: when any player's score reaches 20, display a winner banner to all clients
- Board locks (no further increments) until the host resets
- "Play again" resets all scores to 0 and clears the winner state
- Target is fixed at 20 for now; configurable target is a future enhancement

## Dependencies

- Score tracking must exist first
