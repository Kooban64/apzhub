# Platform Admin — Billing

| Field  | Value                                             |
| ------ | ------------------------------------------------- |
| Status | **READY FOR OWNER VISUAL REVIEW** (with E2E pass) |
| Route  | `/platform-admin/billing`                         |

## Honesty lock

```text
Catalogue price ≠ Invoice ≠ Payment ≠ Recognised revenue
```

Durable data shown:

- Active subscription counts and rows from `platform_product_org_subscription`

Not configured / Unavailable:

- Current month revenue
- Outstanding / overdue receivables
- Failed payments aggregate
- Renewals — 30 days
- Recent billing activity
- Invoices tab
- Payments tab
- Billing Issues tab

Do not manufacture money from catalogue × subscriptions.
