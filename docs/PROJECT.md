# urban-pancake-counter — Project Overview

Lorcana lore score tracker for 2–4 players. Players join a shared real-time session to track lore counts together. No card management — score only.

---

## Status

### P0 — Foundation

| # | Feature | Status | Doc |
|---|---|---|---|
| 1 | Session management | ✅ Done | `features/session-management.md` |
| 2 | Player identity | ✅ Done | `features/player-identity.md` |
| 3 | Player setup / lobby | ✅ Done | `features/player-setup.md` |
| 4 | State sync on join | ✅ Done | `features/state-sync.md` |

### P1 — Core gameplay

| # | Feature | Status | Doc |
|---|---|---|---|
| 5 | Score tracking (real-time) | ✅ Done | `features/score-tracking.md` |
| 6 | Score control mode | ✅ Done | `features/score-control-mode.md` |
| 7 | Score delegation | ✅ Done | `features/score-delegation.md` |
| 8 | Win condition | 🔲 Not started | `features/win-condition.md` |
| 9 | Public hosting (Vercel) | 🔲 Not started | `features/hosting.md` |

### P2 — Required for good UX

| # | Feature | Status | Doc |
|---|---|---|---|
| 10 | Mobile-responsive layout | 🔲 Not started | `features/mobile-layout.md` |
| 11 | Reconnection / state recovery | 🔲 Not started | `features/reconnection.md` |
| 12 | Session sharing UX | 🔲 Not started | `features/session-sharing.md` |

### P3 — Nice to have

| # | Feature | Status | Doc |
|---|---|---|---|
| 13 | QR code for session join | 🔲 Not started | `features/session-sharing.md` |
| 14 | Player color differentiation | 🔲 Not started | `features/player-setup.md` |
| 15 | Win animation | 🔲 Not started | `features/win-condition.md` |
| 16 | Configurable lore target | 🔲 Not started | `features/win-condition.md` |
| 17 | Session auto-expiry | 🔲 Not started | `features/state-sync.md` |
| 18 | Spectator mode | 🔲 Not started | — |

---

## External Dependencies & Accounts

Third-party services this project relies on. Credentials live in `.env.local` (never committed).

| Service | Purpose | Account | Notes |
|---|---|---|---|
| [Pusher](https://dashboard.pusher.com) | Real-time WebSocket sync | GitHub login (verykenny@gmail.com) | Free Sandbox plan — Channels product |
| [GitHub](https://github.com/verykenny/urban-pancake-counter) | Source control | verykenny | Deploy key added: `~/.ssh/urban_pancake_counter` |
| [Vercel](https://vercel.com) | Hosting & CI/CD | — | Set up when feature #9 is implemented; connect GitHub repo, add Pusher env vars |
