# `@apzhub/identity-contracts`

Platform Identity Administration System of Record contracts (APZIDENTITY-002).

## Scope

- Canonical identity metadata models (`IdentityUser`, groups, roles, organisations, tenants, memberships, service assignments, …)
- `identity.*` permission catalogue
- `IdentityPlatformGateway` nested facet contracts (`gateway.identity.*`)
- Read-oriented `IdentityPlatformService` interface

## Non-goals

Authentication credentials, login, MFA, OAuth/OIDC/SAML, SCIM, LDAP, provisioning, HTTP, Workbench, Event Bus.
