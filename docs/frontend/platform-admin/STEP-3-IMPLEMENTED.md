# Platform Admin — Step 3 (Owner review)

| Field    | Value                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------ |
| Status   | **IMPLEMENTED** — stop for Owner review                                                          |
| Routes   | `/platform-admin/tenants/[tenantId]/users` · `/platform-admin/tenants/[tenantId]/users/[userId]` |
| Gap map  | [STEP-3-GAP-MAP.md](./STEP-3-GAP-MAP.md)                                                         |
| Evidence | `evidence/user-inspector-platform-admin.png` (after E2E)                                         |

## Built

- Tenant Detail **Users** tab (live); other tabs remain reserved.
- Tenant Users list from Postgres memberships + user profiles; honest `—` for department; Add User disabled.
- Full-page User Inspector (read-first): Overview, Products, Roles & Permissions, Scopes, Professional Tools, Platform Role, Sessions/Activity/Audit honesty, embedded Gap map tab.
- APIs gated by `platform.nav.administration.view`.

## Reused (not parallel IAM)

- `listMembershipsForTenant` / `platform_user_tenant`
- `inspectMemberEffectiveAccess` when org-member ledger exists
- Commercial product grants + entitlements
- `resolveSessionAuthorization` / PermissionService effective set
- Professional-tools ledger (kept separate from products)

## Deliberately not built

- Subscription / Products / Provisioning / Security / Audit tenant tabs
- Add User / Manage Access write wizards
- Fake permission provenance, fake org metadata, fake Mary Smith rows

## Tests

- Unit: `build-tenant-users.test.ts`, `build-user-inspector.test.ts`
- E2E: `pnpm test:e2e:platform-admin-tenant-users`
