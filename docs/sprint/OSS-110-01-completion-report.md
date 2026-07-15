# OSS-110-01 — Platform Service Contracts — Completion Report

**Milestone:** OSS-110-01  
**Date:** 2026-07-10  
**Status:** Complete  
**Package:** `@apzhub/platform-service-contracts` v0.1.0

---

## Objective

Introduce platform-level service interfaces defining APZHUB business capabilities independently of vendor integration — contracts only, no business logic, transport, or UI.

---

## Deliverables

| Deliverable | Status |
|-------------|--------|
| `@apzhub/platform-service-contracts` package | ✅ |
| Shared contracts (context, paging, sorting, results, errors) | ✅ |
| Canonical domain DTOs | ✅ |
| Query objects, filters, sort fields | ✅ |
| Input/command DTOs | ✅ |
| `WorkspaceService` interface | ✅ |
| `ProjectService` interface | ✅ |
| `TaskService` interface | ✅ |
| `TeamService` interface | ✅ |
| `UserService` interface | ✅ |
| `SearchService` interface | ✅ |
| Plane adapter migration to contracts package | ✅ |
| Contract tests | ✅ 8 passed |
| Specification document | ✅ |
| Foundation doc updates | ✅ |

---

## Package structure

```text
packages/platform-service-contracts/
  package.json
  tsconfig.json
  src/
    common/          context, paging, sorting, list-query, results, errors
    domain/          identifiers, workspace, project, task, sprint, milestone,
                     module, team, status-label, user, search, activity
    queries/         list filters and sort field types
    inputs/          create/update/command inputs
    services/        six service interfaces
    contracts.test.ts
    index.ts
```

---

## Service interface summary

### WorkspaceService

- `listWorkspaces`, `getWorkspace`

### ProjectService

- Projects: list, get, create, update, archive
- Statuses: list, get, create, update, delete
- Labels: list, create, update, delete
- Sprints: list, get, create, update, archive, start, complete
- Modules: list, get, create, update, archive
- Milestones: list, create, update
- Views: getRoadmap, listProjectActivity

### TaskService

- Tasks: list, get, create, update, transitionTaskStatus, assignTask
- Backlog: getBacklog, reorderBacklog
- Sprint assignment: assignTasksToSprint
- My work: listMyTasks
- Comments and attachments: list/add

### TeamService

- listTeam, getTeamMember, addTeamMember, updateTeamMember, removeTeamMember

### UserService

- listUsers, getUser, getUserByEmail, getUserProfile, createUser, updateUser

### SearchService

- search, suggest

---

## Canonical model migration

| Before (OSS-101-05) | After (OSS-110-01) |
|---------------------|-------------------|
| `integrations/plane/src/models/canonical.ts` | Re-exports from `@apzhub/platform-service-contracts` |
| `integrations/plane/src/models/query.ts` | Re-exports from contracts |
| `integrations/plane/src/models/inputs.ts` | Re-exports + adapter `CreateProjectInput` omitting `workspaceId` |

Plane types remain internal to `integrations/plane/src/internal/` only.

---

## Shared contract highlights

```typescript
interface ServiceRequestContext {
  tenantId: string;
  userId: string;
  correlationId: string;
  permissions: readonly string[];
  workspaceId?: string;
  locale?: string;
  timezone?: string;
}

interface PageResult<TItem> {
  items: readonly TItem[];
  totalCount: number;
  page: number;
  perPage: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

class PlatformServiceError {
  category: PlatformServiceErrorCategory;
  code: PlatformServiceErrorCode;
  message: string;
  correlationId: string;
  retryable: boolean;
}
```

---

## Quality gates

| Gate | Result |
|------|--------|
| `pnpm --filter @apzhub/platform-service-contracts typecheck` | Pass |
| `pnpm --filter @apzhub/integration-plane typecheck` | Pass |
| Contract tests | 8 passed |
| Plane adapter tests | 37 passed |
| ESLint (contracts + plane models) | Pass |

---

## Explicitly not in scope (OSS-110-01)

- Platform Service implementations (orchestration, permissions, audit, events)
- API gateway route handlers
- Projects Workbench UI
- Plane task/issue CRUD (OSS-101-06)
- Entity mapping store
- Wiring `ProjectService` to `PlaneAdapter.core`

---

## Next steps (await owner approval)

1. **OSS-110-02+** — Platform Service implementations consuming these contracts
2. **OSS-101-06** — Plane task adapter services mapped to `TaskService` DTOs
3. Entity mapping store for stable platform IDs (replace provisional `*_plane_*` prefixes)

---

## Stop condition

**OSS-110-01 complete.** Await owner approval before Platform Service implementation or OSS-101-06.
