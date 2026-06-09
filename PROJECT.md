# PROJECT.md — Lorcana Lore Tracker (v2 Update Cycle)

**Single source of truth for the v2 refactor + feature cycle.**

This document governs the current major update cycle and is the **single project file** —
the former `docs/PROJECT.md` has been folded in here (its v1 status table is now §6 below).
The finalized v1 feature specs are archived in
[`completed-feature-docs/`](completed-feature-docs/). New, in-flight work is specified
one file per feature in [`specs/`](specs/).

> ⚠️ **Framing correction (read first).** The original v2 brief described this app as
> "P2P/WebSockets." That is not the live architecture. Real-time state is **server-authoritative**:
> clients POST to Next.js route handlers, the server mutates state in **Upstash Redis**, and
> fan-out happens over **Pusher Channels** (hosted WebSockets). There is no peer-to-peer
> connection. "Backward-compatible" in every spec below means *do not break the Pusher
> channel/event contract or the Redis `GameState` schema* — see [Sync Contract](#sync-contract).

---

## 1. Existing Architecture Context (the live baseline)

The app is **already live and functional**. v2 wraps and refines it — it does not rebuild it.
What works today and must keep working:

- **Room creation & session codes** — `POST /api/game` creates a session and a unique
  6-char code (`src/lib/generateCode.ts`); the session is stored in Redis with a 24h TTL.
- **Join & lobby** — `POST /api/game/[id]/join`; players get an id (persisted per-browser via
  `usePlayerId`), a name, a color, and an optional avatar.
- **Real-time state syncing** — every mutation broadcasts a Pusher event on `game-{id}`;
  all clients reconcile into local React state. State recovery on reconnect re-fetches
  `GET /api/game/[id]`.
- **Scoring & rules** — server-authoritative score updates with control modes
  (`host` / `self`), delegation, configurable lore target (1–200, default 20), win lock,
  and play-again reset.

### Live file map (touch points for v2)

| Concern | File |
|---|---|
| Game page (client orchestration, Pusher binds) | `src/app/game/[id]/page.tsx` |
| Lobby | `src/components/LobbyView.tsx` |
| Board / layout | `src/components/ScoreBoard.tsx` |
| Player panel | `src/components/PlayerCard.tsx`, `src/components/MiniPlayerCard.tsx` |
| Session code + copy + QR | `src/components/GameCode.tsx` |
| Score API (broadcasts `score-update`, `game-won`) | `src/app/api/score/route.ts` |
| Other game APIs | `src/app/api/game/[id]/{join,start,mode,reset,host,delegation}/route.ts` |
| Server state store (Redis) | `src/lib/gameStore.ts` |
| Pusher (server) | `src/lib/pusher.ts` |
| Pusher (browser singleton) | `src/lib/pusherClient.ts` |
| Wake lock hook | `src/lib/useWakeLock.ts` |
| Design tokens | `src/app/globals.css` |

### <a name="sync-contract"></a>Sync contract (do not break)

- **Channel:** one per session, `game-{id}`.
- **Events already in use:** `player-joined`, `game-started`, `mode-changed`,
  `score-update` (`{ playerId, score }`), `delegation-updated`, `game-won`
  (`{ winnerId }`), `game-reset`, `host-transferred`.
- **Redis `GameState` schema** (`src/lib/gameStore.ts`): `createdAt`, `hostPlayerId`,
  `players[] {id,name,score,color,avatarName}`, `phase`, `controlMode`, `delegations`,
  `winner`, `loreTarget`.
- **Rule for v2:** new shared/multiplayer state → add a new event and a new optional field
  on `GameState` (default-safe on read, as the client already does with `?? {}` / `?? 20`).
  Never repurpose or rename an existing event or field. Features that are **device-local**
  (themes, history, display mode, webhook URL) must **not** enter Redis or Pusher at all —
  they live in `localStorage`.

---

## 2. Tech Stack & Refactor Rules

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict — no `any`, no needless assertions) |
| Styling | Tailwind CSS v4 (`@theme inline` + CSS custom properties) |
| Real-time | Pusher Channels |
| Session store | Upstash Redis (24h TTL) |
| New client persistence | Browser `localStorage` |
| Hosting | Vercel |

**Refactor rules for this cycle:**

1. **Client-side first.** v2 is overwhelmingly front-end. Add a server route/event *only*
   when state must be shared between players (Features 05, 08). Everything else is local.
2. **Design tokens are mandatory.** `globals.css` defines the warm Hearthlight ramp —
   `--base*`, `--surface`, `--raised`, `--line`, `--fg*`, `--clay*`, `--glow`, `--danger`
   (see `DESIGN.md`). New styling references tokens; the cycle also *migrates* any
   remaining hardcoded `rgba()`/`boxShadow`/`textShadow` literals onto tokens
   (Feature 03). No new hardcoded color/spacing literals.
3. **Tailwind only.** No CSS modules, no inline `style` props for anything a token/utility
   can express. (Existing inline `boxShadow` glows are migrated, not extended.)
4. **Clean, screenshot-friendly DOM.** Stable, semantic class hooks (`.player-card`,
   `.score-panel`, `.lore-bar`, `.activity-feed`) so design-vision tooling can parse layouts.
5. **Mobile-first.** `dvh` viewport units, fluid `clamp()` typography, ≥44px touch targets.
6. **Progressive enhancement.** Browser-API features (wake lock, clipboard, webhooks) must
   degrade silently when unsupported/denied — never throw, never block gameplay.
7. **No abstractions ahead of need.** Extract on the third real use, per `CLAUDE.md`.
8. **Process:** read the relevant `specs/` file before building; one branch + PR per feature
   (never push to `main`); update the §3 roadmap checkbox (and §6 once a v2 item ships) when a
   feature lands.

---

## 3. Prioritized Roadmap

Phases are the intended implementation order; items inside a phase can ship as independent
PRs. **Phase 1 shipped to `main` on 2026-06-07; Phases 2–4 pending.**

### Phase 1 — UI Cleanup & Mobile Baseline (High priority) — ✅ Complete (2026-06-07)

- [x] **01 — Simplify UI / Navigation** → [`specs/01-ui-navigation.md`](specs/01-ui-navigation.md) — `GameMenu` drawer; host control-mode toggle and (on mobile) the Game Code moved into it
- [x] **02 — Mobile-First Responsive Layout** → [`specs/02-mobile-layout.md`](specs/02-mobile-layout.md) — 60/40 hero split, `100dvh` lock, fluid scores, 44px touch targets
- [x] **03 — Aesthetic & UI Polish (Design Tokens)** → [`specs/03-ui-tokens.md`](specs/03-ui-tokens.md) — semantic/shadow/glow tokens; all inline `rgba`/`purple-900` literals migrated
- [x] **04 — Screen Wake Lock API** → [`specs/04-screen-wake-lock.md`](specs/04-screen-wake-lock.md) — hardened: scoped to active play (`phase === 'playing' && !winner`)
- [x] **Haptic feedback** (net-new) → `src/lib/haptics.ts` — vibration on score tap + win, with a device-local opt-out in the menu

### Phase 2 — Core Gameplay Enhancements (Medium-High priority)

- [ ] **05 — Pre-Game Player Reordering** → [`specs/05-player-reordering.md`](specs/05-player-reordering.md)
- [ ] **07 — Lore Race Tracker Progress Bar** → [`specs/07-progress-bar.md`](specs/07-progress-bar.md)
- [ ] **08 — Turn Tracker & Stopwatch Timer** → [`specs/08-turn-timer.md`](specs/08-turn-timer.md)

### Phase 3 — Match Context & Accessibility (Medium priority)

- [ ] **09 — Built-in Lore Log Activity Feed** → [`specs/09-activity-feed.md`](specs/09-activity-feed.md)
- [ ] **10 — Customizable Ink Themes** → [`specs/10-ink-themes.md`](specs/10-ink-themes.md)
- [ ] **11 — Dark Mode & High-Contrast Mode** → [`specs/11-display-modes.md`](specs/11-display-modes.md)

### Phase 4 — Extended Features & Sharing (Low-Medium priority)

- [ ] **12 — Quick-Copy Game Link** → [`specs/12-copy-link.md`](specs/12-copy-link.md)
- [ ] **13 — Local Match History & Ink Statistics** → [`specs/13-match-history.md`](specs/13-match-history.md)
- [ ] **14 — Discord Webhook Integration** → [`specs/14-discord-integration.md`](specs/14-discord-integration.md)

---

## 4. Overlap with the v1 Baseline (important)

Several v2 items are **refinements of shipped features**, not greenfield builds. Treat the
archived v1 doc as the starting point:

| v2 item | Status of overlap | Notes |
|---|---|---|
| 02 Mobile layout | Partial | `ScoreBoard` already does hero-own-card + `MiniPlayerCard` row. v2 formalizes the 60/40 split, `dvh` lock, and fluid type. |
| 03 Design tokens | Partial | Token system exists in `globals.css`; v2 completes adoption + adds light/contrast palettes for Feature 11. |
| 04 Wake lock | **Done** | Implemented in `useWakeLock.ts` incl. iOS sentinel re-acquire. Spec is documentation + release-on-menu hardening. |
| 07 Progress bar | New, but constrained | Must bind to existing `loreTarget` (1–200), not a hardcoded 20. |
| 12 Copy link | Partial | `GameCode` already copies the *code* + QR. v2 adds full-URL copy with the same 1.5s "Copied!" pattern. |

---

## 5. External Dependencies & Accounts

| Service | Purpose | Account | Notes |
|---|---|---|---|
| [Pusher](https://dashboard.pusher.com) | Real-time WebSocket sync | GitHub (verykenny@gmail.com) | Free Sandbox — Channels |
| [Upstash](https://console.upstash.com) | Serverless Redis session store | GitHub (verykenny@gmail.com) | Free tier; 24h TTL |
| [GitHub](https://github.com/verykenny/urban-pancake-counter) | Source control | verykenny | Deploy key `~/.ssh/urban_pancake_counter` |
| [Vercel](https://vercel.com) | Hosting & CI/CD | GitHub (verykenny@gmail.com) | Auto-deploy on push to `main` |
| Discord (Feature 14) | Optional per-user webhook | user-supplied | URL stored in `localStorage` only; never committed/shared |

---

## 6. v1 Baseline Status (historical — all shipped)

The folded-in v1 status tracker (formerly `docs/PROJECT.md`). Every item below is ✅ live; the
specs are archived in [`completed-feature-docs/`](completed-feature-docs/). Kept for
provenance — active work is tracked in the §3 roadmap.

### P0 — Foundation
| # | Feature | Status | Archived doc |
|---|---|---|---|
| 1 | Session management | ✅ Done | `completed-feature-docs/session-management.md` |
| 2 | Player identity | ✅ Done | `completed-feature-docs/player-identity.md` |
| 3 | Player setup / lobby | ✅ Done | `completed-feature-docs/player-setup.md` |
| 4 | State sync on join | ✅ Done | `completed-feature-docs/state-sync.md` |

### P1 — Core gameplay
| # | Feature | Status | Archived doc |
|---|---|---|---|
| 5 | Score tracking (real-time) | ✅ Done | `completed-feature-docs/score-tracking.md` |
| 6 | Score control mode | ✅ Done | `completed-feature-docs/score-control-mode.md` |
| 7 | Score delegation | ✅ Done | `completed-feature-docs/score-delegation.md` |
| 8 | Win condition | ✅ Done | `completed-feature-docs/win-condition.md` |
| 9 | Public hosting (Vercel) | ✅ Done | `completed-feature-docs/hosting.md` |

### P2 — Required for good UX
| # | Feature | Status | Archived doc |
|---|---|---|---|
| 10 | Mobile-responsive layout | ✅ Done | `completed-feature-docs/mobile-layout.md` |
| 11 | Reconnection / state recovery | ✅ Done | `completed-feature-docs/reconnection.md` |
| 12 | Session sharing UX | ✅ Done | `completed-feature-docs/session-sharing.md` |

### P3 — Nice to have
| # | Feature | Status | Archived doc |
|---|---|---|---|
| 13 | QR code for session join | ✅ Done | `completed-feature-docs/session-sharing.md` |
| 14 | Player color differentiation | ✅ Done | `completed-feature-docs/player-setup.md` |
| 15 | Win animation | ✅ Done | `completed-feature-docs/win-condition.md` |
| 16 | Configurable lore target | ✅ Done | `completed-feature-docs/win-condition.md` |
| 17 | Session auto-expiry | ✅ Done (Redis TTL) | `completed-feature-docs/state-sync.md` |
| 18 | Spectator mode | 🚫 Won't do | — |
| 19 | Host transfer | ✅ Done | `completed-feature-docs/host-transfer.md` |
| 20 | Avatar selection | ✅ Done (initials) | `completed-feature-docs/avatar-selection.md` |
| 21 | Mobile player-focus layout | ✅ Done | `completed-feature-docs/mobile-layout.md` |
| 22 | Screen wake lock | ✅ Done | `completed-feature-docs/screen-wake-lock.md` |

**Notes:**
- **17 (auto-expiry)** is satisfied by the Upstash Redis TTL (`SESSION_TTL = 86400`, refreshed
  on every write). The 60-minute in-memory cleanup from the original spec is obsolete now that
  state lives in Redis; 24h is kept so paused games survive.
- **18 (spectator mode)** is **won't-do** — it conflicts with the "No spectator mode"
  constraint in `CLAUDE.md`.
- Several v2 items refine these shipped features rather than replacing them — see §4.
