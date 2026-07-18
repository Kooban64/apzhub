# Identity Service Assignments Workbench Guide

**Milestone:** APZIDENTITY-004
**Section:** `/workspace/identity/service-assignments`

## What a Service Assignment is

A Service Assignment is a **metadata record** linking a subject (a user, group, or other identity entity — `subjectKind` + `subjectId`) to a downstream service capability (`serviceCapability`, e.g. `projects`, `documents`, `reporting`, `search`, `support`, `testing`, `administration`, `configuration`, `notifications`, `workflow-engine`/`workflows`). It answers "which services is this identity entity associated with?" — it does **not** grant, revoke, or provision anything in the target service.

| Field                     | Type   | Notes                                               |
| ------------------------- | ------ | --------------------------------------------------- |
| `id`                      | string | Platform-generated                                  |
| `tenantId`                | string | —                                                   |
| `subjectKind`             | string | e.g. `user`, `group`                                |
| `subjectId`               | string | Foreign key to the subject within Identity metadata |
| `serviceCapability`       | string | Fixed catalogue (`SERVICE_CAPABILITY_OPTIONS`)      |
| `status`                  | string | Lifecycle status (e.g. `active`)                    |
| `createdAt` / `updatedAt` | string | Audit timestamps                                    |
| `createdBy` / `updatedBy` | string | Actor user id                                       |

## Where it surfaces

1. **Service Assignments section** — full list + create/update-status form, `MetaTable` caption `Service assignments`.
2. **User detail** — `serviceAssignmentsForUser` filters the full list by `subjectId === userId` and renders under **Service assignments** (`data-testid="user-service-assignments"`) as `{serviceCapability} ({status})`.

## Relationship to Memberships

Memberships (`kind` + `targetId`) express **identity-internal** relationships (user → group, user → role, etc.). Service Assignments express **cross-vertical** relationships (identity entity → another platform service's capability). Keeping them as separate entities avoids conflating org-structure metadata with service-capability metadata, and keeps each Platform Service's ownership boundary (011) intact.

## What this milestone does not do

- Does not call any other Platform Service, connector, or backend engine to actually provision access — Identity never calls Administration, Documents, Search, etc. directly.
- Does not derive or cache computed effective-permission sets — that remains PermissionService's responsibility (007/009).
- Does not expose backend role/permission names — `serviceCapability` values are the same product-facing vocabulary used everywhere in APZHUB (001 terminology rules).

## Typed client

```ts
import {
  listServiceAssignments,
  getServiceAssignment,
  createServiceAssignment,
  updateServiceAssignment,
} from "@/lib/identity/identity-api";
```

See also: [Identity Views Catalogue](./APZHUB-Identity-Views-Catalogue.md), [Forms & Validation Guide](./APZHUB-Identity-Forms-and-Validation-Guide.md).
