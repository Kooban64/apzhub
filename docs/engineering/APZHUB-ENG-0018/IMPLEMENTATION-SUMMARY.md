# APZHUB-ENG-0018 — Implementation Summary

> **Programme:** APZHUB-ENG-0018  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Groups:** RG-LAW-API-AUTHZ · RG-LAW-SEARCH-INT

## Preconditions verified

| Check                        | Result                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| APZHUB-ENG-0017              | **ACCEPTED** (Owner Decision)                                                                                    |
| ENGINEERING-PLAN Step 3      | RG-LAW-API-AUTHZ + RG-LAW-SEARCH-INT                                                                             |
| Groups repository-approved   | Yes                                                                                                              |
| Status before implementation | **OPEN**                                                                                                         |
| Dependencies                 | Prefer after RG-LAW-HOST-QUALITY (ENG-0016 **ACCEPTED**) · prefer SEARCH after AUTHZ (batched in this programme) |

## STEP 2 — Group contracts

### RG-LAW-API-AUTHZ

| Field                      | Value                                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identifier                 | RG-LAW-API-AUTHZ                                                                                                                                         |
| Title                      | Law API permission fixture alignment                                                                                                                     |
| Root cause                 | RCA-04 — after OBS-LAW-01, `resolveLawApiPermissions` always uses Platform Authorization; fixtures still assumed allow-all / empty-mock invert (403↔2xx) |
| Included failures          | QA2-V-051…074 (**24** Vitest)                                                                                                                            |
| Affected packages          | `apps/web` Law API route tests · `apps/web/lib/api/testing/law-api-test-helpers.ts`                                                                      |
| Affected products          | APZ Law                                                                                                                                                  |
| Affected platform services | Platform Authorization (test fixture only — no service redesign)                                                                                         |
| Dependencies               | Prefer after RG-LAW-HOST-QUALITY                                                                                                                         |
| Acceptance criteria        | Law API authz Vitest suites green; 403 and happy-path fixtures controllable via mock authz                                                               |
| Architecture impact        | None — test/helpers only; production PermissionService path unchanged                                                                                    |
| SemVer impact              | None                                                                                                                                                     |
| Est. reduction             | **24** Vitest                                                                                                                                            |

### RG-LAW-SEARCH-INT

| Field                      | Value                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Identifier                 | RG-LAW-SEARCH-INT                                                                                                                             |
| Title                      | Law search and integration test fixtures                                                                                                      |
| Root cause                 | RCA-07 — after ENG-0007, `resolveLegalSearchTenantScope()` is session-only; integration tests bound ALS only → empty provider status          |
| Included failures          | QA2-V-075…081 (**7** Vitest)                                                                                                                  |
| Affected packages          | `apps/law-platform` search/lifecycle/calendar integration tests                                                                               |
| Affected products          | APZ Law                                                                                                                                       |
| Affected platform services | Search / Knowledge (test fixture only)                                                                                                        |
| Dependencies               | Prefer after RG-LAW-API-AUTHZ (satisfied in-programme)                                                                                        |
| Acceptance criteria        | Law search/palette/workflow/matter/calendar/tenant-isolation integration Vitest green without reintroducing ALS into client-safe tenant scope |
| Architecture impact        | None — session binding in tests only; ENG-0007 client-safe scope preserved                                                                    |
| SemVer impact              | None                                                                                                                                          |
| Est. reduction             | **7** Vitest                                                                                                                                  |

## Changes (summary)

1. Extended Law API test helpers with controllable `mockResolveSessionAuthorization` (`*` grant / empty deny) and deferred `vi.mock` wrapper.
2. Aligned client / calendar / invoice / time-entry / trust API tests to grant-by-default + deny for 403 cases; removed obsolete `LAW_DEV_PERMISSIONS` reliance in trust tests.
3. Bound `setSessionLawPersistenceContext(createLawPersistenceContext({ tenantId: DEFAULT_LAW_TENANT_ID }))` in Law search/palette/workflow/matter/calendar/tenant-isolation integration fixtures.

## Result

RG-LAW-API-AUTHZ and RG-LAW-SEARCH-INT **implemented**. Recommendation: **READY FOR OWNER ACCEPTANCE**.
