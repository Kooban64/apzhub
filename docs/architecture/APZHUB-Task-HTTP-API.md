# APZHUB Task HTTP API

**Milestone:** OSS-110-09  
**Status:** Canonical — HTTP surface for platform task capability  
**Base path:** `/api/v1/tasks`  
**Authority:** [Platform HTTP API](./APZHUB-Platform-HTTP-API.md) · [ADR-0051](../adr/ADR-0051-platform-http-api-surface.md) · OSS-110-08 TaskServiceImpl

---

## Purpose

Expose completed `TaskServiceImpl` operations through the existing Platform HTTP API. No new task business logic. No Plane identifiers in responses.

---

## Request path

```text
HTTP /api/v1/tasks*
  → Zod validation
  → withPlatformApiAuth (session → ServiceRequestContext)
  → PlatformServiceGateway.tasks.*
  → RequestPipeline + ProductionAuthorizationProvider
  → TaskServiceImpl
  → MappingOrchestrator → Plane task provider → adapter.core.tasks
```

Handlers may only validate input, construct context (via auth wrapper), invoke the gateway, and serialize the standard envelope.

---

## Endpoints

| Method        | Path                         | Gateway                  | Permission (pipeline)          |
| ------------- | ---------------------------- | ------------------------ | ------------------------------ |
| GET           | `/api/v1/tasks`              | `listTasks`              | `task.list`                    |
| POST          | `/api/v1/tasks`              | `createTask`             | `task.create`                  |
| GET           | `/api/v1/tasks/{taskId}`     | `getTask`                | `task.read`                    |
| PATCH         | `/api/v1/tasks/{taskId}`     | `updateTask`             | `task.update`                  |
| DELETE        | `/api/v1/tasks/{taskId}`     | `archiveTask`            | `task.archive`                 |
| POST          | `.../transition`             | `transitionTaskStatus`   | `task.transition`              |
| POST          | `.../assignees`              | `assignTask`             | `task.assign`                  |
| DELETE        | `.../assignees/{assigneeId}` | `getTask` + `assignTask` | `task.read` then `task.assign` |
| POST          | `.../labels`                 | `getTask` + `updateTask` | `task.read` then `task.update` |
| DELETE        | `.../labels/{labelId}`       | `getTask` + `updateTask` | `task.read` then `task.update` |
| POST / DELETE | `.../sprint`                 | `updateTask`             | `task.update`                  |
| POST / DELETE | `.../module`                 | `updateTask`             | `task.update`                  |
| POST / DELETE | `.../parent`                 | `updateTask`             | `task.update`                  |

DELETE on the task resource is soft-archive only.

---

## List filters

Required: `projectId`.

Optional (strict — unknown keys rejected):

| Query                                 | Maps to                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `stateId`                             | `TaskListFilter.statusId`                                                  |
| `assigneeId`                          | `assigneeId`                                                               |
| `labelId`                             | `labelId`                                                                  |
| `priority`                            | `priority`                                                                 |
| `moduleId`                            | `projectModuleId`                                                          |
| `sprintId`                            | `sprintId`                                                                 |
| `search`                              | `search`                                                                   |
| `limit` / `cursor` / `sort` / `order` | pagination / sort                                                          |
| `workspaceId`                         | Accepted for client convenience; **not** applied as a TaskListFilter field |

---

## Identifiers

- Task IDs: `task_{32-hex}`
- Related: `proj_`, `status_`, `user_`, `label_`, `sprint_`, `module_`
- Never return Plane issue IDs or provider-native IDs

---

## Errors

Uses shared Platform API error mapping (400 / 401 / 403 / 404 / 409 / 501 / 503 / 500). `RECONCILIATION_REQUIRED` → 409. No stack traces, Plane payloads, or mapping internals in public bodies.

---

## OpenAPI

Documented under tag **Tasks** in [APZHUB-Platform-OpenAPI-v1.yaml](../specs/APZHUB-Platform-OpenAPI-v1.yaml). Validate with `pnpm openapi:validate:platform`.

---

## Explicit exclusions

Task UI, Kanban, comments, attachments, notifications, activity feeds, WebSockets, GraphQL, bulk edit, search enhancements, time tracking, Zammad, new adapters.

---

## Related

- [OSS-110-09 Completion Report](../sprint/OSS-110-09-completion-report.md)
- [OSS-110-08 Completion Report](../sprint/OSS-110-08-completion-report.md)
- [Permission Catalogue](../specs/APZHUB-Platform-Permission-Catalogue.md)
