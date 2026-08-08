# APZQEP 1.1 — Operations Guide

| Audience | Platform operators · On-call |
| -------- | ---------------------------- |
| Product  | APZQEP Version 1.1           |

Full runbook: [APZQEP-V1.1-OPERATIONAL-RUNBOOK.md](../../engineering/APZQEP-V1.1-OPERATIONAL-RUNBOOK.md)

## Deploy

1. Host coexistence: APZHUB Postgres **54334**, APZHUB Redis, web **3300**, Caddy — see `ENVIRONMENT.md`.
2. Migrate: `set -a && . ./.env && set +a && pnpm db:migrate`.
3. Start web (standalone production or approved process). Do not bind legacy portal ports.

## Monitor

- `GET /api/health` — expect healthy database, redis, runtime.
- Use correlation IDs across gateway and services for incident traces.

## Backup / restore

- `docs/operations/BACKUP-AND-RECOVERY.md`
- Drill: `docs/operations/BACKUP-RESTORE-DRILL-RUNBOOK.md` (`pnpm ops:backup-restore-drill`)
- Live production drills remain Change-controlled.

## Incident quick checks

| Symptom                   | Check                               |
| ------------------------- | ----------------------------------- |
| Health 503                | Postgres / Redis / runtime          |
| Cap 403                   | Role grants · catalogue sync        |
| Empty dashboards          | Honest-empty attribution (expected) |
| Missing cross-tenant data | Fail-closed isolation (expected)    |

## Freeze rules

Version 1.1 frozen except production defects, security vulnerabilities, and critical operational hotfixes.
