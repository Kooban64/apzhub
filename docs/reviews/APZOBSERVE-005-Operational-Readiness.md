# APZOBSERVE-005 — Platform Observability Operational Readiness Guide

## Environment

| Variable                 | Role                                      |
| ------------------------ | ----------------------------------------- |
| `APZHUB_OBSERVE_ENABLED` | Deny-by-default; must be `true` to enable |
| Platform PostgreSQL      | Required in production (no silent memory) |

## Deployment order

1. Apply migrations **0054**, **0055**
2. Deploy platform-services with observe factories
3. Enable `APZHUB_OBSERVE_ENABLED=true`
4. Verify `/api/v1/observe/health` and `/readiness`
5. Confirm Workbench `/workspace/observability` with `observe.read`

## Disable procedure

Set `APZHUB_OBSERVE_ENABLED=false` → HTTP `503` / `OBSERVE_SERVICE_UNAVAILABLE` → Workbench unavailable state. No repository fallback.

## Expectations

- Health/readiness: metadata management plane readiness, not provider probes
- Diagnostics: safe registration/persistence metadata only
- Backup/restore: platform PostgreSQL `platform_observe_*` tables
- Upgrade/rollback: additive migrations; no destructive observe migrations in this programme
- Failure triage: correlation IDs; check authz, enabled flag, DB connectivity

## Known ops limitations

No Grafana/Prometheus/Loki/OTel/AlertManager operations. Provider onboarding requires a future approved milestone.
