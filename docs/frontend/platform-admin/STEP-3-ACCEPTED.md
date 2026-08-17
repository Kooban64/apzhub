# Platform Admin — Step 3 acceptance

| Field    | Value                                                         |
| -------- | ------------------------------------------------------------- |
| Owner    | **STEP 3 ACCEPTED** — 2026-08-17                              |
| Baseline | Tenant Users + User Inspector                                 |
| Next     | **Stream 6 IAM Completion** — not more Platform Admin screens |

## Decision

Do not proceed to Subscription / Products / Provisioning / Security / Audit screens until the access read model is trustworthy.

Writes (Add User / Manage Access) stay blocked until the Inspector can represent final access state accurately against the same durable model.

## Carry-forward

- APZOR = ordinary tenant
- Professional tools remain separate entitlements
- Organisational functions are descriptive / template inputs — not authorisation
- APZPRD products retain **independent** role models (no single PRD role)
- Extend BetterAuth / PermissionService / Postgres platform schema — no parallel IAM

See [STREAM-6-IAM-COMPLETION.md](./STREAM-6-IAM-COMPLETION.md).
