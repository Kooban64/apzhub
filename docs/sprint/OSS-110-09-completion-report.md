# OSS-110-09 Completion Report — Task HTTP API Surface

**Status:** Complete  
**Date:** 2026-07-10  
**Scope:** OSS-110-09 only — no task UI, comments, attachments, OSS-101-07, or OSS-110-10

---

## Executive summary

Exposed the completed platform task capability through the existing Platform HTTP API (`/api/v1/tasks`). Thin Next.js App Router handlers validate input with Zod, build trusted `ServiceRequestContext`, and invoke `PlatformServiceGateway.tasks` only. Authorisation remains in `RequestPipeline` / `ProductionAuthorizationProvider`. OpenAPI 3.1 extended and validated. No new task business logic; no Plane identifiers in responses.

**Stop condition met.** Recommended next: **OSS-101-07** (owner approval required).

---

## Routes implemented

| Method        | Path                                            | Gateway                  |
| ------------- | ----------------------------------------------- | ------------------------ |
| GET           | `/api/v1/tasks`                                 | `listTasks`              |
| POST          | `/api/v1/tasks`                                 | `createTask`             |
| GET           | `/api/v1/tasks/{taskId}`                        | `getTask`                |
| PATCH         | `/api/v1/tasks/{taskId}`                        | `updateTask`             |
| DELETE        | `/api/v1/tasks/{taskId}`                        | `archiveTask`            |
| POST          | `/api/v1/tasks/{taskId}/transition`             | `transitionTaskStatus`   |
| POST          | `/api/v1/tasks/{taskId}/assignees`              | `assignTask`             |
| DELETE        | `/api/v1/tasks/{taskId}/assignees/{assigneeId}` | `getTask` + `assignTask` |
| POST          | `/api/v1/tasks/{taskId}/labels`                 | `getTask` + `updateTask` |
| DELETE        | `/api/v1/tasks/{taskId}/labels/{labelId}`       | `getTask` + `updateTask` |
| POST / DELETE | `/api/v1/tasks/{taskId}/sprint`                 | `updateTask`             |
| POST / DELETE | `/api/v1/tasks/{taskId}/module`                 | `updateTask`             |
| POST / DELETE | `/api/v1/tasks/{taskId}/parent`                 | `updateTask`             |

---

## OpenAPI updates

- Tag **Tasks** added
- All task paths documented with schemas, examples, `x-required-permission`, operation IDs, and error responses (400/401/403/404/409/501/503/500)
- `Task`, request bodies, `TaskSuccess`, `TaskCollection` schemas
- Validated: `pnpm openapi:validate:platform` ✅

---

## Files created

| Path                                                | Role                                 |
| --------------------------------------------------- | ------------------------------------ |
| `apps/web/lib/api/v1/schemas/task.ts`               | Zod validation                       |
| `apps/web/lib/api/v1/handlers/tasks.ts`             | Gateway-only handlers                |
| `apps/web/app/api/v1/tasks/**/route.ts`             | App Router routes (10 route modules) |
| `apps/web/lib/api/v1/platform-api.tasks.v1.test.ts` | Task API tests                       |
| `docs/architecture/APZHUB-Task-HTTP-API.md`         | Task API architecture                |
| `docs/sprint/OSS-110-09-completion-report.md`       | This report                          |

---

## Files modified

| Path                                            | Change                               |
| ----------------------------------------------- | ------------------------------------ |
| `apps/web/lib/api/v1/errors.ts`                 | `RECONCILIATION_REQUIRED` → HTTP 409 |
| `apps/web/lib/api/v1/testing/fixtures.ts`       | Mock `gateway.tasks` + task fixtures |
| `apps/web/lib/api/v1/platform-api.v1.test.ts`   | OpenAPI now expects `/tasks`         |
| `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`    | Task paths + schemas                 |
| `docs/architecture/APZHUB-Platform-HTTP-API.md` | Task routes documented               |
| Foundation docs / CHANGELOG / docs/README       | Milestone closeout                   |

---

## Tests added

`platform-api.tasks.v1.test.ts` — 16 tests covering:

- Listing (filters), CRUD, archive, transition, assignees, labels, sprint/module/parent
- Validation failures (unknown query keys, invalid IDs, bodies)
- Permission denial, cross-tenant denial, 404
- Reconciliation → 409, provider unavailable → 503, unexpected failures
- OpenAPI presence + architecture boundary (no Plane imports)

Regression: existing API v1 suite updated; platform-services / contracts / Plane adapter suites green.

---

## Coverage / quality gates

| Gate                                          | Result                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| OpenAPI validate                              | ✅                                                                                           |
| API v1 + task tests                           | 35 passed                                                                                    |
| Platform / Plane / contracts / API regression | 241 passed                                                                                   |
| Task handlers line coverage                   | ~95%                                                                                         |
| Typecheck (`@apzhub/web`)                     | ✅                                                                                           |
| ESLint (task API surface)                     | ✅                                                                                           |
| `pnpm --filter @apzhub/web build`             | Pre-existing failure on `/docs` prerender (`useContext` null) — unrelated to `/api/v1/tasks` |
| Live Plane                                    | Not used                                                                                     |

---

## Technical debt

- Label / sprint / module / parent HTTP verbs compose `getTask` + `updateTask` (no dedicated TaskService methods) — correct for this milestone; finer-grained `task.label|schedule|organise|parent` permissions exist in the catalogue but are not wired to dedicated operations yet.
- Optional `workspaceId` query accepted but not applied as a TaskListFilter field (filter contract has no workspace field).
- Idempotency-Key still accepted into context extras without durable store (pre-existing).

---

## Risks

- Composed relationship endpoints perform two gateway calls (read then update/assign); concurrent updates may race — acceptable until dedicated service methods exist.
- Clients must hold `task.update` (not only catalogue `task.label` etc.) for relationship sub-routes that use `updateTask`.

---

## Recommendation for OSS-101-07

Proceed to **OSS-101-07** only with explicit owner approval. Do not start task-board UI, comments, attachments, activity feeds, notifications, WebSockets, or OSS-110-10 without approval.

---

## Stop condition

**OSS-110-09 complete.** Stop immediately. No further milestones started.
