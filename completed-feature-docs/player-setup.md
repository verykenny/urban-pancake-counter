# Feature: Player Setup / Lobby

Once a session exists, players enter their names and wait in a lobby until the host starts the game.

---

## Behavior

- Each player who navigates to `/game/[code]` is prompted to enter their name before seeing the score board
- The first player to join is assigned the host role (stored against their player identity — see `features/player-identity.md`)
- As players join, all connected clients see the live player list update in the lobby view
- The host sees a "Start game" button; other players see a waiting message
- The game starts when the host clicks "Start game" (minimum 2 players) or all 4 slots are filled
- Player slots are filled in join order; a fifth joiner is rejected

## Decisions

- **Who enters names** — each player enters their own name on join. More natural for remote play; allows each device to own its identity.
- **Player count** — grows dynamically as players join, up to 4. Not fixed at creation time.
- **Player colors** — each player is assigned a distinct accent color from a fixed palette on join (P3 enhancement). No avatars.

## Dependencies

- Session management
- Player identity
