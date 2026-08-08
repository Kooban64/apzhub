# SUP-PR-01 — Fail-closed adapter / bootstrap

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-PR-01**    |
| Slice  | **APZSUP-201**   |
| Status | **Closed**       |
| Date   | 20260808T174000Z |

## Disposition

| Condition                                            | Behaviour                                          |
| ---------------------------------------------------- | -------------------------------------------------- |
| Mapping store postgres unavailable (prod)            | Bootstrap fails — no silent memory fallback        |
| Support provider unavailable at request              | **503** `PROVIDER_UNAVAILABLE` (not empty success) |
| Production + Zammad enabled + providers unregistered | Readiness **not_ready** (fail closed)              |
| Non-prod adapter construct swallow                   | Documented PRWL for local isolation only           |

## Evidence paths

- `packages/platform-services/src/mapping/create-entity-mapping-store.ts`
- `apps/web/lib/api/v1/gateway/bootstrap.ts`
- `apps/web/lib/api/v1/handlers/health.ts` (readiness gate)
- Support API tests: provider unavailable → 503 (`platform-api.support.v1.test.ts`)
