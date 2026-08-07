# APZ Projects 3.0 — Operations Guide

| Audience | Platform operators · on-call · release engineering |
| -------- | -------------------------------------------------- |
| Product  | APZ Projects Release 3.0                           |

## Deploy

- App: `@apzhub/web` production build (`NODE_ENV=production`)
- Compose: `infrastructure/docker/docker-compose.prod.yml` (and host coexistence per `ENVIRONMENT.md`)
- Standalone output: `apps/web/.next/standalone` when using Next standalone

Do not disrupt long-lived host services (e.g. `:3300` next-dev) without approval.

## Health

| Check                 | Endpoint / path                         |
| --------------------- | --------------------------------------- |
| Platform              | `GET /api/health`                       |
| Projects API          | `/api/v1/projects/...` (authz required) |
| Projects UI readiness | `/workspace/projects/health` (admin)    |

Correlate incidents with request/correlation IDs (foundation observability).

## Runtime env (production / E2E standalone)

| Variable                   | Notes                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `APZHUB_WORKSPACE_ROOT`    | Monorepo root for discovery when cwd is standalone                                      |
| `APZHUB_RUNTIME_FAIL_FAST` | `false` for tolerant discovery (align with next-dev); document intentional prod profile |

## Backup & restore

- Authority: `docs/operations/BACKUP-AND-RECOVERY.md`
- Drill: `docs/operations/BACKUP-RESTORE-DRILL-RUNBOOK.md` (`pnpm ops:backup-restore-drill`)
- Platform PostgreSQL only in standard drill — never restore over production without Change Approval

## Logging & monitoring

Follow `docs/operations/RUNBOOK-STANDARDS.md` and platform 1.2 operational runbooks. Mask secrets; structured logs only.

## Incident classes authorised on 3.0

1. Production defects
2. Security vulnerabilities
3. Critical operational hotfixes

All else → Release 3.1 backlog / Product Board.

## Freeze

Release tag and freeze branch identify the production baseline. Do not change 3.0 behaviour on the freeze line without Owner approval.
