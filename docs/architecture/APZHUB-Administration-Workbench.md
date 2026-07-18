# APZHUB Administration Workbench

**Milestone:** APZADMIN-004  
**Status:** Complete  
**Route:** `/workspace/administration`

## Purpose

Product-neutral Administration management interface for the Platform Administration **metadata management plane**.

## Architecture

```text
Administration Workbench
  → administration-api facades
  → /api/v1/administration/*
  → PlatformServiceGateway.administration.*
  → RequestPipeline → Production Authorization
  → Administration Platform Services → Core → Persistence → PostgreSQL
```

## Boundary

The Workbench imports only:

- `@/lib/administration/administration-api`
- `@/lib/administration/query-keys`
- approved UI packages (`@apzhub/ui`, React Query)

It must not import gateway, platform-services, admin-core, admin-persistence, repositories, Event Bus, AI, or call `fetch` from components.

## Coexistence with Platform Operations (M8-03)

Platform Operations previously occupied `/workspace/administration`. For APZADMIN-004:

| Surface                      | Manifest parent id        | Workspace key    | Base route                  |
| ---------------------------- | ------------------------- | ---------------- | --------------------------- |
| Platform Operations (M8-03)  | `platform-administration` | `operations`     | `/workspace/operations`     |
| Administration SoR Workbench | `platform-admin`          | `administration` | `/workspace/administration` |

Ops activity-bar title remains **Platform Operations**. Administration activity-bar title is **Administration**.

## Registration

Manifest-driven under `packages/workbench-framework/manifests/platform-admin*`:

- Activity Bar: Administration (`admin.read`, order ~54)
- Sidebar: Overview, Modules, Categories, Sections, Registrations, Capabilities, Actions, Permissions, Policies, Navigation, Shortcuts, Dashboards, Widgets, References, Audit, History, Diagnostics

Mounted via catch-all workspace + `AdministrationWorkspaceRouter` in `workbench-page.tsx` (after ops `/workspace/operations` check; near Configuration).

## Capability notices (always)

- `ADMINISTRATION METADATA ONLY — RUNTIME ADMINISTRATION IS NOT AVAILABLE`
- `REGISTRATION METADATA ONLY — NO SERVICE PROVISIONING`
- `ACTION CATALOGUE ONLY — RUNTIME EXECUTION IS NOT AVAILABLE`
- `PERMISSION CATALOGUE — ACCESS ASSIGNMENT IS OUTSIDE THIS MILESTONE`
- `DASHBOARD METADATA ONLY — ANALYTICS RENDERING IS NOT PART OF ADMINISTRATION`
- `REGISTERED HEALTH METADATA — NO LIVE PROBE`

## Unavailable (this milestone)

Runtime Administration, User Management, Role Management, Tenant Management, Organisation Management, Provisioning, Live Infrastructure Diagnostics, Event Bus, AI Administration.

## Audit

`pnpm audit:administration-workbench` — zero violations required.

## Next milestone

**APZADMIN-005 — Administration Vertical Certification & Production Readiness** (not started).

## See also

- [Administration HTTP API](./APZHUB-Administration-HTTP-API.md)
- [APZADMIN-004 Completion Report](../sprint/APZADMIN-004-completion-report.md)
