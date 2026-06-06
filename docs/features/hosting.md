# Feature: Public Hosting (Vercel)

Deploy the app to a publicly accessible URL so players don't need to run it locally.

---

## Approach

- Deploy via Vercel's GitHub integration: connect the `verykenny/urban-pancake-counter` repo in the Vercel dashboard and enable automatic deploys on push to `main`
- No Dockerfile or GitHub Actions needed — Vercel handles build and deploy automatically

## Setup Steps

1. Create a Vercel account (if not already) and link to the GitHub repo
2. Add the following environment variables in the Vercel project settings (sourced from `.env.local`):
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
3. Confirm `npm run build` succeeds locally before first deploy
4. After deploy, verify Pusher Sandbox plan allows traffic from the production domain (Sandbox is unrestricted by domain)

## Notes

- The Pusher Sandbox plan is free and suitable for low-traffic use. If concurrent connections exceed the Sandbox limit (100 concurrent connections), upgrade to a paid Pusher plan.
- Vercel's serverless runtime means the in-memory game store (see `features/state-sync.md`) resets on cold starts. For the initial launch this is acceptable; if persistence across deploys is needed, a lightweight external store (e.g. Upstash Redis) can be added later.
- Add Vercel to the External Dependencies table in `docs/PROJECT.md` when set up.

## Dependencies

- All P0 features should be complete before deploying publicly
