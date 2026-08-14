# SPR-IAM-COMMERCIAL-001 — Operations runbook

| Field     | Value                                                                                 |
| --------- | ------------------------------------------------------------------------------------- |
| Status    | Active                                                                                |
| Programme | [APZHUB-IAM-COMMERCIAL-PROGRAMME](../architecture/APZHUB-IAM-COMMERCIAL-PROGRAMME.md) |

## PayFast

| Env                    | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `PAYFAST_MERCHANT_ID`  | Merchant id                                |
| `PAYFAST_MERCHANT_KEY` | Merchant key                               |
| `PAYFAST_PASSPHRASE`   | Signature passphrase (optional in sandbox) |
| `PAYFAST_SANDBOX`      | `true` (default) / `false` for live        |

ITN URL: `POST /api/v1/billing/payfast/itn` (signature-authenticated).

Never commit merchant secrets. Prefer `.secrets/` + env injection.

## Dunning schedule (recommended)

| State        | Operator action                              |
| ------------ | -------------------------------------------- |
| notice       | Email + in-app banner (day 0 of failure)     |
| warning      | Reminder (≈ day 3)                           |
| grace        | Final courtesy window (≈ day 7)              |
| soft_limited | Block new paid-capacity actions; retain read |
| suspended    | After soft limit window — restore on payment |

Advance via `POST /api/v1/billing/dunning/advance` (billing.admin) or scheduled worker.

**Never** jump from `active` to `suspended` in one step.

## Refunds & credits

- Credit: `POST /api/v1/billing/credits` — `{ billingAccountId, amountCents, reason }`
- Refund: `POST /api/v1/billing/refunds` — `{ invoiceId, amountCents, reason }`
- Manual payment (ops): `POST /api/v1/billing/ops` → use `POST /api/v1/billing/overview` purchase then admin manual payment route

## Platform vs org admin

| Plane          | Permission                         | Capability                                          |
| -------------- | ---------------------------------- | --------------------------------------------------- |
| Org Admin      | `identity.manage`, `admin.operate` | Invite/assign/suspend members in own org            |
| Platform       | `admin.platform`, `billing.admin`  | Cross-org commercial overrides, refunds             |
| APZOR internal | Same APIs                          | `platformOperatorOrg` flag only — no special bypass |

## IAM seed

Re-run authorization seed after deploy so Doc-007 personas and `identity.*` / `billing.*` permissions exist:

```bash
pnpm exec tsx -e 'import { seedDefaultAuthorizationRows } from "@apzhub/platform-authorization/postgres"; await seedDefaultAuthorizationRows();'
```
