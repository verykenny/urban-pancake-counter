# urban-pancake-counter

Lorcana lore score tracker for 2–4 players. Players join a shared game session and track each other's scores in real time. No card management — score only. Scores are ephemeral (no database); they reset when the session ends.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Real-time | Pusher Channels (hosted WebSockets) |
| Package mgr | npm |
| Node | 24 LTS (see `.nvmrc`) |

---

## Dev Commands

```bash
nvm use          # switch to correct Node version first
npm run dev      # start local dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint — run before every commit
```

Always run `nvm use` before `npm run dev` to avoid Node version errors.

---

## Environment Variables

Fill in `.env.local` with values from the Pusher dashboard (see `docs/PROJECT.md` for account info):

```
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=     # same as PUSHER_KEY — exposed to browser
NEXT_PUBLIC_PUSHER_CLUSTER= # same as PUSHER_CLUSTER — exposed to browser
```

Never commit `.env.local`.

---

## Architecture

### Routing
- `/` — landing page; enter or create a game code
- `/game/[id]` — live score board for that session

### Real-time
- Channel naming: `game-{id}` (one channel per session)
- Event name: `score-update` — payload `{ playerId, score }`
- Server triggers via `POST /api/score` → `src/app/api/score/route.ts`
- Client subscribes via `src/lib/pusherClient.ts` (singleton)

### Component tree
```
/game/[id]/page.tsx
  └── ScoreBoard        (arranges 2–4 players)
        └── PlayerCard  (name, lore count, +/− buttons)
```

### Server vs client components
- `page.tsx` files default to **server** components unless they need interactivity.
- Add `"use client"` only when a component uses state, effects, or browser APIs.
- `PlayerCard` and `ScoreBoard` are client components.

### Key files
| File | Purpose |
|---|---|
| `src/lib/pusher.ts` | Server-side Pusher client — never import in client components |
| `src/lib/pusherClient.ts` | Browser Pusher singleton |
| `src/app/api/score/route.ts` | API route — broadcasts score updates |
| `src/components/PlayerCard.tsx` | Single player score panel |
| `src/components/ScoreBoard.tsx` | Grid of PlayerCards |
| `docs/PROJECT.md` | Status tracker, open decisions, external accounts |
| `docs/features/` | One file per feature — open questions and proposed approach |

---

## Code Style

- **TypeScript strict mode** — no `any`, no type assertions unless unavoidable.
- **Tailwind only** — no CSS modules, no inline `style` props.
- **No comments** unless the reason is non-obvious.
- **No abstractions ahead of need** — three similar lines is fine; don't extract until the third use is confirmed.
- Prefer named exports for components; default export is fine for pages.

---

## Project Docs

Before planning or building any feature, read the relevant file in `docs/features/`. Each file has open questions that must be resolved before implementation begins. Update `docs/PROJECT.md` status when a feature is complete.

---

## Constraints

- No database. Scores live in React state and broadcast via Pusher. Session ends → scores gone.
- No card management. Third-party software handles cards; this app is score-only.
- 2–4 players per session. No spectator mode, no auth.
- Git remote uses a project-scoped SSH key: `~/.ssh/urban_pancake_counter`. If push fails, verify the key is loaded (`ssh-add ~/.ssh/urban_pancake_counter`).
