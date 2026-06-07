# Spec 14 — Discord Webhook Integration

**Phase 4 · Low-Medium priority · Status: [ ] Pending**

## User Story / Context

> As a player in a Discord pod, I want the tracker to drop a message in our channel when a new
> game link is created and when someone wins, so the group sees "game's up, here's the link"
> and "Alex won!" without me copy-pasting.

## Existing Code Integration

- **Opt-in, device-local config.** A settings input (in the `GameMenu` *Advanced* section,
  F01) where the user pastes their Discord **channel webhook URL**. Stored in `localStorage`
  only — **never** committed, never put in `GameState`/Redis, never broadcast over Pusher.
- **Two fire points:**
  1. **Game link generated** — when *this device* creates a session (the `POST /api/game`
     success path on the landing page `/`). Fire once, with the join link
     (`${origin}/game/${code}`, reusing Feature 12's URL).
  2. **Win at lore target** — on the `winner`-transition (same hook as Feature 13;
     "20 Lore" in the brief is the **default** — use `loreTarget`).
- The brief says "client-side payload." Discord webhooks **do** accept cross-origin browser
  `POST`s (CORS-permitted) for simple JSON, so a direct `fetch` works. **However**, note the
  trade-off below; a thin server proxy route is the more robust option.

## UI/UX Layout & Responsive Design Requirements

- **Settings field:** a labeled URL input + Save + a "Send test message" button, plus an
  enable/disable toggle. Mask the stored URL (show `…/webhooks/****`) after save. ≥44px
  controls, token-styled, in the menu drawer.
- Inline validation: must match `https://discord.com/api/webhooks/…` (or `discordapp.com`).
- A small status line: "Last sent ✓" / "Failed — check the URL". Never block gameplay on it.

## Technical & State Logic

- **Schema (localStorage):** key `lt:discordWebhook` → `{ url: string; enabled: boolean }`.
- **Payload (Discord rich embed):**
  ```jsonc
  { "embeds": [{
      "title": "Lorcana Lore Tracker",
      "description": "A new game is up! Join: <link>",   // or "🏆 Alex won with 20 lore!"
      "color": 13869098,                                  // gold, from --gold
      "fields": [ /* per-player final scores on win */ ],
      "timestamp": "<ISO>"
  }] }
  ```
  POST `Content-Type: application/json`. Discord returns `204 No Content` on success.
- **De-duplication is critical** (the win transition fires on *every* connected client):
  - Only fire the **win** message from **one** device — the **host** (`playerId ===
    hostPlayerId`) — and guard with a per-match sent flag (reuse Feature 13's `matchId` in
    `localStorage`, e.g. `lt:discordSent:<matchId>`), so reconnects/re-renders don't re-post.
  - The **link-created** message fires only on the creating device (it's the only one in the
    `POST /api/game` success path), so it's naturally single-fire; still guard per `gameId`.
- **Edge cases / guardrails:**
  - No URL / disabled / `localStorage` unavailable → silently skip (progressive enhancement).
  - Invalid or revoked webhook → Discord returns 401/404; catch, show the "Failed" status,
    never throw into the game UI.
  - Rate limiting → Discord may return 429 with `retry_after`; on 429, back off and drop the
    message rather than spamming (this is a nicety, not a queue).
  - **Security/privacy:** the webhook URL is a write capability to someone's channel — treat
    it like a secret: localStorage only, masked in UI, never logged, never sent anywhere but
    Discord. Document that anyone with the device can read it.
  - **CORS caveat:** if Discord changes CORS behavior, fall back to a minimal server proxy
    route `POST /api/discord` that forwards the payload (keeps the URL client-supplied; the
    server just relays). Note this as the contingency, not the default.
- **DOM hooks:** `.discord-settings`, `.discord-webhook-input`, `.discord-test-btn`.
