# REGRESSION — APZHUB-LAW-ADOPT-003

| Field     | Value            |
| --------- | ---------------- |
| Timestamp | 20260803T132559Z |

## Executed

- `pnpm exec vitest run testing/apzqep-law-adopt-003` — **PASS** (6 tests)
- `pnpm exec vitest run apps/law-platform/lib/register-law-events.test.ts` — **PASS**
- `pnpm exec vitest run apps/web/lib/api/law-api-auth.test.ts -t resolveLawApiTenant` — **PASS** (4 tests)
- Manifest validation: 64 legal event.yaml + legal-platform service.yaml — **PASS**

## Noted out-of-scope

- Unrelated `buildLawApiAuthenticatedContext` wildcard assertion in `law-api-auth.test.ts` fails on HEAD; not part of EAB-01…06; not modified.

## Result

**PASS** for Engineering Alignment scope.
