# Feature: Avatar Selection

Players choose a Lorcana character avatar when entering their name in the lobby. The avatar appears on their player card during the game and in the lobby player list.

---

## ✅ Shipped — resolved decision (initials placeholder)

The licensing question below was resolved by **not displaying any card art**. Instead:

- The picker shows a grid of champion **monogram tiles** built from a static list of
  character names in `src/lib/champions.ts` (text only — no images, no `lorcana-api.com`
  fetch, no copyright/trademark exposure to card art).
- Selection is optional. The chosen champion is stored as `avatarName: string | null` on the
  `Player` record (not `avatarUrl`).
- Avatars render via `src/components/Avatar.tsx`: a circle bordered in the player's color
  containing the champion's initials, falling back to the player-name initial when no
  champion is selected.
- Used in the lobby picker, lobby player rows, and the `PlayerCard` header.

The sections below are the original spec, retained for context.

---

## Behavior

- The lobby join form (name entry step) gains an avatar picker below the name input
- The picker displays a scrollable grid of Lorcana character thumbnails — one image per card character (de-duplicated, so the same character from multiple sets appears once)
- Selecting an avatar highlights it; the selection is optional — players who skip it fall back to their assigned player color dot (existing behavior)
- Avatar choice is submitted alongside the player's name on join and stored in the player record in Redis
- All connected clients receive the avatar URL in `player-joined` events and in the initial game state fetch, so the lobby list and score cards update live
- The avatar is displayed as a small circular crop of the character portrait on the PlayerCard and as a thumbnail in the lobby player list row

## Image Source

Lorcana card images are served by the unofficial community API at **lorcana-api.com**, which provides JSON card data and hosted card image URLs aggregated from official Ravensburger press/marketing assets.

> **Licensing note — must resolve before implementation.** Lorcana card art is copyright Ravensburger/Disney. The lorcana-api.com dataset is a fan-maintained resource. Before shipping this feature, confirm whether:
> 1. Ravensburger's fan-use policy permits displaying card art in a non-commercial fan tool, or
> 2. A subset of officially released press-kit images is available under a permissive license.
>
> If rights cannot be confirmed, use character name initials styled in the player's color as the avatar placeholder instead.

Assuming rights are cleared, the implementation should fetch the character list once at build time (or on first load) from `https://api.lorcana-api.com/characters` and cache the results. Each character entry provides a `Image` URL pointing to the card art hosted by the API.

## Data Model Changes

Add an `avatarUrl` field to the `Player` interface:

```ts
interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  avatarUrl: string | null;   // null = no avatar selected (fallback to color dot)
}
```

The `avatarUrl` is a fully-qualified HTTPS URL to the character image. It is set at join time and is not editable mid-game.

## UI Changes

### Join form (LobbyView)

- Below the name input, add a horizontally scrolling row (or a 4-column grid on larger screens) of character avatar thumbnails
- Each thumbnail is a 56×56px circular crop of the card art with a subtle ink-dark ring
- The selected avatar gets a gold ring border
- Label above the grid: "Choose your champion" in `star-silver` text

### Lobby player list

- Replace the existing player-color dot (`h-3 w-3 rounded-full`) with the avatar thumbnail (32×32px circular, with a 2px border in the player's color)
- Fall back to the color dot if `avatarUrl` is null

### PlayerCard

- Display the avatar as a 48×48px circle in the card header, next to the player name
- The circle border uses the player's accent color
- Fall back to a color-filled circle with the player's initial if `avatarUrl` is null

## API Changes

- `POST /api/game/[id]/join` — accept `avatarUrl: string | null` in the request body; store it on the player record
- `player-joined` Pusher event — include `avatarUrl` in each player object in the broadcast payload
- `GET /api/game/[id]` — include `avatarUrl` in each player object in the response

## Decisions

- **Optional, not required** — forcing avatar selection adds friction; the name input is the critical path. Avatar is a nice-to-have personalisation.
- **Fetch at join time, not build time** — avoids a large static asset bundle. Character list can be fetched client-side when the join form mounts and cached in component state.
- **No upload / custom images** — scope is limited to the official Lorcana character set. Custom uploads introduce moderation and storage concerns out of scope for an MVP enhancement.
- **De-duplicate by character name** — many characters appear across multiple sets. Show one avatar per unique character to keep the picker manageable.

## Dependencies

- Player setup / lobby (`features/player-setup.md`)
- Player identity (`features/player-identity.md`)
- External: lorcana-api.com (or equivalent rights-cleared image source)
