# APZMETRICS-005 — Operational Readiness

**Date:** 2026-07-18

## Enablement

| Variable                 | Behaviour                                                          |
| ------------------------ | ------------------------------------------------------------------ |
| `APZHUB_METRICS_ENABLED` | `true` / `1` / `on` enables Metrics Platform Services; default off |

## Production checklist

1. Apply migrations 0056/0057
2. Provide PostgreSQL to production factory
3. Set `APZHUB_METRICS_ENABLED=true` only when ready
4. Grant `metrics.read` (and granular mutation permissions) via platform IAM
5. Verify `GET /api/v1/metrics/diagnostics/health` returns metadata-plane flags
6. Confirm Workbench `/workspace/metrics` loads with capability banners

## Disable procedure

Unset/false `APZHUB_METRICS_ENABLED` → HTTP returns `503 METRICS_SERVICE_UNAVAILABLE`; Workbench shows unavailable state; gateway throws not-enabled.

See also [Operational Readiness Guide](../guides/APZHUB-Metrics-Operational-Readiness-Guide.md).
