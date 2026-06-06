# urban-pancake-counter — Project Overview

Lorcana lore score tracker for 2–4 players. Players join a shared real-time session to track lore counts together. No card management — score only.

---

## Status

| Phase | Status |
|---|---|
| Project scaffold | ✅ Done |
| Session management | 🔲 Not started |
| Player setup | 🔲 Not started |
| Score tracking (real-time) | 🔲 Not started |
| Win condition | 🔲 Not started |

---

## Open Decisions

These need to be resolved before or during feature planning:

- **Session codes** — how are game sessions created and shared? (see `features/session-management.md`)
- **Player name entry** — does the host configure all players, or does each player enter their own name on join? (see `features/player-setup.md`)
- **Win condition behavior** — does the app auto-detect 20 lore and lock the board, or just display scores? (see `features/win-condition.md`)

---

## External Dependencies & Accounts

Third-party services this project relies on. Credentials live in `.env.local` (never committed).

| Service | Purpose | Account | Notes |
|---|---|---|---|
| [Pusher](https://dashboard.pusher.com) | Real-time WebSocket sync | GitHub login (verykenny@gmail.com) | Free Sandbox plan — Channels product |
| [GitHub](https://github.com/verykenny/urban-pancake-counter) | Source control | verykenny | Deploy key added: `~/.ssh/urban_pancake_counter` |

---

## Features

| Feature | File |
|---|---|
| Session management | `features/session-management.md` |
| Player setup | `features/player-setup.md` |
| Score tracking | `features/score-tracking.md` |
| Win condition | `features/win-condition.md` |
