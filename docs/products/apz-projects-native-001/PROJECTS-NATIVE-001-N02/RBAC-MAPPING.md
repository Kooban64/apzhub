# RBAC Mapping — APZ-PROJECTS-NATIVE-001-N02

| Field     | Value                       |
| --------- | --------------------------- |
| Slice     | APZ-PROJECTS-NATIVE-001-N02 |
| Status    | **COMPLETE**                |
| Timestamp | 20260805T071500Z            |

## Catalog

APZHUB registers Projects permission keys (wildcard + granular) in:

- `packages/platform-authorization/src/authorization-seed.ts`
- `packages/platform-authorization/src/postgres-authorization-store.ts`

| Key (examples)         | UI use                                        |
| ---------------------- | --------------------------------------------- |
| `projects.*`           | Full Projects product surface (tenant member) |
| `projects.view`        | Dashboard / list / search                     |
| `projects.manage`      | Create / manage projects                      |
| `projects.task.*`      | Task surfaces                                 |
| `projects.sprint.view` | Sprint surfaces                               |
| `projects.admin`       | Health / operator surfaces                    |

Note: legacy catalog key `project.*` (singular) remains for other platform uses; product UI consumes **`projects.*`** (plural) per module manifests.

## Role grants (seed)

| Role           | Grant        |
| -------------- | ------------ |
| Platform Admin | `*`          |
| Tenant Member  | `projects.*` |

## Mapping rules

- Platform permissions → Projects UI helpers (`lib/projects/permissions.ts`).
- Never expose backend/engine role names in UI.
- Never invent product-local roles.
