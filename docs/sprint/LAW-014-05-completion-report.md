# LAW-014-05 — Shared API Framework — Completion Report

> **Story:** LAW-014-05  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Verdict:** SHARED FRAMEWORK DELIVERED — ready for LAW-014-06 (Matter API)

---

## Summary

LAW-014-05 extracts reusable Law API infrastructure from the completed Client API into `apps/web/lib/api/framework/`. The Client API has been refactored to consume the shared helpers with no intentional functional or contract changes. Future resource APIs can mirror the Client module structure with minimal boilerplate.

No Matter, Document, Task, Calendar, Time, Invoice, or Search APIs were implemented.

---

## Deliverables

| Deliverable                                            | Location                                            |
| ------------------------------------------------------ | --------------------------------------------------- |
| Query helpers (pagination, sorting, filtering, fields) | `apps/web/lib/api/framework/query/`                 |
| Response helpers                                       | `apps/web/lib/api/framework/responses.ts`           |
| Error classes and mappers                              | `apps/web/lib/api/framework/errors.ts`              |
| ETag / If-Match helpers                                | `apps/web/lib/api/framework/concurrency.ts`         |
| Validation pipeline                                    | `apps/web/lib/api/framework/validation-pipeline.ts` |
| Workflow runner factory                                | `apps/web/lib/api/framework/workflow-runner.ts`     |
| Resource auth presets                                  | `apps/web/lib/api/framework/resource-auth.ts`       |
| API logging                                            | `apps/web/lib/api/framework/logging.ts`             |
| Request diagnostics                                    | `apps/web/lib/api/framework/diagnostics.ts`         |
| Controller pattern                                     | `apps/web/lib/api/framework/controller.ts`          |
| Framework barrel export                                | `apps/web/lib/api/framework/index.ts`               |
| Refactored Client API                                  | `apps/web/lib/api/clients/`                         |
| Framework tests                                        | `apps/web/lib/api/framework/framework.test.ts`      |
| Shared API framework docs                              | `docs/specs/LAW-API-Framework.md`                   |
| Controller pattern guide                               | `docs/specs/LAW-API-Controller-Pattern.md`          |
| Error mapping guide                                    | `docs/specs/LAW-API-Error-Mapping.md`               |

---

## Shared components delivered

### Query helpers

| Function                | Module                     |
| ----------------------- | -------------------------- |
| `parsePagination()`     | `query/pagination.ts`      |
| `paginateItems()`       | `query/pagination.ts`      |
| `encodeListCursor()`    | `query/pagination.ts`      |
| `parseSorting()`        | `query/sorting.ts`         |
| `sortItems()`           | `query/sorting.ts`         |
| `parseFiltering()`      | `query/filtering.ts`       |
| `parseFieldSelection()` | `query/field-selection.ts` |
| `parseIncludes()`       | `query/field-selection.ts` |

### Response helpers

| Function              | HTTP       |
| --------------------- | ---------- |
| `successResponse()`   | 200        |
| `createdResponse()`   | 201        |
| `updatedResponse()`   | 200 + ETag |
| `archivedResponse()`  | 200        |
| `paginatedResponse()` | 200 list   |

### Error helpers

| Class / Helper                                                 | Code                  | HTTP   |
| -------------------------------------------------------------- | --------------------- | ------ |
| `ValidationError` / `validationErrorResponse()`                | `VALIDATION_FAILED`   | 422    |
| `NotFoundError` / `notFoundResponse()`                         | `NOT_FOUND`           | 404    |
| `ConflictError` / `conflictResponse()`                         | `CONFLICT`            | 409    |
| `PermissionError`                                              | `FORBIDDEN`           | 403    |
| `TenantIsolationError`                                         | `TENANT_MISMATCH`     | 403    |
| `OptimisticConcurrencyError` / `ifMatchPreconditionResponse()` | `PRECONDITION_FAILED` | 412    |
| `translateLawApiError()`                                       | varies                | varies |
| `workflowValidationToResponse()`                               | `VALIDATION_FAILED`   | 422    |

### Other infrastructure

| Component                                    | Purpose                               |
| -------------------------------------------- | ------------------------------------- |
| `createWorkflowRunner()`                     | Tenant-scoped WorkflowService factory |
| `defineResourceAuth()`                       | Permission preset builder             |
| `createLawApiController()`                   | Logging + error translation wrapper   |
| `buildLawApiRequestDiagnostics()`            | Structured request snapshot           |
| `logLawApiRequest()` / `logLawApiResponse()` | Structured JSON logging               |

---

## Client API refactor

| File                        | Change                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `client-query-parser.ts`    | Uses `parsePagination`, `parseSorting`, `parseFiltering`, `sortItems`, `paginateItems`              |
| `client-api-service.ts`     | Uses `createWorkflowRunner`                                                                         |
| `client-api-handlers.ts`    | Uses framework responses, errors, concurrency, validation, controller wrapper, `defineResourceAuth` |
| `client-api-permissions.ts` | Adds `CLIENT_AUTH` object for `defineResourceAuth`                                                  |

OpenAPI contract unchanged. All 12 Client API integration tests pass without modification.

---

## Test report

| Suite                | Result                                |
| -------------------- | ------------------------------------- |
| `framework.test.ts`  | **27 / 27 passed**                    |
| `client-api.test.ts` | **12 / 12 passed** (parity confirmed) |
| Full suite           | **1605 passed**, 42 skipped           |

Framework tests cover: pagination, sorting, filtering, field selection, ETag/If-Match, response helpers, error translation, validation pipeline, resource auth, logging, and diagnostics.

---

## Technical debt

1. **`fields` / `include` parsing only** — Helpers parse query params but do not yet apply sparse fieldsets or expansions to responses.
2. **Repository error translation** — No dedicated mapper from DB/repository exceptions; WorkflowService absorbs outcomes today.
3. **Memory metadata cache** — Client-specific ETag/version cache remains in `client-dto-mapper.ts`; should become a shared `ResourceMetadataResolver` with postgres backing.
4. **Placeholder event bus** — Unchanged from LAW-014-04; workflow events not wired to notification pipeline.
5. **Idempotency** — `x-idempotency-key` not enforced; no framework helper yet.
6. **`runValidationPipeline`** — Basic sequential runner; no schema-validation integration (e.g. Zod/OpenAPI validator).

---

## Quality gates

| Gate                 | Result                |
| -------------------- | --------------------- |
| `pnpm lint`          | **Pass**              |
| `pnpm typecheck`     | **Pass**              |
| `pnpm build`         | **Pass**              |
| `pnpm test`          | **Pass** (1605 tests) |
| `pnpm test:coverage` | **Pass**              |

---

## Recommendation for LAW-014-06

**Proposed scope:** Matter API implementation using the shared framework.

Before or during LAW-014-06:

1. **Extend law-platform API barrel** — Export `MatterWorkflowService`, `getSharedMatterRepository`, matter types/filters.
2. **Create `apps/web/lib/api/matters/`** — Mirror Client module using framework helpers exclusively.
3. **Add routes** — `GET/POST /matters`, `GET/PATCH/DELETE /matters/{matterId}`.
4. **Integration tests** — Copy Client test structure; reset shared matter repository in `beforeEach`.
5. **Optional:** Extract `ResourceMetadataResolver` interface to shared framework before Matter API to unify ETag handling across resources.

The shared framework reduces Matter API implementation to: permissions, DTO mapper, query parser (criteria + sort comparators), service bridge, handlers, routes, and tests.

---

## Out of scope (confirmed)

- Matter, Document, Task, Calendar, Time, Invoice APIs
- Search API, SDK generation, webhooks

---

## Stop condition

Shared API framework is **complete**. Client API refactored. Await owner approval before Matter API (LAW-014-06).

---

## Related documents

- [LAW-API-Framework.md](../specs/LAW-API-Framework.md)
- [LAW-API-Controller-Pattern.md](../specs/LAW-API-Controller-Pattern.md)
- [LAW-API-Error-Mapping.md](../specs/LAW-API-Error-Mapping.md)
- [LAW-014-04 completion report](./LAW-014-04-completion-report.md)
