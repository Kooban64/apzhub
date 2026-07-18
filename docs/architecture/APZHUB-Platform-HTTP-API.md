# APZHUB Platform HTTP API

**Milestone:** OSS-110-07 (+ OSS-110-09 task surface + **OSS-110-11 Support surface** + **APZTCMS-012 Testing surface**)  
**Status:** Canonical — production HTTP surface over `PlatformServiceGateway`  
**Base path:** `/api/v1`  
**Authority:** [010](../010-api-gateway-integration-communication-standards.md) · [ADR-0051](../adr/ADR-0051-platform-http-api-surface.md)

---

## Dependency path

```text
HTTP route (Next.js App Router)
  → request parsing / Zod validation
  → authenticated ServiceRequestContext (trusted session)
  → PlatformServiceGateway
  → RequestPipeline (policies + ProductionAuthorizationProvider)
  → platform service implementation
  → mapping / provider resolution
  → integration adapter
```

**Prohibited:** HTTP route → Plane/adapter; route-level permission catalogues; DB queries in handlers.

---

## Routes delivered

| Method                | Path                                                                            | Gateway operation                          |
| --------------------- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| GET                   | `/api/v1/health`                                                                | Process/gateway health (public)            |
| GET                   | `/api/v1/readiness`                                                             | Readiness (public)                         |
| GET                   | `/api/v1/openapi`                                                               | OpenAPI 3.1 document (public)              |
| GET                   | `/api/v1/workspaces`                                                            | `workspaces.listWorkspaces`                |
| GET                   | `/api/v1/workspaces/{workspaceId}`                                              | `workspaces.getWorkspace`                  |
| GET                   | `/api/v1/projects`                                                              | `projects.listProjects`                    |
| POST                  | `/api/v1/projects`                                                              | `projects.createProject`                   |
| GET                   | `/api/v1/projects/{projectId}`                                                  | `projects.getProject`                      |
| PATCH                 | `/api/v1/projects/{projectId}`                                                  | `projects.updateProject`                   |
| DELETE                | `/api/v1/projects/{projectId}`                                                  | `projects.archiveProject`                  |
| GET                   | `/api/v1/teams?projectId=`                                                      | `teams.listTeam`                           |
| GET                   | `/api/v1/teams/{teamId}?projectId=`                                             | `teams.getTeamMember`                      |
| GET                   | `/api/v1/tasks?projectId=`                                                      | `tasks.listTasks`                          |
| POST                  | `/api/v1/tasks`                                                                 | `tasks.createTask`                         |
| GET                   | `/api/v1/tasks/{taskId}`                                                        | `tasks.getTask`                            |
| PATCH                 | `/api/v1/tasks/{taskId}`                                                        | `tasks.updateTask`                         |
| DELETE                | `/api/v1/tasks/{taskId}`                                                        | `tasks.archiveTask`                        |
| POST                  | `/api/v1/tasks/{taskId}/transition`                                             | `tasks.transitionTaskStatus`               |
| POST                  | `/api/v1/tasks/{taskId}/assignees`                                              | `tasks.assignTask`                         |
| DELETE                | `/api/v1/tasks/{taskId}/assignees/{assigneeId}`                                 | `getTask` + `assignTask`                   |
| POST                  | `/api/v1/tasks/{taskId}/labels`                                                 | `getTask` + `updateTask`                   |
| DELETE                | `/api/v1/tasks/{taskId}/labels/{labelId}`                                       | `getTask` + `updateTask`                   |
| POST / DELETE         | `/api/v1/tasks/{taskId}/sprint`                                                 | `updateTask` (`sprintId`)                  |
| POST / DELETE         | `/api/v1/tasks/{taskId}/module`                                                 | `updateTask` (`projectModuleId`)           |
| POST / DELETE         | `/api/v1/tasks/{taskId}/parent`                                                 | `updateTask` (`parentTaskId`)              |
| GET                   | `/api/v1/support-requests`                                                      | `support.listSupportRequests`              |
| POST                  | `/api/v1/support-requests`                                                      | `support.createSupportRequest`             |
| GET                   | `/api/v1/support-requests/{supportRequestId}`                                   | `support.getSupportRequest`                |
| PATCH                 | `/api/v1/support-requests/{supportRequestId}`                                   | `support.updateSupportRequest`             |
| DELETE                | `/api/v1/support-requests/{supportRequestId}`                                   | `support.closeSupportRequest` (soft close) |
| POST                  | `/api/v1/support-requests/{id}/close\|reopen\|state\|priority\|owner\|customer` | Support command ops                        |
| DELETE                | `/api/v1/support-requests/{id}/owner`                                           | `assignSupportRequest(null)`               |
| GET/POST              | `/api/v1/support-requests/{id}/articles*`                                       | articles list/get/notes/replies            |
| GET                   | `/api/v1/support-requests/{id}/history`                                         | `supportHistory.getTimeline`               |
| GET/POST              | `/api/v1/support-organizations`                                                 | org list/create                            |
| GET/PATCH/DELETE      | `/api/v1/support-organizations/{organizationId}`                                | get/update/archive                         |
| GET/POST              | `/api/v1/support-groups`                                                        | group list/create                          |
| GET/PATCH             | `/api/v1/support-groups/{groupId}`                                              | get/update                                 |
| GET                   | `/api/v1/support-users`                                                         | list/lookup/search                         |
| GET                   | `/api/v1/support-users/{userId}`                                                | get                                        |
| GET                   | `/api/v1/support-search`                                                        | `supportSearch.search`                     |
| GET                   | `/api/v1/support-analytics`                                                     | `getSupportIntelligence`                   |
| GET/POST/PATCH/DELETE | `/api/v1/testing/**`                                                            | `gateway.testing.*` route family           |

## Routes intentionally excluded

| Resource                                                  | Reason                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/api/v1/issues`                                          | Plane-native naming — never exposed                                                |
| `/api/v1/tickets`                                         | Zammad-native naming — never exposed; use `support-requests`                       |
| Task comments / attachments                               | Unsupported on TaskServiceImpl                                                     |
| `/api/v1/users`                                           | Plane user provider is unsupported scaffold                                        |
| `/api/v1/search/internal/indexes` · `/internal/documents` | Index/document HTTP deliberately omitted (APZSEARCH-007 / ADR-0064) — gateway-only |
| `/api/v1/support-sync` / `/api/v1/support-webhooks`       | Operational; deferred (OSS-110-11 exclusion)                                       |
| Support binary attachments                                | Metadata only; binary deferred                                                     |
| Testing binary evidence upload                            | Metadata only; binary deferred                                                     |
| Testing AI Assist / automatic approvals                   | Deferred; recommendations/readiness remain advisory                                |
| Testing live runners                                      | Deferred; automation imports parse external results only                           |
| Team mutations                                            | Not required for this milestone minimum surface                                    |
| Task UI / Support UI / Kanban / WebSockets                | Separate milestones                                                                |

---

## Task API notes (OSS-110-09)

- Handlers validate with Zod, build context, call `gateway.tasks` only — no business logic.
- Permissions enforced by RequestPipeline (`task.list|read|create|update|archive|transition|assign`).
- Relationship sub-routes that compose `updateTask` inherit `task.update`.
- Canonical list filters: `projectId` (required), `stateId`→`statusId`, `assigneeId`, `labelId`, `priority`, `moduleId`→`projectModuleId`, `sprintId`, `search`, `limit`, `cursor`, `sort`, `order`. Optional `workspaceId` accepted but not applied as a TaskListFilter field. Unknown query keys rejected.
- Responses use the standard API v1 envelope; APZHUB global IDs only (`task_*`, never Plane issue IDs).

See [Task HTTP API](./APZHUB-Task-HTTP-API.md).

---

## Support API notes (OSS-110-11)

- Handlers validate with Zod, build context, call `gateway.support*` only — no business logic; no Zammad imports.
- Permissions enforced by RequestPipeline (`support.requests.*`, `support.articles.*`, …) from OSS-110-10 catalogue.
- DELETE on a support request is soft-close (`closeSupportRequest`), not hard delete.
- Internal notes and customer replies use separate routes; visibility cannot be client-overridden.
- Global IDs only: `sreq_`, `sorg_`, `sgrp_`, `suser_`, `sart_` — never `*_zammad_*`.
- Analytics snapshot may include heuristic overdue fields — not authoritative SLA.

See [Support HTTP API](./APZHUB-Support-HTTP-API.md).

---

## Testing API notes (APZTCMS-012)

- Handlers validate with Zod, build context, and call `gateway.testing.*` only — no domain service or persistence imports in handlers/routes.
- The route family lives under `/api/v1/testing/**` with 69 route files currently present under `apps/web/app/api/v1/testing/`.
- Evidence is metadata-only JSON; no multipart or binary evidence route exists.
- Automation validates/imports external result payloads; it does not execute runners.
- Release readiness includes `isDecision: false` and is advisory only.
- Quality risk currently maps to capability unsupported (`501`).

See [Testing HTTP API](./APZHUB-Testing-HTTP-API.md).

---

## Versioning

Path versioning: `/api/v1`. See ADR-0051.

---

## Request context

Built by `buildServiceRequestContext` from Better Auth session:

- actor / tenant from session only
- correlation ID from validated header or generated
- request ID always generated
- optional `Idempotency-Key` → `execution.extras` (no durable store yet)
- locale from `Accept-Language` (best-effort)

---

## Authorisation

Handlers enforce authentication presence only. Permission decisions remain in `RequestPipeline` + production provider using the existing catalogue (`workspace.list`, `project.read`, `task.read`, …).

---

## Pagination / filters

Query: `limit` (max 100), `cursor`, `page`, `perPage`, `sort`, `order`, plus resource filters. Unsupported fields rejected (strict Zod).

---

## Error → HTTP status

| Platform code family                          | HTTP |
| --------------------------------------------- | ---- |
| validation / invalid ID                       | 400  |
| authentication                                | 401  |
| permission / policy / tenant membership       | 403  |
| not found / mapping not found                 | 404  |
| conflict / revision / reconciliation required | 409  |
| capability unsupported                        | 501  |
| provider / persistence unavailable            | 503  |
| unexpected                                    | 500  |

---

## Bootstrap

Process-level singleton via `getPlatformApiGatewayBootstrap()`:

- production authz mode in production
- PostgreSQL mapping in production (existing env rules)
- Plane providers when `PLANE_INTEGRATION_ENABLED=true`
- test override: `setPlatformApiGatewayBootstrapForTests`

---

## OpenAPI

- Spec: [APZHUB-Platform-OpenAPI-v1.yaml](../specs/APZHUB-Platform-OpenAPI-v1.yaml)
- Validate: `pnpm openapi:validate:platform`
- Serve: `GET /api/v1/openapi`

---

## Related

- [Platform Service Gateway](../specs/APZHUB-Platform-Service-Gateway.md)
- [Platform Execution Layer](./APZHUB-Platform-Execution-Layer.md)
- [Platform Service Authorization](./APZHUB-Platform-Service-Authorization.md)
- [Task HTTP API](./APZHUB-Task-HTTP-API.md)
- [Testing HTTP API](./APZHUB-Testing-HTTP-API.md)
- [OSS-110-07 Completion Report](../sprint/OSS-110-07-completion-report.md)
- [OSS-110-09 Completion Report](../sprint/OSS-110-09-completion-report.md)
