# Spec 10 — Customizable Ink Themes

**Phase 3 · Medium priority · Status: [ ] Pending**

## User Story / Context

> As a Lorcana player, I want the app to wear my deck's ink colors (e.g. Amber/Amethyst), so
> the tracker feels like *my* deck — without ever making the scores hard to read.

Lorcana has six inks: **Amber, Amethyst, Emerald, Ruby, Sapphire, Steel**. A player may pick
up to **2** to theme the app's background gradient and accents.

## Existing Code Integration

- **Builds directly on Feature 03 tokens.** The theme overrides the semantic accent tokens
  (`--accent`, `--accent-strong`, `--glow-accent`) and a background gradient variable; it must
  **not** touch per-player identity colors (each player's `color` in `gameStore` derives from
  their chosen ink via `src/lib/inkColors.ts`; those identify players and stay).
- **Device-local preference** — stored in `localStorage`, applied as a `data-ink` attribute
  on `<html>`. It does **not** sync over Pusher and does **not** enter `GameState`. Each
  player themes their own device.
- Applied app-wide via `src/app/layout.tsx` (read the stored value pre-paint to avoid a flash)
  + a client toggle surfaced in the `GameMenu` (F01) under *Display*.

## UI/UX Layout & Responsive Design Requirements

- **Picker:** six ink swatches; select 1 or 2 (selecting a 3rd replaces the oldest). Each
  swatch ≥44px, labeled, with a selected ring. Lives in the menu drawer / a settings panel.
- **Application:**
  - 1 ink → solid-ish accent + a subtle radial/linear gradient in that ink.
  - 2 inks → **linear gradient** blending the two (`linear-gradient(135deg, inkA, inkB)`) for
    the background wash and accent.
  - Keep it **subtle** — a background/edge accent, not full-saturation fills behind text.
- **Contrast is non-negotiable (WCAG AA):** body/score text must keep ≥4.5:1 (≥3:1 for large
  score text) against the themed background. Inks are applied to low-alpha background layers
  and borders, with text staying on the established `--text`/`--star-white` tokens. Verify
  each of the 6 inks and common 2-ink pairs.

## Technical & State Logic

- **Ink palette constants** (`src/lib/inks.ts`): map each ink → `{ name, hex, gradientStop }`,
  chosen so AA holds when used as a low-alpha wash. (Amber gold, Amethyst purple, Emerald
  green, Ruby red, Sapphire blue, Steel gray.)
- **Schema (localStorage):** key `lt:inkTheme` → `{ inks: string[] /* len 0–2 */ }`.
- **Apply logic:** set `document.documentElement.dataset.ink` and inline the resolved gradient
  CSS vars; `globals.css` consumes them. SSR-safe: inline a tiny pre-paint script in
  `layout.tsx` that reads `localStorage` and sets the attribute before first paint (same
  pattern Feature 11 uses) to avoid a theme flash.
- **Edge cases:**
  - No selection → default Ink/gold theme (current look).
  - `localStorage` unavailable (private mode) → default theme, no crash.
  - Interaction with Feature 11: **high-contrast mode wins** — when high-contrast is on, ink
    gradients are suppressed (flat high-contrast surfaces) to preserve legibility.
  - Player accent colors on cards remain the per-player ink colors assigned in `gameStore`,
    independent of ink theme, so players stay distinguishable regardless of theme.
- **DOM/attr hooks:** `<html data-ink="amber-amethyst">`, `.ink-picker`, `.ink-swatch`.
