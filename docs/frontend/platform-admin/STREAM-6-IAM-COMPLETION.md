# Stream 6 — IAM Completion (engineering brief)

| Field     | Value                                                                |
| --------- | -------------------------------------------------------------------- |
| Status    | **READ MODEL DELIVERED** — stop for Owner review (no write UI)       |
| Input     | [STEP-3-GAP-MAP.md](./STEP-3-GAP-MAP.md)                             |
| Stop rule | Coherent **read model** + Inspector. No write UI until Owner review. |

## Frozen hierarchy

```text
Platform Role                    ← separate (AuthZ scope=platform)
    ↓
Tenant Administrative Role       ← separate (AuthZ scope=tenant admin)
    ↓
Organisational / Staff Function  ← descriptive / template only (NOT authz)
    ↓
Product Assignment               ← org subscribed ∩ user may use product
    ↓
Product-specific Role            ← independent per product (AuthZ scope=product)
    ↓
Resource Scope                   ← tenant+user+product+resource
    ↓
Granular Permission              ← PermissionService effective set + provenance
    ↓
Professional Tool Entitlement    ← separate ledger; never inferred from products
```

### APZPRD independence (mandatory)

A user may simultaneously hold distinct roles, e.g.:

| Product   | Role example             |
| --------- | ------------------------ |
| Projects  | Project Manager / Member |
| Support   | Agent                    |
| Time      | Employee                 |
| Workflow  | Approver / Operator      |
| Analytics | Viewer                   |
| Knowledge | Contributor              |
| Documents | Viewer / Clerk           |

There is **no** generic “APZPRD role”. QEP and PEN likewise retain independent product roles and scopes.

## Priority order

1. Unify SoR (Postgres authoritative; bridge file org-member / product-access)
2. Durable product-role assignments (AuthZ `platform_authorization_*`)
3. Formalise resource scopes per product
4. Permission provenance / explanation
5. Organisational metadata (department, staff function, job title, manager)
6. Teams + inherited access with provenance
7. BetterAuth sessions in Inspector
8. Write paths — **Owner gate** (out of scope until review)

## Gap map — decisions (no third store)

| Requirement                    | Existing                                                | Decision                                                                                                             |
| ------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Tenant membership              | `platform_user_tenant`                                  | **SoR**                                                                                                              |
| Staff function / invite status | File `org-member-store`                                 | Bridge → `platform_iam_employment.staff_function_key` + AuthZ tenant persona; file becomes non-authoritative adapter |
| Org metadata                   | `platform_iam_department` / `_position` / `_employment` | Extend employment with `manager_user_id`, `staff_function_key`, `job_title`; wire reads                              |
| Product assignment             | File `product-access`                                   | Migrate to Postgres commercial grant tables; keep API shape                                                          |
| Product roles                  | AuthZ product-scoped roles + assignments                | **SoR** — independent `product_key` per assignment                                                                   |
| Resource scopes                | User-scope overlay role + prefixes                      | Formal catalogue; extend prefixes; keep as permission keys                                                           |
| Permission provenance          | Flat effective set                                      | Extend evaluation to return granting role + product + parsed scopes                                                  |
| Teams                          | `platform_iam_group` + membership                       | Team → role via `platform_authorization_team_role`; resolve with `source_kind=team`                                  |
| Sessions                       | BetterAuth `session`                                    | List/revoke by `user_id` — no second session system                                                                  |
| Professional tools             | File ledger                                             | Remains separate; migrate later if needed — do not infer from products                                               |

## Success criterion (Inspector)

Answer truthfully:

1. Who is this person?
2. Which tenant?
3. What products?
4. What role per product?
5. Which resources in scope?
6. What granular permissions are effective?
7. Why is each important permission allowed or denied?
8. Which professional tools?
9. Direct vs inherited access?
10. Any platform role?

## Out of scope this slice

- Platform Admin Subscription / Products / Provisioning / Security / Audit screens
- Add User / Manage Access / Change Role write wizards
- Inventing a third IAM database or RBAC framework

## Delivered in this pass (2026-08-17)

| Item                                    | Change                                                                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migration `0146_stream6_iam_completion` | Employment descriptive fields; role-assignment `source_kind`/`source_id`; `platform_authorization_team_role`; `platform_product_org_subscription` / `platform_product_user_grant` |
| Dual SoR bridge                         | Org-member file → `platform_iam_employment`; product-access file → Postgres when empty                                                                                            |
| Product roles                           | `listProductRoleAssignmentsForUser` — independent per `product_key`; Direct vs Team sources                                                                                       |
| Resource scopes                         | Formal catalogue in `resource-scopes.ts` (PRD/QEP/PEN prefixes)                                                                                                                   |
| Provenance                              | `explainPostgresPermission` + `buildPermissionProvenance` (ALLOWED/DENIED with Granted by / product / required permission)                                                        |
| Sessions                                | `listSessionsForUser` over BetterAuth `session` table                                                                                                                             |
| Inspector                               | Wired to durable read model; Manage Access still gated                                                                                                                            |
| Tests                                   | Provenance unit + Inspector unit + `pnpm test:e2e:platform-admin-tenant-users`                                                                                                    |

## Explicitly not built

- Add User / Manage Access / Change Role write wizards
- Additional Platform Admin screens
- Parallel IAM / session systems

## Remaining after Owner review

- Point all Org Admin writers at Postgres durable stores (retire file authority)
- Enrich product-role catalogue (e.g. Projects Manager) without collapsing APZPRD into one role
- Optional: faster bulk provenance (single AuthZ snapshot shared across keys)
- Team UX + revoke session when write model opens
