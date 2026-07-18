# APZHUB Identity Platform Services Architecture

**Milestone:** APZIDENTITY-002  
**Status:** Complete — Platform Services, Gateway & Authorization

## Request path

```text
Consumers → gateway.identity.* → RequestPipeline → Production Authorization
→ Identity Platform Services → Identity Core → Identity Persistence → PostgreSQL
```

## Layers

| Layer         | Package / location                                      | Responsibility                               |
| ------------- | ------------------------------------------------------- | -------------------------------------------- |
| Gateway       | `PlatformServiceGateway.identity`                       | Nested facet access                          |
| Authz         | `identityPlatformOps` + `PLATFORM_IDENTITY_PERMISSIONS` | Deny-by-default production                   |
| Thin services | `@apzhub/platform-services` `services/identity`         | Validate context mapping + error translation |
| Domain        | `@apzhub/identity-core` `createPlatformIdentityService` | Lifecycle, validation, orchestration         |
| Persistence   | `@apzhub/identity-persistence`                          | In-memory (test) / PostgreSQL (production)   |
| Contracts     | `@apzhub/identity-contracts` `IdentityPlatformGateway`  | Facet types + inputs                         |

## Facets

`users`, `groups`, `roles`, `organisations`, `tenants`, `departments`, `positions`, `memberships`, `serviceAssignments`, `invitations`, `activation`, `deactivation`, `policies`, `audit`, `history`, `references`, `diagnostics`.

## Boundaries

- **Metadata SoR only** — not authentication
- **No passwords / sessions / OAuth / OIDC / MFA / SAML / SCIM / LDAP / tokens**
- **No HTTP / OpenAPI / typed client** (APZIDENTITY-003)
- **No Workbench / provisioning / directory sync / live IdP probes**
- **No Event Bus / AI**
- Permissions use `identity.*` from identity-contracts

## Enablement

Env gate: `APZHUB_IDENTITY_ENABLED` ∈ `{1,true,on}` (deny-by-default). Production requires `DATABASE_URL` / PostgreSQL — no silent in-memory fallback.
