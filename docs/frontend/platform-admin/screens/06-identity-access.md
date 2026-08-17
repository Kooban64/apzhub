# Screen — Identity & Access (platform control plane)

| Field  | Value                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------- |
| Status | **IMPLEMENTED (read/inspect)** — see [../GOVERNANCE-CONTROL-PLANE.md](../GOVERNANCE-CONTROL-PLANE.md) |

## Scope

Manage access to the **APZ Platform control plane**.

**Do not** mix APZOR (or any tenant) users into this screen. Tenant users live under **Tenants → {tenant} → Users**.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Identity & Access                                                                       │
│ Manage access to the APZ Platform control plane                                         │
│                                                                                         │
│ Platform Administrators    Platform Roles    Privileged Access    Sessions              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ PLATFORM ADMINISTRATORS                                                                 │
│                                                                                         │
│ 🔍 Search                                                                               │
│                                                                                         │
│ User              Platform Role           MFA        Last Active        Status          │
│ ─────────────────────────────────────────────────────────────────────────────────────── │
│ John Smith        Platform Owner          ✓          4 min ago          Active          │
│ Mary Jones        Platform Operations     ✓          18 min ago         Active          │
│ Peter Brown       Platform Support        ✓          Yesterday          Active          │
│                                                                                         │
│                                                         [+ Add Administrator]            │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

Platform roles ≠ tenant organisational roles (Stream 6). Keep the models separate in UI copy and APIs.
