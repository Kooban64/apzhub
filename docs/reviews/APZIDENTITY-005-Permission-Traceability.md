# APZIDENTITY-005 — Permission Traceability Matrix

**Date:** 2026-07-17  
**Catalogue:** `PLATFORM_IDENTITY_PERMISSIONS`  
**Map:** `identityPlatformOps`

| Gateway service                 | Op                            | Permission            | HTTP (representative)           | Typed client                | Workbench action       |
| ------------------------------- | ----------------------------- | --------------------- | ------------------------------- | --------------------------- | ---------------------- |
| identityUsers                   | list/get                      | identity.user         | GET `/identity/users`           | `listUsers` / `getUser`     | Users list/detail      |
| identityUsers                   | create/update                 | identity.user         | POST/PATCH users                | `createUser` / `updateUser` | Create/edit user       |
| identityActivation              | create                        | identity.user         | POST activation                 | `createActivation`          | Activate               |
| identityDeactivation            | create                        | identity.user         | POST deactivation               | `createDeactivation`        | Deactivate             |
| identityGroups                  | *                             | identity.group        | `/identity/groups`              | groups facades              | Groups section         |
| identityRoles                   | *                             | identity.role         | `/identity/roles`               | roles facades               | Roles section          |
| identityOrganisations           | *                             | identity.organization | `/identity/organisations`       | org facades                 | Organisations          |
| identityTenants                 | *                             | identity.tenant       | `/identity/tenants`             | tenant facades              | Tenants                |
| identityDepartments / Positions | *                             | identity.organization | departments/positions           | facades                     | Departments/Positions  |
| identityMemberships             | *                             | identity.user         | `/identity/memberships`         | memberships                 | Memberships            |
| identityServiceAssignments      | *                             | identity.assignment   | `/identity/service-assignments` | assignments                 | Service Assignments    |
| identityInvitations             | *                             | identity.manage       | `/identity/invitations`         | invitations                 | Invitations            |
| identityPolicies                | *                             | identity.manage       | `/identity/policies`            | policies                    | Policies               |
| identityAudit                   | list/get                      | identity.audit        | `/identity/audit`               | audit                       | Audit (read-only)      |
| identityHistory                 | list/get                      | identity.read         | `/identity/history`             | history                     | History (read-only)    |
| identityReferences              | list/get                      | identity.read         | `/identity/references`          | references                  | References             |
| identityReferences              | create/update                 | identity.manage       | POST/PATCH references           | create/update               | References manage      |
| identityDiagnostics             | health/readiness/capabilities | identity.read         | diagnostics routes              | diagnostics                 | Diagnostics / Overview |

Workbench visibility uses `identity.read` for navigation; mutations require granular permissions. Server authorization remains authoritative.
