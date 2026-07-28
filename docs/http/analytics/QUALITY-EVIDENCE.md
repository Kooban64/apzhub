# Analytics HTTP API — Quality Evidence

> **Programme:** APZHUB-PLATFORM-ANALYTICS-005

| Gate                    | Evidence                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Unit / API tests        | `apps/web/lib/api/v1/platform-api.analytics.v1.test.ts` (7 tests)                                                  |
| Authorization tests     | Deny-provider case in same file; pipeline operation map for analytics ops                                          |
| Validation tests        | Zod schemas in `apps/web/lib/api/v1/schemas/analytics.ts`                                                          |
| OpenAPI validation      | `pnpm openapi:validate:platform` — **valid**                                                                       |
| Architecture compliance | Handlers call `gateway.analytics.*` only; routes use `withPlatformApiAuth`; no Metabase imports in handlers/routes |
| Contracts / services    | `packages/analytics-contracts` · `packages/platform-services/src/services/analytics`                               |

## Test coverage themes

- 503 when disabled
- Health / readiness / capabilities
- Catalogue, categories, datasets, reports
- Saved create / patch / archive
- Authorization denial
- OpenAPI path registration + route auth wrapper presence
