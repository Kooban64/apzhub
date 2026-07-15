# ADR-0050: Production Authorisation & Policy Enforcement

## Status

Accepted — OSS-110-06

## Context

OSS-110-04 introduced a pluggable `AuthorizationProvider` and policy framework with a development `AllowAllAuthorizationProvider` default. Production platform-service operations must enforce authenticated actor, tenant, organisation, role, permission, resource, and action decisions through `RequestPipeline` without Plane/vendor roles, without HTTP routes, and without silent allow-all in production.

Related prior decisions: [ADR-0041](./ADR-0041-platform-authorization-rbac-phase-1.md) (RBAC Phase 1 data model), [ADR-0040](./ADR-0040-platform-tenant-foundation.md), [ADR-0049](./ADR-0049-persistent-entity-mapping-store.md).

## Decision

### 1. Production authorisation strategy

1. **Boundary:** Modules / future API → `PlatformServiceGateway` → `RequestPipeline` → policies → `AuthorizationProvider` → authorisation access resolver → existing identity/RBAC persistence (`@apzhub/platform-authorization`). Services never query role tables directly; adapters never authorise platform access.
2. **Provider:** `ProductionAuthorizationProvider` evaluates structured `AuthorizeRequest` and returns `AuthorizationDecision` (allow/deny). Ordinary denial does **not** throw; the pipeline maps denial to typed `PlatformServiceError` codes.
3. **Vendor neutrality:** Plane (and all engines) roles never determine APZHUB platform access. Client-supplied `context.permissions` / role names are never trusted alone.

### 2. Permission model

1. **Catalogue:** Governed keys `{capability}.{action}` plus `platform.impersonation.use`.
2. **Capabilities (current):** workspace, project, team, user, search, administration, provider, mapping.
3. **Actions:** list, read, create, update, archive, delete, manage, administer, execute (search).
4. **Mapping:** Explicit `OPERATION_AUTHORIZATION_MAPPINGS` — never method-name reflection as the sole source of truth.
5. **Roles:** Reuse established APZHUB roles (platform administrator, administrator, manager, standard user) via existing authorization seed/grants — no parallel role system.

### 3. Decision precedence (deny-by-default)

Strict order — no ambiguity:

1. Invalid / inactive / anonymous actor  
2. Tenant membership missing or inactive  
3. Organisation membership mismatch (when organisation-scoped)  
4. Explicit deny permission (where model supports deny grants)  
5. Platform administrator override (governed; default enabled)  
6. Explicit / role-derived allow grant  
7. Resource ownership / membership grant  
8. Default deny  

Impersonation is validated before effective-actor permission evaluation.

### 4. Impersonation governance

1. Request context carries original actor (`impersonation.actorUserId`) and effective `userId`.
2. Original actor must hold `platform.impersonation.use`.
3. Privilege escalation is prohibited (impersonator cannot gain permissions they lack via target, beyond governed rules; cannot impersonate platform administrators unless explicitly governed).
4. Full audit visibility: original actor, effective actor, reason metadata when present. No impersonation UI or HTTP endpoint in this milestone.

### 5. Production allow-all prohibition

1. `AUTHORIZATION_PROVIDER_MODE`: `production` | `allow-all` | `deny-all`.
2. Defaults: allow-all outside production; **production** mode when `NODE_ENV=production` and mode unset (raw env path).
3. Allow-all in production requires explicit `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION=true` — otherwise bootstrap fails with `INVALID_AUTHORIZATION_CONFIGURATION`.
4. Production mode requires an `AuthorizationAccessResolver`; missing resolver fails bootstrap clearly.
5. Operators should set `AUTHORIZATION_PROVIDER_MODE=production` explicitly in production deployments.

### 6. Policies vs provider

- **Policies:** Preconditions and governance (authenticated actor, active account, tenant membership, organisation scope, impersonation gate, mapping tenant isolation, maintenance-mode contract).
- **Provider:** Permission / role / resource decisions.
- Do not duplicate permission evaluation inside policies.

### 7. Persistence

No new role/permission schema in OSS-110-06. Use existing `@apzhub/platform-authorization` persistence and seed catalogue extensions. Access data is obtained only through `AuthorizationAccessResolver` (in-memory for tests; platform bridge for production wiring).

## Alternatives considered

1. **OPA / Casbin** — rejected for this milestone; external policy engines are out of scope.
2. **Trust client-supplied permissions on context** — rejected; Zero Trust requires server-side resolution.
3. **Silent production allow-all** — rejected; security defect.
4. **Per-service inline permission checks** — rejected; must remain central in pipeline + provider.

## Consequences

- `@apzhub/platform-services` v0.5.0 ships production authz, policies, audit sink hooks, operation map, fixtures.
- Gateway public accessors remain unchanged; additive context fields retain defaults.
- Future API routes must call gateway only — never bypass pipeline.
- Known limitation: full identity administration UI and automated access reviews remain out of scope.

## Related

- [007 — Identity & RBAC](../007-identity-authentication-authorisation-rbac-architecture.md)
- [Platform Authorization Reference Architecture](../architecture/APZHUB-Platform-Authorization-Reference-Architecture.md)
- [Platform Service Authorization Architecture](../architecture/APZHUB-Platform-Service-Authorization.md)
- [Permission Catalogue](../specs/APZHUB-Platform-Permission-Catalogue.md)
- [OSS-110-06 Completion Report](../sprint/OSS-110-06-completion-report.md)
