# Production Readiness Assessment — Platform-1.4-OR-001

> **Date:** 2026-07-23 · Objective assessment · No remediation

## Classification

**PRODUCTION READY WITH LIMITATIONS / ACTIONS** for Platform 1.4 baseline **with durable notification runtime remaining OFF**.

**Not ready** to enable `APZHUB_NOTIFICATION_DURABLE_RUNTIME` in production until migrations **0065–0067** are applied and live product claim/lease evidence is re-validated.

## Dimension scores

| Dimension           | Assessment         | Notes                                                                        |
| ------------------- | ------------------ | ---------------------------------------------------------------------------- |
| Reliability         | Conditional        | Process-local path retained; durable path code present but schema undeployed |
| Recoverability      | Conditional        | Design + probe reclaim OK; product reclaim NOT RUN on live SoR               |
| Maintainability     | Acceptable         | Admin/ops services delivered; docs packs present                             |
| Monitoring          | Partial            | Health/diagnostics/metrics APIs present; not a full dashboards programme     |
| Security            | Acceptable         | Deny-by-default admin; flag OFF; live RLS on durable tables N/A              |
| Auditability        | Conditional        | Audit design + unit tests OK; live admin audit table absent                  |
| Operational risk    | Elevated until MIG | OR-R-01 High if flag enabled early                                           |
| Rollback capability | Acceptable         | Flag OFF rollback path confirmed                                             |

## Go-live posture

| Path                                   | Posture                                                            |
| -------------------------------------- | ------------------------------------------------------------------ |
| Platform 1.4 with durable flag **OFF** | Acceptable with known limitations + backlog actions                |
| Durable runtime **ON**                 | **Blocked** pending migration deployment + live product validation |

## Required actions (separate programmes)

1. Deploy migrations through **0067** (proposed MIG programme)
2. Live SKIP LOCKED / worker lifecycle suite (proposed QA-LIVE programme)
3. Reconcile vertical certification pins / OpenAPI allowlists (OR-DEF-002)
4. Then Platform-1.4-CERT-001
