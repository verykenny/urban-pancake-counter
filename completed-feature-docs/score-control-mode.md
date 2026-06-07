# Feature: Score Control Mode

The host decides, at game start, who is allowed to modify player scores. This controls whether the game is host-managed (e.g. one person runs the board) or self-managed (each player tracks their own score on their own device).

---

## Modes

| Mode | Description |
|---|---|
| **Host controls all** | Only the host's device can increment or decrement any player's score. All +/− buttons are disabled for non-host clients. |
| **Players control own** | Each player can only modify their own score card. A player can additionally delegate their card's controls to another player (see `features/score-delegation.md`). |

## Behavior

- The host selects the mode in the lobby before starting the game
- The selected mode is stored in the game store and broadcast to all clients as part of the `game-started` Pusher event
- The mode cannot be changed after the game starts (to avoid confusion mid-game)
- The server enforces the mode on `POST /api/score` requests — a request from a non-authorized player is rejected with `403`
- The client disables buttons proactively based on the received mode and the player's own identity, but server-side enforcement is authoritative

## Dependencies

- Player identity
- Player setup / lobby
- State sync on join
