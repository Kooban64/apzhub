# Performance Report — APZQEP-152

| Field     | Value              |
| --------- | ------------------ |
| Programme | APZQEP-152         |
| Artefact  | PERFORMANCE-REPORT |
| Timestamp | 20260803T064000Z   |

---

## Scope

APZQEP-152 adds a per-request `resolveSessionAuthorization` call inside `withPlatformApiAuth` for Cap (and other) platform API handlers. That is an authorisation correctness change, not a performance programme.

## Observations

| Topic                       | Statement                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Permission resolve overhead | Present on authenticated API requests; **not load-tested at scale** under this programme                          |
| Cap TX + RLS GUC            | `applyPostgresTenantSession` issues `set_config` per Cap transaction; expected low overhead; not benchmarked here |
| Cap F repository facts      | Collect path reads Cap A–E repositories; cost depends on tenant data volume; no scale claim                       |

## Unsupported claims (do not assert)

- No RPS / p95 / p99 figures for permission resolve
- No production-scale concurrency certification
- No claim that resolve latency is negligible under peak load

## Recommendation

Measure `resolveSessionAuthorization` + Cap TX GUC latency under representative tenant load before production GO (as part of APZQEP-150 re-run or ops readiness), not as a substitute for RBAC correctness.
