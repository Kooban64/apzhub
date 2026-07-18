# Plane Collaboration & Project Intelligence

**Package:** `@apzhub/integration-plane` v0.4.0  
**Milestone:** OSS-101-07  
**Scope:** Plane adapter only — no PlatformService, HTTP, or UI

---

## Capabilities

| Service                 | Adapter surface          | Plane CE mapping                        |
| ----------------------- | ------------------------ | --------------------------------------- |
| `PlaneCommentService`   | `adapter.core.comments`  | Issue comments                          |
| `PlaneActivityService`  | `adapter.core.activity`  | Issue history (+ project aggregation)   |
| `PlaneWatcherService`   | `adapter.core.watchers`  | Issue subscribers                       |
| `PlaneAnalyticsService` | `adapter.core.analytics` | Project stats, cycle progress/analytics |

---

## Comments

Operations: `list`, `get`, `create`, `update`, `delete`.

Paths:

- `GET/POST .../issues/{issueId}/comments/`
- `GET/PATCH/DELETE .../issues/{issueId}/comments/{commentId}/`

Canonical `Comment` DTOs (`comment_plane_*` provisional IDs).

---

## Activity

- `listTaskActivity` → `GET .../issues/{issueId}/history/`
- `listProjectActivity` → aggregates first-page issue histories (Plane CE has no project-wide activity collection)
- `list` → alias for project activity

Supports pagination and filters: `taskId`, `actorId`, `action`, `occurredAfter`, `occurredBefore`.

---

## Watchers

Plane subscribers exposed as APZHUB `Watcher`:

- `list` / `add` / `remove`
- Paths under `.../issue-subscribers/`

---

## Project intelligence (read-only)

| Method                 | Source                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `getProjectStatistics` | `project-stats` + issue list derivation (distributions, overdue, blocked, workloads) |
| `getTaskStatistics`    | Issue get + comment/watcher counts                                                   |
| `getCycleProgress`     | `.../cycles/{id}/progress/`                                                          |
| `getVelocitySnapshot`  | `.../cycles/{id}/analytics/`                                                         |
| `getBurndownSnapshot`  | progress + analytics + cycle dates                                                   |

Canonical models: `ProjectStatistics`, `TaskStatistics`, `VelocitySnapshot`, `BurndownSnapshot`, `CycleProgressSnapshot`.

---

## Explicit exclusions

UI, Kanban, notifications, webhooks, realtime, attachments, documents, chat, HTTP routes, PlatformService changes, Zammad.

---

## Related

- [PLANE-ADAPTER.md](./PLANE-ADAPTER.md)
- [PLANE-TASK-SERVICE.md](./PLANE-TASK-SERVICE.md)
- [OSS-101-07 Completion Report](../../docs/sprint/OSS-101-07-completion-report.md)
