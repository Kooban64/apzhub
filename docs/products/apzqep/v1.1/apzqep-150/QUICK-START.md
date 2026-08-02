# APZQEP Quick Start (LIMITED_AVAILABILITY)

1. Install deps: `pnpm install`
2. Start platform deps: `pnpm docker:up` (see `ENVIRONMENT.md`)
3. Migrate/seed platform DB: `pnpm db:reset` (or migrate + seed)
4. Run web: `pnpm dev`
5. Sign in via platform auth
6. Open Core QE workspaces (Document Map)
7. Expect Cap A–F data to reset when the web process restarts
