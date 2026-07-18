# APZHUB Platform — Tenant Architecture

> **Milestone:** M8-01 — Identity & Tenant Foundation  
> **Status:** Active  
> **Authority:** [Document 011](../011-platform-data-architecture-database-design-principles.md) · [ADR-0040](../adr/ADR-0040-platform-tenant-foundation.md)

---

## Overview

APZHUB owns tenant metadata as platform data. Backend engines (Law, future products) reference platform tenant IDs; they do not define authoritative tenant records.

---

## Data model

### `platform_tenant`

| Column                     | Type        | Notes                                                    |
| -------------------------- | ----------- | -------------------------------------------------------- |
| `tenant_id`                | text PK     | Stable platform ID (e.g. `t0000001-…`)                   |
| `slug`                     | text unique | URL-safe identifier                                      |
| `name`                     | text        | Display name                                             |
| `status`                   | text        | `active` \| `suspended` \| `archived`                    |
| `metadata`                 | jsonb       | Product keys, display hints (non-authoritative for RBAC) |
| `created_at`, `updated_at` | timestamptz | Audit                                                    |

### `platform_user_tenant`

| Column                     | Type                                  | Notes                              |
| -------------------------- | ------------------------------------- | ---------------------------------- |
| `membership_id`            | text PK                               |                                    |
| `user_id`                  | text FK → `user.id`                   | Better Auth user                   |
| `tenant_id`                | text FK → `platform_tenant.tenant_id` |                                    |
| `is_primary`               | boolean                               | Primary tenant for session default |
| `status`                   | text                                  | `active` \| `inactive`             |
| `created_at`, `updated_at` | timestamptz                           | Audit                              |

### `user.active_tenant_id`

Better Auth additional field mapped to `active_tenant_id`. Session resolution prefers this over membership lookup when set.

**Migration:** `packages/config/drizzle/0011_platform_identity.sql`

---

## Default tenant

| Constant                     | Value                                  |
| ---------------------------- | -------------------------------------- |
| `DEFAULT_PLATFORM_TENANT_ID` | `t0000001-0000-4000-8000-000000000001` |
| Default slug                 | `default-firm`                         |

Aligned with Law Platform `DEFAULT_LAW_TENANT_ID` for single-firm migration paths. Seed runs via `packages/config/src/db/seed.ts` and `seedDefaultPlatformTenantRow()`.

---

## TenantManagementService

Platform service (in `@apzhub/platform-identity`):

| Operation                                            | Description                          |
| ---------------------------------------------------- | ------------------------------------ |
| `createTenant`                                       | Register tenant with slug uniqueness |
| `getTenant` / `listTenants`                          | Read                                 |
| `suspendTenant` / `activateTenant` / `archiveTenant` | Lifecycle                            |
| `assignUserToTenant`                                 | Membership + optional primary        |
| `listUserTenants` / `listTenantUsers`                | Membership queries                   |
| `getDiagnostics`                                     | Counts for health/admin              |

**Stores:**

- **In-memory** — dev/test without PostgreSQL (`getSharedTenantManagementService()`)
- **PostgreSQL** — `postgres-tenant-store.ts` (Drizzle) for production paths

---

## Session tenant resolution

```text
getValidatedSession()
    → resolveSessionTenant()
        1. user.activeTenantId
        2. getPrimaryTenantIdForUser() [PostgreSQL]
        3. In-memory TenantSessionResolver
    → if none: provisionPlatformTenantForUser() → re-resolve
    → enrichValidatedSession() → { tenantId, tenantSource, user.* }
```

---

## Law persistence binding

```text
resolveLawTenantBinding({ sessionTenantId, explicitTenantId, userId })
    1. explicitTenantId        → explicit
    2. sessionTenantId         → session-claim   (M8-01 — closes TD-P02 primary path)
    3. userId + fallback gate  → session-single-firm-fallback
    4. env LAW_TENANT_ID       → env-override
    5. DEFAULT_LAW_TENANT_ID   → default-firm (legacy)
```

Production multi-tenant deployments must supply session tenant; fallback is development-only when explicitly allowed.

---

## Diagnostics

| Source                                      | Fields                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `TenantManagementService.getDiagnostics()`  | tenantCount, activeTenantCount, membershipCount, primaryMembershipCount |
| `GET /api/platform/v1/identity/diagnostics` | in-memory + postgres counts, session tenant snapshot                    |
| Law persistence diagnostics                 | `tenantSource` includes `session-claim`                                 |

---

## Out of scope (M8-01)

- Tenant administration UI (M8-03)
- Tenant-scoped RBAC roles (M8-02)
- Row-level security policies per product schema (product persistence milestones)
- Tenant provisioning workflows for SaaS onboarding (M8-05)

---

## Related documents

- [APZHUB Platform Identity Reference Architecture](./APZHUB-Platform-Identity-Reference-Architecture.md)
- [LAW-012-03 Tenant Context Specification](./LAW-012-03-Tenant-Context-Specification.md)
- [M8-01 completion report](../sprint/M8-01-completion-report.md)
