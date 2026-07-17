# APZWORKFLOW-005 — HTTP API Certification

## Surface

All implemented routes under `apps/web/app/api/v1/workflows/**` (20 route modules) wire `lib/api/v1/handlers/workflows.ts` → `gateway.workflow.*` (stubs for capabilities/health/readiness/diagnostics).

## Parity

| Check | Result |
| --- | --- |
| Route catalogue ↔ OpenAPI Platform Workflow | PASS |
| `pnpm openapi:validate:platform` | PASS |
| Standard API v1 envelopes | PASS (platform handlers) |
| Lifecycle commands publish/archive/restore/transition | PASS |
| Validation single route | PASS |
| Audit by workflow ID | PASS |
| Categories/folders current gateway ops only | PASS (limitation retained) |

## Explicit absences (tested)

`execute`, `runs`, `jobs`, `steps`, `schedules`, `pause`, `resume`, `retry`, `cancel`, `terminate`, runtime credentials, execution logs, webhook ingress, `n8n`, engine connections, workers, queues — **absent** from filesystem and OpenAPI.

## Management-plane stubs

Capabilities / health / readiness / diagnostics report `executionEnabled: false` / `engineConfigured: false`.
