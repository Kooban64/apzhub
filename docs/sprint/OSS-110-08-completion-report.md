# OSS-110-08 Completion Report — Platform Task Service, Mapping & Gateway Integration

**Status:** Complete  
**Date:** 2026-07-10  
**Scope:** OSS-110-08 only — no task HTTP routes, UI, OSS-110-09, or OSS-101-07

---

## Executive summary

Delivered mapping-aware **TaskServiceImpl**, Plane **task capability provider**, gateway `tasks` exposure through `RequestPipeline`, production authorisation (`task.*` permissions), and stable APZHUB global task IDs (`task_{32-hex}` via ADR-0048 / EntityMappingStore).

**Stop condition met.** Recommended next: **OSS-110-09 — Task HTTP API Surface** (owner approval required).

---

## Milestone scope delivered

| Area                                             | Status |
| ------------------------------------------------ | ------ |
| `TaskProvider` contract (project-scoped)         | ✅     |
| `createPlaneTaskProvider` → `adapter.core.tasks` | ✅     |
| Mapping-aware `TaskServiceImpl`                  | ✅     |
| Stable APZHUB task global IDs                    | ✅     |
| Relationship ID translation                      | ✅     |
| `PlatformServiceGateway.tasks`                   | ✅     |
| RequestPipeline + production authz               | ✅     |
| Permission catalogue `task.*`                    | ✅     |
| Additive `archiveTask` on contracts              | ✅     |
| Compensation / reconciliation paths              | ✅     |
| Tests + architecture boundaries                  | ✅     |

---

## Architecture overview

```text
gateway.tasks
  → RequestPipeline (policies + ProductionAuthorizationProvider)
  → TaskServiceImpl
  → MappingOrchestrator + EntityMappingStore
  → ProviderResolver (capability: task)
  → Plane TaskProvider
  → adapter.core.tasks
  → Plane CE issues API
```

---

## Supported task operations

`listTasks`, `getTask`, `createTask`, `updateTask`, `archiveTask`, `transitionTaskStatus`, `assignTask`, `getBacklog`, `assignTasksToSprint` (via per-task update).

## Unsupported (controlled errors)

`reorderBacklog`, `listMyTasks`, `listComments`, `addComment`, `listAttachments` — `PROVIDER_CAPABILITY_UNSUPPORTED` / `CONFIGURATION_ERROR`.

No HTTP `/api/v1/tasks`, no UI.

---

## Stable global IDs

- Format: `task_{32-hex}` (ADR-0048)
- Created via `ensureMappingAfterCreate` after provider create
- List/get reuse mappings deterministically via `toPlatformId`
- Provisional `task_plane_*` never returned to consumers

---

## Relationship translation

Outbound (APZHUB → native): status, user (assignee), label, sprint, module, parent task — with same-project validation (except users).

Inbound: all relationship IDs rewritten to APZHUB global IDs.

**Assignee path:** `user_*` mappings only — missing mapping → `MAPPING_NOT_FOUND` (no fabricated identity).

---

## Provider resolution

1. preferred provider / integration
2. mapped provider from task (or parent project for create)
3. active provider
4. priority

Mapped Plane project tasks do not route to an unrelated active task provider.

---

## Compensation

Provider create success + mapping persistence failure → `RECONCILIATION_REQUIRED` with safe diagnostics (no silent success; no automatic Plane delete).

---

## Permissions

Singular capability `task` (repository convention):  
`task.list|read|create|update|archive|transition|assign|label|schedule|organise|parent|manage|administer`

---

## Package versions

| Package                              | Version                                    |
| ------------------------------------ | ------------------------------------------ |
| `@apzhub/platform-services`          | **0.5.0 → 0.6.0**                          |
| `@apzhub/platform-service-contracts` | **0.1.0 → 0.2.0** (additive `archiveTask`) |
| `@apzhub/integration-plane`          | 0.3.0 (unchanged)                          |

---

## Files created

| Path                                          | Purpose                                   |
| --------------------------------------------- | ----------------------------------------- |
| `src/services/task-service-impl.ts`           | Mapping-aware TaskServiceImpl             |
| `src/providers/plane/plane-task-provider.ts`  | Plane task provider                       |
| `src/task-service.test.ts`                    | Task provider/service/gateway/authz tests |
| `docs/sprint/OSS-110-08-completion-report.md` | This report                               |

## Files modified (high level)

- capability-providers, provider types/resolver, create-platform-services, gateway
- permission catalogue, operation-authorization-map, authz fixtures
- map-provider-error (IntegrationError passthrough)
- contracts TaskService + version
- mock providers, package index/exports
- foundation docs, CHANGELOG

---

## Tests

| Suite                                | Result                              |
| ------------------------------------ | ----------------------------------- |
| `task-service.test.ts`               | 15 passed                           |
| platform-services + contracts (full) | included in 287 combined regression |
| Postgres mapping store               | 28 passed (existing)                |
| Plane + SDK + API v1                 | green                               |

### Coverage (task capability)

| File                     | Stmts | Branch | Funcs | Lines    |
| ------------------------ | ----- | ------ | ----- | -------- |
| `task-service-impl.ts`   | ~90%  | ~87%   | ~96%  | **~90%** |
| `plane-task-provider.ts` | ~98%  | 100%   | 100%  | **~98%** |

---

## Quality gates

| Gate                                          | Result |
| --------------------------------------------- | ------ |
| Typecheck (contracts, platform-services, web) | Pass   |
| Lint (platform-services)                      | Pass   |
| Combined regression (27 files / 287 tests)    | Pass   |

---

## Backward compatibility

- Existing gateway surfaces unchanged
- `/api/v1` behaviour unchanged
- Tasks only exposed when a task provider is registered
- Contract change additive only (`archiveTask`)

---

## Security

- Deny-by-default production authz on gateway task ops
- Cross-tenant mapping isolation via policies + tenant-scoped store
- No Plane-native IDs in public Task models
- No secrets in errors/diagnostics

---

## Technical debt / risks

- Comments/attachments/backlog reorder deferred
- User assignee mapping depends on existing user mappings (scaffold)
- Live Plane soak testing deferred to HTTP milestone
- Coverage residual branches on rare update null/string paths

---

## Recommendation for next milestone

**OSS-110-09 — Task HTTP API Surface**

- `/api/v1/tasks`
- schemas, validation, OpenAPI, HTTP error mapping
- **No UI**

Do not start OSS-110-09, task UI, or OSS-101-07 without owner approval.
