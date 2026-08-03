# Security Architecture — APZQEP-152

| Field     | Value                                          |
| --------- | ---------------------------------------------- |
| Programme | APZQEP-152                                     |
| Artefact  | SECURITY-ARCHITECTURE                          |
| Timestamp | 20260803T064000Z                               |
| Status    | Remediation implemented; certification pending |

---

## Request path (Cap A–F)

```text
Client
  → Better Auth session (cookie)
  → withPlatformApiAuth
       · authenticatePlatformApiRequest (401 if no session)
       · resolveSessionAuthorization(userId, tenantId, productKey: apzqep)
       · buildServiceRequestContext(..., permissions: authz.permissions)
       · traffic governance
       · runWithTenantContext(tenantId) → handler
  → actorFromContext (userId, tenantId, permissions — no elevation)
  → Cap domain service requirePermission (fail closed)
  → Cap postgres repository
       · runInDatabaseTransaction
       · applyPostgresTenantSession (app.tenant_id / FORCE RLS)
```

## Trust boundaries

| Boundary          | Rule                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| Client → API      | Never trust client roles, permissions, tenant, or actor IDs           |
| Session → context | Tenant and user from validated session only                           |
| Context → domain  | Permissions from PermissionService / resolveSessionAuthorization only |
| Domain → DB       | Tenant filter + RLS session GUC; no cross-tenant spoof via body       |

## Layers

1. **Authentication** — Better Auth session validation (`packages/auth`).
2. **Authorisation resolve** — `resolveSessionAuthorization` attaches effective Cap grants.
3. **HTTP actor construction** — pass-through only; empty permissions remain empty (fail closed).
4. **Domain enforcement** — Cap services call `requirePermission` before mutations/reads that need grants.
5. **Tenant isolation** — ALS tenant + `set_config('app.tenant_id', …)` on Cap TX path.
6. **Audit / logging** — platform API request/response logs (correlation, actor, tenant, operation); domain history for aggregates.

## Defects addressed

| ID     | Defect                                                       | Remediation                                              |
| ------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| RB-002 | Cap HTTP `actorFromContext` elevation when permissions empty | Elevation removed; real grants resolved                  |
| HR-001 | Cap F `system-reporting` synthetic actor                     | Facts from Cap repositories under caller Cap F authority |

## Not claimed complete

Workspace/nav Cap ACL gating, project membership ACL, full authz-decision audit via ProductionAuthorizationProvider on Cap paths, production load certification — see [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).
