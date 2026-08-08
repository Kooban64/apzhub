# APZQEP Version 1.1 — Operational Runbook

| Field     | Value                                          |
| --------- | ---------------------------------------------- |
| Timestamp | 20260808T064400Z                               |
| Audience  | Operators · Administrators                     |
| Target    | Enterprise Quality Baseline – Production Ready |

---

## 1. Deployment verification

1. Confirm host coexistence ports (`ENVIRONMENT.md`): APZHUB Postgres **54334**, Redis (APZHUB), web **3300**, Caddy edge.
2. Apply migrations: `set -a && . ./.env && set +a && pnpm db:migrate` (and test DB when required).
3. Seed/auth catalogue: ensure Cap roles sync on startup (`seedDefaultAuthorizationCatalog` grants wave permissions onto `qep-operator` / `qep-reader`).
4. Start web (dev or standalone production). Do not bind legacy portal ports.

## 2. Monitoring

- Platform health: `GET /api/health` — expect `status: healthy` with database + redis + runtime.
- Runtime registry count and `platformReady` in health payload.
- Correlation IDs on API requests for end-to-end trace (gateway → service → connector).

## 3. Logging

- Structured logs via platform services; never log secrets or raw engine credentials.
- Investigate failures using correlation ID across gateway and workers.

## 4. Backup / restore

- Authority: `docs/operations/BACKUP-AND-RECOVERY.md`.
- Drill: `docs/operations/BACKUP-RESTORE-DRILL-RUNBOOK.md` (`pnpm ops:backup-restore-drill`).
- V1.1 SoR tables include automation, SCM, QI, dashboards, orchestration documents (see QX-PR-09 evidence).

## 5. Administrator guidance

| Topic          | Guidance                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Cap RBAC       | Least privilege — `tenant-member` has no Cap grants                                             |
| Operator role  | `qep-operator` — includes Cap A–F + Quality Flows + Automation/SCM/QI operate + Dashboards read |
| Reader role    | `qep-reader` — read-only Cap + wave read                                                        |
| Auto-assign    | `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` opt-in only (dev/cert); leave unset in production             |
| Membership ACL | Deferred to V1.2 (QX-P1-05) — Cap RBAC remains V1.1 boundary                                    |

## 6. Operator guidance (daily)

| Workspace              | Path                                  | Notes                                                |
| ---------------------- | ------------------------------------- | ---------------------------------------------------- |
| Quality Flow Workspace | `/workspace/qep/quality-flows`        | Flagship — active / waiting / exceptions / decisions |
| Automation             | `/workspace/qep/automation`           | Dry-run / queue; durable executions                  |
| SCM                    | `/workspace/qep/scm`                  | Repositories · webhooks · traceability links         |
| Quality Intelligence   | `/workspace/qep/quality-intelligence` | Recommendations · scores · confidence                |
| Dashboards             | `/workspace/qep/dashboards`           | Honest-empty until SoR projections bound             |
| Evidence               | `/workspace/qep/evidence`             | Capture · explorer · collections                     |

## 7. Incident quick checks

1. Health 503 → Postgres/Redis/runtime.
2. Cap 403 → role grants / permission catalogue sync.
3. Empty dashboards → expected honest-empty attribution (not an outage).
4. Cross-tenant data missing → expected fail-closed isolation.
