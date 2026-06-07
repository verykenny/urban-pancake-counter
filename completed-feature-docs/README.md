# Completed Feature Docs (Archive)

These are the **finalized feature specifications for the v1 baseline** that is currently
live at https://urban-pancake-counter.vercel.app. Every feature here is marked ✅ Done in
the historical v1 status table in [`PROJECT.md`](../PROJECT.md) (§6).

They were moved out of the active `docs/features/` directory during the **v2 update cycle**
(see [`PROJECT.md`](../PROJECT.md)) so that `specs/` only contains in-flight work.
They remain the authoritative record of how the existing room creation, session-code
generation, and real-time sync mechanisms behave — read them before touching anything they
describe, because every v2 change must stay backward-compatible with this baseline.

| Doc | Baseline feature |
|---|---|
| `session-management.md` | Room creation + 6-char session codes |
| `player-identity.md` | Per-browser player id (localStorage) |
| `player-setup.md` | Lobby join + player colors |
| `state-sync.md` | State sync on join + Redis TTL |
| `score-tracking.md` | Real-time score broadcast (Pusher) |
| `score-control-mode.md` | Host-controls-all vs self-control |
| `score-delegation.md` | Hand score control to another player |
| `win-condition.md` | Win at lore target + configurable target + animation |
| `hosting.md` | Vercel deploy |
| `mobile-layout.md` | Responsive + mobile player-focus layout |
| `reconnection.md` | Reconnect / state recovery |
| `session-sharing.md` | Copy code + QR join |
| `host-transfer.md` | Transfer host |
| `avatar-selection.md` | Initials/champion avatars |
| `screen-wake-lock.md` | Screen wake lock (v1 — superseded/hardened by `specs/04`) |
