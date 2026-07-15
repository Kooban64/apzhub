# APZHUB — Testing Domain-Platform Boundary Guide

**Milestone:** APZTCMS-011  
**Status:** Enforced by architecture tests and package dependency rules

---

## Dependency direction

```text
apps/web (presentation)
    ↓ typed client only — NO platform-services import
@apzhub/platform-services
    ↓ implements
@apzhub/platform-service-contracts
    ↓ uses types from
@apzhub/testing-contracts
    ↑ implemented by
@apzhub/testing-services
    ↓ uses
@apzhub/testing-persistence
```

**Prohibited reverse dependencies:**

- `testing-services` → `platform-services` ❌
- `testing-persistence` → `platform-services` ❌
- `apps/web/lib/testing` → `platform-services` ❌
- `gateway` → testing repositories directly ❌

---

## Responsibility split

| Concern | Domain | Platform |
| ------- | ------ | -------- |
| State machines | ✅ | ❌ |
| Gate evaluation logic | ✅ | ❌ |
| SQL / repositories | ✅ (persistence pkg) | ❌ |
| `ServiceRequestContext` enforcement | ❌ | ✅ |
| `PlatformServiceError` translation | ❌ | ✅ |
| RequestPipeline / authz map | ❌ | ✅ |
| `gateway.testing.*` surface | ❌ | ✅ |
| Dashboard aggregation for platform API | ✅ (data) / ✅ (thin impl) | Presentation-oriented counts in impl |

Platform impls are **thin delegates** — no duplicated business rules.

---

## Error boundary

| Side | Error type |
| ---- | ---------- |
| Domain | `DomainRuleError` |
| Persistence | `PersistenceError` |
| Platform public surface | `PlatformServiceError` only |

Domain errors must not escape past `withTestingErrorMapping`.

---

## Context boundary

Domain services accept platform-compatible context (tenant, user, permissions snapshot as needed). Platform layer normalises via `assertTestingContext` before every call.

---

## What APZTCMS-011 added vs prior milestones

| Prior (APZTCMS-004–009) | APZTCMS-011 |
| ----------------------- | ----------- |
| Domain factories only | Platform service impls + contracts |
| Repo-level authz | + Pipeline operation authz |
| No gateway | `gateway.testing.*` nested surface |
| Direct domain tests | + Platform integration tests |

Domain package versions **unchanged**.

---

## Automated enforcement

`testing-architecture-boundary.test.ts`:

1. Workbench decoupled from `@apzhub/platform-services`
2. Domain packages do not import platform-services
3. Gateway does not import testing repositories
4. No testing HTTP routes, event-bus folders, or AI assist folders under platform-services

---

## Future APZTCMS-012 boundary

HTTP handlers live in `apps/web/app/api/v1/` (or gateway app layer):

- Build `ServiceRequestContext` from session
- Call `gateway.testing.*` only
- Map `PlatformServiceError` to envelope
- **Never** import `@apzhub/testing-services` from route handlers

Workbench continues using `TestingClient` — swap mock → HTTP client without view changes.

---

## Related

- [Testing Platform Service Architecture](./APZHUB-Testing-Platform-Service-Architecture.md)
- [APZ TCMS Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md)
- [003 — Overall System Architecture](../003-overall-system-architecture-design-principles.md)
