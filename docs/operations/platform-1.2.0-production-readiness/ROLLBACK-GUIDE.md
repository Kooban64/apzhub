# Rollback Guide — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A7

## Image rollback

```bash
# List immutable tags
docker images apzhub/web

# Point compose at previous tag
export APZHUB_WEB_IMAGE=apzhub/web:1.2.0-<PREVIOUS_BUILD>
pnpm docker:up:prod

pnpm test:production-smoke
```

## Database rollback

Prefer forward-fix migrations. If restore required:

1. Stop `web`.
2. Restore previous dump ([RESTORE-PROCEDURES.md](./RESTORE-PROCEDURES.md)).
3. Start `web` · smoke.

## Config rollback

Restore previous `.env.production` from secrets store; recreate containers:

```bash
pnpm docker:down:prod && pnpm docker:up:prod
```

## Decision rule

Rollback if: P1 open after deploy, smoke fails, or auth/data integrity risk. Owner informed for Production Changes.
