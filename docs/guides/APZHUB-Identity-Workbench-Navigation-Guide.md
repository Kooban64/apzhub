# Identity Workbench Navigation Guide

**Milestone:** APZIDENTITY-004

## Entry

- Activity Bar: **Identity** (`platform-identity`)
- Base route: `/workspace/identity`
- Permission: `identity.read` (uniform across all sidebar children in this milestone)

## Sidebar sections

| Order | Section             | Route suffix           | Permission      |
| ----- | ------------------- | ---------------------- | --------------- |
| 10    | Overview            | `/overview`            | `identity.read` |
| 20    | Users               | `/users`               | `identity.read` |
| 30    | Groups              | `/groups`              | `identity.read` |
| 40    | Roles               | `/roles`               | `identity.read` |
| 50    | Organisations       | `/organisations`       | `identity.read` |
| 60    | Tenants             | `/tenants`             | `identity.read` |
| 70    | Departments         | `/departments`         | `identity.read` |
| 80    | Positions           | `/positions`           | `identity.read` |
| 90    | Memberships         | `/memberships`         | `identity.read` |
| 100   | Service Assignments | `/service-assignments` | `identity.read` |
| 110   | Invitations         | `/invitations`         | `identity.read` |
| 120   | Policies            | `/policies`            | `identity.read` |
| 130   | Audit               | `/audit`               | `identity.read` |
| 140   | History             | `/history`             | `identity.read` |
| 150   | References          | `/references`          | `identity.read` |
| 160   | Diagnostics         | `/diagnostics`         | `identity.read` |

## Routing

- `resolveIdentitySection(pathname)` (`apps/web/lib/identity/routes.ts`) maps a pathname to an `IdentitySection`, defaulting to `overview` for unknown suffixes.
- `identitySectionPath(section)` builds deep links, e.g. `identitySectionPath("users")` → `/workspace/identity/users`.
- `isIdentityRoute(pathname)` gates whether `workbench-page.tsx` mounts `IdentityWorkspaceRouter`.

## Deep links

```ts
import { identitySectionPath } from "@/lib/identity/routes";

identitySectionPath("service-assignments"); // "/workspace/identity/service-assignments"
```

## Coexistence

Identity does not share a workspace key, route prefix, or manifest parent id with Administration (`/workspace/administration`, `platform-admin`) or Platform Operations (`/workspace/operations`, `platform-administration`). Do not conflate the three workspaces.
