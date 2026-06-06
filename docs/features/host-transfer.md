# Feature: Host Transfer

The current host can hand off host privileges to any other player in the session, either during the lobby or mid-game.

---

## Behavior

- Only the current host sees a "Make host" button on other players' cards
- Clicking it immediately transfers host status to that player — the original host loses all host-only capabilities
- The transfer is broadcast to all clients via a `host-transferred` Pusher event so every device updates in real time
- The server enforces the action: only the current host can call the transfer endpoint
- Works in both the lobby and playing phases
- The current host's card shows a "Host" badge so all players know who is in charge

## API

`POST /api/game/[id]/host` — body `{ playerId, newHostPlayerId }`

- `playerId` must be the current host
- `newHostPlayerId` must be an existing player in the session
- Returns `403` if the requester is not the host or the target is not in the session

## Pusher event

`host-transferred` — payload `{ hostPlayerId: string }`

## Dependencies

- Session management
- Player identity
