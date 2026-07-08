# LAW — Shared API Framework

> **Story:** LAW-014-05  
> **Status:** Implementation authority  
> **Location:** `apps/web/lib/api/framework/`  
> **Last updated:** 2026-07-06

---

## Overview

The Law API framework extracts reusable infrastructure from the Client API (LAW-014-04) so future resource APIs (Matter, Document, Task, etc.) require minimal boilerplate.

Import from:

```typescript
import {
  parsePagination,
  successResponse,
  notFoundResponse,
  createWorkflowRunner,
} from "@/lib/api";
```

---

## Module map

| Module                             | Purpose                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `framework/query/`                 | Pagination, sorting, filtering, field selection       |
| `framework/responses.ts`           | Semantic success response helpers                     |
| `framework/errors.ts`              | Typed errors and envelope mappers                     |
| `framework/concurrency.ts`         | ETag and If-Match handling                            |
| `framework/validation-pipeline.ts` | Request validation helpers                            |
| `framework/workflow-runner.ts`     | WorkflowService factory with persistence scope        |
| `framework/resource-auth.ts`       | Permission preset builder                             |
| `framework/logging.ts`             | Structured request/response logging                   |
| `framework/diagnostics.ts`         | Request diagnostics snapshot                          |
| `framework/controller.ts`          | Controller wrapper with logging and error translation |

---

## Query helpers

### Pagination

```typescript
const { limit, cursorOffset } = parsePagination(searchParams);
const { page, pagination } = paginateItems(items, limit, cursorOffset);
```

- Default limit: 25, max: 100
- Cursor encoding: base64url JSON `{ offset }`

### Sorting

```typescript
const sort = parseSorting(searchParams, { defaultSort: ["displayName"] });
const sorted = sortItems(items, sort, comparators, ["displayName"]);
```

- Supports `-field` for descending order
- Unknown sort fields are skipped

### Filtering

```typescript
const filters = parseFiltering(searchParams, {
  queryParam: "query",
  enumParams: ["status", "clientType"],
});
```

### Field selection

```typescript
const fields = parseFieldSelection(searchParams); // sparse fieldsets (not yet applied)
const includes = parseIncludes(searchParams); // expansions (not yet applied)
```

---

## Response helpers

| Helper                | HTTP       | Use                            |
| --------------------- | ---------- | ------------------------------ |
| `successResponse()`   | 200        | Standard read/mutation success |
| `createdResponse()`   | 201        | Resource created               |
| `updatedResponse()`   | 200 + ETag | Resource updated               |
| `archivedResponse()`  | 200        | Soft delete/archive            |
| `paginatedResponse()` | 200        | List with pagination block     |

All helpers delegate to the core envelope builders in `response.ts` and include tracing headers.

---

## Error helpers

Controllers must not manually construct error envelopes. Use typed errors or response helpers:

| Error class                  | Code                  | HTTP |
| ---------------------------- | --------------------- | ---- |
| `ValidationError`            | `VALIDATION_FAILED`   | 422  |
| `NotFoundError`              | `NOT_FOUND`           | 404  |
| `ConflictError`              | `CONFLICT`            | 409  |
| `PermissionError`            | `FORBIDDEN`           | 403  |
| `TenantIsolationError`       | `TENANT_MISMATCH`     | 403  |
| `OptimisticConcurrencyError` | `PRECONDITION_FAILED` | 412  |

Helpers: `notFoundResponse()`, `validationErrorResponse()`, `workflowValidationToResponse()`, `translateLawApiError()`.

See [LAW-API-Error-Mapping.md](./LAW-API-Error-Mapping.md).

---

## Concurrency

```typescript
const version = parseIfMatchVersion(request.headers.get("if-match"));
const failed = ifMatchPreconditionResponse(context, version, currentVersion);
if (failed) return failed;
```

- `generateETag(version)` for response headers
- `validateIfMatch()` / `assertIfMatchVersion()` for programmatic checks

---

## Workflow runner

```typescript
const runner = createWorkflowRunner({
  createService: (context) => new ClientWorkflowService({ ... }),
});

await runner.withService(context, (service) => {
  // business logic via WorkflowService
});
```

Binds `LawPersistenceContext` (tenant + actor) via AsyncLocalStorage. Business logic stays in WorkflowService classes.

---

## Resource auth presets

```typescript
const auth = defineResourceAuth({
  view: "legal.client.view",
  create: "legal.client.create",
  edit: "legal.client.edit",
  delete: "legal.client.delete",
});

export const CLIENT_LIST_AUTH = auth.list;
```

---

## Controller pattern

Handlers are wrapped with `createLawApiController()` for logging and error translation:

```typescript
export const handleListClients = createLawApiController(handleListClientsImpl, {
  operation: "listClients",
});
```

See [LAW-API-Controller-Pattern.md](./LAW-API-Controller-Pattern.md).

---

## Entity module structure

Each resource API adds a folder under `apps/web/lib/api/{entity}/`:

```
clients/
  {entity}-api-permissions.ts   # Permission constants + CLIENT_AUTH
  {entity}-dto-mapper.ts        # OpenAPI DTO mapping
  {entity}-query-parser.ts      # Entity-specific criteria + framework query helpers
  {entity}-api-service.ts       # Workflow runner + form value mapping
  {entity}-api-handlers.ts      # Thin HTTP handlers
  {entity}-api.test.ts          # Integration tests
  index.ts
```

---

## Related documents

- [LAW-API-Controller-Pattern.md](./LAW-API-Controller-Pattern.md)
- [LAW-API-Error-Mapping.md](./LAW-API-Error-Mapping.md)
- [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)
- [LAW-014-04 completion report](../sprint/LAW-014-04-completion-report.md)
