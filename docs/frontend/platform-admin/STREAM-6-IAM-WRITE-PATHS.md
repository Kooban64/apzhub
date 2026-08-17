# Stream 6 — IAM Write Paths Phase 1

| Field        | Value                                                                              |
| ------------ | ---------------------------------------------------------------------------------- |
| Status       | **ACCEPTED** (2026-08-17) — Owner accepted Phase 1 write paths                     |
| Prerequisite | [STREAM-6-IAM-COMPLETION.md](./STREAM-6-IAM-COMPLETION.md) read model **ACCEPTED** |
| Rule         | Every write is explainable immediately after save via User Inspector               |

## Scope delivered

1. **Add User** — `/api/v1/platform-admin/tenants/[tenantId]/users/write` + wizard on Users list
2. **Manage Access** — product roles, scopes, PT grant/revoke, role GAIN/LOSE preview
3. **Role Change** — `previewProductRoleChange` / `applyProductRoleChange` (product-independent)
4. **Scope Change** — `upsertPostgresUserScopedPermissions` via Manage Access
5. **Professional Tool Grants** — separate from product UI; reason + expiry
6. **Deactivate User** — suspend membership, revoke sessions, revoke PT, clear grants

## Durable writers

| Concern        | Writer                                                              |
| -------------- | ------------------------------------------------------------------- |
| Membership     | `ensureUserTenantMembership` / `setUserTenantMembershipStatus`      |
| Product grants | `setUserProductGrantsDurable` (Postgres SoR + file dual-write)      |
| Product roles  | `upsertPostgresRoleAssignment` / `deactivatePostgresRoleAssignment` |
| Scopes         | `upsertPostgresUserScopedPermissions`                               |
| Employment     | `upsertEmploymentMetadata`                                          |
| Sessions       | `revokeAllSessionsForUser`                                          |
| PT             | existing grant/revoke (separate entitlement)                        |

## Explainability rule

> Every IAM write must be explainable immediately after save.

After Add User / Manage Access / Role / Scope / PT / Deactivate, the User Inspector reads the same durable Postgres model and shows:

- what changed (product roles, scopes, PT);
- why permissions exist (provenance);
- where scope applies;
- team vs direct source.

## Signature proof

`pnpm test:e2e:platform-admin-iam-write` — Support Agent + Engineering on APZOR → Inspector confirms products/tools; role preview shows GAIN/LOSE.

## Explicitly not built

- Custom role creation
- Access-request / access-review workflows
- Subscription / Products / Security / Audit Platform Admin tabs
- Parallel IAM stores
- Fine-grained Source Merge / Security Terminal capabilities (negative by omission — not granted)
