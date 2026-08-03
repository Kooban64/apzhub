# ENGINEERING-ALIGNMENT-TESTS

| Field     | Value                                    |
| --------- | ---------------------------------------- |
| Programme | APZHUB-LAW-ADOPT-003                     |
| Timestamp | 20260803T132559Z                         |
| Standard  | ES-001 (conform; no certification claim) |

## Executed

| Suite             | Command / path                                                                                | Result                         |
| ----------------- | --------------------------------------------------------------------------------------------- | ------------------------------ |
| EAB-01 manifests  | `pnpm exec vitest run testing/apzqep-law-adopt-003/legal-event-manifests.test.ts`             | **PASS**                       |
| EAB-03 honesty    | `testing/apzqep-law-adopt-003/openapi-honesty.test.ts`                                        | **PASS**                       |
| EAB-04 tenant     | `testing/apzqep-law-adopt-003/tenant-resolution-eab04.test.ts`                                | **PASS**                       |
| Register events   | `apps/law-platform/lib/register-law-events.test.ts`                                           | **PASS**                       |
| Tenant regression | `apps/web/lib/api/law-api-auth.test.ts` `-t resolveLawApiTenant`                              | **PASS** (targeted)            |
| Manifest validate | `parseCapabilityManifestYaml` over `events/legal/**` + `services/legal-platform/service.yaml` | **PASS** (64 events + service) |

## Vitest include

`vitest.config.ts` includes `testing/apzqep-law-adopt-003/**/*.test.{ts,tsx}` (EAB-01/03/04 conformance harness).

## Out of programme / pre-existing

Full `law-api-auth.test.ts` file includes an unrelated `buildLawApiAuthenticatedContext` wildcard grant assertion that fails on current HEAD and was **not** introduced or altered by EAB-01…06. Not in Engineering Alignment Backlog. Not remediated here (would be untraceable eng).

## Certification

**Not claimed.** Await PBR-APZHUB-LAW-003.
