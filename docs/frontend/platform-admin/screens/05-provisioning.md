# Screen — Provisioning

| Field  | Value      |
| ------ | ---------- |
| Status | **LOCKED** |

## Queue (workspace)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Provisioning                                                                            │
│ Identity, product and provider provisioning                                             │
│                                                                                         │
│ Overview       Queue       Failures       History                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ QUEUE                                                                                   │
│                                                                                         │
│ 12 Pending       3 Processing       2 Failed       41 Completed Today                  │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Status     Tenant       User          Target          Started       Action              │
│ ─────────────────────────────────────────────────────────────────────────────────────── │
│ ◐ Running  APZOR        Mary Smith    QEP             08:42         View                │
│ ○ Pending  Acme Bank    J. Daniels    Support         —             View                │
│ ⚠ Failed   Acme Bank    P. Smith      Zammad          08:31         Retry               │
│ ✓ Done     APZOR        Ayanda        Source          07:56         View                │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

On Failures / failed rows, **provider** names are allowed (global honesty). Prefer capability name in Target when the job is product-scoped; show provider when the failure is adapter-level.

## Failure inspector (right drawer)

```text
┌─────────────────────────────────────┐
│ Provisioning Failure            ×  │
├─────────────────────────────────────┤
│                                     │
│ User                                │
│ Peter Smith                         │
│                                     │
│ Tenant                              │
│ Acme Bank                           │
│                                     │
│ Product                             │
│ Support                             │
│                                     │
│ Provider                            │
│ Zammad                              │
│                                     │
│ Status                              │
│ ⚠ Failed                            │
│                                     │
│ Attempt                             │
│ 3 of 5                              │
│                                     │
│ Last Attempt                        │
│ 08:31                               │
│                                     │
│ Error                               │
│ Provider connection unavailable     │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ [Retry Provisioning]                │
│                                     │
│ View Diagnostic                     │
│ View Audit                          │
│                                     │
└─────────────────────────────────────┘
```

This is what **global honesty** means visually: real status, real error, real retry.
