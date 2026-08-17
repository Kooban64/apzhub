# Screen — Billing

| Field  | Value      |
| ------ | ---------- |
| Status | **LOCKED** |

## Rules

Prices and amounts come from **real commercial configuration** — not UI constants. Unavailable → show unavailable.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Billing                                                                                 │
│ Platform commercial operations                                                          │
│                                                                                         │
│ Overview       Invoices       Payments       Billing Issues                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ REVENUE                              RECEIVABLES                                        │
│                                                                                         │
│ Current Month                        Outstanding                                        │
│ R xxx,xxx                            R xx,xxx                                           │
│                                                                                         │
│ Active Subscriptions                 Overdue                                            │
│ 38                                  3                                                  │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ RECENT PAYMENTS                                                                         │
│                                                                                         │
│ Tenant          Invoice        Amount         Method        Status         Date          │
│ ─────────────────────────────────────────────────────────────────────────────────────── │
│ Acme Bank       INV-1028       R xx,xxx       PayFast       Paid           16 Aug        │
│ Zen Retail      INV-1027       R x,xxx        PayFast       Failed         16 Aug        │
│ APZOR           INV-1026       Internal/...   —             Current        15 Aug        │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

APZOR billing rows remain ordinary commercial/metadata rows — not “system tenant” theatre.
