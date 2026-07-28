# APZHUB Platform 1.0.0 — Architecture Overview

> **Programme:** APZHUB-PORTFOLIO-001 (Platform Release 1.0)  
> **Date:** 2026-07-19  
> **Authority:** docs 003/004/008/009/010 · ENTERPRISE-ARCHITECTURE-CATALOGUE

---

## Layered architecture

```text
Presentation → Application → Domain → Services → Adapters → Backend Engines
```

No layer bypass. Reverse dependencies prohibited.

## Platform spine (certified present)

| Capability         | Evidence                                                       |
| ------------------ | -------------------------------------------------------------- |
| Integration SDK    | `@apzhub/integration-sdk` **1.0.0** frozen                     |
| Identity / AuthZ   | BetterAuth + platform-identity / authorization                 |
| Workbench          | workbench-framework · shell regions (005/016)                  |
| API Gateway path   | Request pipeline · OpenAPI Platform **1.12.0**                 |
| Search             | search-contracts · publication adapters                        |
| Events / Outbox    | platform-event-bus · platform-outbox                           |
| Analytics platform | Metabase adapter · analytics-contracts · `/api/v1/analytics/*` |
| Workflow platform  | n8n adapter · workflow-contracts · `/api/v1/workflow/*`        |
| Documents platform | document-* · Documents product **1.0.0**                       |
| Testing platform   | testing-* · TCMS **1.0.0** · GHA reference                     |
| Legal platform     | law-platform · legal-business-core · Law **1.0.0**             |

## Product SoR patterns

| Pattern              | Products                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| OSS-backed (adapter) | Projects (Plane) · Time (Kimai) · Support (Zammad) · Analytics (Metabase) · Workflow (n8n metadata) |
| Native platform SoR  | Documents · TCMS · Law (core)                                                                       |

See [ARCHITECTURE-SUMMARY.md](./ARCHITECTURE-SUMMARY.md).
