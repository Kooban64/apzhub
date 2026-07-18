# APZHUB Platform Upgrade & Rollback Guide

> **Programme:** PRH-012–018  
> **Story:** PRH-013  
> **Audience:** Platform operators

---

## Purpose

Document version upgrade and rollback for APZHUB platform schema and application releases. Correlates with the Drizzle migration journal.

---

## Migration source of truth

| Artefact       | Path                                         |
| -------------- | -------------------------------------------- |
| SQL migrations | `packages/config/drizzle/*.sql`              |
| Journal        | `packages/config/drizzle/meta/_journal.json` |
| Apply command  | `pnpm db:migrate` (`scripts/db-migrate.ts`)  |

Migrations are ordered by journal `idx`. Latest platform worker migration includes **0060** (outbox worker lifecycle).

---

## Pre-upgrade checklist

1. Announce maintenance window.
2. **Backup** PostgreSQL (logical dump + confirm restore test on staging).
3. Backup Redis only if durable keys are relied upon (sessions may be ephemeral).
4. Record current `PLATFORM_VERSION` / `BUILD_NUMBER` and git SHA.
5. Record last applied journal tag from `__drizzle_migrations` (or equivalent).
6. Ensure staging has already applied the same migration set successfully.

```bash
# Example logical backup
pg_dump "$DATABASE_URL" -Fc -f "apzhub-backup-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

---

## Upgrade procedure

```text
1. Stop traffic (or drain) and stop outbox worker
2. Deploy new application artefacts (build)
3. pnpm db:migrate
4. Start application
5. Start pnpm worker:outbox
6. Run health probes + production smoke
7. Restore traffic
```

### Commands

```bash
# stop worker (supervisor/systemd stop)
pnpm --filter @apzhub/web build
pnpm db:migrate
pnpm --filter @apzhub/web start
pnpm worker:outbox
pnpm test:production-smoke   # PLAYWRIGHT_BASE_URL=https://...
```

### Migration order rules

- Apply **only forward** via `pnpm db:migrate`.
- Do not reorder or rewrite journal tags that have been applied in any environment.
- New migrations must be appended with the next numeric prefix.
- RLS migrations typically follow their base schema migration in pairs.

---

## Failed migration rollback

If `pnpm db:migrate` fails mid-run:

1. **Do not** start the new app version against a half-migrated DB.
2. Capture error logs and the last successful journal entry.
3. Prefer **restore from pre-upgrade backup** for production (safest).
4. On staging only, carefully reverse the failed SQL if a documented reverse script exists for that migration (most PRH-era migrations do **not** ship automatic down scripts — restore is the default).
5. Redeploy the previous application SHA.
6. Re-run health probes.

### Application-only rollback (no schema change)

If the release did not add migrations:

1. Redeploy previous build/SHA.
2. Restart worker.
3. Verify `/api/health` and smoke suite.

### Schema + app rollback

1. Restore Postgres from pre-upgrade dump.
2. Redeploy previous app SHA.
3. Restart worker.
4. Verify probes and smoke.

---

## Staging rollback drill (acceptance)

Operators should periodically:

1. Take a staging dump.
2. Apply a pending migration on staging.
3. Restore the dump.
4. Confirm app boots on restored schema.

Record date and outcome in the release notes.

---

## Correlation with outbox / event bus

- Outbox rows (`law_outbox_event` lifecycle columns from **0060**) must remain consistent across rollback — prefer full DB restore rather than partial table surgery.
- Event Bus is in-process; no durable bus state to migrate.

---

## Explicit non-goals

- Automated blue/green (PCv2-06)
- Vault-managed migration secrets (PCv2-04)
- M17 CI-driven migrate gates

---

## Related

- [Production Deployment Guide](./APZHUB-Production-Deployment-Guide.md)
- [Production Operations Checklist](./APZHUB-Production-Operations-Checklist.md)
