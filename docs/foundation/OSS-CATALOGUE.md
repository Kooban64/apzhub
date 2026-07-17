# APZHUB OSS Catalogue

> **Purpose:** Index of open-source engines and OSS integration waves  
> **Audience:** Architects, integration engineers, AI agents  
> **Authoritative references:** [OSS-001 Master Plan](../strategy/OSS-001-APZHUB-OSS-Integration-Master-Plan.md) · [OSS Product Integration Catalog](../architecture/APZHUB-OSS-Product-Integration-Catalog.md) · [OSS Capability Mapping](../architecture/APZHUB-OSS-Capability-Mapping.md)  
> **Related documents:** [INTEGRATION-CATALOGUE](./INTEGRATION-CATALOGUE.md) · [OSS Integration Strategy](../strategy/APZHUB-OSS-Integration-Strategy.md)  
> **Reading order:** Before integration work  
> **Last updated:** 2026-07-16  
> **Current status:** Active — Wave 2 CLOSED (OSS-102-08 CERTIFIED_WITH_LIMITATIONS); Wave 6 n8n delivered as Workflow Engine Reference Adapter (**APZWORKFLOW-011** frozen); Wave 7 Kiwi SoR path **superseded by APZ TCMS**

---

## OSS integration principles

1. **Self-hosted Community Edition first** — no mandatory Enterprise dependencies
2. **Hidden from users** — engine names never in UI
3. **Adapter boundary** — Module → Service → Adapter → Engine
4. **Platform Core consumption** — identity, authz, ops, lifecycle for every integration
5. **Replaceable** — new adapter implements same Platform Service interface

See [OSS Integration Standards](../governance/APZHUB-OSS-Integration-Standards.md).

---

## Nine-wave roadmap

| Wave  | OSS Engine         | APZHUB Capability | Service               | Status                                                  |
| ----- | ------------------ | ----------------- | --------------------- | ------------------------------------------------------- |
| **1** | Plane              | Projects          | `ProjectService`      | **Complete** — Reference Adapter certified (OSS-101-10) |
| **2** | Zammad             | Support           | `SupportService`      | Wave 2 **CLOSED** — CERTIFIED_WITH_LIMITATIONS (OSS-102-08); PlatformService pending |
| **3** | Kimai              | Time Tracking     | `TimeTrackingService` | Planned                                                 |
| **4** | Paperless-ngx      | Documents         | `DocumentService`     | Planned                                                 |
| **5** | Metabase           | Analytics         | `AnalyticsService`    | Planned                                                 |
| **6** | n8n                | Automation / Workflow Engine | `Workflow` (engine facet) | **Complete** — Reference Adapter `@apzhub/integration-n8n` **0.1.0** (APZWORKFLOW-011; read-only; frozen) |
| **7** | Kiwi TCMS          | Testing           | `TestingService`      | **SUPERSEDED** — native **APZ TCMS** (ADR-0059); Kiwi not product SoR/UI |
| **8** | Greenbone, Faraday | Security Ops      | Security connectors   | Planned                                                 |
| **9** | MobSF              | Mobile Security   | Security connector    | Planned                                                 |

**Owner amendment:** Zammad resequenced to Wave 2 (OSS-102). Historical “Wave 4 Zammad” references are superseded for sequencing.

Full per-product specifications: [OSS Product Integration Catalog](../architecture/APZHUB-OSS-Product-Integration-Catalog.md).

---

## Wave 1 — Plane → Projects (**COMPLETE**)

| Field              | Detail                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| **Engine**         | Plane CE (self-hosted)                                                                                   |
| **User-facing**    | Projects                                                                                                 |
| **Package**        | `@apzhub/integration-plane` v0.6.0 — **certified Reference Adapter**                                     |
| **Architecture**   | [Projects Plane Reference Architecture](../architecture/APZHUB-Projects-Plane-Reference-Architecture.md) |
| **Domain mapping** | [Projects Domain Mapping](../architecture/APZHUB-Projects-Domain-Mapping.md)                             |
| **Certification**  | [OSS-101-10 Wave 1 Certification](../sprint/OSS-101-10-Wave1-Certification.md)                           |
| **Backlog**        | [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)                                       |
| **Implementation** | Adapter + platform spine complete; Projects UI deferred                                                  |

### OSS-101 milestones

| Milestone               | Status                       |
| ----------------------- | ---------------------------- |
| OSS-101-01 … OSS-101-10 | **Complete** (Wave 1 closed) |

---

## Wave 2 — Zammad → Support (current focus)

| Field                   | Detail                                                                      |
| ----------------------- | --------------------------------------------------------------------------- |
| **Engine**              | Zammad CE (self-hosted)                                                     |
| **User-facing**         | Support                                                                     |
| **Package**             | `@apzhub/integration-zammad` **v0.6.0** — Wave 2 CERTIFIED_WITH_LIMITATIONS |
| **Architecture**        | [ZAMMAD-ARCHITECTURE](../architecture/ZAMMAD-ARCHITECTURE.md)               |
| **Adapter guide**       | [ZAMMAD-ADAPTER](../../integrations/zammad/docs/ZAMMAD-ADAPTER.md)          |
| **Domain mapping**      | [ZAMMAD-MAPPING](../architecture/ZAMMAD-MAPPING.md)                         |
| **Capability matrix**   | [ZAMMAD-CAPABILITY-MATRIX](../architecture/ZAMMAD-CAPABILITY-MATRIX.md)     |
| **Implementation plan** | [ZAMMAD-IMPLEMENTATION-PLAN](../architecture/ZAMMAD-IMPLEMENTATION-PLAN.md) |
| **Backlog**             | [OSS-102 Backlog](../backlog/OSS-102-Zammad-Integration-Backlog.md)         |
| **Implementation**      | `adapter.core` + `adapter.operations` — PlatformService/HTTP/UI deferred |

### OSS-102 milestones

| Milestone                             | Status                             |
| ------------------------------------- | ---------------------------------- |
| OSS-102-01 (discovery & architecture) | **Complete**                       |
| OSS-102-02 (integration foundation)   | **Complete**                       |
| OSS-102-03 (core Support services)    | **Complete**                       |
| OSS-102-04 (articles & metadata)      | **Complete**                       |
| OSS-102-05 (search/history/analytics) | **Complete**                       |
| OSS-102-06 (sync/events/webhooks)     | **Complete**                       |
| OSS-102-07 (ops/diagnostics/cert)     | **Complete**                       |
| OSS-102-08 (Wave 2 closeout)          | **Complete** — CERTIFIED_WITH_LIMITATIONS |
| OSS-110-10                            | **Complete** — Support Platform Services |
| OSS-110-11                            | **Complete** — Support HTTP API Surface |
| OSS-110-12                            | **Complete** — Support vertical CERTIFIED_WITH_LIMITATIONS |
| OSS-110-13+                           | **Blocked** — await owner approval |

---

## Authentication model (all OSS)

| Aspect             | Approach                                              |
| ------------------ | ----------------------------------------------------- |
| User auth          | Better Auth SSO — platform-owned                      |
| Engine auth        | Per-tenant service tokens via Integration SDK         |
| Credential storage | Secret provider refs — never in platform DB plaintext |
| User mapping       | Platform Identity → engine user/workspace             |

See [Integration Authentication Architecture](../architecture/APZHUB-Integration-Authentication-Architecture.md).

---

## Build vs integrate decisions

| Capability          | Decision                    | Reference        |
| ------------------- | --------------------------- | ---------------- |
| Projects            | **Integrate** (Plane)       | ADR-0047         |
| Time Tracking       | **Integrate** (Kimai)       | OSS-001          |
| Documents           | **Integrate** (Paperless)   | OSS-001          |
| **APZ TCMS** / Testing | **Build native** (orchestrates external result engines) | ADR-0059 |
| Quality Engineering | **Superseded** by APZ TCMS  | ADR-0059         |
| Kiwi TCMS wave      | **Superseded** as SoR/UI    | ADR-0059         |
| Financial Engine    | **Build native** (deferred) | FIN-001          |
| Law Platform        | **Build native**            | Product strategy |

See [OSS vs Native Decision Model](../architecture/APZHUB-OSS-vs-Native-Capability-Decision-Model.md) · [Build vs Buy Strategy](../strategy/APZHUB-Build-vs-Buy-Strategy.md).

---

## OSS risk register

[OSS Integration Risk Register](../governance/APZHUB-OSS-Integration-Risk-Register.md)

---

## Engineering estimates

[OSS-001 Engineering Estimates](../strategy/OSS-001-Engineering-Estimates.md)

---

## What is not in scope

- Vendor-specific code in Integration SDK (OSS-100)
- Direct engine API calls from frontend
- OAuth interactive flows (future milestone)
- Vault integration (placeholder only; PCv2-04 future)
