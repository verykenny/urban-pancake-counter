# Feature: Score Delegation

When score control mode is *players control own*, a player may choose to let another specific player update their score on their behalf — for example, if they want to hand their phone to someone else, or if one player is managing the board for another.

---

## Behavior

- Delegation is only available when the active score control mode is *players control own*
- A player can open a delegation menu on their own score card and select any other player in the session to be their delegate
- Once delegated, the delegate's device can press +/− on the delegating player's card in addition to their own
- The delegating player retains control of their own card — delegation is additive, not a transfer
- A player can revoke their delegation at any time by selecting "None" in the delegation menu
- Delegation state is per-player, stored in the game store, and broadcast to all clients via a `delegation-updated` Pusher event so button states update in real time
- The server enforces delegation on `POST /api/score` requests — a player attempting to modify another player's score without being that player's delegate (or being the host in host-controls-all mode) is rejected with `403`

## Open Questions

- **UI placement** — where does the delegation menu live? Options: a small icon/button on the player's own card, or a settings panel. Decision to be made during implementation.

## Dependencies

- Player identity
- Score control mode
