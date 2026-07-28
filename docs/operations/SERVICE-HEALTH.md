# APZHUB Service Health Model

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Authority:** Document **014** health hierarchy

---

## Hierarchy

```text
Platform
  → Workspace / Product enablement
    → Module
      → Platform Service
        → Connector / Adapter
          → Backend Engine
            → Infrastructure (host, DB, Redis, network)
```

## Health states

| State   | Meaning                      | Ops action                  |
| ------- | ---------------------------- | --------------------------- |
| Green   | Within OLA                   | Monitor                     |
| Amber   | Degraded / partial           | Ticket; communicate         |
| Red     | Unavailable / failing checks | Incident                    |
| Unknown | No signal                    | Treat as Amber until proven |

## Platform signals (examples)

| Signal                   | Source                                      |
| ------------------------ | ------------------------------------------- |
| `GET /api/v1/health`     | apps/web gateway                            |
| Service readiness facets | createPlatformServices bundles              |
| Adapter health           | Integration SDK health                      |
| Engine health            | Translated via adapter — never raw to users |
| Event Bus / outbox       | Relay / DLQ metrics when available          |
| Automation journal       | Depth / failure counts (ops)                |

## Product health

Each commercial product should expose or inherit health via its Platform Service + adapter. Administration Workspace (when used) is permission-gated.
