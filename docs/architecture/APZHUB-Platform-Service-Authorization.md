# APZHUB Platform Service Authorization

**Milestone:** OSS-110-06 + **OSS-110-10**  
**Status:** Canonical — production authorisation for platform-service gateway operations  
**Package:** `@apzhub/platform-services` v0.7.0  
**Authority:** [007](../007-identity-authentication-authorisation-rbac-architecture.md) · [013](../013-security-architecture-zero-trust-framework.md) · [ADR-0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md)

---

## Purpose

Replace development-only allow-all authorisation with a production-capable, vendor-neutral authorisation and policy-enforcement layer for all application-facing platform-service operations executed through `RequestPipeline`.

---

## Dependency direction

```text
Modules / future API layer
  → PlatformServiceGateway
    → RequestPipeline
      → policies (preconditions / governance)
      → AuthorizationProvider (permission decisions)
        → AuthorizationAccessResolver
          → @apzhub/platform-authorization (identity / RBAC)
      → (on allow) platform service implementation
        → mapping / provider orchestration → adapter
```

**Prohibited:** Plane roles as platform authz; adapter-side platform authz; services querying role tables; silent production allow-all; client-supplied roles as sole authority; vendor-native IDs as security boundaries.

---

## Authorisation model

| Field                  | Meaning                                    |
| ---------------------- | ------------------------------------------ |
| Subject                | Authenticated actor (effective user)       |
| Tenant                 | Required tenancy scope                     |
| Organisation           | Optional organisation scope                |
| Role                   | Platform roles (not engine roles)          |
| Permission             | Catalogue key `{capability}.{action}`      |
| Action                 | Operation action (list/read/create/…)      |
| Resource type / ID     | Typed resource under evaluation            |
| Ownership / membership | Resource-scoped facts from access snapshot |
| Decision               | `allow` \| `deny`                          |
| Reason / denial code   | Safe public reason + internal code         |
| Policy metadata        | Composable policy outcomes                 |

---

## Decision precedence

Deny-by-default. See [ADR-0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md) §3.

---

## Policies (production set)

| Policy ID                           | Priority | Responsibility                                |
| ----------------------------------- | -------- | --------------------------------------------- |
| `authenticated-actor-required`      | 10       | Non-anonymous `userId`                        |
| `active-account-required`           | 20       | Subject status `active`                       |
| `active-tenant-membership-required` | 30       | Active membership in `tenantId`               |
| `organisation-scope-validation`     | 40       | Org membership when `organisationId` set      |
| `impersonation-controls`            | 50       | Impersonation permission / escalation gates   |
| `mapping-tenant-isolation`          | 60       | Mapped resource tenant/org must match context |
| `maintenance-mode`                  | 70       | Contract hook when maintenance flag set       |

Policies short-circuit on first deny (`POLICY_DENIED`). Permission evaluation remains in the provider.

---

## Operation → permission mapping

Explicit table in `operation-authorization-map.ts`. Examples:

| Service             | Operation                | Permission                    | Resource             |
| ------------------- | ------------------------ | ----------------------------- | -------------------- |
| workspace           | `listWorkspaces`         | `workspace.list`              | workspace            |
| project             | `getProject`             | `project.read`                | project + ID         |
| project             | `createProject`          | `project.create`              | project              |
| project             | `archiveProject`         | `project.archive`             | project + ID         |
| team                | `listTeams`              | `team.list`                   | team                 |
| user                | `listUsers` / `getUser`  | `user.list` / `user.read`     | user                 |
| search              | `search`                 | `search.execute`              | search               |
| support             | `listSupportRequests`    | `support.requests.list`       | support_request      |
| support             | `closeSupportRequest`    | `support.requests.transition` | support_request + ID |
| support             | `assignSupportRequest`   | `support.requests.assign`     | support_request + ID |
| supportOrganization | `listOrganizations`      | `support.organizations.list`  | support_organization |
| supportArticle      | `createNote`             | `support.articles.create`     | support_article      |
| supportAnalytics    | `getSupportIntelligence` | `support.analytics.read`      | support_analytics    |

Full catalogue: [Permission Catalogue](../specs/APZHUB-Platform-Permission-Catalogue.md).

---

## Bootstrap

| Env                                     | Values                                    |
| --------------------------------------- | ----------------------------------------- |
| `AUTHORIZATION_PROVIDER_MODE`           | `production` \| `allow-all` \| `deny-all` |
| `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION` | `true` only as explicit escape hatch      |

Production must not silently use allow-all. Missing/invalid configuration fails with `INVALID_AUTHORIZATION_CONFIGURATION`.

---

## Audit

`AuthorizationAuditSink` records structured `authorization.evaluated` events (actor, effective actor, tenant, org, permission, resource, decision, denial, impersonation, correlation/request IDs, duration). No secrets, tokens, or vendor payloads.

---

## Errors

| Code                                  | Typical cause               |
| ------------------------------------- | --------------------------- |
| `AUTHENTICATION_REQUIRED`             | Anonymous / missing actor   |
| `INVALID_ACTOR` / `INACTIVE_ACTOR`    | Bad or inactive subject     |
| `TENANT_MEMBERSHIP_REQUIRED`          | No active tenant membership |
| `ORGANISATION_SCOPE_MISMATCH`         | Org scope failure           |
| `PERMISSION_DENIED`                   | Provider deny               |
| `POLICY_DENIED`                       | Policy deny                 |
| `IMPERSONATION_DENIED`                | Impersonation rule failure  |
| `AUTHORIZATION_UNAVAILABLE`           | Provider/resolver failure   |
| `INVALID_AUTHORIZATION_CONFIGURATION` | Bootstrap misconfiguration  |

Public messages must not reveal internal role graphs, hidden permissions, or DB details.

---

## HTTP surface (OSS-110-07)

Application HTTP routes under `/api/v1` call `PlatformServiceGateway` only. See [Platform HTTP API](./APZHUB-Platform-HTTP-API.md) and [ADR-0051](../adr/ADR-0051-platform-http-api-surface.md).

---

## Related

- [Platform Execution Layer](./APZHUB-Platform-Execution-Layer.md)
- [Platform Authorization Reference Architecture](./APZHUB-Platform-Authorization-Reference-Architecture.md)
- [Platform Service Gateway](../specs/APZHUB-Platform-Service-Gateway.md)
- [OSS-110-06 Completion Report](../sprint/OSS-110-06-completion-report.md)
