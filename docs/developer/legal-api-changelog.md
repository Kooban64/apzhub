# Law Platform API — Changelog

> **Story:** LAW-014-07  
> **Version:** 1.0.0  
> **Last updated:** 2026-07-06

---

## v1.0.0 — 2026-07-06

### Implemented resources

| Resource        | Story      | Endpoints                                                                          |
| --------------- | ---------- | ---------------------------------------------------------------------------------- |
| Clients         | LAW-014-04 | GET/POST `/clients`, GET/PATCH/DELETE `/clients/{clientId}`                        |
| Matters         | LAW-014-06 | GET/POST `/matters`, GET/PATCH/DELETE `/matters/{matterId}`                        |
| Documents       | LAW-014-06 | GET/POST `/documents`, GET/PATCH/DELETE `/documents/{documentId}`                  |
| Tasks           | LAW-014-06 | GET/POST `/tasks`, GET/PATCH/DELETE `/tasks/{taskId}`                              |
| Calendar events | LAW-014-06 | GET/POST `/calendar-events`, GET/PATCH/DELETE `/calendar-events/{calendarEventId}` |
| Time entries    | LAW-014-06 | GET/POST `/time-entries`, GET/PATCH/DELETE `/time-entries/{timeEntryId}`           |
| Invoices        | LAW-014-06 | GET/POST `/invoices`, GET/PATCH/DELETE `/invoices/{invoiceId}`                     |

### Infrastructure

| Story      | Deliverable                                                    |
| ---------- | -------------------------------------------------------------- |
| LAW-014-01 | API scaffold, response/error envelopes                         |
| LAW-014-02 | Authentication, tenant binding                                 |
| LAW-014-03 | OpenAPI 3.1 specification                                      |
| LAW-014-05 | Shared API framework                                           |
| LAW-014-07 | Developer documentation, Swagger UI, Postman/Bruno collections |

### Planned (contract only)

- Search (`/search`)
- Dashboard (`/dashboard/executive`)
- Activities (`/activities`)
- Notifications (`/notifications`)

---

## Breaking changes policy

Breaking changes require a new major API version (`/api/law/v2/`). See [Versioning](./legal-api-versioning.md).

---

## Deprecation policy

1. Mark deprecated in OpenAPI with `deprecated: true`.
2. Document in this changelog with removal target date.
3. Maintain for ≥ one release cycle.
4. Remove only in next major version.

---

## Known contract notes

| Topic                | Notes                                                                          |
| -------------------- | ------------------------------------------------------------------------------ |
| DELETE responses     | Implementation returns 200 archive envelope; some OpenAPI paths still show 204 |
| `fields` / `include` | Parsed but not yet applied to responses                                        |
| Idempotency          | `x-idempotency-key` documented but not enforced                                |

---

## Downloads

- OpenAPI: [/api/law/v1/openapi.yaml](../specs/LAW-OpenAPI-v1.yaml)
- Docs: [/api/docs](../developer/legal-api-developer-guide.md)
