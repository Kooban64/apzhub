# APZHUB Identity Administration Workbench

**Milestone:** APZIDENTITY-004
**Status:** Complete
**Route:** `/workspace/identity`

## Purpose

Product-neutral Identity Administration management interface for the Platform Identity **metadata management plane** — users, groups, roles, organisations, tenants, departments, positions, memberships, service assignments, invitations, policies, audit, history, and references.

**Metadata / lifecycle only.** This Workbench does **not** manage authentication, does **not** provision accounts in backend engines, and does **not** perform directory synchronisation.

## Architecture

```text
Identity Workbench
  → identity-api facades
  → /api/v1/identity/*
  → PlatformServiceGateway.identity.*
  → RequestPipeline → Production Authorization
  → Identity Platform Services → Core → Persistence → PostgreSQL
```

## Boundary

The Workbench imports only:

- `@/lib/identity/identity-api`
- `@/lib/identity/identity-errors`
- `@/lib/identity/identity-types`
- `@/lib/identity/query-keys`
- `@/lib/identity/routes`
- approved UI packages (`@apzhub/ui`, TanStack Query)

It must not import `@apzhub/identity-core`, `@apzhub/identity-persistence`, `@apzhub/platform-services`, the `PlatformServiceGateway`, Event Bus, or call `fetch` directly from components. It must not couple into the frozen Administration architecture (`apps/web/lib/administration`, `apps/web/components/administration`, `@apzhub/admin-core`, `@apzhub/admin-persistence`) — Identity is its own vertical.

## Registration

Manifest-driven under `packages/workbench-framework/manifests/platform-identity*`:

- Activity Bar: `platform-identity` (Identity), permission `identity.read`, order ~53
- Sidebar children (all `identity.read`): Overview, Users, Groups, Roles, Organisations, Tenants, Departments, Positions, Memberships, Service Assignments, Invitations, Policies, Audit, History, References, Diagnostics

Mounted via the catch-all workspace route + `IdentityWorkspaceRouter` in `workbench-page.tsx`, guarded by `isIdentityRoute` (`apps/web/lib/identity/routes.ts`). There is no dedicated `apps/web/app/workspace/identity` route tree.

## Capability notices (always visible)

- `AUTHENTICATION NOT MANAGED HERE`
- `PROVISIONING NOT AVAILABLE`
- `DIRECTORY SYNC NOT AVAILABLE`

These appear on the Overview cards and repeat as banners on Users and Diagnostics. No password fields, login forms, OAuth/OIDC/SAML/SCIM/LDAP/MFA controls, or `provisionUser`/directory-sync actions are ever rendered.

## Memberships & Service Assignments

Users carry read/manage panels for **Memberships** (user ↔ group/role/other target) and **Service Assignments** (subject ↔ downstream service capability, e.g. `projects`, `documents`, `workflow-engine`). Both are metadata records only — no runtime provisioning of the referenced service occurs.

## Unavailable (this milestone)

Live authentication, credential management, SSO/IdP configuration, SCIM/LDAP directory sync, automatic account provisioning in backend engines, Event Bus, AI administration.

## Audit

`pnpm audit:identity-workbench` — zero violations required.

## Next milestone

**APZIDENTITY-005 — Identity Vertical Certification & Production Readiness** (not started; await owner approval).

## See also

- [Identity HTTP API Architecture](./APZHUB-Identity-HTTP-API.md)
- [Identity Workbench Navigation Guide](../guides/APZHUB-Identity-Workbench-Navigation-Guide.md)
- [Identity Views Catalogue](../guides/APZHUB-Identity-Views-Catalogue.md)
- [APZIDENTITY-004 Completion Report](../sprint/APZIDENTITY-004-completion-report.md)
