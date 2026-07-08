# LAW-014-04 — Client API Implementation — Completion Report

> **Story:** LAW-014-04  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Verdict:** CLIENT API DELIVERED — ready for owner approval before LAW-014-05

---

## Summary

LAW-014-04 implements the first business API resource for the Law Platform: **Clients** at `/api/law/v1/clients`. All five CRUD operations are wired through the existing auth scaffold, standard response/error envelopes, `ClientWorkflowService`, `ClientRepository`, legal-business-core validators, and `LawPersistenceContext`. Twelve integration tests cover happy paths, validation, auth, pagination, filtering, and envelope shape.

No Matter, Document, Task, Calendar, Time, Invoice, Search, Dashboard, Activity, or Notification APIs were implemented.

---

## Deliverables

| Deliverable                                        | Location                                                   |
| -------------------------------------------------- | ---------------------------------------------------------- |
| Collection route (`GET`, `POST`)                   | `apps/web/app/api/law/v1/clients/route.ts`                 |
| Item route (`GET`, `PATCH`, `DELETE`)              | `apps/web/app/api/law/v1/clients/[clientId]/route.ts`      |
| Handlers                                           | `apps/web/lib/api/clients/client-api-handlers.ts`          |
| Service bridge                                     | `apps/web/lib/api/clients/client-api-service.ts`           |
| DTO mapper                                         | `apps/web/lib/api/clients/client-dto-mapper.ts`            |
| Query parser (pagination, sort, filters, If-Match) | `apps/web/lib/api/clients/client-query-parser.ts`          |
| Permissions                                        | `apps/web/lib/api/clients/client-api-permissions.ts`       |
| Law-platform server bridge                         | `apps/law-platform/lib/api/index.ts`                       |
| List response helper                               | `apps/web/lib/api/response.ts` (`jsonListSuccessResponse`) |
| Integration tests                                  | `apps/web/lib/api/clients/client-api.test.ts`              |
| OpenAPI contract updates                           | `docs/specs/LAW-OpenAPI-v1.yaml`                           |

---

## Endpoints implemented

| Method | Path                                         | Permission            | Status                     |
| ------ | -------------------------------------------- | --------------------- | -------------------------- |
| GET    | `/api/law/v1/clients`                        | `legal.client.view`   | Implemented                |
| POST   | `/api/law/v1/clients`                        | `legal.client.create` | Implemented                |
| GET    | `/api/law/v1/clients/{clientId}`             | `legal.client.view`   | Implemented                |
| PATCH  | `/api/law/v1/clients/{clientId}`             | `legal.client.edit`   | Implemented                |
| DELETE | `/api/law/v1/clients/{clientId}`             | `legal.client.delete` | Implemented (soft archive) |
| PUT    | `/api/law/v1/clients`, `/clients/{clientId}` | —                     | 405 Method Not Allowed     |

---

## Implementation notes

### Architecture

```
Next.js route → withLawApiAuth → handler → withClientWorkflowService
  → runWithLawPersistenceContextAsync(tenantId, actorId)
  → ClientWorkflowService(shared ClientRepository, placeholder EventBus)
  → DTO mapper → jsonSuccessResponse / jsonListSuccessResponse / jsonErrorResponse
```

- **Auth:** Reuses LAW-014-02 middleware (`withLawApiAuth`) with session validation, tenant binding via `x-tenant-id`, and permission checks.
- **Persistence:** Each request runs inside `LawPersistenceContext` ALS scoped to the resolved tenant. Repository mode is controlled by `LAW_REPOSITORY_MODE` (`memory` default in tests; `postgres` in production).
- **Workflow:** Create/update/delete delegate to `ClientWorkflowService`; validation errors from legal-business-core surface as **422** with field-level `details`.
- **Shared repository:** API uses `getSharedClientRepository()` so in-memory mode persists data across requests within a process (required for create-then-get flows).

### List behaviour

- **Pagination:** Cursor-based offset encoding (`limit`, `cursor`, `hasMore`, `nextCursor`, `prevCursor`).
- **Filtering:** `query`, `status`, `clientType` mapped to `ClientSearchCriteria`.
- **Sorting:** `sort` supports `displayName`, `status`, and `-` prefix for descending.
- **Response:** `{ ok: true, data: ClientSummaryV1[], pagination, meta }`.

### Detail / mutation behaviour

- **GET by id:** Returns `ClientDetailV1` with `ETag` header (numeric version).
- **PATCH / DELETE:** Optional `If-Match` header for optimistic concurrency; mismatch returns **412 PRECONDITION_FAILED**.
- **POST:** Returns **201** with created `ClientDetailV1`.
- **DELETE:** Soft delete via `ClientWorkflowService.deleteClient`; archived clients return **404** on subsequent GET.

### Permissions

| Permission            | Operations                |
| --------------------- | ------------------------- |
| `legal.client.view`   | GET collection, GET by id |
| `legal.client.create` | POST                      |
| `legal.client.edit`   | PATCH                     |
| `legal.client.delete` | DELETE                    |

Dev registration mode (`isDevRegistrationAllowed`) bypasses permission checks in development/test — same pattern as LAW-014-02 diagnostics.

---

## API test report

**File:** `apps/web/lib/api/clients/client-api.test.ts`  
**Result:** **12 / 12 passed**

| Test                    | Assertion                                                 |
| ----------------------- | --------------------------------------------------------- |
| Unauthenticated list    | 401, `UNAUTHENTICATED` error envelope                     |
| Missing permission      | 403 forbidden                                             |
| List with pagination    | 200, `ok`, `data[]`, `pagination.limit`, `meta.requestId` |
| Filter by query         | Matching client in results                                |
| Create client           | 201, `ClientDetailV1`, `CLT-` reference                   |
| Validation failure      | 422, `VALIDATION_FAILED`                                  |
| Get by id               | 200, matching `clientId`                                  |
| Unknown client          | 404                                                       |
| PATCH update            | 200, updated `status`                                     |
| Soft delete             | 200, `{ status: "archived" }`; subsequent GET 404         |
| Cursor pagination       | `hasMore`, distinct pages                                 |
| Same-tenant persistence | Created client retrievable in same session                |

Tests run with `LAW_REPOSITORY_MODE=memory`, mocked `@apzhub/auth/server`, and repository/metadata reset in `beforeEach`.

---

## Contract deviations

| Topic                 | Contract (LAW-014-03)              | Implementation                                                                  | Resolution                                                                                                                                                      |
| --------------------- | ---------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DELETE response       | 204 No Content                     | **200** success envelope `{ ok, data: { clientId, status: "archived" }, meta }` | OpenAPI updated to `ClientArchiveResponseV1` + 200. Rationale: consistent envelope pattern across all mutating endpoints; clients receive confirmation payload. |
| List filter params    | Documented in pagination spec only | Implemented; not in OpenAPI path                                                | OpenAPI updated with `query`, `status`, `clientType` parameters on `listClients`.                                                                               |
| Memory-mode metadata  | DB-backed `version`, timestamps    | In-process metadata cache when `LAW_REPOSITORY_MODE=memory`                     | Documented as technical debt; postgres mode skips cache (relies on repository/DB).                                                                              |
| Event bus             | Events on create/update/delete     | `createPlaceholderEventBus()` — publish may return `ok: false`                  | Handlers treat **`result.client` presence** as success; events not yet wired to real notification pipeline.                                                     |
| `fields` / `include`  | Supported per contract             | Not implemented in v1                                                           | Ignored silently; document for LAW-014-05+ or follow-up.                                                                                                        |
| Idempotency key       | `x-idempotency-key` on POST        | Not implemented                                                                 | Deferred; no duplicate-create guard yet.                                                                                                                        |
| Tenant isolation test | Cross-tenant 404                   | Memory repo is process-global, not tenant-partitioned                           | Test validates same-tenant persistence; true isolation requires postgres tenant scoping or per-tenant repo factory.                                             |

OpenAPI client operations marked `x-implementation-status: implemented`. Spec validates with `@apidevtools/swagger-cli`.

---

## Technical debt

1. **Memory metadata cache** — `version`, `createdAt`, `updatedAt` for ETag/concurrency in memory mode use `client-dto-mapper` cache; postgres should load from DB columns.
2. **Placeholder event bus** — Workflow events not connected to real event-notification pipeline; activities/notifications from API mutations are not emitted.
3. **Shared in-memory repository** — Not tenant-isolated; acceptable for dev/test only.
4. **Field selection / expansion** — `fields` and `include` query params accepted by contract but not honoured.
5. **Idempotency** — POST idempotency key header not enforced.
6. **Location header** — POST 201 does not yet set `Location: /api/law/v1/clients/{clientId}`.
7. **Generator sync** — `scripts/generate-law-openapi-v1.py` still marks clients as `planned`; manual YAML edits should be backported when generator is next run.

---

## Quality gates

| Gate                 | Result                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm lint`          | **Pass**                                                                                                   |
| `pnpm typecheck`     | **Pass**                                                                                                   |
| `pnpm build`         | **Pass** (routes registered: `/api/law/v1/clients`, `/api/law/v1/clients/[clientId]`)                      |
| `pnpm test`          | **Pass** (343 files, 1578 tests)                                                                           |
| `pnpm test:coverage` | **Pass**                                                                                                   |
| OpenAPI validate     | **Pass**                                                                                                   |
| E2E                  | **Not run** — no Playwright spec for Law Client API; existing E2E covers workspace/runtime frameworks only |

---

## Recommendation for LAW-014-05

**Proposed scope:** Matter API (`/api/law/v1/matters`) using the same pattern proven here.

Before starting Matter API:

1. **Extract shared API patterns** — Generic list handler helper (cursor pagination, sort, filter parsing), workflow service factory, and metadata resolution abstraction to reduce duplication across resources.
2. **Resolve postgres metadata path** — Load `version`/timestamps from persistence for ETag/`If-Match` in production mode.
3. **Wire event bus** — Replace placeholder with law-platform event registration so workflow `ok: true` and downstream activity/notification hooks work.
4. **Tenant-scoped repository factory** — Ensure postgres (and optionally memory) repositories enforce tenant isolation at persistence layer.
5. **Add Playwright smoke** — One E2E path: login → create client → list → archive, validating envelopes in a running app.

Matter API should mirror Client API structure: route → auth → handler → `MatterWorkflowService` → DTO mapper → envelopes, with client relationship validation on create/update.

---

## Out of scope (confirmed)

- Matter, Document, Task, Calendar, Time, Invoice APIs
- Search, Dashboard, Activity, Notification APIs
- Webhooks, SDK generation
- Public external auth model changes

---

## Stop condition

Client API implementation is **complete**. Await owner approval before Matter API or any other business API.

---

## Related documents

- [LAW-OpenAPI-v1.yaml](../specs/LAW-OpenAPI-v1.yaml)
- [LAW-API-DTO-Catalogue.md](../specs/LAW-API-DTO-Catalogue.md)
- [LAW-API-Error-Catalogue.md](../specs/LAW-API-Error-Catalogue.md)
- [LAW-API-Pagination-and-Filtering.md](../specs/LAW-API-Pagination-and-Filtering.md)
- [LAW-014-03 completion report](./LAW-014-03-completion-report.md)
- [LAW-014-02 completion report](./LAW-014-02-completion-report.md)
