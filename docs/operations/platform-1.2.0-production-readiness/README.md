# APZHUB-OPS-002 — Platform 1.2.0 Production Readiness Implementation

> **Programme:** APZHUB-OPS-002  
> **Title:** Platform 1.2.0 Production Readiness Implementation  
> **Classification:** OPERATIONS  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** Certified Release  
> **Date:** 2026-07-22  
> **Rule:** Operational actions A1–A8 only — **no feature development · no architecture redesign · no Platform 1.3**  
> **Predecessor:** [APZHUB-OPS-001](../platform-1.2.0-operational-readiness/README.md) **ACCEPTED**  
> **Recommendation:** **READY FOR OWNER PRODUCTION ACCEPTANCE**  
> **Status:** **ACCEPTED** (Owner Decision — APZHUB-PLAN-001 bootstrap · Platform 1.2 Programme CLOSED)

## Actions completed

| Action | Scope                     | Artefacts                                                                    |
| ------ | ------------------------- | ---------------------------------------------------------------------------- |
| **A1** | Deployment artefacts      | `apps/web/Dockerfile` · `docker-compose.prod.yml` · `pnpm docker:build:prod` |
| **A2** | Production edge           | `Caddyfile.prod` · `Caddyfile.prod.public` · TLS docs                        |
| **A3** | Hardening                 | `.env.production.example` · production configuration guide                   |
| **A4** | Backup & recovery         | `ops-postgres-backup.sh` · cron · restore/DR docs                            |
| **A5** | Infrastructure validation | `ops:capacity-check` · capacity evidence                                     |
| **A6** | Operations readiness      | On-call · incident matrix · runbook index                                    |
| **A7** | Deployment governance     | Go-live · rollback · smoke · change checklists                               |
| **A8** | Owner sign-off pack       | Limitations · accepted risks · go-live recommendation                        |

## Pack

| Document                  | Path                                                         |
| ------------------------- | ------------------------------------------------------------ |
| Deployment Guide          | [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)                 |
| Docker Guide              | [DOCKER-GUIDE.md](./DOCKER-GUIDE.md)                         |
| Production Configuration  | [PRODUCTION-CONFIGURATION.md](./PRODUCTION-CONFIGURATION.md) |
| TLS Configuration         | [TLS-CONFIGURATION.md](./TLS-CONFIGURATION.md)               |
| Backup Procedures         | [BACKUP-PROCEDURES.md](./BACKUP-PROCEDURES.md)               |
| Restore Procedures        | [RESTORE-PROCEDURES.md](./RESTORE-PROCEDURES.md)             |
| Disaster Recovery         | [DISASTER-RECOVERY.md](./DISASTER-RECOVERY.md)               |
| Runbooks                  | [RUNBOOKS.md](./RUNBOOKS.md)                                 |
| On-call Procedures        | [ONCALL-PROCEDURES.md](./ONCALL-PROCEDURES.md)               |
| Smoke Tests               | [SMOKE-TESTS.md](./SMOKE-TESTS.md)                           |
| Rollback Guide            | [ROLLBACK-GUIDE.md](./ROLLBACK-GUIDE.md)                     |
| Go-Live Checklist         | [GO-LIVE-CHECKLIST.md](./GO-LIVE-CHECKLIST.md)               |
| Owner Production Sign-off | [OWNER-PRODUCTION-SIGNOFF.md](./OWNER-PRODUCTION-SIGNOFF.md) |
| Completion Report         | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)               |

## STOP

Workflow Execute remains **gated**. No Email SoR · no FIN-001 · no Platform 1.3. Await Owner Production Acceptance.
