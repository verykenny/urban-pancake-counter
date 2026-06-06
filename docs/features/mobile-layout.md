# Feature: Mobile-Responsive Layout

Players will primarily use this app on their phones while sitting around a table. The layout must be usable on small screens with large, tappable controls.

---

## Behavior

- The score board adapts to screen size: single column on mobile (< `sm`), two columns on tablet/desktop
- Score +/− buttons are large enough to tap without precision (minimum 44px touch target per WCAG)
- Player name and score are legible at arm's length (large font sizes)
- The lobby waiting view and name-entry form are centered and full-width on mobile
- The session code and "Copy code" button (see `features/session-sharing.md`) are prominent and easily tappable

## Approach

- Tailwind responsive prefixes (`sm:`, `md:`) on existing `ScoreBoard` and `PlayerCard` components
- No new dependencies — Tailwind v4 already in use
- Test on iPhone SE (smallest common viewport) and a mid-size Android (360px width) using browser DevTools device emulation

## Dependencies

- Score tracking (components must exist before layout pass)
