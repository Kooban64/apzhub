# H6 — Operational Readiness

| Field  | Value                                                                     |
| ------ | ------------------------------------------------------------------------- |
| Phase  | Hardening H6                                                              |
| Status | **COMPLETE**                                                              |
| Scope  | Deploy · monitor · logging · backup · restore · runbooks · admin guidance |

## Validation

| Area                   | Evidence                                                                                                                                                                  | Result                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Deployment             | `infrastructure/docker/docker-compose.dev.yml` · `docker-compose.prod.yml`; standalone Next production build (`NODE_ENV=production pnpm --filter @apzhub/web build`) PASS | **PASS**                                                               |
| Monitoring / health    | `GET /api/health` (Postgres · Redis · runtime diagnostics); Projects readiness/health routes under `/api/v1/projects`                                                     | **PASS** (endpoint present; host coexistence ports per ENVIRONMENT.md) |
| Logging                | Structured platform logging via API gateway / services; correlation IDs per foundation 010/014                                                                            | **PASS**                                                               |
| Backup                 | Platform Postgres backup authority — `docs/operations/BACKUP-AND-RECOVERY.md`                                                                                             | **PASS**                                                               |
| Restore                | Drill runbook — `docs/operations/BACKUP-RESTORE-DRILL-RUNBOOK.md` (`pnpm ops:backup-restore-drill`)                                                                       | **PASS** (procedure exists; live Prod drill remains Change-controlled) |
| Operational runbooks   | `docs/operations/RUNBOOK-STANDARDS.md`; platform 1.2 ops runbooks                                                                                                         | **PASS**                                                               |
| Administrator guidance | Projects admin surfaces (governance · policies · delegations · retention · roles) + W010 design; Administration Workspace permission-gated                                | **PASS**                                                               |

## Notes

- Staging application host bring-up remains optional ops work (Hardening Plan deferred polish) — not a Release Candidate blocker when compose + health + runbooks are present.
- Live production backup drill requires Change Approval; procedure readiness is accepted for H6.

## Sign-off

| Criterion                                                     | Status       |
| ------------------------------------------------------------- | ------------ |
| Deploy · monitor · backup/restore · runbooks · admin guidance | **DONE**     |
| H6 accepted                                                   | **COMPLETE** |
