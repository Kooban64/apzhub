# APZWORKFLOW-010 — Dependency Audit

**Result:** PASS

## Direction

```text
Workbench / Typed Client  →  HTTP only
HTTP handlers             →  PlatformServiceGateway (no adapter / core / persistence)
Platform Services         →  Integration SDK + @apzhub/integration-n8n (no apps/web, no UI)
Adapter                   →  Integration SDK + n8n HTTP client (no platform-services, no workflow-core)
workflow-contracts        →  no integration-n8n / platform-services / next
```

## Forbidden (verified)

| Consumer                   | Must not depend on                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| Workbench                  | Gateway, platform-services, integration-n8n, workflow-core, workflow-persistence              |
| Typed client               | Gateway, platform-services, integration-n8n, workflow-core, workflow-persistence              |
| HTTP handlers              | integration-n8n, workflow-core, workflow-persistence, direct platform-services package import |
| Platform Services (engine) | apps/web, NextRequest, Event Bus                                                              |
| Adapter                    | platform-services, workflow-core, workflow-persistence, next                                  |

## Package versions (frozen)

| Package                      | Version |
| ---------------------------- | ------- |
| `@apzhub/integration-n8n`    | 0.1.0   |
| `@apzhub/workflow-contracts` | 0.3.0   |
| `@apzhub/platform-services`  | 0.20.0  |
