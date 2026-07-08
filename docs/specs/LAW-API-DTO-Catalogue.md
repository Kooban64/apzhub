# LAW — API DTO Catalogue

> **Story:** LAW-014-03  
> **Status:** Specification authority  
> **OpenAPI:** [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)  
> **Base path:** `/api/law/v1/`  
> **Last updated:** 2026-07-06

---

## 1. Purpose

This catalogue defines all Law Platform API v1 data transfer objects. Schemas are authoritative in OpenAPI; this document provides a human-readable index and mapping to domain types.

**No controllers or persistence are implemented in LAW-014-03.**

---

## 2. Envelope DTOs

| DTO              | OpenAPI schema            | Description                               |
| ---------------- | ------------------------- | ----------------------------------------- |
| Success envelope | inline                    | `{ ok: true, data, meta }`                |
| List envelope    | inline                    | `{ ok: true, data[], pagination, meta }`  |
| Error envelope   | `ErrorEnvelope`           | `{ ok: false, error, meta }`              |
| Validation error | `ValidationErrorEnvelope` | Error with `details[]` field errors       |
| Response meta    | `ResponseMeta`            | `requestId`, `correlationId`, `timestamp` |
| Pagination meta  | `PaginationMeta`          | Cursor pagination state                   |

---

## 3. Shared primitives

| DTO                 | Schema               | Description                                |
| ------------------- | -------------------- | ------------------------------------------ |
| Lookup reference    | `LookupReferenceV1`  | `{ id, reference, label, href? }`          |
| Money amount        | `MoneyAmount`        | `{ amount, currency }` — decimal as string |
| Custom fields       | `CustomFields`       | String map for tenant extensions           |
| Tags                | `Tags`               | String array                               |
| Resource timestamps | `ResourceTimestamps` | `createdAt`, `updatedAt`                   |
| Versioned resource  | `VersionedResource`  | `version` for optimistic concurrency       |

---

## 4. Client DTOs

| DTO            | Schema                  | Use        |
| -------------- | ----------------------- | ---------- |
| Summary        | `ClientSummaryV1`       | List rows  |
| Detail         | `ClientDetailV1`        | GET single |
| Create request | `CreateClientV1Request` | POST       |
| Update request | `UpdateClientV1Request` | PATCH      |

**Domain mapping:** `Client` from `@apzhub/legal-business-core`

| Field             | Type   | Notes                                        |
| ----------------- | ------ | -------------------------------------------- |
| `clientId`        | string | UUID or platform ID                          |
| `clientReference` | string | e.g. `CLT-2026-00042`                        |
| `displayName`     | string | Required                                     |
| `clientType`      | enum   | `individual`, `organisation`                 |
| `status`          | enum   | `prospect`, `active`, `inactive`, `archived` |

---

## 5. Matter DTOs

| DTO            | Schema                  | Use        |
| -------------- | ----------------------- | ---------- |
| Summary        | `MatterSummaryV1`       | List rows  |
| Detail         | `MatterDetailV1`        | GET single |
| Create request | `CreateMatterV1Request` | POST       |
| Update request | `UpdateMatterV1Request` | PATCH      |

**Domain mapping:** `Matter`

| Field             | Type   | Notes                                                                   |
| ----------------- | ------ | ----------------------------------------------------------------------- |
| `matterReference` | string | e.g. `MAT-2026-00118`                                                   |
| `matterStatus`    | enum   | Includes `prospect`, `open`, `pending`, `on_hold`, `closed`, `archived` |
| `priority`        | enum   | `low`, `normal`, `high`, `urgent`                                       |
| `leadAttorneyId`  | string | Required on create                                                      |

---

## 6. Document DTOs

| DTO            | Schema                    | Use           |
| -------------- | ------------------------- | ------------- |
| Summary        | `DocumentSummaryV1`       | List rows     |
| Detail         | `DocumentDetailV1`        | GET single    |
| Create request | `CreateDocumentV1Request` | POST metadata |
| Update request | `UpdateDocumentV1Request` | PATCH         |

**Domain mapping:** `Document`

Binary upload is out of band via future `POST /documents/{id}/upload-url` (planned LAW-014-08).

---

## 7. Task DTOs

| DTO            | Schema                | Use        |
| -------------- | --------------------- | ---------- |
| Summary        | `TaskSummaryV1`       | List rows  |
| Detail         | `TaskDetailV1`        | GET single |
| Create request | `CreateTaskV1Request` | POST       |
| Update request | `UpdateTaskV1Request` | PATCH      |

**Domain mapping:** `Task`

Action endpoint `POST /tasks/{taskId}/complete` is documented in OpenAPI planning; contract TBD in implementation story.

---

## 8. Calendar event DTOs

| DTO            | Schema                         | Use        |
| -------------- | ------------------------------ | ---------- |
| Summary        | `CalendarEventSummaryV1`       | List rows  |
| Detail         | `CalendarEventDetailV1`        | GET single |
| Create request | `CreateCalendarEventV1Request` | POST       |
| Update request | `UpdateCalendarEventV1Request` | PATCH      |

**Domain mapping:** `CalendarEvent`

---

## 9. Time entry DTOs

| DTO            | Schema                     | Use        |
| -------------- | -------------------------- | ---------- |
| Summary        | `TimeEntrySummaryV1`       | List rows  |
| Detail         | `TimeEntryDetailV1`        | GET single |
| Create request | `CreateTimeEntryV1Request` | POST       |
| Update request | `UpdateTimeEntryV1Request` | PATCH      |

**Domain mapping:** `TimeEntry`

---

## 10. Invoice DTOs

| DTO            | Schema                   | Use                           |
| -------------- | ------------------------ | ----------------------------- |
| Summary        | `InvoiceSummaryV1`       | List rows                     |
| Detail         | `InvoiceDetailV1`        | GET single with `lineItems[]` |
| Line item      | `InvoiceLineItemV1`      | Embedded in detail            |
| Create request | `CreateInvoiceV1Request` | POST                          |
| Update request | `UpdateInvoiceV1Request` | PATCH (draft only)            |

**Domain mapping:** `Invoice`, `InvoiceLineItem`

---

## 11. Search DTOs

| DTO        | Schema           | Use                                                       |
| ---------- | ---------------- | --------------------------------------------------------- |
| Query body | `SearchQueryV1`  | POST `/search`                                            |
| Result     | `SearchResultV1` | `{ query, hits[] }`                                       |
| Hit        | `SearchHitV1`    | `{ entityType, entityId, reference, title, score, href }` |

GET `/search?query=` uses the same result shape.

---

## 12. Dashboard DTOs

| DTO                 | Schema                 | Use                        |
| ------------------- | ---------------------- | -------------------------- |
| Executive dashboard | `ExecutiveDashboardV1` | GET `/dashboard/executive` |
| Metrics             | `DashboardMetricsV1`   | KPI block                  |
| Link item           | `DashboardLinkItemV1`  | List section rows          |

**Internal mapping:** `ExecutiveDashboardSnapshot` (LAW-013-01 composition)

---

## 13. Activity DTOs

| DTO      | Schema       | Use                         |
| -------- | ------------ | --------------------------- |
| Activity | `ActivityV1` | List and detail (read-only) |

Activities are system-generated from domain events. No create/update DTOs.

---

## 14. Notification DTOs

| DTO            | Schema                        | Use              |
| -------------- | ----------------------------- | ---------------- |
| Notification   | `NotificationV1`              | List and detail  |
| Update request | `UpdateNotificationV1Request` | PATCH read state |

---

## 15. Infrastructure DTOs

| DTO         | Schema          | Status                       |
| ----------- | --------------- | ---------------------------- |
| Health      | `HealthV1`      | **Implemented** (LAW-014-01) |
| Diagnostics | `DiagnosticsV1` | **Implemented** (LAW-014-02) |

---

## 16. DTO naming convention

| Pattern                   | Example                          |
| ------------------------- | -------------------------------- |
| `{Entity}SummaryV1`       | List projection                  |
| `{Entity}DetailV1`        | Full read model                  |
| `Create{Entity}V1Request` | POST body                        |
| `Update{Entity}V1Request` | PATCH body (all fields optional) |

Major version suffix `V1` is required on all public schemas. Breaking changes require `V2` schemas and `/api/law/v2/`.

---

## 17. Related documents

| Document                                                                  | Purpose                   |
| ------------------------------------------------------------------------- | ------------------------- |
| [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)                              | Machine-readable contract |
| [LAW-API-Error-Catalogue](./LAW-API-Error-Catalogue.md)                   | Error codes               |
| [LAW-API-Pagination-and-Filtering](./LAW-API-Pagination-and-Filtering.md) | List query standards      |
| [LAW-API-Examples](./LAW-API-Examples.md)                                 | Request/response examples |
