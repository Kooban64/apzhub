# Platform Admin Step 3 — Stream 6 gap map

| Field | Value                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------- |
| Slice | Tenant Users + User Inspector (read-first)                                                               |
| Date  | 2026-08-17                                                                                               |
| Rule  | Extend BetterAuth / PermissionService / catalogue / tenant architecture — **do not invent parallel IAM** |

## Gap map

| Requirement                                                | Existing source                                               | Reusable?                  | Gap?                                                    | Recommended extension                 |
| ---------------------------------------------------------- | ------------------------------------------------------------- | -------------------------- | ------------------------------------------------------- | ------------------------------------- |
| Tenant membership                                          | `platform_user_tenant` + `listMembershipsForTenant`           | Yes                        | None for read                                           | Keep Postgres as Platform Admin SoR   |
| Organisational metadata (department / job title / manager) | Identity employment tables                                    | No (not wired)             | Yes — shown as `—`                                      | Join employment by userId+tenantId    |
| Staff function                                             | org-member `personaRoleId` + staff-function templates         | Yes when ledger row exists | Dual SoR: Postgres membership vs file org-member ledger | Always write org-member on provision  |
| Teams                                                      | —                                                             | No                         | Yes — not configured                                    | Stream 6 teams model later            |
| Product assignments                                        | product-access file ledger + `resolveTenantEntitlements`      | Yes                        | File-backed; not Postgres SoR                           | Migrate grants to platform SoR        |
| Product roles                                              | staff-function `suggestedProducts` when grant present         | Partial                    | No durable product-role assignment                      | Persist product role on grant / AuthZ |
| Permissions                                                | `resolveSessionAuthorization` / PermissionService             | Yes                        | None for flat allow-list                                | Keep server authoritative             |
| Permission provenance                                      | `evaluatePermissionAgainstEffective` (single-key)             | Partial                    | No bulk “Granted by / Scope / Resource”                 | Extend evaluation lineage API         |
| Resource scopes                                            | Scoped permission prefixes                                    | Yes                        | Empty when no grants — honest                           | None for read                         |
| Professional-tool entitlements                             | professional-tools file ledger                                | Yes                        | Small catalogue; separate from products                 | Keep separation; expand later         |
| Platform roles                                             | AuthZ `platform-*` / `superadmin` — **not** tenant membership | Yes                        | Template set may be incomplete                          | Seed remaining platform roles         |
| Provisioning state                                         | org-member status                                             | Partial                    | Full Provisioning tab later                             | Step later                            |
| Sessions                                                   | Better Auth                                                   | No list API                | Honest unavailable                                      | Session admin API when supported      |
| Activity / Audit                                           | `loadInspectionTimelineTabs`                                  | Yes                        | May be empty                                            | Honest empty states                   |
| Add User / Manage Access                                   | Org Admin create/provision                                    | No for Platform Admin      | Write model not ready                                   | Leave unavailable this slice          |

## Dual SoR note

Platform Admin Users list is gated by **Postgres** `platform_user_tenant`. Enrichment (staff function, Org IAM inspection tabs) comes from the **file org-member ledger** when present. Missing ledger rows produce honest gaps — not fabricated Mary Smith–style rows.

## What this slice proved

The UI successfully **interrogates** existing architecture: membership, product grants, AuthZ permissions, scopes, professional tools, and platform role separation are readable where real. Provenance, org metadata, teams, sessions, and write paths are the genuine Stream 6 engineering targets — not mockup polish.
