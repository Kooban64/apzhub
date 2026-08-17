# Screen — Providers

| Field    | Value                           |
| -------- | ------------------------------- |
| Status   | **LOCKED**                      |
| Audience | Authorised Platform Admins only |

## Distinction

| Surface    | Naming                                                      |
| ---------- | ----------------------------------------------------------- |
| Operations | APZ **capability** names (Projects, Support, Time, …)       |
| Providers  | **Implementation** provider names (Plane, Zammad, Kimai, …) |

Normal users must not see this table.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Providers                                                                               │
│ Implementation providers supporting APZ capabilities                                   │
│                                                                                         │
│ Overview       Integrations       Health       Provider Mappings                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ Provider          Capability          Status       Tenants      Last Check              │
│ ─────────────────────────────────────────────────────────────────────────────────────── │
│ Plane             Projects            ● Healthy       38         08:41                  │
│ Zammad            Support             ● Healthy       31         08:41                  │
│ Kimai             Time                ● Healthy       36         08:41                  │
│ n8n               Workflow            ● Healthy       22         08:41                  │
│ Metabase          Analytics           ● Healthy       28         08:41                  │
│ Paperless-ngx     Documents           ● Healthy       19         08:41                  │
│ GitHub            Source              ● Healthy       14         08:40                  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

Health states must be live or explicit unavailable — never invented healthy.
