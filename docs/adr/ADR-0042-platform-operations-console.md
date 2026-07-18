# ADR-0042 — Platform Operations Console

> **Status:** Accepted  
> **Date:** 2026-07-08  
> **Milestone:** M8-03 — Platform Operations Console  
> **Authority:** [Document 005](../005-desktop-experience-workspace-framework.md) · [ADR-0041](./ADR-0041-platform-authorization-rbac-phase-1.md)

## Problem

Platform capabilities (identity, authorization, runtime registry, health, diagnostics) were exposed only via scattered APIs and dev diagnostics panels. Operators lacked a single operational interface within the Workbench.

## Decision

Deliver the **Platform Operations Console** as a manifest-driven Workbench workspace:

1. **Workspace:** `platform-administration` activity-bar entry renamed **Platform Operations** (`/workspace/administration/*`).
2. **Navigation:** Sidebar manifests for Dashboard, Tenants, Users, Roles, Permissions, Products, Services, Modules, Provisioning, Diagnostics, Audit, Health, Configuration, Feature Flags (placeholder).
3. **Presentation:** `apps/web` route router renders section components; modules remain presentation-only.
4. **Data:** Consume existing platform APIs and diagnostics — no duplicated business logic.
5. **APIs:** Add read-only aggregation routes under `/api/platform/v1/operations/*`, `/users`, `/modules`, `/services`, `/products`, `/audit`, `/provisioning`.

Products expose diagnostics; the Platform presents them.

## Alternatives

| Alternative              | Why rejected                                          |
| ------------------------ | ----------------------------------------------------- |
| New layout framework     | Violates M8 constraint — use existing Workbench UX    |
| Product-local admin UIs  | Duplicates platform operations; violates architecture |
| Full CRUD admin in M8-03 | Out of scope — read-first operations console          |

## Consequences

- Operators manage platform state from one Workbench workspace.
- Feature flags, preferences, governance workflows remain deferred (M8-04+).
- Law Platform business screens unchanged.

## References

- [Platform Operations Reference Architecture](../architecture/APZHUB-Platform-Operations-Reference-Architecture.md)
- [M8-03 completion report](../sprint/M8-03-completion-report.md)
