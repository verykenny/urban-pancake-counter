# Spec 07 — The Lore Race Tracker Progress Bar

**Phase 2 · Medium-High priority · Status: [ ] Pending**

## User Story / Context

> As a player, I want to see at a glance how close each of us is to winning, without doing the
> "they're at 17, target's 20" math in my head — a filling bar reads instantly from across a
> table.

## Existing Code Integration

- **Pure client/presentational.** Add a `LoreBar` (`src/components/LoreBar.tsx`) rendered
  inside `PlayerCard` (and a thin variant in `MiniPlayerCard`). It reads `score` (already a
  prop) and the **lore target**.
- **Bind to the real target, not 20.** `loreTarget` is configurable (1–200, default 20) and
  already lives in `GameState` and is threaded through `page.tsx` → `ScoreBoard`. Pass
  `loreTarget` down to `PlayerCard`/`LoreBar` rather than hardcoding a max. The brief says
  "0 to 20 max"; 20 is the **default**, but the bar must honor whatever the host set.
- Score changes already arrive via the `score-update` Pusher event and re-render the card —
  the bar updates for free; the only addition is the CSS transition.

## UI/UX Layout & Responsive Design Requirements

- **Horizontal bar** under the score number, full card width. Track uses `--surface-raised`/
  `--border`; fill uses the **player's accent color** (`color` prop) so each bar matches its
  player, with a subtle `--glow-accent`.
- **Width** = `min(score / loreTarget, 1) * 100%`.
- **Smooth transition:** `transition: width 0.3s ease-in-out` (per the brief) — no instant
  snaps. Use a CSS class, not inline style, so Feature 03 tokens govern it.
- **Markers (optional polish):** faint tick at the target end; when `score >= loreTarget`
  the fill reaches 100% and gets the `--gold` win glow.
- **Mini/opponent variant:** thinner (e.g. 4–6px), no number labels, same fill logic.
- Accessibility: `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax={loreTarget}`,
  `aria-valuenow={score}`, `aria-label="{name} lore progress"`.

## Technical & State Logic

- **No new app state, no schema/event change.** Derived entirely from `score` + `loreTarget`.
- **Clamp:** percentage capped at 100% even if `score > loreTarget` (overshoot from a `+3`).
- **DOM hook:** `.lore-bar` (track) + `.lore-bar-fill`.
- **Edge cases:**
  - `loreTarget` very small (e.g. 1) → bar jumps to full on first point; transition still
    applies. Very large (200) → each point is a thin sliver; that's acceptable.
  - Score reset (play-again sets all scores to 0) → bar animates back down to 0 via the same
    transition.
  - Respect `prefers-reduced-motion`: drop the transition (snap) when the user requests
    reduced motion.
  - SSR: the bar is in a client component (`"use client"` already on the card); compute width
    at render — no layout-effect flash.
