# SUP-H5 — Operational hardening

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-H5**       |
| Slice  | **APZSUP-305**   |
| Status | **Closed**       |
| Date   | 20260808T180000Z |

## Exercised

1. Ops pack [SUP-PR-06-OPS-READINESS.md](./SUP-PR-06-OPS-READINESS.md) — flags, health, backup notes
2. Runbook [support-adapter-unhealthy.md](../../../../operations/runbooks/support-adapter-unhealthy.md) — fail-closed wording aligned
3. Diagnosis path: health/readiness details include `zammadEnabled`, mapping mode, providers

Ops can diagnose Support adapter unavailability without Support 2.0 health UI.
