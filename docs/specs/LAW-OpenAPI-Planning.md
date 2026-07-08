# LAW — OpenAPI Planning

> **Milestone:** LAW-014 — Integration Foundation  
> **Status:** **OpenAPI v1 delivered** (LAW-014-03) — see [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)  
> **Authority:** [LAW-API-Design-Standard](./LAW-API-Design-Standard.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

This document plans the Law Platform OpenAPI 3.1 specification: API groups, future endpoints, schemas, security schemes, versioning, SDK generation, and documentation strategy.

**OpenAPI file:** [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml) (LAW-014-03)

---

## 2. Specification metadata (planned)

```yaml
openapi: 3.1.0
info:
  title: APZHUB Law Platform API
  version: 1.0.0
  description: Tenant-scoped legal practice management API
  contact:
    name: APZHUB API Support
  license:
    name: Proprietary
servers:
  - url: https://api.apzhub.com/api/law/v1
    description: Production
  - url: https://staging.apzhub.com/api/law/v1
    description: Staging
```

---

## 3. API groups

| Tag         | Description                  | Priority |
| ----------- | ---------------------------- | -------- |
| `Clients`   | Client directory and CRM     | P1       |
| `Matters`   | Matter lifecycle             | P1       |
| `Documents` | Document metadata            | P2       |
| `Tasks`     | Task management              | P2       |
| `Calendar`  | Calendar events              | P2       |
| `Time`      | Time entries                 | P2       |
| `Billing`   | Invoices and line items      | P2       |
| `Search`    | Unified search               | P3       |
| `Webhooks`  | Subscription management      | P3       |
| `Admin`     | API keys, integration config | P3       |
| `Health`    | Readiness probes             | P1       |

---

## 4. Future endpoints (v1 catalogue)

### 4.1 Clients

| Method | Path                           | Operation ID         | Permission            |
| ------ | ------------------------------ | -------------------- | --------------------- |
| GET    | `/clients`                     | `listClients`        | `legal.client.view`   |
| POST   | `/clients`                     | `createClient`       | `legal.client.create` |
| GET    | `/clients/{clientId}`          | `getClient`          | `legal.client.view`   |
| PATCH  | `/clients/{clientId}`          | `updateClient`       | `legal.client.edit`   |
| DELETE | `/clients/{clientId}`          | `deleteClient`       | `legal.client.delete` |
| GET    | `/clients/{clientId}/matters`  | `listClientMatters`  | `legal.client.view`   |
| GET    | `/clients/{clientId}/invoices` | `listClientInvoices` | `legal.client.view`   |

### 4.2 Matters

| Method | Path                            | Operation ID         | Permission                    |
| ------ | ------------------------------- | -------------------- | ----------------------------- |
| GET    | `/matters`                      | `listMatters`        | `legal.matter.view`           |
| POST   | `/matters`                      | `createMatter`       | `legal.matter.create`         |
| GET    | `/matters/{matterId}`           | `getMatter`          | `legal.matter.view`           |
| PATCH  | `/matters/{matterId}`           | `updateMatter`       | `legal.matter.edit`           |
| DELETE | `/matters/{matterId}`           | `archiveMatter`      | `legal.matter.archive`        |
| GET    | `/matters/{matterId}/workspace` | `getMatterWorkspace` | `legal.matter.workspace.open` |

### 4.3 Documents

| Method | Path                                 | Operation ID            | Permission               |
| ------ | ------------------------------------ | ----------------------- | ------------------------ |
| GET    | `/documents`                         | `listDocuments`         | `legal.document.view`    |
| POST   | `/documents`                         | `createDocument`        | `legal.document.create`  |
| GET    | `/documents/{documentId}`            | `getDocument`           | `legal.document.view`    |
| PATCH  | `/documents/{documentId}`            | `updateDocument`        | `legal.document.edit`    |
| DELETE | `/documents/{documentId}`            | `archiveDocument`       | `legal.document.archive` |
| POST   | `/documents/{documentId}/upload-url` | `requestDocumentUpload` | `legal.document.create`  |

### 4.4 Tasks

| Method | Path                       | Operation ID   | Permission            |
| ------ | -------------------------- | -------------- | --------------------- |
| GET    | `/tasks`                   | `listTasks`    | `legal.task.view`     |
| POST   | `/tasks`                   | `createTask`   | `legal.task.create`   |
| GET    | `/tasks/{taskId}`          | `getTask`      | `legal.task.view`     |
| PATCH  | `/tasks/{taskId}`          | `updateTask`   | `legal.task.edit`     |
| POST   | `/tasks/{taskId}/complete` | `completeTask` | `legal.task.complete` |
| DELETE | `/tasks/{taskId}`          | `archiveTask`  | `legal.task.archive`  |

### 4.5 Calendar events

| Method | Path                                        | Operation ID          | Permission              |
| ------ | ------------------------------------------- | --------------------- | ----------------------- |
| GET    | `/calendar-events`                          | `listCalendarEvents`  | `legal.calendar.view`   |
| POST   | `/calendar-events`                          | `createCalendarEvent` | `legal.calendar.create` |
| GET    | `/calendar-events/{calendarEventId}`        | `getCalendarEvent`    | `legal.calendar.view`   |
| PATCH  | `/calendar-events/{calendarEventId}`        | `updateCalendarEvent` | `legal.calendar.edit`   |
| POST   | `/calendar-events/{calendarEventId}/cancel` | `cancelCalendarEvent` | `legal.calendar.cancel` |

### 4.6 Time entries

| Method | Path                          | Operation ID      | Permission          |
| ------ | ----------------------------- | ----------------- | ------------------- |
| GET    | `/time-entries`               | `listTimeEntries` | `legal.time.view`   |
| POST   | `/time-entries`               | `createTimeEntry` | `legal.time.create` |
| GET    | `/time-entries/{timeEntryId}` | `getTimeEntry`    | `legal.time.view`   |
| PATCH  | `/time-entries/{timeEntryId}` | `updateTimeEntry` | `legal.time.edit`   |
| DELETE | `/time-entries/{timeEntryId}` | `deleteTimeEntry` | `legal.time.delete` |

### 4.7 Invoices

| Method | Path                              | Operation ID               | Permission                |
| ------ | --------------------------------- | -------------------------- | ------------------------- |
| GET    | `/invoices`                       | `listInvoices`             | `legal.invoice.view`      |
| POST   | `/invoices`                       | `createInvoice`            | `legal.invoice.create`    |
| GET    | `/invoices/{invoiceId}`           | `getInvoice`               | `legal.invoice.view`      |
| PATCH  | `/invoices/{invoiceId}`           | `updateInvoice`            | `legal.invoice.edit`      |
| POST   | `/invoices/{invoiceId}/cancel`    | `cancelInvoice`            | `legal.invoice.cancel`    |
| POST   | `/invoices/{invoiceId}/mark-paid` | `markInvoicePaid`          | `legal.invoice.mark-paid` |
| GET    | `/invoices/{invoiceId}/pdf`       | `getInvoicePdfPlaceholder` | `legal.invoice.view`      |

### 4.8 Search

| Method | Path      | Operation ID          | Permission             |
| ------ | --------- | --------------------- | ---------------------- |
| GET    | `/search` | `searchLegalEntities` | `legal.search.execute` |

### 4.9 Webhooks (admin)

| Method | Path                                      | Operation ID                | Permission                 |
| ------ | ----------------------------------------- | --------------------------- | -------------------------- |
| GET    | `/webhook-subscriptions`                  | `listWebhookSubscriptions`  | `legal.admin.integrations` |
| POST   | `/webhook-subscriptions`                  | `createWebhookSubscription` | `legal.admin.integrations` |
| DELETE | `/webhook-subscriptions/{subscriptionId}` | `deleteWebhookSubscription` | `legal.admin.integrations` |

### 4.10 Health

| Method | Path      | Operation ID        | Auth |
| ------ | --------- | ------------------- | ---- |
| GET    | `/health` | `getLegalApiHealth` | None |
| GET    | `/ready`  | `getLegalApiReady`  | None |

---

## 5. Schema planning

### 5.1 Core schemas

| Schema                  | Purpose                             |
| ----------------------- | ----------------------------------- |
| `ClientV1`              | Client response                     |
| `CreateClientV1Request` | Create body                         |
| `UpdateClientV1Request` | PATCH body                          |
| `MatterV1`              | Matter response                     |
| `DocumentV1`            | Document metadata response          |
| `TaskV1`                | Task response                       |
| `CalendarEventV1`       | Calendar event response             |
| `TimeEntryV1`           | Time entry response                 |
| `InvoiceV1`             | Invoice with embedded `lineItems[]` |
| `InvoiceLineItemV1`     | Line item                           |
| `ErrorResponse`         | Standard error envelope             |
| `PaginationMeta`        | Cursor pagination                   |
| `ResponseMeta`          | requestId, correlationId            |

### 5.2 Shared components

```yaml
components:
  schemas:
    Uuid:
      type: string
      format: uuid
    IsoDateTime:
      type: string
      format: date-time
    ClientStatus:
      type: string
      enum: [prospect, active, inactive, archived]
    MatterStatus:
      type: string
      enum: [open, pending, on_hold, closed, archived]
    InvoiceStatus:
      type: string
      enum: [draft, sent, partial, paid, void]
    BillingStatus:
      type: string
      enum: [unbilled, billed, written_off]
```

### 5.3 Schema ↔ domain mapping

| OpenAPI schema          | Domain source                               |
| ----------------------- | ------------------------------------------- |
| `ClientV1`              | `Client` from `@apzhub/legal-business-core` |
| `CreateClientV1Request` | `ClientFormValues`                          |
| `InvoiceV1`             | `Invoice` + `InvoiceLineItem[]`             |

Mappers live in `apps/law-platform/lib/api/mappers/` (future) — not generated from domain types directly.

---

## 6. Security schemes

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: BetterAuth session token
    ApiKeyAuth:
      type: apiKey
      in: header
      name: Authorization
      description: "Format: ApiKey {keyId}:{secret}"
```

### Default security

```yaml
security:
  - BearerAuth: []
  - ApiKeyAuth: []
```

Health endpoints: `security: []`.

---

## 7. Versioning strategy

| Aspect        | Approach                                       |
| ------------- | ---------------------------------------------- |
| Spec version  | `info.version` tracks API release (semver)     |
| URL version   | `/api/v1/` frozen per major                    |
| Schema suffix | `V1` in component names                        |
| Deprecation   | `deprecated: true` + `x-sunset-date` extension |
| Changelog     | `docs/releases/legal-api-v1.md` per release    |

### Breaking change policy

Requires `/api/v2/`:

- Remove response field
- Change field type
- Remove endpoint
- Tighten validation (previously accepted values rejected)

---

## 8. SDK generation strategy

### 8.1 Target languages (phased)

| Phase | Language   | Package                              |
| ----- | ---------- | ------------------------------------ |
| 1     | TypeScript | `@apzhub/legal-api-client`           |
| 2     | Python     | `apzhub-legal` (future)              |
| 3     | C#         | `Apzhub.Legal` (future — enterprise) |

### 8.2 Generation pipeline (planned)

```text
OpenAPI 3.1 YAML
    ↓
openapi-generator-cli (typescript-fetch)
    ↓
packages/legal-api-client/
    ↓
pnpm build + publish (private registry)
```

### 8.3 SDK features

- Typed request/response models
- Automatic `X-Correlation-Id` injection
- `X-Idempotency-Key` helper for creates
- Retry with backoff on 429/503
- Error type discrimination (`ValidationError`, `NotFoundError`, etc.)

**LAW-014 does not generate SDKs.** First SDK story: LAW-014-15.

---

## 9. Documentation strategy

| Artifact             | Audience              | Location                                     |
| -------------------- | --------------------- | -------------------------------------------- |
| OpenAPI spec         | Developers, codegen   | `docs/specs/LAW-OpenAPI-v1.yaml`             |
| Redoc / Stoplight    | Interactive reference | `https://docs.apzhub.com/legal-api`          |
| Quick start guide    | Integrators           | `docs/developer/legal-api-quick-start.md`    |
| Authentication guide | Integrators           | `docs/developer/legal-api-authentication.md` |
| Webhook guide        | Integrators           | `docs/developer/legal-api-webhooks.md`       |
| Changelog            | All                   | `docs/releases/legal-api-*.md`               |
| Postman collection   | QA / partners         | Generated from OpenAPI                       |

### Documentation principles

- Every endpoint has description + example request/response
- Permission requirements documented per operation
- Error codes linked to catalogue
- Sandbox tenant for partner testing

---

## 10. Generation tooling (planned)

| Tool                                  | Purpose                               |
| ------------------------------------- | ------------------------------------- |
| `openapi-typescript`                  | Type-only generation for internal use |
| `@openapitools/openapi-generator-cli` | Full client SDK                       |
| `spectral`                            | Lint OpenAPI against APZHUB rules     |
| `openapi-diff`                        | Breaking change detection in CI       |

CI gate (future): OpenAPI diff must pass on PRs touching `docs/openapi/`.

---

## 11. Related documents

| Document                                                                                            | Purpose              |
| --------------------------------------------------------------------------------------------------- | -------------------- |
| [LAW-API-Design-Standard](./LAW-API-Design-Standard.md)                                             | Conventions          |
| [LAW-Integration-Reference-Architecture](../architecture/LAW-Integration-Reference-Architecture.md) | Architecture         |
| [LAW-014 Backlog](../backlog/LAW-014-integration-foundation-backlog.md)                             | Implementation order |

---

## 12. Planning note

Endpoint catalogue mirrors existing workflow capabilities and repository filters. No endpoint is authorised for implementation until the corresponding LAW-014-xx story is approved.
