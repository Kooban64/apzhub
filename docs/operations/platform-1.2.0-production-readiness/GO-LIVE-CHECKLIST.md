# Go-Live Checklist — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A7

## Change approval checklist

- [ ] Change record filed (scope, window, rollback owner)
- [ ] Owner Approval for shared-host impact (if any)
- [ ] `.env.production` hardened (A3) — no example secrets
- [ ] `AUTHORIZATION_PROVIDER_MODE=production`
- [ ] Dev registration disabled
- [ ] Workflow Execute remains gated

## Release / deployment checklist

- [ ] `pnpm ops:capacity-check` PASS/ATTENTION accepted
- [ ] `pnpm ops:host-coexistence-audit -- --live` reviewed
- [ ] Image built & tagged (`apzhub/web:1.2.0-<BUILD>`)
- [ ] DB migrated
- [ ] `pnpm docker:up:prod` healthy (`web`, `postgres`, `redis`, `caddy`)
- [ ] TLS path verified (internal / host nginx / public)
- [ ] Backup cron installed · test dump taken
- [ ] `pnpm test:production-smoke` PASS

## Maintenance window checklist

- [ ] Users notified (as applicable)
- [ ] On-call primary + secondary confirmed
- [ ] Rollback image tag identified
- [ ] Pre-change DB dump taken

## Rollback checklist

- [ ] Trigger criteria agreed
- [ ] Previous image tag available locally/registry
- [ ] Pre-change dump available
- [ ] Smoke re-run after rollback

## Sign-off

- [ ] Operations sign-off
- [ ] Owner Production Acceptance ([OWNER-PRODUCTION-SIGNOFF.md](./OWNER-PRODUCTION-SIGNOFF.md))
