# APZHUB Platform — Authorization Reference Architecture

> **Milestone:** M8-02 — Authorization Framework (RBAC Phase 1)  
> **Status:** Active  
> **Authority:** [Document 007](../007-identity-authentication-authorisation-rbac-architecture.md) · [ADR-0041](../adr/ADR-0041-platform-authorization-rbac-phase-1.md)

---

## Purpose

Define the Platform Authorization Framework — canonical RBAC Phase 1. Identity (M8-01) determines **who**; authorization determines **what**; governance (M8-05+) determines **why**.

Products consume authorization. Products must not implement authorization logic.

---

## Package: `@apzhub/platform-authorization`

| Service                      | Responsibility                                             |
| ---------------------------- | ---------------------------------------------------------- |
| `AuthorizationService`       | Facade — evaluate, effective permissions, diagnostics      |
| `PermissionService`          | Permission catalog registration and lookup                 |
| `RoleService`                | Role lifecycle, inheritance, role-permission grants        |
| `RoleAssignmentService`      | User ↔ role assignments (tenant/product scoped)            |
| `EffectivePermissionService` | Computes direct + inherited + scoped effective permissions |
| `AuthorizationDiagnostics`   | Evaluation counters, cache stats, entity counts            |

**Exports:** `.` (in-memory bundle), `./server` (session bridge), `./postgres` (Drizzle store)

---

## RBAC model

### Role scopes

| Scope      | Binding       | Example          |
| ---------- | ------------- | ---------------- |
| `platform` | Global        | `platform-admin` |
| `tenant`   | `tenant_id`   | `tenant-member`  |
| `product`  | `product_key` | `law-operator`   |

### Role types (Phase 1)

- **Platform roles** — cross-product administration
- **Tenant roles** — firm/workspace scoped
- **Product roles** — law-platform, future products
- **Inherited roles** — `parent_role_id` chain merged into effective permissions
- **Custom roles** — created via API/service at runtime

---

## Permission model

Manifest-driven dot-notation keys. Canonical namespaces:

`platform.*` · `tenant.*` · `user.*` · `product.*` · `workspace.*` · `service.*` · `law.*` · `legal.*` · `trust.*`

Wildcard grants supported: `*`, `legal.*`, `trust.*`

Evaluation uses `permissionPatternMatches()` — exact match or namespace wildcard.

---

## Effective permissions

Computed per request context `{ userId, tenantId?, productKey? }`:

1. Active role assignments filtered by tenant/product scope
2. Inherited parent roles expanded
3. Role-permission grants merged (deny overrides allow)
4. Cached per user/tenant/product key

Sources: **direct role permissions**, **inherited role permissions**, **tenant scope**, **product scope**.

---

## Authorization evaluation

| Outcome              | Meaning                                                 |
| -------------------- | ------------------------------------------------------- |
| `allow`              | Granted permission matches effective set                |
| `deny`               | No matching allow, or explicit deny                     |
| `not_applicable`     | Empty/undefined permission key                          |
| `unknown_permission` | Key not in catalog and not canonical namespace          |
| `unknown_role`       | Assignment references missing role                      |
| `tenant_mismatch`    | Tenant-scoped assignment/role incompatible with context |

---

## Repository layer

| Repository                 | Implementations       |
| -------------------------- | --------------------- |
| `PermissionRepository`     | In-memory, PostgreSQL |
| `RoleRepository`           | In-memory, PostgreSQL |
| `RolePermissionRepository` | In-memory, PostgreSQL |
| `RoleAssignmentRepository` | In-memory, PostgreSQL |

Repository parity tests validate in-memory contract (PostgreSQL path via `postgres-authorization-store.ts`).

**Migration:** `0012_platform_authorization.sql`

---

## Platform events

| Event ID                                    | Trigger            |
| ------------------------------------------- | ------------------ |
| `platform.authorization.role.created`       | Role created       |
| `platform.authorization.role.updated`       | Role updated       |
| `platform.authorization.assignment.created` | Assignment created |
| `platform.authorization.assignment.removed` | Assignment removed |

Manifests: `events/platform/authorization/*/event.yaml`

---

## Platform APIs

| Route                                        | Methods           | Purpose                     |
| -------------------------------------------- | ----------------- | --------------------------- |
| `/api/platform/v1/roles`                     | GET, POST         | List/create roles           |
| `/api/platform/v1/permissions`               | GET, POST         | List/register permissions   |
| `/api/platform/v1/assignments`               | GET, POST, DELETE | Role assignments            |
| `/api/platform/v1/authorization/diagnostics` | GET               | Diagnostics + recent events |

All routes require validated session (M8-01).

---

## Product integration

### Session bridge

```text
getValidatedSession()
  → resolveSessionAuthorization({ userId, tenantId, productKey })
  → createAuthPermissionContextFromUser(user, { roles, permissions })
  → WorkbenchPermissionAdapter (registry filters + command gates)
```

### Law Platform

- Hydration: `createLawPlatformAuthPermissionContext()` in all registry loaders
- Law API: `resolveLawApiPermissions()` async → AuthorizationService
- Trust commands: inherit permission adapter from Workbench shell (no product-owned RBAC)

### Platform web

- `createPlatformAuthPermissionContext()` for Workbench hydration

Dev fallback: `isDevRegistrationAllowed()` grants `["*"]` when no assignments exist (unchanged behaviour).

---

## Diagnostics

`AuthorizationService.getDiagnostics()` tracks:

- Permission evaluation counts by outcome
- Cache hits/misses for effective permission computation
- Role, permission, assignment counts
- Evaluation failure count

`/api/platform/v1/authorization/diagnostics` exposes in-memory + PostgreSQL counts.

---

## Deferred (not M8-02)

- Administration Console UI (M8-03)
- Feature flags / governance (M8-05)
- Delegation, approval workflows, ABAC, policy engine

---

## Platform service gateway enforcement (OSS-110-06)

Gateway-facing platform services enforce authorisation through `@apzhub/platform-services`:

- `ProductionAuthorizationProvider` + production policies on `RequestPipeline`
- Governed permission catalogue `{capability}.{action}`
- Access data via `AuthorizationAccessResolver` (bridges this package; services do not query tables)
- Bootstrap: `AUTHORIZATION_PROVIDER_MODE` — no silent production allow-all

See [ADR-0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md) and [Platform Service Authorization](./APZHUB-Platform-Service-Authorization.md).

---

## Related documents

- [Platform Identity Reference Architecture](./APZHUB-Platform-Identity-Reference-Architecture.md)
- [Platform Tenant Architecture](./APZHUB-Platform-Tenant-Architecture.md)
- [Platform Service Authorization](./APZHUB-Platform-Service-Authorization.md)
- [M8-02 completion report](../sprint/M8-02-completion-report.md)
- [OSS-110-06 completion report](../sprint/OSS-110-06-completion-report.md)
