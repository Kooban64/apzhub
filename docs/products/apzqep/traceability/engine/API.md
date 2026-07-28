# REST API — Traceability

Base: `/api/v1/qep/traceability`

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/trace-links` | List (filtered, paginated) |
| POST | `/trace-links` | Create |
| GET | `/trace-links/{id}` | Detail |
| POST | `/trace-links/{id}/validate` | Validate |
| POST | `/trace-links/{id}/approve` | Approve |
| POST | `/trace-links/{id}/retire` | Retire |
| POST | `/trace-links/{id}/supersede` | Supersede |
| PATCH | `/trace-links/{id}/confidence` | Update confidence |
| PATCH | `/trace-links/{id}/authority` | Update authority |
| PATCH | `/trace-links/{id}/scope` | Update scope |
| PATCH | `/trace-links/{id}/rationale` | Update rationale |
| PATCH | `/trace-links/{id}/metadata` | Update metadata |
| GET | `/trace-links/{id}/history` | Domain history |
| GET | `/trace-links/taxonomy` | Normative taxonomy |
| GET | `/endpoints/{kind}/{artefactId}/trace-links` | Endpoint-oriented list |

Responses include server-authoritative `availableActions`.
Error codes follow Platform + Trace domain failures (not-found, conflict, permission, validation, lifecycle, concurrency).
