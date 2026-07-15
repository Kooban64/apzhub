# APZHUB Platform — Operations Reference Architecture

> **Milestone:** M8-03 — Platform Operations Console  
> **Status:** Active  
> **Authority:** [Document 005](../005-desktop-experience-workspace-framework.md) · [ADR-0042](../adr/ADR-0042-platform-operations-console.md)

---

## Purpose

The Platform Operations Console is the central operational interface for APZHUB. Every platform capability is observable and manageable from one Workbench workspace. Products remain consumers; the console belongs to the Platform.

---

## Architecture

```text
Workbench (Platform Operations workspace)
        ↓
OperationsWorkspaceRouter (route → section component)
        ↓
Platform APIs (/api/platform/v1/*)
        ↓
Platform packages (identity, authorization, runtime) + existing health loaders
```

**No duplicated logic:** Dashboard and Health sections aggregate `/api/health`, identity diagnostics, authorization diagnostics, and runtime registry counts.

---

## Navigation

| Section | Route | Data source |
| ------- | ----- | ----------- |
| Dashboard | `/workspace/administration` | `GET /api/platform/v1/operations/summary` |
| Tenants | `.../tenants` | `GET /api/platform/v1/tenants` |
| Users | `.../users` | `GET /api/platform/v1/users` |
| Roles | `.../roles` | `GET /api/platform/v1/roles` |
| Permissions | `.../permissions` | `GET /api/platform/v1/permissions` |
| Products | `.../products` | `GET /api/platform/v1/products` |
| Services | `.../services` | `GET /api/platform/v1/services` |
| Modules | `.../modules` | `GET /api/platform/v1/modules` |
| Provisioning | `.../provisioning` | `GET /api/platform/v1/provisioning` |
| Diagnostics | `.../diagnostics` | Identity + authorization diagnostics APIs |
| Audit | `.../audit` | `GET /api/platform/v1/audit` |
| Health | `.../health` | Operations summary health aggregate |
| Configuration | `.../configuration` | `GET /api/platform/v1/operations/configuration` |
| Feature Flags | `.../feature-flags` | Placeholder (M8-05) |

Manifests: `packages/workbench-framework/manifests/platform-operations-*/module.yaml`

---

## Permission model

All operations sections require `platform.nav.administration.view`. Platform-admin role grants `*` in authorization seed.

---

## API surface (M8-03 additions)

| Route | Purpose |
| ----- | ------- |
| `GET /api/platform/v1/operations/summary` | Dashboard aggregate |
| `GET /api/platform/v1/operations/configuration` | Read-only environment summary |
| `GET /api/platform/v1/users` | User directory + effective permissions |
| `GET /api/platform/v1/modules` | Runtime module registry |
| `GET /api/platform/v1/services` | Runtime service registry |
| `GET /api/platform/v1/products` | Product registry |
| `GET /api/platform/v1/provisioning` | Tenant provisioning status |
| `GET /api/platform/v1/audit` | Authorization + tenant audit signals |

---

## Deferred

- Feature flag engine (M8-05)
- User preferences (M8-04)
- Configuration editing
- Password management / auth redesign
- Product business administration screens

---

## Related documents

- [Platform Operations Console Guide](../developer/APZHUB-Platform-Operations-Console-Guide.md)
- [Platform Operations UX Guide](../governance/APZHUB-Platform-Operations-UX-Guide.md)
- [M8-03 completion report](../sprint/M8-03-completion-report.md)
