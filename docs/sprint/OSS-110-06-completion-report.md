# OSS-110-06 — Production Authorisation & Policy Enforcement — Completion Report

**Milestone:** OSS-110-06  
**Date:** 2026-07-10  
**Status:** Complete  
**Package:** `@apzhub/platform-services` v0.5.0  
**Contracts:** `@apzhub/platform-service-contracts` (authz error codes)  
**ADR:** [ADR-0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md)

---

## Executive summary

OSS-110-06 replaces development-only allow-all authorisation with a production-capable, vendor-neutral authorisation and policy-enforcement layer. All gateway-exposed platform-service operations evaluate authenticated actor, tenant, organisation, role, permission, resource, and action decisions through the existing `RequestPipeline`. Deny-by-default precedence is deterministic. Production bootstrap never silently falls back to allow-all. No HTTP routes, UI, or Plane task CRUD were introduced.

---

## Milestone scope delivered

| Deliverable | Status |
|-------------|--------|
| Authorisation model (subject/tenant/org/role/permission/action/resource/decision) | ✅ |
| Permission catalogue `{capability}.{action}` | ✅ |
| Explicit operation → permission map | ✅ |
| `ProductionAuthorizationProvider` + `DenyAllAuthorizationProvider` | ✅ |
| `AuthorizationAccessResolver` + platform bridge + in-memory | ✅ |
| Role/permission resolution + documented precedence | ✅ |
| Production policies (authn, account, tenant, org, impersonation, mapping isolation, maintenance) | ✅ |
| RequestPipeline integration + audit sink | ✅ |
| Impersonation controls (no UI/HTTP) | ✅ |
| Tenant/org isolation with mapping-aware denial | ✅ |
| Bootstrap (`AUTHORIZATION_PROVIDER_MODE`) | ✅ |
| Structured authz audit events | ✅ |
| Typed authz error codes | ✅ |
| Shared test fixtures (`./testing`) | ✅ |
| Documentation + ADR-0050 | ✅ |
| HTTP / API routes | ⏸ Excluded |
| TaskServiceImpl / Plane task CRUD | ⏸ Excluded |
| OPA / Casbin / external policy engines | ⏸ Excluded |
| Identity admin UI / role screens | ⏸ Excluded |

---

## Architecture overview

```text
PlatformServiceGateway
  → RequestPipeline
      1. validate context
      2. enrich correlation / request IDs
      3. policies (preconditions)
      4. AuthorizationProvider (permissions)
      5. audit authorization.evaluated
      6. invoke service (on allow only)
  → MappingOrchestrator / providers / adapters
```

---

## Authorisation model

Structured requests and decisions with constrained resource types, actions, catalogue permissions, denial codes, and optional policy metadata. Client-supplied permissions are never authoritative.

---

## Permission catalogue summary

Naming: `{capability}.{action}` (+ `platform.impersonation.use`).  
Capabilities: workspace, project, team, user, search, administration, provider, mapping.  
See [Permission Catalogue](../specs/APZHUB-Platform-Permission-Catalogue.md).

---

## Role and permission resolution

Access snapshots from `AuthorizationAccessResolver` include subject status, tenant/org memberships, roles, grants, denials, and resource membership facts. Platform bridge wraps `@apzhub/platform-authorization` without scattering DB queries in the provider.

---

## Decision precedence

1. Invalid/inactive/anonymous actor  
2. Tenant membership  
3. Organisation mismatch  
4. Explicit deny  
5. Platform-admin override  
6. Explicit / role-derived grant  
7. Resource membership grant  
8. Default deny  

---

## Policy set implemented

Authenticated actor · active account · active tenant membership · organisation scope · impersonation · mapping tenant isolation · maintenance-mode contract.

---

## Operation-to-permission mapping

Explicit `OPERATION_AUTHORIZATION_MAPPINGS` for workspace, project (incl. status/label), team, user, and search operations.

---

## Tenancy and organisation enforcement

Policies + provider enforce request-context tenant/org. Mapping tenant mismatch denies before provider invocation when a resource ID resolves to a different tenant/org.

---

## Impersonation controls

Original vs effective actor; `platform.impersonation.use` required; privilege-escalation and platform-admin impersonation restrictions; full audit fields. No UI/endpoint.

---

## Audit-event behaviour

`AuthorizationAuditSink` / `InMemoryAuthorizationAuditSink` — safe fields only (no secrets/tokens/vendor payloads).

---

## Bootstrap and configuration

| Variable | Purpose |
|----------|---------|
| `AUTHORIZATION_PROVIDER_MODE` | `production` \| `allow-all` \| `deny-all` |
| `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION` | Explicit production allow-all escape hatch |

Invalid/missing production configuration fails with `INVALID_AUTHORIZATION_CONFIGURATION`.

---

## Persistence and migration changes

**None.** Reuses existing identity/RBAC persistence and extended authorization seed permissions. No duplicate role system.

---

## Files created (primary)

| Path | Role |
|------|------|
| `packages/platform-services/src/authorization/*` | Catalogue, map, provider, policies, audit, bootstrap, public barrel |
| `packages/platform-services/src/testing/authorization-fixtures.ts` | Shared fixtures |
| `packages/platform-services/src/authorization.production.test.ts` | Authz + security tests |
| `docs/adr/ADR-0050-*.md` | Decision record |
| `docs/architecture/APZHUB-Platform-Service-Authorization.md` | Architecture |
| `docs/specs/APZHUB-Platform-Permission-Catalogue.md` | Catalogue |
| `docs/sprint/OSS-110-06-completion-report.md` | This report |

---

## Files modified (primary)

| Path | Change |
|------|--------|
| `packages/platform-services` pipeline, factory, exports, README | Wire production authz |
| `packages/platform-service-contracts` errors | Authz error codes |
| `packages/platform-authorization` seed | Catalogue-aligned grants |
| `packages/config` governance schema/registry | Authz env keys |
| Foundation + architecture + CHANGELOG + `.env.example` | Closeout |

---

## Tests added

- `authorization.production.test.ts` — 26 tests (allow/deny, tenant/org, roles, grants, deny precedence, admin, impersonation, mapping isolation, bootstrap, audit, security boundaries)
- Execution-layer updates for `PERMISSION_DENIED` / `POLICY_DENIED`
- Regression: platform-services, contracts, Plane, integration-sdk, platform-authorization

---

## Total test statistics (closeout)

| Suite | Result |
|-------|--------|
| `@apzhub/platform-services` | **122** passed |
| `@apzhub/platform-service-contracts` | **8** passed |
| Plane + integration-sdk + platform-authorization (sampled) | **111** passed |
| Authz-focused unit file | **26** passed |
| Execution layer | **13** passed |

---

## Security test results

Covered: cross-tenant denial · guessed global ID · impersonation escalation prevention · client-supplied roles not trusted · no service execution after deny · safe public denial errors · no silent production allow-all.

---

## Coverage

| Area | Lines (approx.) |
|------|-----------------|
| `packages/platform-services/src/authorization` | ~79% |
| `packages/platform-services/src/execution` | ~94% |
| `packages/platform-services/src/policy` | ~89% |

---

## Quality-gate results

| Gate | Result |
|------|--------|
| ESLint (`platform-services`) | Pass |
| Typecheck (`platform-services`, contracts, config) | Pass |
| Unit / integration tests (above) | Pass |
| Plane adapter regressions | Pass (37 core Plane tests in package suite) |
| Integration SDK regressions | Pass |
| New DB migrations | N/A |

---

## Backward-compatibility assessment

- Gateway public accessors unchanged  
- Pipeline extension points preserved  
- Allow-all / deny-all available for explicit test/dev selection  
- Mapping store, provider registry, Plane provider unchanged  
- Additive context fields retain defaults  
- Production security not weakened for legacy unsafe paths  

---

## Deployment considerations

1. Set `AUTHORIZATION_PROVIDER_MODE=production` in production.  
2. Wire `AuthorizationAccessResolver` (platform bridge) with live authorization data.  
3. Do not set `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION` except controlled break-glass.  
4. Ensure authorization seed includes catalogue permissions for deployed roles.

---

## Security considerations

Deny-by-default; Zero Trust evaluation every request; tenant/org isolation aligned with mapping store; audit without secret leakage; public errors sanitised.

---

## Technical debt

- Authorization folder line coverage ~79% (below some package thresholds for other areas) — extend edge-case tests in a follow-up if required.  
- Maintenance-mode is a contract hook only (no admin UI).  
- Platform bridge still depends on composition-root wiring for live DB-backed authorization.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Misconfigured production allow-all | Bootstrap assert + escape hatch required |
| Incomplete role seed | Catalogue + seed alignment; fail closed |
| Future routes bypassing gateway | Documented invariant; next milestone must use gateway |

---

## Recommendation for the next milestone

Suggested **API routes / HTTP surface** (owner-named, e.g. part of a later OSS-110 slice) **or** **OSS-101-06 Task board** — only after explicit owner approval. Do **not** start either without approval.

---

## Stop condition

**OSS-110-06 complete.** Do not begin HTTP/API routes, OSS-101-06, OSS-110-07, or any other milestone without explicit owner approval.
