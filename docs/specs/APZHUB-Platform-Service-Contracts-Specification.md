# APZHUB Platform Service Contracts Specification

**Milestone:** OSS-110-01  
**Status:** Canonical vendor-neutral service contracts — **interfaces and types only, no implementation**  
**Package:** `@apzhub/platform-service-contracts` v0.1.0  
**Authority:** [009 — Platform Service Layer](../009-platform-service-layer-integration-framework.md) · [027 — Platform Service SDK](../027-platform-service-sdk-business-service-framework-service-manifest-specification.md) · [010 — API Gateway Standards](../010-api-gateway-integration-communication-standards.md)

---

## Purpose

Define the **platform-level service interfaces** that APZHUB modules and orchestration layers consume. These contracts:

- Use APZHUB canonical models only
- Contain no vendor types (Plane, Kimai, etc.)
- Contain no business logic, transport, or UI
- Are satisfied by Platform Service implementations and Integration Adapters via translation

---

## Package layout

```text
packages/platform-service-contracts/
  src/
    common/       # context, paging, sorting, results, errors
    domain/       # canonical DTOs
    queries/      # list filters and sort fields
    inputs/       # create/update/command inputs
    services/     # service interfaces
```

---

## Shared contracts

| Contract                                    | Description                                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| `ServiceRequestContext`                     | Tenant, user, correlation ID, permissions, optional workspace/locale/timezone |
| `PageRequest` / `PageResult<T>`             | Offset paging                                                                 |
| `CursorPageRequest` / `CursorPageResult<T>` | Cursor paging (activity streams)                                              |
| `SortField` / `SortSpec`                    | Typed sorting                                                                 |
| `ListQuery<TFilter, TSort>`                 | Combined page + sort + filter                                                 |
| `ServiceResult<T>` / `ServiceListResult<T>` | Response wrappers with metadata                                               |
| `PlatformServiceError`                      | Vendor-neutral error contract (010 categories)                                |

---

## Service interfaces

| Interface          | Service ID          | Responsibility                                                              |
| ------------------ | ------------------- | --------------------------------------------------------------------------- |
| `WorkspaceService` | `workspace-service` | List/get workspaces                                                         |
| `ProjectService`   | `project-service`   | Projects, statuses, labels, sprints, modules, milestones, roadmap, activity |
| `TaskService`      | `task-service`      | Tasks, backlog, comments, attachments, my work                              |
| `TeamService`      | `team-service`      | Project team membership                                                     |
| `UserService`      | `user-service`      | Platform user lookup and profile                                            |
| `SearchService`    | `search-service`    | Unified search and suggestions (020)                                        |

Full method signatures live in the package source under `src/services/`.

---

## Domain models

Canonical DTOs previously provisional in `@apzhub/integration-plane` now live in `src/domain/`:

- Workspace, Project, Task, Sprint, Milestone, ProjectModule
- ProjectStatusEntity, Label, TeamMember, User
- SearchDocument, SearchResult, Comment, Attachment, ActivityEntry

Adapters map engine records → these types. Modules and Platform Services never import engine types.

---

## Adapter relationship

```text
Module  →  Platform Service (implements interface)  →  Adapter (maps to canonical DTOs)
```

`@apzhub/integration-plane` re-exports subset types from `@apzhub/platform-service-contracts` for backward compatibility. New code should import from the contracts package directly.

---

## Error contract

`PlatformServiceError` categories align with [010](../010-api-gateway-integration-communication-standards.md):

- `validation`, `authentication`, `authorization`, `not_found`, `conflict`
- `business_rule`, `configuration`, `integration`, `connector`
- `temporary_failure`, `system`

Backend details must never appear in `message` or `details` exposed to clients.

---

## Related

- [ProjectService Specification](./APZHUB-ProjectService-Specification.md)
- [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md)
- [Plane Adapter Specification](./APZHUB-PlaneAdapter-Specification.md)
- [OSS-110-02 Completion Report](../sprint/OSS-110-02-completion-report.md)
