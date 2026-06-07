# Spec 03 — Aesthetic & UI Polish Framework (Design Tokens)

**Phase 1 · High priority · Status: [ ] Pending**

## User Story / Context

> As the maintainer, I want one place that defines every color, spacing, and border the app
> uses, so a restyle (dark mode, ink themes, high-contrast) is a token swap — and so the DOM
> is clean enough for design-vision AI to read a screenshot and reason about the layout.

A token system **already exists** in `src/app/globals.css` (`--ink-*`, `--gold-*`,
`--star-*`, `--error`, exposed to Tailwind via `@theme inline`). The work here is to (a)
**finish migrating the hardcoded literals** still scattered in components, (b) add the
missing **spacing/border/radius/shadow** token families, and (c) **standardize component
class hooks**. This spec is the foundation for Features 10 and 11.

## Existing Code Integration

Hardcoded literals to migrate (non-exhaustive — grep for `rgba(`, `boxShadow`, `textShadow`,
`purple-900`, raw hex):
- `PlayerCard.tsx` — inline `boxShadow: '0 4px 32px rgba(74,44,138,0.35)…'`, `colorGlow`
  template string, `purple-900/30` delegate badge.
- `game/[id]/page.tsx` — `textShadow: '0 0 24px rgba(212,164,42,0.45)'`, ambient glow
  `bg-purple-900/20`, winner `boxShadow`, gradient buttons.
- `GameCode.tsx` — `boxShadow: '0 0 24px rgba(212,164,42,0.08)'`.

Replace these with token-backed utilities (e.g. `shadow-card`, `glow-gold`,
`bg-accent-soft`). Player accent colors (the per-player hex in `gameStore` `COLORS`) stay as
inline `color`/`background` driven by data — that's legitimate dynamic styling, not a
hardcoded literal; document the distinction.

## UI/UX Layout & Responsive Design Requirements

- **No visual regression.** The migration must be pixel-stable on the current theme; this is
  a refactor, verified by before/after screenshots at 375px and 1280px.
- **Token families to define** (in `:root`, surfaced through `@theme inline`):
  - Color: keep existing; add semantic aliases `--surface`, `--surface-raised`, `--border`,
    `--text`, `--text-muted`, `--accent`, `--accent-strong`, `--danger`.
  - Spacing scale: `--space-1…8` (4px base) — or commit to Tailwind's scale and forbid
    arbitrary px. Pick one and document it.
  - Radius: `--radius-sm/md/lg/2xl` (cards currently `rounded-2xl`).
  - Border width: `--border-thin` (1px) / `--border-thick` (used by F11 high-contrast).
  - Shadow/glow: `--shadow-card`, `--glow-gold`, `--glow-accent`.
- **Component class hooks (screenshot-friendly DOM):** `.player-card`, `.score-panel`,
  `.opponent-card`, `.game-code`, `.lore-bar`, `.turn-timer`, `.activity-feed`,
  `.game-menu`. These are stable semantic anchors layered alongside Tailwind utilities.

## Technical & State Logic

- **No runtime state.** This is CSS architecture only.
- **Theming readiness:** define the semantic aliases so Features 10/11 can override them by
  setting a `data-theme` / `data-contrast` attribute on `<html>` (set in `layout.tsx` /
  toggled client-side). Tokens cascade; components never hardcode the concrete `--ink-*`
  value, only the semantic alias.
- **Tailwind v4 note:** read `node_modules/next/dist/docs/` and the Tailwind v4
  `@theme inline` docs before editing `globals.css` — this is not the Tailwind/Next you may
  remember (per `AGENTS.md`). Keep `@theme inline` mapping intact so `text-gold`, `bg-ink-mid`
  etc. continue resolving.
- **Edge cases / guardrails:**
  - Add an ESLint or grep CI check that fails on new raw hex / `rgba(` in `src/components`
    and `src/app` (allow the data-driven player-color inline styles via an eslint-disable
    comment convention).
  - Per-player dynamic colors must still work after the migration (they're data, not tokens).
  - Don't break the Tailwind `@theme` font tokens (`--font-display` = Cinzel) used by titles.
