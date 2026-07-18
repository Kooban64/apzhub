# APZHUB Administration Route Catalogue

**Milestone:** APZADMIN-003  
**Base:** `/api/v1/administration`

## Modules

| Method | Path                             | Gateway                  |
| ------ | -------------------------------- | ------------------------ |
| GET    | `/modules`                       | `modules.list`           |
| POST   | `/modules`                       | `modules.create`         |
| GET    | `/modules/{moduleId}`            | `modules.get`            |
| PATCH  | `/modules/{moduleId}`            | `modules.updateMetadata` |
| DELETE | `/modules/{moduleId}`            | `modules.archive`        |
| POST   | `/modules/{moduleId}/transition` | `modules.transition`     |
| POST   | `/modules/{moduleId}/archive`    | `modules.archive`        |
| POST   | `/modules/{moduleId}/restore`    | `modules.restore`        |
| GET    | `/modules/{moduleId}/audit`      | `audit.list(moduleId)`   |
| GET    | `/modules/{moduleId}/history`    | `history.list`           |
| GET    | `/modules/{moduleId}/metadata`   | `metadata.list`          |
| GET    | `/modules/{moduleId}/references` | `references.list`        |

## CRUD facets

Collection `GET|POST` and item `GET|PATCH` for:  
`categories`, `sections`, `actions`, `permissions`, `registrations`, `policies`, `capabilities`, `navigations`, `shortcuts`, `dashboards`.

## Nested / special

| Method     | Path                                                | Notes                                                       |
| ---------- | --------------------------------------------------- | ----------------------------------------------------------- |
| GET\|POST  | `/dashboards/{dashboardId}/widgets`                 | list/create with dashboardId                                |
| GET\|PATCH | `/widgets/{widgetId}`                               |                                                             |
| GET\|POST  | `/metadata`                                         | list requires `?moduleId=`                                  |
| GET\|PATCH | `/metadata/{metadataId}`                            |                                                             |
| GET\|POST  | `/references`                                       | list requires `?moduleId=`                                  |
| GET        | `/references/{referenceId}`                         | no PATCH                                                    |
| GET        | `/audit`, `/audit/{auditId}`                        |                                                             |
| GET        | `/history/{historyId}`                              |                                                             |
| GET        | `/diagnostics`, `/diagnostics/{diagnosticId}`       |                                                             |
| GET        | `/health`, `/readiness`, `/management-capabilities` | plane flags: workbench=false, runtimeAdmin=false, http=true |

## Excluded (never shipped)

`execute`, `runtime`, `users`, `roles`, `tenants`, `organisations`, `provisioning`, `workbench`, `probes`, `events`, `ai`.
