# Domain Events — APZQEP-ENG-050A

Event builders emit typed events with `eventId`, `occurredAt`, `correlationId`, `tenantId`, `specificationId`.

| Owner name | Implemented type |
| ---------- | ---------------- |
| specification.created | `qep.specification.created` |
| specification.updated | `qep.specification.updated` |
| specification.review.started | `qep.specification.review.started` |
| specification.review.completed | `qep.specification.review.completed` |
| specification.approved | `qep.specification.approved` |
| specification.rejected | `qep.specification.rejected` |
| specification.withdrawn | `qep.specification.withdrawn` |
| specification.superseded | `qep.specification.superseded` |
| specification.cancelled | `qep.specification.cancelled` |
| specification.retired | `qep.specification.retired` |
| specification.relationship.added | `qep.specification.relationship.added` |
| specification.relationship.removed | `qep.specification.relationship.removed` |

Catalogue: `SPECIFICATION_DOMAIN_EVENT_TYPES`. Events are collected on the aggregate; publishing is out of scope for ENG-050A.
