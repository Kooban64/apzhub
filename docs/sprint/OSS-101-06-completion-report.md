# OSS-101-06 Completion Report — Plane Task / Issue Capability

**Status:** Complete  
**Date:** 2026-07-10  
**Scope:** OSS-101-06 only — Plane adapter task capability  
**Package:** `@apzhub/integration-plane` **v0.3.0**

---

## Executive summary

Delivered a production-quality, strongly typed **Plane task (issue) capability** on `adapter.core.tasks` (`PlaneTaskService`). Canonical Task DTOs come from `@apzhub/platform-service-contracts`. Plane “issue” naming remains internal. Soft-archive, state transitions, assignees, labels, cycles (sprints), and modules are supported through `PlaneOperationRunner` → `PlaneRestClient`.

**Explicitly not delivered (by design):** Platform `TaskServiceImpl`, mapping orchestration, gateway task exposure, `/api/v1/tasks`, task-board UI, comments/attachments.

**Stop condition met.** Recommended next milestone: **OSS-110-08 — Platform Task Service, Mapping & Gateway Integration** (requires owner approval).

---

## Milestone scope delivered

| Area | Status |
|------|--------|
| `PlaneTaskService` on `adapter.core.tasks` | ✅ |
| Canonical Task models (contracts + re-exports) | ✅ |
| List / get / create / update / archive | ✅ |
| State transition with project-state validation | ✅ |
| Assignees, labels, cycle, module, parent | ✅ |
| Query filters, paging, sorting | ✅ |
| Soft-archive (`archived_at`); no hard delete | ✅ |
| Capability registration (`tasks`) | ✅ |
| Error translation extensions | ✅ |
| Mock API router for issues | ✅ |
| Diagnostics task indicators | ✅ |
| Tests + architecture boundary checks | ✅ |
| Docs + version bump to v0.3.0 | ✅ |

---

## Architecture overview

```text
Future TaskServiceImpl (OSS-110-08)
  → PlaneTaskService
  → PlaneOperationRunner (logger, metrics, circuit breaker, error mapper)
  → PlaneRestClient (list/get/create/update/archive issues)
  → Plane CE issues API
```

**Prohibited paths verified:** no `platform-services`, `PlatformServiceGateway`, or `EntityMappingStore` imports in `integrations/plane`.

---

## Supported operations

`list`, `get`, `create`, `update`, `archive`, `transition`, `assign`, `unassign`, `setAssignees`, `addLabels`, `removeLabels`, `setLabels`, `addToCycle`, `removeFromCycle`, `addToModule`, `removeFromModule`, parent via update.

## Unsupported operations

Hard delete; comments; attachments; activity; bulk edit; webhooks; TaskServiceImpl; HTTP task routes; UI.

---

## Canonical model usage

Additive, vendor-neutral contract fields:

- `Task.assigneeIds`, `startDate`, `dueDate`, `archivedAt`
- `CreateTaskInput` / `UpdateTaskInput` / `AssignTaskInput` multi-assignee + dates/estimate
- `TaskListFilter`: `statusId`, `priority`, `projectModuleId`, `archived`, date bounds

Plane-native fields never required on platform contracts.

---

## Mapping behaviour

`mapPlaneIssue` → provisional `task_plane_*` IDs; related entities use existing `*_plane_*` prefixes. Priority and state-group mapping are deterministic; unknown enums degrade safely (`priority: none`, `status: open`).

---

## State-transition behaviour

Validates target state ID against `listStates` for the project; rejects foreign states; returns canonical `TaskStatus` from Plane state group.

---

## Relationship handling

Assignees/labels mutated via issue PATCH arrays; cycle ↔ canonical sprint; module association; parent task reference without recursive tree fetch.

---

## Plane API endpoint coverage

| Client method | Path pattern |
|---------------|--------------|
| `listIssues` | `GET .../projects/{id}/issues/` |
| `getIssue` | `GET .../issues/{id}/` |
| `createIssue` | `POST .../issues/` |
| `updateIssue` | `PATCH .../issues/{id}/` |
| `archiveIssue` | `PATCH` with `archived_at` |

---

## Capability registration

- Core service id: `tasks` (operations include `transition`, `assign`)
- Extended bootstrap caps: `tasks`, `issues`
- Diagnostics: `taskCapability.{registered,serviceAvailable,supportedOperations,apiAssumption}`

---

## Error translation changes

Added vendor codes: `STATE_NOT_FOUND`, `INVALID_STATE`, `INVALID_ASSIGNEE`, `INVALID_LABEL`, `INVALID_CYCLE`, `INVALID_MODULE`. Runner passes through `IntegrationError` (validation) without remapping to internal.

---

## Files created

| Path | Purpose |
|------|---------|
| `src/services/task-service.ts` | `PlaneTaskService` |
| `src/mappers/task-mapper.ts` | Issue ↔ Task mapping |
| `src/mappers/task-mapper.test.ts` | Mapper unit tests |
| `src/plane-task-service.test.ts` | Contract / integration / boundary tests |
| `docs/PLANE-TASK-SERVICE.md` | Task service reference |
| `docs/sprint/OSS-101-06-completion-report.md` | This report |

## Files modified (high level)

- `plane-rest-client.ts`, `plane-api-types.ts`, `plane-error-mapper.ts`
- `plane-core-services.ts`, `service-capabilities.ts`, `plane-bootstrap.ts`, `plane-adapter.ts`, `index.ts`
- Mock core fetch/data; request validation; package.json → 0.3.0
- `@apzhub/platform-service-contracts` Task DTOs / filters / inputs (additive)
- Foundation docs, CHANGELOG, PLANE-ADAPTER.md

---

## Package version

`@apzhub/integration-plane` **0.2.0 → 0.3.0** (minor — new public capability).

---

## Tests added

| Suite | Count (approx.) |
|-------|-----------------|
| `task-mapper.test.ts` | 10 |
| `plane-task-service.test.ts` | 14 |
| Updated core/bootstrap tests | capability count 8 |

**Total Plane tests:** 61 passed (8 files)

### Regression

| Suite | Result |
|-------|--------|
| platform-service-contracts + platform-services + integration-sdk | 195 passed |
| API / apps/web lib api (incl. v1) | 191 passed |
| Authorisation production tests | included in platform-services |

### Coverage (task capability)

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| `task-mapper.ts` | 100% | ~99% | 100% | **100%** |
| `task-service.ts` | ~95% | ~89% | 100% | **~95%** (≥90% target) |

---

## Quality-gate results

| Gate | Result |
|------|--------|
| Format / lint (`integration-plane`) | Pass |
| Typecheck (`integration-plane`) | Pass |
| Plane unit + contract tests | 61 pass |
| Integration SDK regression | Pass |
| platform-service-contracts | Pass |
| platform-services (incl. authz) | Pass |
| API v1 / web API regression | Pass |

---

## Backward compatibility

- Existing core services unchanged in behaviour
- API v1 routes unchanged
- Public Plane package adds `PlaneTaskService` / Task types; no breaking removals
- Contract changes are additive only

---

## Security considerations

- Secrets not exposed in public adapter errors
- Diagnostics omit task titles / PII
- No mapping-store or gateway coupling in adapter

---

## Plane API assumptions

- CE issues API under `/api/workspaces/{slug}/projects/{id}/issues/`
- Soft-archive via `archived_at`
- Assignees/labels/cycle/module/parent via issue PATCH fields
- State groups map to canonical TaskStatus
- Engine version window remains ~0.23–0.24.x (bootstrap metadata)

---

## Technical debt

- Client-side archived filter branches rarely hit when server filters first
- Sort `order_by` mapping is best-effort vs live Plane field catalogue
- Comments/attachments deferred
- Bootstrap still declares SDK capability enum subset; extended caps carry `tasks`/`issues`

---

## Risks

- Live Plane field/query differences vs mock may need OSS-110-08 soak testing
- Multi-assignee semantics (`assigneeId` + `assigneeIds`) must stay consistent in TaskServiceImpl

---

## Recommendation for next milestone

**OSS-110-08 — Platform Task Service, Mapping & Gateway Integration**

- Plane task capability provider in `@apzhub/platform-services`
- Mapping-aware `TaskServiceImpl` + stable APZHUB task global IDs
- Parent/relationship ID translation via mapping store
- `PlatformServiceGateway` task exposure

Do **not** start OSS-110-08, task HTTP routes, task UI, or OSS-101-07 without owner approval.
