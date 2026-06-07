# Spec 11 — Dark Mode & High-Contrast Mode

**Phase 3 · Medium priority · Status: [ ] Pending**

## User Story / Context

> As a player using the tracker over a webcam or in harsh/washed-out lighting, I want a global
> display toggle — a deep-gray dark mode, and a raw black/white high-contrast mode with thick
> borders — so the scores stay legible regardless of glare.

The app's default theme is already dark (ink purple). This adds **explicit, switchable display
modes** distinct from the decorative ink themes (Feature 10).

## Existing Code Integration

- **Builds on Feature 03 tokens.** Each mode is a token override applied via a `data-contrast`
  (or `data-mode`) attribute on `<html>`; components reference only semantic tokens
  (`--surface`, `--text`, `--border`, …) so no component edits are needed beyond ensuring no
  stragglers still hardcode literals (that's exactly what F03 cleans up).
- **Device-local**, `localStorage`, no Pusher/`GameState` involvement.
- Toggle surfaced in the `GameMenu` (F01) under *Display*; applied app-wide via `layout.tsx`.

## UI/UX Layout & Responsive Design Requirements

- **Modes:**
  1. **Default** (current ink theme).
  2. **Dark** — deep gray surface `#121212` (`--surface`), raised `#1e1e1e`, soft borders,
     desaturated accents. Calmer than the purple default.
  3. **High-contrast** — raw black (`#000`) **or** white (`#fff`) background, opposite-color
     text, **thick borders** (`--border-thick`, e.g. 2–3px) on every `.player-card`,
     `.lore-bar`, and button so shapes survive webcam compression / glare. Minimal/no glows.
- A small segmented control (Default / Dark / High-Contrast) in the menu; each ≥44px.
- High-contrast must hit **WCAG AAA where feasible** (≥7:1) — that's its whole point.

## Technical & State Logic

- **Schema (localStorage):** key `lt:displayMode` → `'default' | 'dark' | 'high-contrast'`.
- **Pre-paint application:** inline a blocking script in `layout.tsx` `<head>` that reads
  `localStorage` and sets `document.documentElement.dataset.contrast` **before first paint**
  (prevents a flash of the wrong theme). Default to `'default'` if unset/unavailable.
- **Token overrides** live in `globals.css` under attribute selectors:
  `:root[data-contrast="dark"] { --surface:#121212; … }`,
  `:root[data-contrast="high-contrast"] { --surface:#000; --text:#fff; --border-thick:3px; … }`.
- **Precedence:** high-contrast **overrides Feature 10 ink gradients** (suppress the gradient,
  use flat high-contrast surfaces). Document this in both specs.
- **`prefers-color-scheme` / `prefers-contrast`:** on first visit (no stored pref), optionally
  seed from `window.matchMedia('(prefers-contrast: more)')` → high-contrast, else default.
  Don't override an explicit user choice.
- **Edge cases:**
  - `localStorage` unavailable → default mode, no crash.
  - Confetti/win glow colors must remain visible in high-contrast (swap to a safe palette).
  - Ensure disabled-button opacity (`opacity-30` in `PlayerCard`) still reads as disabled in
    high-contrast — may need a border/pattern cue instead of opacity alone.
- **DOM/attr hooks:** `<html data-contrast="dark">`, `.display-mode-toggle`.
