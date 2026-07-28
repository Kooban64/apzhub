# Monitoring Review — Platform 1.2.0

> **Programme:** APZHUB-OPS-001  
> **Status:** **PARTIAL**

## Verified

| Item                 | Evidence                                                              | Finding                                                                    |
| -------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Health endpoints     | `apps/web/app/api/health/route.ts` · gateway health handlers          | DB/Redis/runtime diagnostics                                               |
| Alert strategy       | `MONITORING-AND-ALERTING.md` · APZHUB-1.2-003                         | Catalogue + runbooks; **manual triage**                                    |
| Alert audit          | `evidence/alert-strategy/20260720T085229Z-R12-OPS-02-audit-PASS.json` | **PASS**                                                                   |
| Observe product      | Frozen Observe vertical                                               | Metadata plane — **PL12-KL-02** live evaluation/delivery **not** automated |
| Grafana / Prometheus | ENVIRONMENT.md (legacy Grafana) · ops docs                            | **Not** in APZHUB docker compose                                           |
| Logging              | Structured logging standards in platform/ops docs                     | Present as standard; host aggregation via existing stack                   |
| Error reporting      | Incident + runbook path                                               | Manual                                                                     |

## Honesty

Do not claim automated Observe paging or product-owned Prometheus/Grafana GA for APZHUB 1.2.0.

## Before production

- Assign on-call to P1/P2 alert catalogue roles.
- Subscribe humans to `/api/health` and host monitoring.
- Accept manual-triage posture for this baseline.
