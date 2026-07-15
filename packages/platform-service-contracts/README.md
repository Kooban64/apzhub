# @apzhub/platform-service-contracts

Vendor-neutral platform service interfaces, canonical DTOs, and query contracts.

**Current version:** **0.8.0** (Testing platform service interfaces — APZTCMS-011)  
**Status:** Contracts only — no implementations in this package

## Purpose

Defines the stable boundary between APZHUB modules and platform services. All types use APZHUB terminology; no vendor engine types appear in this package.

## Contents

| Area | Description |
|------|-------------|
| `common/` | Request context, paging, sorting, result wrappers, errors |
| `domain/` | Canonical DTOs (Project, Task, Workspace, User, etc.) |
| `queries/` | List filters and sort field types |
| `inputs/` | Create/update/command inputs |
| `services/` | Service interface definitions |
| `services/testing/` | **APZTCMS-011** — Testing platform gateway + per-capability interfaces |

## Service interfaces

- `WorkspaceService`
- `ProjectService`
- `TaskService`
- `TeamService`
- `UserService`
- `SearchService`
- Support services (OSS-110-10)
- **`TestingPlatformGateway`** — nested `plans`, `suites`, `cases`, … `reporting` (APZTCMS-011)

## Usage

```typescript
import type {
  ProjectService,
  ServiceRequestContext,
  TestingPlatformGateway,
} from "@apzhub/platform-service-contracts";
```

Implementations live in `@apzhub/platform-services` (OSS-110-02+, Testing APZTCMS-011).

## Related documentation

- [Testing Platform Service Contracts](../../docs/architecture/APZHUB-Testing-Platform-Service-Contracts.md)
- [Platform Service Contracts Specification](../../docs/specs/APZHUB-Platform-Service-Contracts-Specification.md)
- [Platform Service Gateway](../../docs/specs/APZHUB-Platform-Service-Gateway.md)
- [APZTCMS-011 Completion Report](../../docs/sprint/APZTCMS-011-completion-report.md)
