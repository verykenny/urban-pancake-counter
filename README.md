# Lorcana Lore Tracker

Real-time lore score tracker for 2–4 players. Create a session, share the code, and track everyone's lore count together — no account required.

**Live:** https://urban-pancake-counter.vercel.app

---

## Features

- Create or join a game session with a 6-character code
- Real-time score sync across all connected players (Pusher)
- Two control modes: players control their own score, or host controls all
- Score delegation — hand control of your score to another player
- Host transfer
- Win detection at 20 lore with a play-again flow
- Sessions persist for 24 hours (Upstash Redis), then expire automatically

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Real-time | Pusher Channels |
| Session store | Upstash Redis |
| Hosting | Vercel |

## Local Development

**Prerequisites:** Node.js 24 (see `.nvmrc`), a Pusher Channels app, and an Upstash Redis database.

1. Clone the repo and install dependencies:
   ```bash
   git clone git@github.com:verykenny/urban-pancake-counter.git
   cd urban-pancake-counter
   nvm use
   npm install
   ```

2. Copy the environment variable template and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```

   Required variables:
   ```
   PUSHER_APP_ID=
   PUSHER_KEY=
   PUSHER_SECRET=
   PUSHER_CLUSTER=
   NEXT_PUBLIC_PUSHER_KEY=
   NEXT_PUBLIC_PUSHER_CLUSTER=
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project Docs

Project status, the v2 roadmap, and migration context live in [`PROJECT.md`](PROJECT.md).
In-flight feature specs are in [`specs/`](specs/); shipped v1 specs are archived in
[`completed-feature-docs/`](completed-feature-docs/).
