# Spec 15 — Table Mode (single-device)

**Phase 5 (net-new) · Medium priority · Status: [x] Implemented (pending PR/merge)**

## User Story / Context

> As a group with only one phone, I want to lay it flat in the middle of the table and have
> everyone see their own card, so one of us can track all the lore from that single screen
> without anyone else having to join from another device.

Every existing flow is **remote multiplayer**: each player joins a `game-{id}` session from
their own phone and state is synced through Redis + Pusher. Table Mode is the common
in-person case where a group shares one device. Because there is no second client, it is
implemented as **pure local React state — no game code, no `/api/*`, no Pusher, no Redis**.
This honours the project rule that device-local state never enters the sync layer, and the
core constraint that scores are ephemeral.

Confirmed product decisions:
- 2–4 players total, **no names** — each player is auto-assigned a color + icon (ink).
- All cards take **equal space** once the game starts.
- Players sit on **up to two sides**: the far side (top of the screen) is rotated 180°, the
  near side (bottom) is upright. No left/right (90°) seats.
- The lore-target win flow (default 20, confetti, win lock) is kept, mirroring the main game.

## Existing Code Integration

- **New client route** `src/app/table/page.tsx` (`"use client"`). It owns all local state and
  renders `TableSetup` (setup phase) then `TableBoard` + a win overlay (playing phase). It is
  the local analogue of `game/[id]/page.tsx` but with the Pusher / debounce / pending-delta /
  reconnection machinery stripped out.
- **Landing entry** — `src/app/page.tsx` gains a subordinate **"Table mode"** link to `/table`
  below the create/join actions.
- **Reused unchanged:** `Avatar`, `INK_COLORS` / `assignInk` / `inkLabel`
  (`src/lib/inkColors.ts`), `PlayerCard`, `vibrate` (`src/lib/haptics.ts`), `useWakeLock`,
  `canvas-confetti`, and the `100dvh` lock + score-size tokens in `globals.css`.
- **Small reuse-enabling additions (no behaviour change to remote mode):**
  - `useScoreReveal(score, pendingDelta, instant = false)` — a new `instant` path commits the
    new score immediately with a pop and never flashes/badges (there is no network echo to
    wait for on a single device). The existing two-arg call sites are unaffected.
  - `PlayerCard` gains an optional `instant` prop (passes through to `useScoreReveal` and drops
    the badge slot to reclaim vertical space). All other props map cleanly:
    `pendingDelta={0}`, `isOwnCard`/`isHost` omitted (no "own"/host card — every card is
    equal), `delegateName={null}`.
  - `inkLabel(key)` added next to `inkHex` for deriving a display label ("Amber") used as the
    card name (so `+`/`−` aria-labels read "Add lore for Amber") and the win headline.
- **Untouched (contract preserved):** all `/api/*`, `gameStore.ts`, `pusher*.ts`, the Redis
  `GameState` schema and every Pusher event, `ScoreBoard.tsx`, `MiniPlayerCard.tsx`,
  `LobbyView.tsx`, `GameCode.tsx`.

## UI/UX Layout & Responsive Design Requirements

- **Setup (`TableSetup`)** — centered shell matching `LobbyView`. A 2/3/4 player-count pill,
  a live preview of the auto-assigned avatars (`Avatar` + ink label, no name fields), the
  lore-target numeric input reused verbatim from the lobby (1–200, clamp on blur, "(standard)"
  at 20), and a clay **Start game** button. DOM hook: none required beyond defaults.
- **Board (`TableBoard`)** — a full-height (`min-h-[100dvh]`) flex column split into equal
  vertical bands; the far-side band is rotated with `rotate-180`. `rotate-180` is applied to
  the wrapping **cell**, not `PlayerCard`, so the card content *and* its `+`/`−` hit areas
  rotate together (a far player taps the visually-correct button by construction). Touch
  targets stay ≥44px (rotation is rigid, no scaling). DOM hooks: `.table-board`, `.table-card`.
  - **2 players:** one card per band (top 180°, bottom 0°).
  - **3 players (1 far / 2 near):** top band = one full-width card (180°); bottom band = two
    equal-width upright cards. Each band is an equal 50% height.
  - **4 players:** two equal cards per band; top row rotated 180°.
- **Orientation:** portrait-locked two-sided layout regardless of device orientation (it reads
  fine rotated; left/right seats are out of scope). The existing landscape media query keys on
  `.score-stack`/`.score-grid`, which Table Mode does not use, so it does not interfere.
- **Win overlay:** fixed, centered, above the board, with a translucent `bg-base-deep/70`
  backdrop; Cinzel "{ink} wins!" headline (`role="status"`), "Reached {N} lore", and
  Play again / New game / Exit actions.

## Technical & State Logic

- **State (`src/app/table/page.tsx`):** `phase: 'setup' | 'playing'`, `players: TablePlayer[]`,
  `loreTarget: number`, `winnerId: string | null`.
- **Player model (`src/lib/tableMode.ts`):** `TablePlayer { id, score, color, avatarName }`
  (no `name` — deliberately leaner than the server `Player`). `buildTablePlayers(count)` mints
  `crypto.randomUUID()` ids and walks `assignInk(null, taken)` to deterministically assign the
  first N inks (amber, amethyst, emerald, ruby).
- **Scoring:** synchronous and clamped exactly like `gameStore.updateScore` —
  `Math.min(loreTarget, Math.max(0, score + delta))` — with `vibrate(10)` per tap. No debounce,
  no pending-delta, no echo. `PlayerCard`'s existing button-disable logic (`−` at 0, `+` at
  `loreTarget`) works because it reads `score + pendingDelta` = `score + 0`.
- **Win detection:** an effect on `[players, loreTarget, winnerId]` sets `winnerId` to the
  first player at `>= loreTarget`; a separate effect fires confetti + `vibrate([60,40,60])`
  once on the `null → winner` transition (gated on `prefers-reduced-motion`). While `winnerId`
  is set the board is `locked` and the score handler early-returns.
- **Reset / exit:** **Play again** zeroes scores and clears the winner (same players / count /
  target); **New game** returns to setup; **Exit** is a `Link href="/"` — in-memory state is
  discarded on navigation, no cleanup needed.
- **No schema, event, route, or localStorage key changes.** The only `lt:`-prefixed storage in
  play is the existing haptics opt-out, read automatically by `vibrate`.
