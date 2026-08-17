# Screen — Operations

| Field  | Value      |
| ------ | ---------- |
| Status | **LOCKED** |

## Naming rule

**Operations uses APZ capability names.**  
**Providers uses implementation-provider names.**

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Operations                                                                              │
│ Current APZ platform operational state                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ CORE PLATFORM                                                                           │
│                                                                                         │
│ Identity              ● Healthy           Search                 ● Healthy              │
│ Notifications         ● Healthy           Activity               ● Healthy              │
│ Command               ● Healthy           Realtime               ● Healthy              │
│ Audit                 ● Healthy           Personalisation        ● Healthy              │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ PROVIDER SERVICES                                                                       │
│                                                                                         │
│ Projects              ● Healthy           Support                ● Healthy              │
│ Time                  ● Healthy           Workflow               ● Healthy              │
│ Analytics             ● Healthy           Documents              ● Healthy              │
│ Source                ● Healthy                                                       │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ACTIVE ISSUES                                                                           │
│                                                                                         │
│ ⚠ Provisioning latency above threshold                              18 min             │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

Secondary tabs (IA): Platform Health · Services · Diagnostics.  
Diagnostics may deep-link to Providers when implementation detail is required.
