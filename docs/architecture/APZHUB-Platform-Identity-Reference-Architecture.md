# APZHUB Platform — Identity Reference Architecture

> **Milestone:** M8-01 — Identity & Tenant Foundation  
> **Status:** Active (M8-01 complete)  
> **Authority:** [Document 007](../007-identity-authentication-authorisation-rbac-architecture.md) · [ADR-0040](../adr/ADR-0040-platform-tenant-foundation.md)  
> **Scope:** Platform identity and tenant binding only — RBAC is M8-02

---

## Purpose

Define how APZHUB owns identity-related platform metadata that all products consume: authentication handoff (Better Auth), tenant membership, session tenant resolution, and diagnostics. Products must not implement parallel identity systems.

---

## Layer model

```text
Client / Product UI
        ↓
@apzhub/auth (Better Auth session validation)
        ↓
Session tenant enrichment (resolveSessionTenant, provisionPlatformTenantForUser)
        ↓
@apzhub/platform-identity (TenantManagementService, TenantSessionResolver)
        ↓
PostgreSQL platform_tenant / platform_user_tenant / user.active_tenant_id
        ↓
Product persistence & APIs (consume session.tenantId — never own tenant SoR)
```

---

## Package boundaries

| Package | Responsibility | Must not |
| ------- | -------------- | -------- |
| `@apzhub/auth` | Better Auth config, `getValidatedSession()`, session tenant enrichment | Own tenant tables; implement RBAC |
| `@apzhub/platform-identity` | Tenant entity, membership, lifecycle, diagnostics, session resolver | Business logic; product-specific rules |
| `@apzhub/config` | Drizzle schema, migrations, seed for platform identity tables | Tenant resolution logic |
| Products (`apps/*`) | Pass `sessionTenantId` into persistence/API scopes | Duplicate tenant stores or auth enrichment |

---

## Session model (M8-01)

`getValidatedSession(headers)` returns an **enriched session**:

| Field | Description |
| ----- | ----------- |
| `user.id` | Better Auth user ID |
| `user.activeTenantId` | Persisted active tenant (when set) |
| `tenantId` | Resolved tenant for the current request |
| `tenantSource` | `user_active_tenant` \| `primary_membership` \| `none` |

**Resolution order:**

1. `user.activeTenantId` (or legacy `user.tenantId` field on session user)
2. Primary active membership in `platform_user_tenant` (PostgreSQL or in-memory)
3. First-login provisioning assigns default platform tenant when no membership exists

---

## API surface (platform)

| Route | Purpose |
| ----- | ------- |
| `GET /api/platform/v1/tenants` | List tenants + diagnostics (authenticated) |
| `GET /api/platform/v1/identity/diagnostics` | Identity/tenant diagnostics for operators |

---

## Product integration

### Law Platform

- `resolveLawTenantBinding()` accepts `sessionTenantId` from enriched session (source: `session-claim`).
- Workbench shell provider passes `sessionTenantId` from session user.
- Single-firm fallback gated by `LAW_ALLOW_SINGLE_FIRM_FALLBACK` (development only).

### Platform web (`apps/web`)

- Law API tenant resolver reads `session.tenantId`, `user.activeTenantId`, `user.tenantId`.
- Platform identity API routes use `@apzhub/platform-identity`.

---

## Deferred (M8-02+)

| Capability | Milestone |
| ---------- | --------- |
| PermissionService / RBAC evaluation | M8-02 |
| Administration Console | M8-03 |
| User preferences service | M8-04 |
| Feature flags & governance | M8-05 |
| Security hardening pass | M8-06 |

---

## Related documents

- [APZHUB Platform Tenant Architecture](./APZHUB-Platform-Tenant-Architecture.md)
- [Platform Technical Debt Register](./APZHUB-Platform-Technical-Debt-Register.md) — TD-P02
- [SPR-008 sprint guide](../sprint/SPR-008-platform-identity-administration-ux.md)
- [M8-01 completion report](../sprint/M8-01-completion-report.md)
