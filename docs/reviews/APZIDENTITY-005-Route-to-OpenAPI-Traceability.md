# APZIDENTITY-005 — Route-to-OpenAPI Traceability Report

**Date:** 2026-07-17  
**OpenAPI:** Platform OpenAPI **1.7.0** — tag `Platform Identity Administration`  
**App Router routes:** **36** under `apps/web/app/api/v1/identity`

## Facet families (handlers ↔ OpenAPI ↔ client)

| Facet | Collection route | Item route | OpenAPI paths present | Typed client methods |
| --- | --- | --- | --- | --- |
| users | `/identity/users` | `/identity/users/{userId}` | Yes | list/get/create/update |
| groups | `/identity/groups` | `/identity/groups/{groupId}` | Yes | list/get/create/update |
| roles | `/identity/roles` | `/identity/roles/{roleId}` | Yes | list/get/create/update |
| organisations | `/identity/organisations` | `/identity/organisations/{organisationId}` | Yes | list/get/create/update |
| tenants | `/identity/tenants` | `/identity/tenants/{tenantId}` | Yes | list/get/create/update |
| departments | `/identity/departments` | item | Yes | list/get/create/update |
| positions | `/identity/positions` | item | Yes | list/get/create/update |
| memberships | `/identity/memberships` | item | Yes | list/get/create/update |
| service-assignments | `/identity/service-assignments` | item | Yes | list/get/create/update |
| invitations | `/identity/invitations` | item | Yes | list/get/create/update |
| activation | `/identity/activation` | item | Yes | list/get/create |
| deactivation | `/identity/deactivation` | item | Yes | list/get/create |
| policies | `/identity/policies` | item | Yes | list/get/create/update |
| audit | `/identity/audit` | item | Yes | list/get (read-only) |
| history | `/identity/history` | item | Yes | list/get (read-only) |
| references | `/identity/references` | item | Yes | list/get/create/update |
| diagnostics | health/readiness/capabilities/management-capabilities | n/a | Yes | diagnostics facades |

## Absences (certified)

No OpenAPI or App Router routes for: login, logout, password, oauth, oidc, saml, scim, ldap, mfa, provisioning, directory-sync, workbench, events, ai.

## Validation

`pnpm openapi:validate:platform` — PASS.
