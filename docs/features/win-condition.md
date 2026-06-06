# Feature: Win Condition

Lorcana ends when a player reaches 20 lore. The app should handle this moment clearly.

---

## Behavior

- When any player's score reaches 20, a winner banner is displayed to all connected clients simultaneously via a Pusher `game-won` event
- The score board locks — all +/− buttons are disabled for all players
- The host sees a "Play again" button; other players see a waiting message
- "Play again" resets all scores to 0, clears the winner state, and returns everyone to the active game view (no lobby re-entry required)

## Decisions

- **Auto-detect** — yes, the app automatically declares a winner at 20. No manual declaration.
- **Board lock** — scores are frozen on win. No corrections allowed; the board lock is strict.
- **Restart** — "Play again" is host-only and resets to 0 without re-entering the lobby.
- **Lore target** — fixed at 20 for now. Configurable target (P3 enhancement) deferred — some play to different numbers but it's an edge case.

## P3 Enhancements

- **Configurable lore target** — host sets target (default 20) at game start, before the lobby closes.
- **Win animation** — confetti or screen flash on win declaration, client-side only (CSS or `canvas-confetti`).

## Dependencies

- Score tracking
