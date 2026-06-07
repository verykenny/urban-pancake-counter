# Feature: Session Sharing UX

Players who didn't create the session need to know the game code. The game page should make the code visible and easy to share.

---

## P2 — Copy Code Button

- The session code is displayed prominently on the game page (lobby and active game views)
- A "Copy code" button copies the code to the clipboard using the browser Clipboard API
- On copy, the button briefly shows a "Copied!" confirmation before resetting
- No external service is called — this is a pure client-side interaction

## P3 — QR Code for Session Join

- A QR code is rendered on the game page (e.g. in a collapsible panel or modal) encoding the URL `https://<host>/game/[code]`
- Players can point their phone camera at the screen to join without typing
- Library: `qrcode.react` (lightweight, React-native, no canvas dependencies)
- The QR code is generated client-side — no server involvement

## Dependencies

- Session management (the code must exist before it can be displayed)
