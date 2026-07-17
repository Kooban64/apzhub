# APZHUB Identity Authorization Guide

**Milestone:** APZIDENTITY-002

## Catalogue

`PLATFORM_IDENTITY_PERMISSIONS` from `@apzhub/identity-contracts` is spread into `PLATFORM_SERVICE_PERMISSION_CATALOGUE`:

- `identity.*`
- `identity.read`
- `identity.manage`
- `identity.user`
- `identity.group`
- `identity.role`
- `identity.organization`
- `identity.tenant`
- `identity.assignment`
- `identity.audit`

## Operation map

`identityPlatformOps` maps gateway pipeline keys to granular permissions, for example:

| Pipeline key | Example ops | Permission |
| --- | --- | --- |
| `identityUsers` | list/get/create/update | `identity.user` |
| `identityGroups` | … | `identity.group` |
| `identityRoles` | … | `identity.role` |
| `identityOrganisations` / `identityDepartments` / `identityPositions` | … | `identity.organization` |
| `identityTenants` | … | `identity.tenant` |
| `identityServiceAssignments` | … | `identity.assignment` |
| `identityAudit` | list/get | `identity.audit` |
| `identityDiagnostics` | health/readiness/capabilities | `identity.read` |
| `identityInvitations` / `identityPolicies` | … | `identity.manage` |

## Rules

- Production authorization is **deny-by-default**
- **No allow-all** in production bootstrap
- **No client-side authorization** — server / RequestPipeline is authoritative
