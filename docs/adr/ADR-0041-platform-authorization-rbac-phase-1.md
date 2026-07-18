# ADR-0041 — Platform Authorization Framework (RBAC Phase 1)

> **Status:** Accepted  
> **Date:** 2026-07-08  
> **Milestone:** M8-02 — Authorization Framework  
> **Authority:** [Document 007](../007-identity-authentication-authorisation-rbac-architecture.md) · [ADR-0040](./ADR-0040-platform-tenant-foundation.md)

## Problem

Manifest permission keys were declared across Workbench, Action, Knowledge, Event, and Law APIs, but runtime enforcement used deny-by-default adapters with empty permission sets (TD-M8-RBAC). Products risked implementing local permission logic.

## Decision

Introduce **`@apzhub/platform-authorization`** as the canonical Platform Authorization Framework (RBAC Phase 1):

1. **Services:** `AuthorizationService`, `PermissionService`, `RoleService`, `RoleAssignmentService`, `EffectivePermissionService`, diagnostics tracker.
2. **Schema:** `platform_authorization_permission`, `platform_authorization_role`, `platform_authorization_role_permission`, `platform_authorization_role_assignment` (migration `0012`).
3. **Role scopes:** platform, tenant, product — with inherited roles via `parent_role_id`.
4. **Evaluation outcomes:** allow, deny, not_applicable, unknown_permission, unknown_role, tenant_mismatch.
5. **Session bridge:** `resolveSessionAuthorization()` feeds Workbench `AuthSessionPermissionAdapter` and Law API permission resolver.
6. **Platform APIs:** `/api/platform/v1/roles`, `/permissions`, `/assignments`, `/authorization/diagnostics`.
7. **Events:** `platform.authorization.role.created|updated`, `platform.authorization.assignment.created|removed`.

`@apzhub/auth` remains authentication + tenant enrichment only — not authorization.

## Alternatives

| Alternative                     | Why rejected                                          |
| ------------------------------- | ----------------------------------------------------- |
| RBAC inside `@apzhub/auth`      | Violates identity/authorization separation (M8-01)    |
| Product-local permission stores | Duplicates platform capability; breaks manifest model |
| Full ABAC / policy engine now   | Out of scope — future phase                           |

## Consequences

- Products consume `AuthorizationService` / `resolveSessionAuthorization()` — no owned permission tables.
- Dev allow-all fallback remains when `isDevRegistrationAllowed()` and no grants exist.
- Administration UI, feature flags, delegation — deferred to M8-03+.
- Legacy `roles` / `user_roles` tables remain; new authorization schema is canonical for M8-02+.

## References

- [APZHUB Platform Authorization Reference Architecture](../architecture/APZHUB-Platform-Authorization-Reference-Architecture.md)
- [M8-02 completion report](../sprint/M8-02-completion-report.md)
