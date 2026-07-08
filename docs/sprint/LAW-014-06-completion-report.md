# LAW-014-06 — Remaining Business APIs — Completion Report

> **Story:** LAW-014-06  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Verdict:** ALL BUSINESS APIs DELIVERED — ready for LAW-014-07

---

## Summary

LAW-014-06 implements the six remaining Law Platform business APIs using the shared API framework (LAW-014-05) and existing WorkflowService classes. Each resource follows the Client API reference pattern: thin controllers, workflow delegation, standard envelopes, and integration tests with Client API parity.

Search, Dashboard, Activity, Notification, Trust Accounting, and Payment APIs were not implemented.

---

## Endpoint coverage matrix

| Resource                 | GET list | GET by id | POST | PATCH | DELETE/Archive | Routes                                                   | Tests |
| ------------------------ | -------- | --------- | ---- | ----- | -------------- | -------------------------------------------------------- | ----- |
| **Clients** (LAW-014-04) | ✓        | ✓         | ✓    | ✓     | ✓ archive      | `/clients`, `/clients/{clientId}`                        | 12    |
| **Matters**              | ✓        | ✓         | ✓    | ✓     | ✓ archive      | `/matters`, `/matters/{matterId}`                        | 12    |
| **Documents**            | ✓        | ✓         | ✓    | ✓     | ✓ archive      | `/documents`, `/documents/{documentId}`                  | 12    |
| **Tasks**                | ✓        | ✓         | ✓    | ✓     | ✓ archive      | `/tasks`, `/tasks/{taskId}`                              | 12    |
| **Calendar events**      | ✓        | ✓         | ✓    | ✓     | ✓ cancel       | `/calendar-events`, `/calendar-events/{calendarEventId}` | 12    |
| **Time entries**         | ✓        | ✓         | ✓    | ✓     | ✓ delete       | `/time-entries`, `/time-entries/{timeEntryId}`           | 12    |
| **Invoices**             | ✓        | ✓         | ✓    | ✓     | ✓ cancel       | `/invoices`, `/invoices/{invoiceId}`                     | 12    |

**Total business API integration tests:** 84 (72 new + 12 Client)

---

## Implementation summary

### Architecture (all resources)

```
Route → withLawApiAuth → createLawApiController(handler)
  → parse query/body → with*WorkflowService(context, service => ...)
    → WorkflowService (@apzhub/law-platform)
      → paginatedResponse / successResponse / archivedResponse / error helpers
```

### Module layout (per entity)

| Layer          | Files                                                  |
| -------------- | ------------------------------------------------------ |
| Permissions    | `{entity}-api-permissions.ts` + `defineResourceAuth`   |
| DTO mapper     | `{entity}-dto-mapper.ts` + `createEntityMetadataCache` |
| Query parser   | `{entity}-query-parser.ts` + framework query helpers   |
| Service bridge | `{entity}-api-service.ts` + `createWorkflowRunner`     |
| Handlers       | `{entity}-api-handlers.ts`                             |
| Tests          | `{entity}-api.test.ts`                                 |
| Routes         | `app/api/law/v1/{path}/route.ts` + `[id]/route.ts`     |

### Law platform bridge

Extended `apps/law-platform/lib/api/index.ts` with exports for all six WorkflowServices, form types, list criteria, repository factories, and filter helpers.

### Shared infrastructure added

| Component             | Location                             |
| --------------------- | ------------------------------------ |
| Entity metadata cache | `framework/entity-metadata-cache.ts` |
| DTO input helpers     | `framework/dto-input-helpers.ts`     |
| Test seed helpers     | `testing/law-api-test-helpers.ts`    |

---

## Permissions enforced

| Resource | View                  | Create                  | Edit                  | Delete/Archive/Cancel    |
| -------- | --------------------- | ----------------------- | --------------------- | ------------------------ |
| Matter   | `legal.matter.view`   | `legal.matter.create`   | `legal.matter.edit`   | `legal.matter.archive`   |
| Document | `legal.document.view` | `legal.document.create` | `legal.document.edit` | `legal.document.archive` |
| Task     | `legal.task.view`     | `legal.task.create`     | `legal.task.edit`     | `legal.task.archive`     |
| Calendar | `legal.calendar.view` | `legal.calendar.create` | `legal.calendar.edit` | `legal.calendar.cancel`  |
| Time     | `legal.time.view`     | `legal.time.create`     | `legal.time.edit`     | `legal.time.delete`      |
| Invoice  | `legal.invoice.view`  | `legal.invoice.create`  | `legal.invoice.edit`  | `legal.invoice.cancel`   |

---

## Test report

| Suite                  | Result                      |
| ---------------------- | --------------------------- |
| Matter API             | 12 / 12                     |
| Document API           | 12 / 12                     |
| Task API               | 12 / 12                     |
| Calendar Event API     | 12 / 12                     |
| Time Entry API         | 12 / 12                     |
| Invoice API            | 12 / 12                     |
| Client API (parity)    | 12 / 12                     |
| Framework (LAW-014-05) | 27 / 27                     |
| **Full suite**         | **1677 passed**, 42 skipped |

Each entity test suite covers: unauthorized, forbidden, list + pagination, filtering, create, validation failure, get by id, 404, update, archive/delete, cursor pagination, tenant persistence.

---

## OpenAPI updates

`docs/specs/LAW-OpenAPI-v1.yaml`:

- All Matter, Document, Task, Calendar, Time, and Invoice CRUD operations marked `x-implementation-status: implemented`
- Spec validates with `@apidevtools/swagger-cli`

### Contract deviations (documented)

| Topic                | OpenAPI                         | Implementation                                | Notes                                                                                       |
| -------------------- | ------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| DELETE responses     | 204 No Content (most resources) | **200** success envelope with archive payload | Consistent with Client API (`archivedResponse`); aligns with LAW-014-04 envelope standard   |
| List filter params   | Partially specified             | Implemented per domain `*ListCriteria`        | Filter query params follow pagination spec; OpenAPI path params to be expanded in follow-up |
| `fields` / `include` | Specified                       | Parsed, not applied                           | Deferred — helpers exist (`parseFieldSelection`, `parseIncludes`)                           |
| Invoice create       | `lineItems[]`                   | Mapped to workflow `timeEntryIds`             | Line items with `timeEntryId` drive invoice composition                                     |

---

## Remaining technical debt

1. **DELETE 204 vs 200 envelope** — OpenAPI still shows 204 for several resources; implementation uses 200 archive envelopes (Client pattern). Update OpenAPI DELETE response schemas to match or document permanent deviation.
2. **Memory metadata cache** — Per-entity `createEntityMetadataCache` for ETag/version in memory mode; postgres should load from DB.
3. **Placeholder event bus** — Workflow events not connected to notification pipeline.
4. **Field selection / expansion** — Query params parsed but not applied to responses.
5. **Idempotency keys** — `x-idempotency-key` not enforced on POST.
6. **Action endpoints** — `POST /tasks/{id}/complete`, `POST /invoices/{id}/mark-paid` specified in planning but not in v1 YAML; not implemented.
7. **Matter workspace endpoint** — `GET /matters/{id}/workspace` planned but not in scope for LAW-014-06.
8. **True tenant isolation tests** — Memory repositories are process-global; cross-tenant 404 tests require postgres tenant scoping.

---

## Quality gates

| Gate                 | Result                                                 |
| -------------------- | ------------------------------------------------------ |
| `pnpm lint`          | **Pass**                                               |
| `pnpm typecheck`     | **Pass**                                               |
| `pnpm build`         | **Pass** (all 7 business resource routes registered)   |
| `pnpm test`          | **Pass** (1677 tests)                                  |
| `pnpm test:coverage` | **Pass**                                               |
| OpenAPI validate     | **Pass**                                               |
| E2E                  | **Not run** — no Playwright spec for Law business APIs |

---

## Recommendation for LAW-014-07

**Proposed scope:** Cross-cutting API completion — choose one or more:

1. **Search API** — `GET/POST /search` using existing legal search ranking
2. **Action endpoints** — Task complete, invoice mark-paid (if added to OpenAPI)
3. **Matter workspace API** — `GET /matters/{matterId}/workspace`
4. **OpenAPI alignment** — DELETE response schemas, list filter parameters, archive response DTOs for all resources
5. **Postgres metadata path** — Unified ETag/version from persistence for production
6. **Event bus wiring** — Connect API mutations to activity/notification pipeline
7. **Playwright E2E smoke** — Login → create client → matter → document flow

Await owner prioritisation before webhooks, SDK generation, or external integrations.

---

## Out of scope (confirmed)

- Trust Accounting, Payment, Reporting APIs
- Search, Dashboard, Activity, Notification API changes
- Webhooks, SDK generation, background workers, external integrations

---

## Stop condition

All remaining business APIs are **implemented**. Await owner approval before webhooks, SDK generation, or external integrations.

---

## Related documents

- [LAW-API-Framework.md](../specs/LAW-API-Framework.md)
- [LAW-API-Controller-Pattern.md](../specs/LAW-API-Controller-Pattern.md)
- [LAW-OpenAPI-v1.yaml](../specs/LAW-OpenAPI-v1.yaml)
- [LAW-014-05 completion report](./LAW-014-05-completion-report.md)
- [LAW-014-04 completion report](./LAW-014-04-completion-report.md)
