# Feature: Session Management

Players need a way to create a game session and share it with others so everyone lands on the same score board.

---

## Open Questions

- **Code format** — short random code (e.g. `XKCD42`, like Jackbox) vs. a UUID in the URL? A short human-readable code is easier to share verbally.
- **Session creation** — does any player create a session, or only a designated "host"?
- **Session expiry** — should sessions auto-expire after inactivity? How long?
- **Max players** — enforce 2–4 at join time, or just display however many connect?

## Proposed Approach (to confirm during planning)

- Host visits `/` and clicks "Create game" → generates a short alphanumeric code → redirects to `/game/[code]`
- Other players visit `/` and enter the code → redirected to the same `/game/[code]`
- No auth, no accounts — code is the only key to a session
- Sessions are in-memory (Pusher channel lifetime); no persistence needed

## Dependencies

- None — first feature to build
