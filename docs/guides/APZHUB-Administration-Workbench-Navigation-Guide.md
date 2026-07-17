# Administration Workbench Navigation Guide

**Milestone:** APZADMIN-004

## Entry

- Activity Bar: **Administration** (`platform-admin`)
- Base route: `/workspace/administration`
- Permission: `admin.read` (section-specific permissions for some children)

## Sidebar sections

| Order | Section | Route suffix | Permission |
| --- | --- | --- | --- |
| 10 | Overview | `/overview` | `admin.read` |
| 20 | Modules | `/modules` | `admin.read` |
| 30 | Categories | `/categories` | `admin.read` |
| 40 | Sections | `/sections` | `admin.read` |
| 50 | Registrations | `/registrations` | `admin.registration` |
| 60 | Capabilities | `/capabilities` | `admin.read` |
| 70 | Actions | `/actions` | `admin.read` |
| 80 | Permissions | `/permissions` | `admin.read` |
| 90 | Policies | `/policies` | `admin.policy` |
| 100 | Navigation | `/navigation` | `admin.navigation` |
| 110 | Shortcuts | `/shortcuts` | `admin.navigation` |
| 120 | Dashboards | `/dashboards` | `admin.read` |
| 130 | Widgets | `/widgets` | `admin.read` |
| 140 | References | `/references` | `admin.read` |
| 150 | Audit | `/audit` | `admin.audit` |
| 160 | History | `/history` | `admin.audit` |
| 170 | Diagnostics | `/diagnostics` | `admin.diagnostics` |

## Coexistence

Platform Operations is at `/workspace/operations` (parent id `platform-administration`). Do not conflate the two workspaces.

## Deep links

Use `administrationSectionPath(section)` from `apps/web/lib/administration/routes.ts`.
