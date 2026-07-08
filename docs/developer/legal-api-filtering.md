# Law Platform API — Filtering

> **Story:** LAW-014-07  
> **Authority:** [LAW-API-Pagination-and-Filtering.md](../specs/LAW-API-Pagination-and-Filtering.md)

---

## Common parameters

| Parameter      | Type   | Description                                                |
| -------------- | ------ | ---------------------------------------------------------- |
| `query`        | string | Full-text search across reference, title, display name     |
| Resource enums | string | Status, type, priority filters (comma-separated or single) |

---

## Per-resource filters

| Resource  | Filters                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| Clients   | `query`, `status`, `clientType`                                                                                             |
| Matters   | `query`, `status`, `clientId`, `priority`                                                                                   |
| Documents | `query`, `matterId`, `clientId`, `documentStatus`, `documentCategoryId`, `folderId`                                         |
| Tasks     | `query`, `taskStatus`, `taskPriority`, `assigneeUserId`, `matterId`, `dueDateFilter`                                        |
| Calendar  | `query`, `dateRangeFilter`, `dateFrom`, `dateTo`, `matterId`, `clientId`, `ownerUserId`, `eventType`, `calendarEventStatus` |
| Time      | `query`, `entryDateFilter`, `matterId`, `taskId`, `userId`, `billableFilter`                                                |
| Invoices  | `query`, `clientId`, `matterId`, `invoiceStatus`                                                                            |

---

## Example

```http
GET /api/law/v1/clients?query=harbour&status=active&clientType=organisation
```

```http
GET /api/law/v1/tasks?taskStatus=not_started&assigneeUserId=user-1
```

---

## Invalid filters

Malformed filters return **400** `VALIDATION_INVALID_FILTER` (when strict validation is enabled).
