# ADR-0040 — Platform Tenant Foundation

> **Status:** Accepted  
> **Date:** 2026-07-08  
> **Milestone:** M8-01 — Identity & Tenant Foundation  
> **Authority:** [Document 007](../007-identity-authentication-authorisation-rbac-architecture.md) · [Document 011](../011-platform-data-architecture-database-design-principles.md)

## Problem

Better Auth sessions validated identity but did not carry a platform tenant claim (TD-P02). Law persistence and API layers fell back to `DEFAULT_LAW_TENANT_ID`, bypassing real multi-tenant isolation. Products were beginning to implement tenant resolution locally.

## Decision

Introduce **`@apzhub/platform-identity`** as the platform-owned tenant layer:

1. **Entities:** `platform_tenant`, `platform_user_tenant`, and `user.active_tenant_id` (PostgreSQL migration `0011_platform_identity.sql`).
2. **Service:** `TenantManagementService` — tenant lifecycle, membership, diagnostics (in-memory + PostgreSQL adapters).
3. **Session resolution:** `@apzhub/auth` enriches `getValidatedSession()` with `tenantId` and `tenantSource` via `resolveSessionTenant()` and first-login provisioning.
4. **Resolution order (Law persistence):** session claim → explicit context → env override → gated single-firm fallback (`LAW_ALLOW_SINGLE_FIRM_FALLBACK`).
5. **Default tenant ID:** `t0000001-0000-4000-8000-000000000001` — aligned across platform and law for migration compatibility.

Products consume platform tenant resolution; they do not own tenant tables or session enrichment.

## Alternatives

| Alternative                               | Why rejected                                                   |
| ----------------------------------------- | -------------------------------------------------------------- |
| Law-only tenant tables                    | Violates platform ownership; duplicates identity per product   |
| Tenant claim in JWT only                  | Misses membership changes; Better Auth session is SoR for auth |
| Product-specific fallbacks without gating | Perpetuates TD-P02 multi-tenant bypass                         |

## Consequences

- Sessions carry `tenantId` when membership or `activeTenantId` exists; first login provisions default membership when PostgreSQL is available.
- RBAC (`PermissionService`, role tables) remains **M8-02** — not in scope for M8-01.
- Dev/test environments without PostgreSQL continue using in-memory tenant bundle.
- Law API tenant resolution prefers auth session over development fallback.

## References

- [APZHUB Platform Identity Reference Architecture](../architecture/APZHUB-Platform-Identity-Reference-Architecture.md)
- [APZHUB Platform Tenant Architecture](../architecture/APZHUB-Platform-Tenant-Architecture.md)
- [M8-01 completion report](../sprint/M8-01-completion-report.md)
