# Screen — Audit

| Field  | Value                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------- |
| Status | **IMPLEMENTED (read/inspect)** — see [../GOVERNANCE-CONTROL-PLANE.md](../GOVERNANCE-CONTROL-PLANE.md) |

## List

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Audit                                                                                   │
│ Platform-wide administrative and security audit                                         │
│                                                                                         │
│ Platform Audit   Administrative Changes   Tenant Access   Exports                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search      Actor ▾    Tenant ▾    Action ▾    Date ▾                    Export      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ Time      Actor          Tenant       Event                                             │
│ ─────────────────────────────────────────────────────────────────────────────────────── │
│ 08:42     John Smith     APZOR        Added QEP entitlement                             │
│ 08:31     System         Acme Bank    Provisioning retry failed                         │
│ 08:17     Finance        Zen Retail   Payment status changed                            │
│ 07:56     System         APZOR        User provisioning completed                       │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Event drawer

```text
┌─────────────────────────────────────┐
│ Audit Event                     ×   │
├─────────────────────────────────────┤
│                                     │
│ Event                               │
│ Product Entitlement Changed         │
│                                     │
│ Tenant                              │
│ APZOR                               │
│                                     │
│ Actor                               │
│ John Smith                          │
│                                     │
│ Product                             │
│ APZQEP                              │
│                                     │
│ Previous                            │
│ 10 licences                         │
│                                     │
│ New                                 │
│ 15 licences                         │
│                                     │
│ Timestamp                           │
│ 17 Aug 2026 08:42:11                │
│                                     │
│ Correlation ID                      │
│ ...                                 │
│                                     │
└─────────────────────────────────────┘
```

Correlation ID is mandatory when present in the event envelope (foundation 010 / 012 / 029).
