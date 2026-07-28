# Workflow HTTP API — Quality Evidence

> **Programme:** APZHUB-PLATFORM-WORKFLOW-005

| Gate                    | Evidence                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Unit / API tests        | `apps/web/lib/api/v1/platform-api.workflow.v1.test.ts` (7 tests)                                                   |
| Authorization tests     | Deny-provider case in same file; pipeline operation map for workflow ops                                           |
| Validation tests        | Zod schemas in `apps/web/lib/api/v1/schemas/workflow.ts`                                                           |
| OpenAPI validation      | `pnpm openapi:validate:platform` — **valid** (1.12.0)                                                              |
| TypeScript              | `tsc --noEmit -p apps/web` — **PASS**                                                                              |
| Architecture compliance | Handlers call `gateway.workflow.*` only; routes use `withPlatformApiAuth`; no `integration-n8n` in handlers/routes |
| Contracts / services    | `packages/workflow-contracts` **0.4.2** · `packages/platform-services` workflow runtime                            |

## Test coverage themes

- 503 when disabled
- Health / readiness / capabilities (no n8n leakage)
- Definitions + runs lifecycle
- Schedules create / arm-pause-retire / delete
- Tasks claim + approvals decide + notifications list
- Authorization denial
- OpenAPI path registration + route auth wrapper presence
