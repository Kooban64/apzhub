# Platform 1.4 Operations

## Maturity goals

Deployment · rollback · migrations · health/readiness · diagnostics · metrics · alerting · worker supervision · queue monitoring · DLQ triage · replay · incident response · capacity monitoring · backup/restore · release evidence · change records · provider onboarding · secret rotation · compliance evidence · support handover.

## Gap severity (from CERT-002 / ENG residuals)

| Gap                                        | Severity                 |
| ------------------------------------------ | ------------------------ |
| Process-local delivery runtime             | **High**                 |
| Capacity evidence absent                   | **High**                 |
| POPIA formal pack incomplete               | **High**                 |
| DLQ/admin runbooks thin                    | **Medium**               |
| Full Playwright/monorepo not re-run        | **Medium**               |
| Provider onboarding absent (SMTP deferred) | **Medium** (conditional) |

## Programme mapping

OPS-001 runbooks · E02 capacity · E05 admin · COMP-001 compliance evidence.
