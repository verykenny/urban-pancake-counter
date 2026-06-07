# Spec 01 — Simplify UI / Navigation

**Phase 1 · High priority · Status: [ ] Pending**

## User Story / Context

> As a player mid-match on my phone, I want the screen to show only my session and my
> scores, so I'm not distracted by host toggles, mode switches, QR codes, and "make host"
> links competing for space with the numbers I actually came to read.

The active game screen (`src/app/game/[id]/page.tsx`) currently renders, all at once: the
title, the game code block with Copy/QR buttons, the "First to N lore" line, a host
control-mode toggle, the board, plus per-card "Make host" and "Delegate control" links. On a
phone this is cluttered and pushes the scores down. We consolidate secondary actions into a
single dismissible menu and keep only the essentials always-visible.

## Existing Code Integration

- **Wrap, don't rewrite.** Add a `GameMenu` (`src/components/GameMenu.tsx`, `"use client"`)
  rendered by the playing-phase branch of `page.tsx`. It receives the handlers that already
  exist on the page (`handleModeChange`, `handleTransferHost`, plus Feature 12's share link)
  and renders them inside a dropdown drawer instead of inline.
- **Always-visible (stays in the main flow):** the session code (`GameCode`, can be slimmed)
  and the lore target line ("First to {`gameState.loreTarget`} lore").
- **Moves into the menu:** the host control-mode toggle (currently lines ~274–297), plus
  future global toggles (themes F10, display mode F11, webhook settings F14, history F13).
- No Pusher/Redis changes. Menu open/close is **local UI state only** — it must not touch
  `GameState`.

## UI/UX Layout & Responsive Design Requirements

- **Trigger:** a vertical-ellipsis (`⋮`) icon button, top-right, min touch target **44×44px**,
  `aria-haspopup="menu"` + `aria-expanded`. Use the `--gold`/`--star-*` tokens.
- **Drawer behavior:**
  - Mobile (`< sm`): slide-in panel anchored to the top-right / full-width sheet, max-height
    `80dvh`, internally scrollable, with a translucent backdrop (`bg-ink-deep/60`) that
    closes on tap.
  - Tablet/desktop (`≥ sm`): anchored popover under the `⋮` button.
- **Sections** with small-caps token headers (`text-star-dim`): *Game* (control mode, share
  link), *Display* (theme, dark/high-contrast), *Match* (history, activity feed toggle),
  *Advanced* (Discord webhook). Host-only items are simply omitted when
  `playerId !== hostPlayerId`.
- Each menu row ≥44px tall; clear focus ring; `font-display` for the menu title only.

## Technical & State Logic

- **State:** `const [menuOpen, setMenuOpen] = useState(false)` inside `GameMenu`.
- **Dismissal:** close on backdrop tap, on `Escape` (keydown listener while open), and on
  any action selection. Trap focus within the drawer while open; restore focus to the `⋮`
  button on close.
- **A11y:** `role="menu"` / `role="menuitem"`; lock body scroll on mobile while the sheet is
  open (`overflow: hidden` on a wrapper, restored on close).
- **DOM hooks for vision tooling:** `.game-menu-trigger`, `.game-menu-drawer`,
  `.game-menu-section`.
- **Edge cases:** spectator-less app, so menu only ever shows actions the local player can
  perform; if a host action arrives via Pusher while the menu is open (e.g. host transferred
  away), the host-only rows must reactively disappear (they derive from `gameState`, so this
  is automatic — verify it). Reconnecting banner and error toasts must render *above* the
  drawer backdrop (`z-50`+).
