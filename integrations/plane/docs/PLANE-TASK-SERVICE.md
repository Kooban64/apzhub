# Plane Task Service Reference

**Package:** `@apzhub/integration-plane` v0.3.0  
**Milestone:** OSS-101-06  
**Access:** `adapter.core.tasks` (`PlaneTaskService`)

---

## Purpose

Plane-specific task/issue capability at the adapter boundary. Public terminology is APZHUB **Task**; Plane “issue” naming stays internal to REST types and client methods.

```text
Future TaskServiceImpl
  → PlaneTaskService (adapter.core.tasks)
  → PlaneOperationRunner
  → PlaneRestClient
  → Plane CE issues API
```

---

## Supported operations

| Method                                     | Operation name                             | Notes                               |
| ------------------------------------------ | ------------------------------------------ | ----------------------------------- |
| `list`                                     | `plane.tasks.list`                         | Paging, filters, sorting            |
| `get`                                      | `plane.tasks.get`                          | By provider-native / provisional ID |
| `create`                                   | `plane.tasks.create`                       | Canonical `CreateTaskInput`         |
| `update`                                   | `plane.tasks.update`                       | Partial update only                 |
| `archive`                                  | `plane.tasks.archive`                      | Soft-archive via `archived_at`      |
| `transition`                               | `plane.tasks.transition`                   | Validates state belongs to project  |
| `assign` / `unassign` / `setAssignees`     | `plane.tasks.assign` / `unassign`          | Multi-assignee                      |
| `addLabels` / `removeLabels` / `setLabels` | `plane.tasks.labels`                       | Label set mutations                 |
| `addToCycle` / `removeFromCycle`           | `plane.tasks.add_cycle` / `remove_cycle`   | Canonical sprint IDs                |
| `addToModule` / `removeFromModule`         | `plane.tasks.add_module` / `remove_module` | Module association                  |

---

## Unsupported in this milestone

- Hard delete (Plane DELETE not exposed)
- Comments / attachments / activity streams
- Bulk edit
- Webhooks / real-time
- Platform `TaskServiceImpl`, mapping store, gateway, HTTP `/api/v1/tasks`, UI
- APZHUB global ID generation (`{prefix}_{32-hex}`)

---

## Identity treatment

| Boundary                 | ID form                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Adapter public Task      | Provisional `task_plane_{planeIssueId}`                                                               |
| Related entities         | `proj_plane_*`, `status_plane_*`, `label_plane_*`, `sprint_plane_*`, `module_plane_*`, `user_plane_*` |
| Future platform provider | Resolves/persists APZHUB global IDs via `EntityMappingStore`                                          |

The adapter never imports mapping-store or platform-service implementations.

---

## Query support

Filters (Plane query params kept internal):

- `statusId`, `assigneeId`, `labelId`, `priority`, `sprintId`, `projectModuleId`, `parentTaskId`, `archived`
- `search`
- `createdAfter` / `createdBefore` / `updatedAfter` / `updatedBefore`

Sort fields: `title`, `status`, `priority`, `rank`, `createdAt`, `updatedAt` → mapped to Plane `order_by` (`name`, `state__name`, etc.).

Pagination: canonical `PageRequest` / `PageResult`.

---

## Archive semantics

**Archive** sets Plane `archived_at` (soft). Hard delete is intentionally not exposed. Do not equate archive with hard delete.

---

## State transitions

1. List project states via Plane
2. Reject target state IDs not in that project
3. PATCH issue `state`
4. Map Plane state **group** → canonical `TaskStatus` (`open` / `in_progress` / `done` / …)

No hard-coded state display names (“Todo”, “Done”).

---

## Error translation

Task failures flow through `PlaneOperationRunner` → `PlaneVendorErrorMapper`, including `ISSUE_NOT_FOUND`, `INVALID_STATE`, `INVALID_ASSIGNEE`, `INVALID_LABEL`, `INVALID_CYCLE`, `INVALID_MODULE`, authz, conflict, rate limit, unavailable.

Validation failures thrown inside operations preserve `category: "validation"` without remapping to internal.

---

## Testing

Mock router: `createMockPlaneCoreFetch()` — no live Plane required.

See `plane-task-service.test.ts` and `mappers/task-mapper.test.ts`.
