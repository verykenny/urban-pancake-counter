# Spec 12 — Quick-Copy Game Link

**Phase 4 · Low-Medium priority · Status: [ ] Pending**

## User Story / Context

> As a host, I want to copy a full join *link* (not just the 6-char code) so I can paste it
> into a chat and my friend taps straight into the game — no typing the code.

## Existing Code Integration

- **Extends the existing `src/components/GameCode.tsx`.** It already:
  - has `handleCopy()` that writes the **code** to `navigator.clipboard` with a 1.5s
    `copied` state and a guard (`if (!navigator.clipboard) return`) + try/catch;
  - computes `origin` (`window.location.origin`) and already builds the join URL for the QR:
    `` `${origin}/game/${code}` ``.
- **Reuse, don't duplicate.** Add a **"Share Game"** action that copies that same
  `${origin}/game/${code}` URL using the identical 1.5s feedback pattern. The simplest clean
  result: keep "Copy code" and add "Share link" side by side, *or* make the primary button
  copy the link and keep "Copy code" secondary. Recommended: primary **Share link**,
  secondary **Copy code** + **QR** (matches the brief's "next to the room session code").
- If Feature 01 ships, the share action also belongs in the `GameMenu` *Game* section; keep
  one shared handler.

## UI/UX Layout & Responsive Design Requirements

- **Button** beside the code block, ≥44px, token-styled, label "Share link" → transient
  "Copied!" for **1.5s** (reuse the existing `setTimeout(() => setCopied(false), 1500)`).
- Distinct transient state per button if both copy actions exist (don't let copying the link
  flip the code button's label) — separate boolean state for each.
- **Progressive enhancement:** if `navigator.share` (Web Share API) exists on mobile, offer a
  native share sheet first (`navigator.share({ url })`) and fall back to clipboard copy
  otherwise. Both paths show the same success cue.
- Mobile-first placement; doesn't crowd the code on a 320px screen (stack buttons if needed).

## Technical & State Logic

- **State:** reuse `copied` pattern; if two buttons, `const [copiedLink, setCopiedLink]` +
  existing `copied` for the code.
- **URL:** `${origin}/game/${code}`. `origin` already memoized via `useState(() => …)` with
  the `typeof window` guard (SSR-safe) — reuse it; don't recompute.
- **Clipboard guard:** keep `if (!navigator.clipboard) return;` + try/catch silent-fail
  (some browsers block clipboard without HTTPS/user gesture — this is HTTPS on Vercel, fine).
- **Edge cases:**
  - `navigator.clipboard` and `navigator.share` both unavailable → show the link as
    selectable text the user can long-press/copy manually (don't leave them stranded).
  - Insecure context (local `http`) → clipboard may reject; fail silently (current behavior).
  - `navigator.share` user-cancel rejects the promise → swallow (not an error).
  - Code is uppercase 6-char; URL path uses it verbatim (route is case-handled as today).
- **DOM hooks:** `.share-link-btn`, reuse `.game-code`.
