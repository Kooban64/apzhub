# APZHUB Platform Administration Architecture

**Milestone:** APZADMIN-001 — Platform Administration Foundation  
**Scope:** Metadata System of Record only

## Overview

APZHUB Platform Administration owns registration, capability, navigation, policy, diagnostic, and audit **metadata** for platform administration surfaces. It does **not** render dashboards, manage users/roles/tenants, or execute runtime probes in this milestone.

## Layering

```text
admin-contracts (no deps)
        ↑
admin-core (contracts only)
        ↑
admin-persistence (config + contracts + core + drizzle-orm)
```

Production persistence requires PostgreSQL. In-memory stores are explicit test-only paths — no silent fallback.

## Out of scope (APZADMIN-001)

- HTTP / API Gateway / typed client / OpenAPI  
- Platform Services implementation (`packages/platform-services`)  
- Workbench / UI / dashboard rendering  
- Event Bus  
- User, role, or tenant management  

## Next

**APZADMIN-002** — Platform Services, Gateway & Authorization (owner approval required).
