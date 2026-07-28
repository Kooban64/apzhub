# CRUD — Requirements

> **Programme:** APZQEP-ENG-020B

## Operations

| Operation | Application | HTTP |
| --------- | ----------- | ---- |
| Create | `createRequirement` | `POST /api/v1/qep/requirements` |
| Read | `getRequirement` | `GET /api/v1/qep/requirements/:id` |
| Update | `updateRequirement` | `PATCH /api/v1/qep/requirements/:id` |
| Archive | `archiveRequirement` | `DELETE /api/v1/qep/requirements/:id` |
| List | `listRequirements` | `GET /api/v1/qep/requirements` |
| Search | `searchRequirements` | `GET /api/v1/qep/requirements/search?q=` |

## Rules

- Soft archive only — no restore, no permanent delete
- Domain factories enforce invariants before persistence
- Optimistic concurrency via `revision` / `expectedRevision`
- Unique active key per tenant (`tenant_id`, `key`) where not archived

## Gateway

`gateway.qep.requirements.*` via `@apzhub/platform-services` RequestPipeline.
