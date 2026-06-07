# Spec 02 — Mobile-First Responsive Layout

**Phase 1 · High priority · Status: [ ] Pending**

## User Story / Context

> As a player holding my phone during a face-to-face match, I want my own score huge and
> thumb-reachable and my opponent's smaller-but-readable, and I don't want the layout to jump
> when the mobile browser's address bar shows/hides.

A mobile player-focus layout already partly exists. v2 formalizes it into an explicit
**60/40 split** (own panel / opponents), fluid typography readable from 3–5 ft, and a
viewport locked with dynamic units so the address-bar collapse stops shifting the board.

## Existing Code Integration

- **Refine `src/components/ScoreBoard.tsx`.** It already branches: `hidden sm:grid` for
  tablet/desktop, and a `sm:hidden` mobile column with the own `PlayerCard` as hero + a row of
  `MiniPlayerCard`s. Keep that structure; change the *proportions and sizing*, don't rebuild.
- **`src/app/game/[id]/page.tsx`** playing-phase `<main>` currently uses `min-h-screen`.
  Replace height handling with `dvh` (see below).
- This is **pure CSS/markup** — no Pusher/Redis/handler changes. `onScoreChange` and the
  `canControl` logic stay exactly as-is.

## UI/UX Layout & Responsive Design Requirements

- **Split (mobile, `< sm`):** own `.score-panel` occupies ~60% of the available vertical
  space, opponents' row ~40%. Use a flex column where the hero card gets `flex-[3]` and the
  opponents row `flex-[2]` (3:2 ≈ 60/40). The 2–4-player cases:
  - 2 players → 1 mini card; 3 → 2; 4 → 3 mini cards in the 40% row (horizontal scroll if
    they don't fit, snap points per card).
- **Fluid typography:** own score `font-size: clamp(4.5rem, 22vw, 9rem)`; opponent score
  `clamp(2rem, 9vw, 3.5rem)`. Names/labels `clamp(0.9rem, 4vw, 1.15rem)`. Keep
  `tabular-nums` so digits don't reflow.
- **Touch targets:** all +/− controls ≥ **44px** (own card stays at the current 64px `h-16`);
  mini-card controls ≥44px.
- **Viewport lock:** the playing `<main>` uses `min-height: 100dvh` (with `100vh` fallback
  for older engines). Avoid `100vh` alone — that's what causes the address-bar jump.
  Internal regions that must not overflow use `dvh` too; allow the opponents row to scroll
  rather than the whole page.
- **Orientation:** primarily portrait; in landscape, fall back to the side-by-side `sm:grid`
  treatment even on small heights (`@media (orientation: landscape)`).

## Technical & State Logic

- No new state. No schema/event changes.
- **CSS strategy:** prefer Tailwind arbitrary values backed by tokens; the `clamp()` scales
  can live as utility classes or a tiny `@layer` rule in `globals.css`
  (`--score-size-hero`, `--score-size-mini` tokens) so Feature 03 can govern them.
- **DOM hooks:** `.score-board`, `.score-panel` (own), `.opponents-row`, `.opponent-card`.
- **Edge cases:**
  - Local player not found in `players` (spectating own stale state mid-join) → render all
    cards in the uniform grid fallback rather than an empty 60% hero.
  - Very small devices (≤320px wide, 4 players) → opponents row scrolls horizontally with
    `scroll-snap`; never shrink a touch target below 44px to fit.
  - `dvh` unsupported → `vh` fallback keeps it usable (progressive enhancement).
  - Winner overlay and `GameMenu` (F01) must layer above the split without changing its math.
