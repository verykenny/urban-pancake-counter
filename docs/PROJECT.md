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
| 8 | Win condition | ✅ Done | `features/win-condition.md` |
| 9 | Public hosting (Vercel) | ✅ Done | `features/hosting.md` |

### P2 — Required for good UX

| # | Feature | Status | Doc |
|---|---|---|---|
| 10 | Mobile-responsive layout | ✅ Done | `features/mobile-layout.md` |
| 11 | Reconnection / state recovery | ✅ Done | `features/reconnection.md` |
| 12 | Session sharing UX | ✅ Done | `features/session-sharing.md` |

### P3 — Nice to have

| # | Feature | Status | Doc |
|---|---|---|---|
| 13 | QR code for session join | ✅ Done | `features/session-sharing.md` |
| 14 | Player color differentiation | ✅ Done | `features/player-setup.md` |
| 15 | Win animation | ✅ Done | `features/win-condition.md` |
| 16 | Configurable lore target | ✅ Done | `features/win-condition.md` |
| 17 | Session auto-expiry | ✅ Done (Redis TTL) | `features/state-sync.md` |
| 18 | Spectator mode | 🚫 Won't do | — |
| 19 | Host transfer | ✅ Done | `features/host-transfer.md` |
| 20 | Avatar selection | 🔲 Not started | `features/avatar-selection.md` |

**Notes:**
- **17 (auto-expiry)** is satisfied by the Upstash Redis TTL (`SESSION_TTL = 86400`, refreshed on every write). The 60-minute in-memory cleanup from the original spec is obsolete now that state lives in Redis; 24h is kept so paused games survive.
- **18 (spectator mode)** is **won't-do** — it conflicts with the "No spectator mode" constraint in `CLAUDE.md`.

---

## External Dependencies & Accounts

Third-party services this project relies on. Credentials live in `.env.local` (never committed).

| Service | Purpose | Account | Notes |
|---|---|---|---|
| [Pusher](https://dashboard.pusher.com) | Real-time WebSocket sync | GitHub login (verykenny@gmail.com) | Free Sandbox plan — Channels product |
| [Upstash](https://console.upstash.com) | Serverless Redis — game session store | GitHub login (verykenny@gmail.com) | Free tier; sessions expire after 24h |
| [GitHub](https://github.com/verykenny/urban-pancake-counter) | Source control | verykenny | Deploy key added: `~/.ssh/urban_pancake_counter` |
| [Vercel](https://vercel.com) | Hosting & CI/CD | GitHub login (verykenny@gmail.com) | https://urban-pancake-counter.vercel.app — auto-deploys on push to `main` |
