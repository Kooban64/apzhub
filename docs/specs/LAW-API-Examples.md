# LAW — API Examples

> **Story:** LAW-014-03  
> **Status:** Specification examples  
> **OpenAPI:** [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)  
> **Base path:** `/api/law/v1/`  
> **Last updated:** 2026-07-06

Representative request and response examples for every resource. All examples use the canonical envelope from LAW-014-01/02.

---

## 1. Clients

### List clients

```http
GET /api/law/v1/clients?status=active&query=harbour&limit=25
x-correlation-id: corr-clients-001
```

```json
{
  "ok": true,
  "data": [
    {
      "clientId": "c1000042-0001-4000-8000-000000000042",
      "clientReference": "CLT-2026-00042",
      "displayName": "Harbourview Holdings Pty Ltd",
      "clientType": "organisation",
      "status": "active",
      "tags": ["corporate", "retainer"],
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-07-01T14:22:00.000Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "nextCursor": null,
    "prevCursor": null,
    "hasMore": false
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440001",
    "correlationId": "corr-clients-001",
    "timestamp": "2026-07-06T09:15:00.000Z"
  }
}
```

### Create client

```http
POST /api/law/v1/clients
Content-Type: application/json
x-idempotency-key: 7c9e6679-7425-40de-944b-e07fc1f90ae7
x-correlation-id: corr-clients-create
```

```json
{
  "displayName": "Meridian Family Trust",
  "clientType": "organisation",
  "status": "prospect",
  "tags": ["family", "estate"],
  "customFields": {
    "referralSource": "Existing client — Harbourview Holdings"
  }
}
```

```json
{
  "ok": true,
  "data": {
    "clientId": "c1000043-0001-4000-8000-000000000043",
    "clientReference": "CLT-2026-00043",
    "displayName": "Meridian Family Trust",
    "clientType": "organisation",
    "status": "prospect",
    "tags": ["family", "estate"],
    "customFields": {
      "referralSource": "Existing client — Harbourview Holdings"
    },
    "version": 1,
    "createdAt": "2026-07-06T09:20:00.000Z",
    "updatedAt": "2026-07-06T09:20:00.000Z"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440002",
    "correlationId": "corr-clients-create",
    "timestamp": "2026-07-06T09:20:00.000Z"
  }
}
```

---

## 2. Matters

### Get matter

```http
GET /api/law/v1/matters/m2000118-0002-4000-8000-000000000118
x-correlation-id: corr-matter-get
```

```json
{
  "ok": true,
  "data": {
    "matterId": "m2000118-0002-4000-8000-000000000118",
    "matterReference": "MAT-2026-00118",
    "title": "Harbourview — Stage 2 DA Appeal",
    "description": "Appeal against council refusal of development application for Lot 14.",
    "clientId": "c1000042-0001-4000-8000-000000000042",
    "matterTypeId": "mt-litigation-001",
    "matterStatus": "open",
    "practiceAreaId": "pa-planning-001",
    "priority": "high",
    "openedAt": "2026-03-10T00:00:00.000Z",
    "leadAttorneyId": "u-attorney-alex-morgan",
    "teamMemberIds": ["u-attorney-alex-morgan", "u-paralegal-sam-lee"],
    "courtId": "court-land-env-001",
    "tags": ["planning", "appeal"],
    "customFields": {},
    "version": 4,
    "createdAt": "2026-03-10T09:00:00.000Z",
    "updatedAt": "2026-07-05T16:45:00.000Z"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440010",
    "correlationId": "corr-matter-get",
    "timestamp": "2026-07-06T09:25:00.000Z"
  }
}
```

### Create matter

```json
{
  "title": "Chen — Unfair dismissal claim",
  "clientId": "c1000038-0001-4000-8000-000000000038",
  "matterTypeId": "mt-employment-001",
  "practiceAreaId": "pa-employment-001",
  "priority": "normal",
  "leadAttorneyId": "u-attorney-priya-shah",
  "description": "Advisory and representation re Fair Work Commission proceedings."
}
```

---

## 3. Documents

### List documents for matter

```http
GET /api/law/v1/documents?matterId=m2000118-0002-4000-8000-000000000118&documentStatus=approved
```

```json
{
  "ok": true,
  "data": [
    {
      "documentId": "d3000201-0003-4000-8000-000000000201",
      "documentReference": "DOC-2026-00201",
      "title": "Points of Claim — Harbourview DA Appeal",
      "documentType": "pleading",
      "documentStatus": "approved",
      "matterId": "m2000118-0002-4000-8000-000000000118",
      "fileName": "points-of-claim-v2.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 245760,
      "createdAt": "2026-06-12T11:30:00.000Z",
      "updatedAt": "2026-06-18T09:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "hasMore": false,
    "nextCursor": null,
    "prevCursor": null
  },
  "meta": {
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "2026-07-06T09:30:00.000Z"
  }
}
```

---

## 4. Tasks

### Create task

```json
{
  "title": "Prepare witness statement — Dr Patel",
  "assigneeUserId": "u-paralegal-sam-lee",
  "matterId": "m2000118-0002-4000-8000-000000000118",
  "taskPriority": "high",
  "dueAt": "2026-07-20T17:00:00.000Z",
  "tags": ["witness", "deadline"]
}
```

### Update task (complete)

```http
PATCH /api/law/v1/tasks/t4000088-0004-4000-8000-000000000088
If-Match: 3
Content-Type: application/json
```

```json
{
  "taskStatus": "completed"
}
```

---

## 5. Calendar events

### List today's hearings

```http
GET /api/law/v1/calendar-events?eventType=hearing&startsAfter=2026-07-06T00:00:00Z&startsBefore=2026-07-07T00:00:00Z
```

```json
{
  "ok": true,
  "data": [
    {
      "calendarEventId": "e5000033-0005-4000-8000-000000000033",
      "title": "Directions hearing — Chen v Apex Logistics",
      "eventType": "hearing",
      "startsAt": "2026-07-06T10:30:00.000Z",
      "endsAt": "2026-07-06T11:30:00.000Z",
      "allDay": false,
      "matterId": "m2000095-0002-4000-8000-000000000095",
      "ownerUserId": "u-attorney-priya-shah",
      "calendarEventStatus": "scheduled",
      "createdAt": "2026-05-01T08:00:00.000Z",
      "updatedAt": "2026-05-01T08:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "hasMore": false,
    "nextCursor": null,
    "prevCursor": null
  },
  "meta": {
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "2026-07-06T08:00:00.000Z"
  }
}
```

---

## 6. Time entries

### Create time entry

```json
{
  "matterId": "m2000118-0002-4000-8000-000000000118",
  "entryDate": "2026-07-05",
  "durationMinutes": 90,
  "narrative": "Conference with counsel re expert evidence scope",
  "activityCode": "CONF",
  "billable": true,
  "rate": { "amount": "450.00", "currency": "AUD" }
}
```

### List unbilled time

```http
GET /api/law/v1/time-entries?billingStatus=unbilled&matterId=m2000118-0002-4000-8000-000000000118
```

---

## 7. Invoices

### Get invoice with line items

```json
{
  "ok": true,
  "data": {
    "invoiceId": "i6000012-0006-4000-8000-000000000012",
    "invoiceReference": "INV-2026-00012",
    "clientId": "c1000042-0001-4000-8000-000000000042",
    "matterId": "m2000118-0002-4000-8000-000000000118",
    "invoiceStatus": "sent",
    "issueDate": "2026-07-01",
    "dueDate": "2026-07-31",
    "subtotal": { "amount": "6750.00", "currency": "AUD" },
    "taxTotal": { "amount": "675.00", "currency": "AUD" },
    "total": { "amount": "7425.00", "currency": "AUD" },
    "lineItems": [
      {
        "lineItemId": "li-001",
        "description": "Professional fees — DA appeal (15.0 hrs @ $450)",
        "quantity": "15.0",
        "unitPrice": { "amount": "450.00", "currency": "AUD" },
        "amount": { "amount": "6750.00", "currency": "AUD" },
        "matterId": "m2000118-0002-4000-8000-000000000118",
        "timeEntryId": "t4000071-0004-4000-8000-000000000071"
      }
    ],
    "version": 2,
    "createdAt": "2026-07-01T10:00:00.000Z",
    "updatedAt": "2026-07-02T14:00:00.000Z"
  },
  "meta": {
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "2026-07-06T09:45:00.000Z"
  }
}
```

---

## 8. Search

### Quick search (GET)

```http
GET /api/law/v1/search?query=harbour&entityTypes=client,matter&limit=10
```

```json
{
  "ok": true,
  "data": {
    "query": "harbour",
    "hits": [
      {
        "entityType": "client",
        "entityId": "c1000042-0001-4000-8000-000000000042",
        "reference": "CLT-2026-00042",
        "title": "Harbourview Holdings Pty Ltd",
        "subtitle": "Active · Corporate retainer",
        "score": 0.98,
        "href": "/api/law/v1/clients/c1000042-0001-4000-8000-000000000042"
      },
      {
        "entityType": "matter",
        "entityId": "m2000118-0002-4000-8000-000000000118",
        "reference": "MAT-2026-00118",
        "title": "Harbourview — Stage 2 DA Appeal",
        "subtitle": "Open · Planning",
        "score": 0.91,
        "href": "/api/law/v1/matters/m2000118-0002-4000-8000-000000000118"
      }
    ]
  },
  "meta": {
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "2026-07-06T09:50:00.000Z"
  }
}
```

### Advanced search (POST)

```json
{
  "query": "fair work dismissal",
  "entityTypes": ["matter", "document"],
  "limit": 25
}
```

---

## 9. Dashboard

### Executive dashboard

```http
GET /api/law/v1/dashboard/executive
x-correlation-id: corr-dashboard
```

```json
{
  "ok": true,
  "data": {
    "refreshedAt": "2026-07-06T09:00:00.000Z",
    "welcomeMessage": "Good morning, Alex. Here is your firm overview.",
    "metrics": {
      "openMatters": 47,
      "activeClients": 128,
      "openTasks": 63,
      "overdueTasks": 5,
      "unbilledHours": "124.5",
      "outstandingInvoices": 12,
      "outstandingBalance": "$186,420.00",
      "todayEvents": 3
    },
    "todayCalendar": [
      {
        "title": "Directions hearing — Chen v Apex Logistics",
        "subtitle": "CAL-2026-00033 · 10:30",
        "href": "/api/law/v1/calendar-events/e5000033-0005-4000-8000-000000000033"
      }
    ],
    "openMatters": [],
    "recentClients": [],
    "recentDocuments": [],
    "outstandingTasks": [],
    "unbilledTime": [],
    "outstandingInvoices": []
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440020",
    "correlationId": "corr-dashboard",
    "timestamp": "2026-07-06T09:00:00.000Z"
  }
}
```

---

## 10. Activities

### List activities for matter

```http
GET /api/law/v1/activities?matterId=m2000118-0002-4000-8000-000000000118&limit=20
```

```json
{
  "ok": true,
  "data": [
    {
      "activityId": "act-20260705-001",
      "activityType": "legal.document.updated",
      "title": "Document updated",
      "summary": "Points of Claim — Harbourview DA Appeal amended to v2",
      "occurredAt": "2026-07-05T14:22:00.000Z",
      "actorUserId": "u-attorney-alex-morgan",
      "entityType": "document",
      "entityId": "d3000201-0003-4000-8000-000000000201",
      "matterId": "m2000118-0002-4000-8000-000000000118",
      "clientId": "c1000042-0001-4000-8000-000000000042"
    }
  ],
  "pagination": {
    "limit": 20,
    "hasMore": true,
    "nextCursor": "eyJhIjoiIn0",
    "prevCursor": null
  },
  "meta": {
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "2026-07-06T10:00:00.000Z"
  }
}
```

---

## 11. Notifications

### List unread notifications

```http
GET /api/law/v1/notifications?read=false&limit=25
```

```json
{
  "ok": true,
  "data": [
    {
      "notificationId": "ntf-20260706-001",
      "notificationType": "legal.task.overdue",
      "title": "Task overdue",
      "body": "Prepare witness statement — Dr Patel was due 19 Jul 2026.",
      "createdAt": "2026-07-06T08:00:00.000Z",
      "read": false,
      "readAt": null,
      "actionHref": "/api/law/v1/tasks/t4000088-0004-4000-8000-000000000088",
      "entityType": "task",
      "entityId": "t4000088-0004-4000-8000-000000000088"
    }
  ],
  "pagination": {
    "limit": 25,
    "hasMore": false,
    "nextCursor": null,
    "prevCursor": null
  },
  "meta": {
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "2026-07-06T10:05:00.000Z"
  }
}
```

### Mark notification read

```http
PATCH /api/law/v1/notifications/ntf-20260706-001
Content-Type: application/json
```

```json
{
  "read": true
}
```

---

## 12. Error examples

### 401 Unauthenticated

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication is required to access this resource."
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440099",
    "correlationId": "corr-unauth",
    "timestamp": "2026-07-06T10:10:00.000Z"
  }
}
```

### 422 Business rule violation

```json
{
  "ok": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Cannot issue invoice with no line items.",
    "details": {
      "rule": "INVOICE_MIN_LINE_ITEMS",
      "invoiceStatus": "draft"
    }
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440100",
    "correlationId": "corr-invoice-issue",
    "timestamp": "2026-07-06T10:15:00.000Z"
  }
}
```

### 412 Version conflict

```json
{
  "ok": false,
  "error": {
    "code": "PRECONDITION_FAILED",
    "message": "Resource was modified by another request.",
    "details": {
      "currentVersion": 5,
      "ifMatchVersion": 3
    }
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440101",
    "correlationId": "corr-version",
    "timestamp": "2026-07-06T10:20:00.000Z"
  }
}
```

---

## 13. Health (implemented)

```http
GET /api/law/v1/health
```

```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "service": "law-platform-api",
    "apiVersion": "v1",
    "scaffoldVersion": "1.0.0",
    "basePath": "/api/law/v1"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-07-06T10:00:00.000Z"
  }
}
```

---

## 14. Unsupported operations

| Operation              | Status                | Response                 |
| ---------------------- | --------------------- | ------------------------ |
| `PUT /{resource}/{id}` | Not supported in v1   | `405 METHOD_NOT_ALLOWED` |
| `POST /activities`     | System-generated only | `405 METHOD_NOT_ALLOWED` |

Use `PATCH` for partial updates.

---

## 15. Related documents

- [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)
- [LAW-API-DTO-Catalogue](./LAW-API-DTO-Catalogue.md)
- [LAW-API-Error-Catalogue](./LAW-API-Error-Catalogue.md)
