# Screen — Global tenant lookup (header search)

| Field  | Value      |
| ------ | ---------- |
| Status | **LOCKED** |

## Intent

Extremely fast path from Platform Admin header search to a tenant (and related users / invoices / provisioning).

Placeholder:

```text
Search tenants, users, invoices, provisioning...
```

## Results panel

```text
┌────────────────────────────────────────────────────────────┐
│ 🔍 acme                                                   │
├────────────────────────────────────────────────────────────┤
│ TENANTS                                                    │
│                                                           │
│ Acme Bank                                      Active      │
│ 280 users · Enterprise                                    │
│                                                           │
│ USERS                                                      │
│                                                           │
│ Mary Jones                                    Acme Bank    │
│ Peter Smith                                   Acme Bank    │
│                                                           │
│ BILLING                                                    │
│                                                           │
│ INV-1028                                      Acme Bank    │
│                                                           │
└────────────────────────────────────────────────────────────┘
```

## Rules

- Results respect the **Platform Administrator's own role** (permission-filtered).
- Keyboard: typeahead, arrow selection, Enter to open.
- Opening a tenant lands on Tenant Detail Overview.
