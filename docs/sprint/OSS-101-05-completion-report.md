# OSS-101-05 Completion Report — Plane Core Services

**Status:** Complete  
**Date:** 2026-07-10  
**Scope:** OSS-101-05 only — no OSS-101-06+, no ProjectService UI, no OSS-102

---

## Executive summary

Transformed `@apzhub/integration-plane` from a connectivity-only adapter into a **fully usable APZHUB Projects provider** at the adapter boundary. Seven strongly typed core service APIs (Workspaces, Projects, Project States, Labels, Cycles, Modules, Members) expose list/get/create/update/archive-delete operations with paging, filtering, sorting, request/response validation, canonical entity mapping, SDK logging/metrics, and capability discovery.

All Plane REST responses are mocked in contract tests — no live Plane instance required. Integration SDK unchanged.

**Stop condition met:** OSS-101-06 not started. Await owner approval.

---

## Architecture overview

```text
PlaneAdapter
  └── core: PlaneCoreServices
        ├── PlaneOperationRunner   # SDK metrics, logger, circuit breaker, error mapper
        ├── PlaneRestClient        # Internal REST (IntegrationClient)
        ├── mappers/               # Plane → APZHUB canonical models
        └── services/
              ├── workspaces
              ├── projects
              ├── projectStates
              ├── labels
              ├── cycles
              ├── modules
              └── members
```

| Layer                  | Responsibility                                |
| ---------------------- | --------------------------------------------- |
| `PlaneCoreServices`    | Facade + capability discovery                 |
| Entity services        | Business API + validation + mapping           |
| `PlaneOperationRunner` | Cross-cutting SDK observability               |
| `PlaneRestClient`      | Plane CE REST paths (internal)                |
| `mappers/`             | Canonical ID prefixing (`proj_plane_*`, etc.) |

---

## Files created

| Path                                          | Purpose                          |
| --------------------------------------------- | -------------------------------- |
| `src/models/canonical.ts`                     | APZHUB canonical DTOs            |
| `src/models/query.ts`                         | Paging, filtering, sorting types |
| `src/models/inputs.ts`                        | Create/update input contracts    |
| `src/validation/request-validation.ts`        | Request validators               |
| `src/validation/response-validation.ts`       | Response validators              |
| `src/internal/plane-rest-client.ts`           | Full REST client                 |
| `src/services/plane-operation-runner.ts`      | SDK operation wrapper            |
| `src/services/plane-core-services.ts`         | Service facade                   |
| `src/services/workspace-service.ts`           | Workspace API                    |
| `src/services/project-service.ts`             | Project API                      |
| `src/services/project-state-service.ts`       | Project states API               |
| `src/services/label-service.ts`               | Labels API                       |
| `src/services/cycle-service.ts`               | Cycles (sprints) API             |
| `src/services/module-service.ts`              | Modules API                      |
| `src/services/member-service.ts`              | Members API                      |
| `src/services/list-helpers.ts`                | Pagination/sort helpers          |
| `src/mappers/*.ts`                            | Entity mappers (7 files)         |
| `src/capabilities/service-capabilities.ts`    | Capability discovery             |
| `src/testing/mock-plane-core-data.ts`         | Fixture data                     |
| `src/testing/mock-plane-core-fetch.ts`        | Full API mock router             |
| `src/plane-core-services.test.ts`             | Contract tests (13)              |
| `docs/sprint/OSS-101-05-completion-report.md` | This report                      |

---

## Files modified

| Path                                                | Change                                |
| --------------------------------------------------- | ------------------------------------- |
| `integrations/plane/src/plane-adapter.ts`           | Exposes `adapter.core` services       |
| `integrations/plane/src/plane-bootstrap.ts`         | Extended capabilities metadata v0.2.0 |
| `integrations/plane/src/index.ts`                   | Public exports for models + services  |
| `integrations/plane/package.json`                   | v0.2.0                                |
| `integrations/plane/docs/PLANE-ADAPTER.md`          | Core services documentation           |
| `docs/foundation/CURRENT-STATE.md`                  | OSS-101-05 complete                   |
| `docs/foundation/CURRENT-MILESTONE.md`              | Stop at OSS-101-05                    |
| `docs/foundation/ACTIVE-BACKLOG.md`                 | Status update                         |
| `docs/foundation/AI-CONTEXT.md`                     | Roadmap update                        |
| `docs/README.md`                                    | Registry entry                        |
| `docs/backlog/OSS-101-Plane-Integration-Backlog.md` | OSS-101-05 complete                   |
| `docs/architecture/APZHUB-Plane-Adapter-Design.md`  | Core services delivered               |

---

## API coverage

| Service        | list | get | create | update | archive/delete |
| -------------- | ---- | --- | ------ | ------ | -------------- |
| Workspaces     | ✅   | ✅  | —      | —      | —              |
| Projects       | ✅   | ✅  | ✅     | ✅     | ✅ archive     |
| Project States | ✅   | ✅  | ✅     | ✅     | ✅ delete      |
| Labels         | ✅   | ✅  | ✅     | ✅     | ✅ delete      |
| Cycles         | ✅   | ✅  | ✅     | ✅     | ✅ archive     |
| Modules        | ✅   | ✅  | ✅     | ✅     | ✅ archive     |
| Members        | ✅   | ✅  | ✅ add | ✅     | ✅ remove      |

All list operations support paging, filtering, and sorting validation.

---

## Entity coverage

| Plane entity | APZHUB canonical      | Mapper             |
| ------------ | --------------------- | ------------------ |
| Workspace    | `Workspace`           | `workspace-mapper` |
| Project      | `Project`             | `project-mapper`   |
| State        | `ProjectStatusEntity` | `state-mapper`     |
| Label        | `Label`               | `label-mapper`     |
| Cycle        | `Sprint`              | `cycle-mapper`     |
| Module       | `ProjectModule`       | `module-mapper`    |
| Member       | `TeamMember`          | `member-mapper`    |

Provisional canonical IDs use `*_plane_{uuid}` prefix until ProjectService mapping store (OSS-101-05+ platform layer).

---

## Tests

| Suite                         | Tests  |
| ----------------------------- | ------ |
| OSS-101-04 foundation tests   | 24     |
| `plane-core-services.test.ts` | 13     |
| **Total**                     | **37** |

Contract tests cover all seven services, capability discovery, validation, paging, error translation, and full CRUD lifecycles (mocked API).

---

## Coverage

| Metric    | `integrations/plane/src` (approx.) |
| --------- | ---------------------------------- |
| Lines     | 91.95%                             |
| Branches  | 73.84%                             |
| Functions | 100%                               |

---

## Outstanding work

| Item                                    | Target                               |
| --------------------------------------- | ------------------------------------ |
| Platform `ProjectService` orchestration | OSS-101-05 UI track / platform layer |
| Entity mapping store (platform IDs)     | ProjectService + DB migration        |
| Task/issue CRUD                         | OSS-101-06                           |
| SDK HTTP transport                      | OSS-100-06                           |
| Control plane health registration       | OSS-101-09                           |
| Live Plane contract verification        | Optional staging gate                |

---

## Recommendations for OSS-101-06

1. **Tasks next** — implement `PlaneTaskService` (Plane issues) following the same service/mapper/mock pattern.
2. **Wire ProjectService** — consume `adapter.core.projects` only through platform service boundary; never import mappers in modules.
3. **Mapping store** — replace provisional `*_plane_*` IDs with platform global IDs before UI exposure.
4. **State machine tests** — task transitions will need dedicated contract tests for status changes.
5. **Do not begin OSS-101-06** until owner explicitly approves.

---

## Quality gates

| Gate                                                | Result          |
| --------------------------------------------------- | --------------- |
| `pnpm --filter @apzhub/integration-plane typecheck` | Pass            |
| `pnpm eslint integrations/plane`                    | Pass            |
| `pnpm vitest run integrations/plane`                | Pass — 37 tests |

---

## Stop condition

OSS-101-05 complete. **Do not begin OSS-101-06.** Await explicit owner approval.
