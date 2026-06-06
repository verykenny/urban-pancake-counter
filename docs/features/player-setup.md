# Feature: Player Setup

Once a session exists, players need names and slots assigned before the score board can be shown.

---

## Open Questions

- **Who enters names?** Two models to consider:
  - *Host configures all players* — one person sets up all 2–4 names before anyone joins (simpler, less coordination)
  - *Each player enters their own name on join* — each device picks a name when connecting (more natural for remote play)
- **Player count** — is the number of players fixed when the session is created, or does it grow as people join?
- **Player colors / avatars** — any visual differentiation beyond names?

## Proposed Approach (to confirm during planning)

- Each player enters their name when joining via the `/game/[code]` page
- First to join is implicitly the host (for any host-only actions)
- Player slots fill in join order; session locks once the host starts the game or all slots fill

## Dependencies

- Session management must exist first
