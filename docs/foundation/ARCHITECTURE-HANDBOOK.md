# APZHUB Architecture Handbook

> **Purpose:** Architectural reference index for the Knowledge Foundation  
> **Audience:** Architects, senior engineers, AI agents  
> **Authoritative references:** [003 — System Architecture](../003-overall-system-architecture-design-principles.md) · [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md)  
> **Related documents:** [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md) · [INTEGRATION-CATALOGUE](./INTEGRATION-CATALOGUE.md)  
> **Reading order:** After Engineering Handbook  
> **Last updated:** 2026-07-18  
> **Current status:** Active — index to canonical architecture docs (reconciled under **APZHUB-KF-001**); Integration SDK **1.0.0 Architecture Frozen** (OSS-100-11); Identity Administration **closed/frozen** (APZIDENTITY-006); Administration / Configuration / Notification SoR **frozen**; Workflow Engine **frozen** (APZWORKFLOW-011); Search Platform + Publication **Architecture Frozen** (008 / **019**); Document Vertical (APZDOCS-006)

---

## Layered architecture

```text
Presentation (Modules, Workbench UI)
        ↓
Application / Domain (Platform Services — business logic)
        ↓
Services (Orchestration, validation, permissions, audit)
        ↓
Adapters (Integration SDK — connectors)
        ↓
Backend Engines (OSS products — Plane, Kimai, etc.)
```

**Rule:** No layer bypassing. Reverse dependencies prohibited.

See [003](../003-overall-system-architecture-design-principles.md).

---

## Request path

```text
Client → API Gateway → Auth → Authz → Validation → Platform Service → Connector → Engine
```

- Standard request context (token, correlation ID, org, workspace, locale)
- Standard response envelope
- Typed error categories — no backend details exposed

See [010](../010-api-gateway-integration-communication-standards.md).

---

## Module → Service → Connector

```text
Module → Platform Service → Service Connector → Backend Engine
```

| Layer                 | Responsibility                | Never does                             |
| --------------------- | ----------------------------- | -------------------------------------- |
| **Module**            | Presentation, routes, nav     | Direct connector calls; business logic |
| **Platform Service**  | Business rules, orchestration | UI; raw engine API exposure            |
| **Connector/Adapter** | Translation, health, errors   | Business logic; user-facing names      |

See [008](../008-module-plugin-connector-architecture.md) · [009](../009-platform-service-layer-integration-framework.md).

---

## Platform Core architecture

**Canonical:** [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md)

| Capability              | Package                                                                                                                                                                                                                                                                                                                                                                                                                                              | Architecture doc                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                 | `@apzhub/platform-runtime`                                                                                                                                                                                                                                                                                                                                                                                                                           | Registry, discovery, bootstrap                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Workbench               | `@apzhub/workbench-framework`                                                                                                                                                                                                                                                                                                                                                                                                                        | [workbench-framework.md](../architecture/workbench-framework.md)                                                                                                                                                                                                                                                                                                                                                                                          |
| Identity                | `@apzhub/platform-identity`                                                                                                                                                                                                                                                                                                                                                                                                                          | [Platform Identity Reference](../architecture/APZHUB-Platform-Identity-Reference-Architecture.md)                                                                                                                                                                                                                                                                                                                                                         |
| Authorization           | `@apzhub/platform-authorization`                                                                                                                                                                                                                                                                                                                                                                                                                     | [Platform Authorization Reference](../architecture/APZHUB-Platform-Authorization-Reference-Architecture.md)                                                                                                                                                                                                                                                                                                                                               |
| Operations              | `@apzhub/platform-operations`                                                                                                                                                                                                                                                                                                                                                                                                                        | [Platform Operations Reference](../architecture/APZHUB-Platform-Operations-Reference-Architecture.md)                                                                                                                                                                                                                                                                                                                                                     |
| Personalisation         | `@apzhub/platform-personalisation`                                                                                                                                                                                                                                                                                                                                                                                                                   | [Platform Personalisation Reference](../architecture/APZHUB-Platform-Personalisation-Reference-Architecture.md)                                                                                                                                                                                                                                                                                                                                           |
| Governance              | `@apzhub/platform-governance`                                                                                                                                                                                                                                                                                                                                                                                                                        | [Platform Governance Reference](../architecture/APZHUB-Platform-Governance-Reference-Architecture.md)                                                                                                                                                                                                                                                                                                                                                     |
| Security                | `@apzhub/platform-security`                                                                                                                                                                                                                                                                                                                                                                                                                          | [Platform Security Reference](../architecture/APZHUB-Platform-Security-Reference-Architecture.md)                                                                                                                                                                                                                                                                                                                                                         |
| Bootstrap               | `@apzhub/platform-bootstrap`                                                                                                                                                                                                                                                                                                                                                                                                                         | [Platform Bootstrap Architecture](../architecture/APZHUB-Platform-Bootstrap-Architecture.md)                                                                                                                                                                                                                                                                                                                                                              |
| Lifecycle               | `@apzhub/platform-lifecycle`                                                                                                                                                                                                                                                                                                                                                                                                                         | [Platform Lifecycle Architecture](../architecture/APZHUB-Platform-Lifecycle-Architecture.md)                                                                                                                                                                                                                                                                                                                                                              |
| Reporting               | `@apzhub/reporting-contracts` · `@apzhub/reporting-core` · `/api/v1/reporting`                                                                                                                                                                                                                                                                                                                                                                       | [Vertical Certification](../architecture/APZHUB-Platform-Reporting-Vertical-Certification.md) · [HTTP API](../architecture/APZHUB-Platform-Reporting-HTTP-API.md)                                                                                                                                                                                                                                                                                         |
| Documents               | `@apzhub/document-contracts` · `@apzhub/document-core` · `@apzhub/document-persistence` · `@apzhub/document-storage` · `platform-services` gateway · `/api/v1/documents` · `/workspace/documents`                                                                                                                                                                                                                                                    | [Document Vertical Certification](../architecture/APZHUB-Platform-Document-Vertical-Certification.md) · [Document Workbench](../architecture/APZHUB-Platform-Document-Workbench.md) · [Document HTTP API](../architecture/APZHUB-Platform-Document-HTTP-API.md) · [Document Platform Services Architecture](../architecture/APZHUB-Document-Platform-Services-Architecture.md)                                                                            |
| Workflow                | SoR **PRODUCTION_READY_WITH_LIMITATIONS** (005; frozen) · Engine wave **CLOSED** (011; frozen; Reference Adapter `@apzhub/integration-n8n` **0.1.0**) · `gateway.workflow.engine.*` · HTTP `/api/v1/workflows/engine/*` · Workbench `/workspace/workflow-engine` · `@apzhub/platform-services` **0.20.0** · `@apzhub/workflow-contracts` **0.3.0**                                                                                                   | [Architecture Freeze Notice](../architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md) · [Reference Adapter Standard](../architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md) · [APZWORKFLOW-011 Completion](../sprint/APZWORKFLOW-011-completion-report.md) · [Final Architecture](../architecture/APZHUB-Workflow-Engine-Final-Architecture.md)                                                                               |
| Identity Administration | **APZIDENTITY-006 complete** — wave **closed/frozen**; contracts/core **0.2.0**, persistence **0.1.0**; HTTP `/api/v1/identity/*` + Workbench `/workspace/identity`; metadata SoR only (not authentication)                                                                                                                                                                                                                                          | [Identity Freeze Notice](../architecture/APZHUB-Identity-Architecture-Freeze-Notice.md) · [APZIDENTITY-006 Completion](../sprint/APZIDENTITY-006-completion-report.md)                                                                                                                                                                                                                                                                                    |
| Metrics                 | **APZMETRICS-006 complete** — programme **closed/frozen** · **Architecture Frozen** · `pnpm audit:metrics-wave` · **PRODUCTION_READY_WITH_LIMITATIONS** retained                                                                                                                                                                                                                                                                                     | [Freeze Notice](../architecture/APZHUB-Metrics-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Metrics-Reference-Standard.md) · [APZMETRICS-006 Completion](../sprint/APZMETRICS-006-completion-report.md)                                                                                                                                                                                                                   |
| Observability           | **APZOBSERVE-006 complete** — wave **frozen/closed** · **PRODUCTION_READY_WITH_LIMITATIONS** · `pnpm audit:observe-wave` · metadata governance only · Reference Standard · `/workspace/observability`                                                                                                                                                                                                                                                | [Freeze Notice](../architecture/APZHUB-Observability-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Observability-Reference-Standard.md) · [Wave Closeout](../sprint/APZOBSERVE-006-wave-closeout-report.md) · [APZOBSERVE-006 Completion](../sprint/APZOBSERVE-006-completion-report.md)                                                                                                                                   |
| Administration          | **APZADMIN-006 complete** — wave **frozen/closed** · **PRODUCTION_READY_WITH_LIMITATIONS** · `pnpm audit:administration-wave` · metadata governance only · Reference Standard · ops at `/workspace/operations`                                                                                                                                                                                                                                       | [Freeze Notice](../architecture/APZHUB-Administration-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Administration-Reference-Standard.md) · [Wave Closeout](../sprint/APZADMIN-006-wave-closeout-report.md) · [APZADMIN-006 Completion](../sprint/APZADMIN-006-completion-report.md)                                                                                                                                       |
| Configuration           | **APZCONFIG-006 complete** — wave **frozen/closed** · **PRODUCTION_READY_WITH_LIMITATIONS** · `pnpm audit:configuration-wave` · SoR metadata only (no runtime/secrets/flags) · Reference Standard                                                                                                                                                                                                                                                    | [Freeze Notice](../architecture/APZHUB-Configuration-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Configuration-Reference-Standard.md) · [Wave Closeout](../sprint/APZCONFIG-006-wave-closeout-report.md) · [APZCONFIG-006 Completion](../sprint/APZCONFIG-006-completion-report.md)                                                                                                                                      |
| Notification            | **APZNOTIFY-006 complete** — wave **frozen/closed** · **PRODUCTION_READY_WITH_LIMITATIONS** · `pnpm audit:notification-wave` · SoR metadata only (no delivery)                                                                                                                                                                                                                                                                                       | [Freeze Notice](../architecture/APZHUB-Notification-Architecture-Freeze-Notice.md) · [Wave Closeout](../sprint/APZNOTIFY-006-wave-closeout-report.md) · [APZNOTIFY-006 Completion](../sprint/APZNOTIFY-006-completion-report.md)                                                                                                                                                                                                                          |
| Search                  | `@apzhub/search-contracts` **0.4.0** · `@apzhub/search-persistence` **0.2.0** · `@apzhub/search-integration` **0.2.0** · `@apzhub/search-orchestrator` **0.1.0** · `@apzhub/search-publication-admin` **0.1.0** · `@apzhub/integration-search-sdk` **0.1.0** · `@apzhub/integration-meilisearch` **0.1.0** · product adapters **0.1.x** — Platform **008** + Publication **009–019** **Architecture Frozen** (**PRODUCTION_READY_WITH_LIMITATIONS**) | [Freeze Notice](../architecture/APZHUB-Search-Publication-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Search-Publication-Reference-Standard.md) · [APZSEARCH-019 Wave Certification](../reviews/APZSEARCH-019-Wave-Certification.md) · [APZSEARCH-018 Certification](../reviews/APZSEARCH-018-publication-certification.md) · [Search Vertical Certification](../reviews/APZSEARCH-008-search-vertical-certification.md) |
| Integration SDK         | `@apzhub/integration-sdk` **1.0.0** — **Architecture Frozen** (OSS-100-11) · `PRODUCTION_READY_WITH_LIMITATIONS` · `pnpm certify:integration-sdk`                                                                                                                                                                                                                                                                                                    | [Freeze Notice](../architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Integration-SDK-Reference-Standard.md) · [ADR-0065](../adr/ADR-0065-integration-sdk-v1-architecture-freeze.md) · [OSS-100-11 Completion](../sprint/OSS-100-11-completion-report.md)                                                                                                                                   |

Per-capability detail: [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md).

---

## Cross-cutting frameworks (M4–M7)

| Framework             | Package                                 | Architecture                                                                         |
| --------------------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| Action / Command      | `@apzhub/command-framework`             | [command-framework.md](../architecture/command-framework.md)                         |
| Knowledge & Discovery | `@apzhub/knowledge-discovery-framework` | [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md) |
| Event & Notification  | `@apzhub/event-notification-framework`  | [event-notification-framework.md](../architecture/event-notification-framework.md)   |
| Activity & Timeline   | `@apzhub/activity-timeline-framework`   | [activity-timeline-framework.md](../architecture/activity-timeline-framework.md)     |

---

## Integration architecture

**Canonical:** [OSS Integration Master Architecture](../architecture/APZHUB-OSS-Integration-Master-Architecture.md)

| Component             | Reference                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Integration SDK       | [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md)     |
| Adapter pattern       | [Base Adapter Pattern](../architecture/APZHUB-Base-Adapter-Pattern.md)                                       |
| Authentication        | [Integration Authentication Architecture](../architecture/APZHUB-Integration-Authentication-Architecture.md) |
| Connection management | [Integration Connection Management](../architecture/APZHUB-Integration-Connection-Management.md)             |
| Health & diagnostics  | [Integration Health & Diagnostics Model](../architecture/APZHUB-Integration-Health-Diagnostics-Model.md)     |
| Error translation     | [Integration Error Translation Model](../architecture/APZHUB-Integration-Error-Translation-Model.md)         |

Credential flow (OSS-100-02):

```text
Capability Service → Vendor Adapter → Integration SDK → Auth Provider → Connection Manager
```

---

## Product architecture

| Product            | Reference                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| Law Platform       | [Law Platform Reference Architecture](../architecture/APZHUB-Law-Platform-Reference-Architecture.md) |
| Trust Accounting   | [LAW Trust Reference Architecture](../architecture/LAW-Trust-Reference-Architecture.md)              |
| Projects (planned) | [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md)       |

---

## Data architecture

- **One System of Record** per datum
- Platform PostgreSQL for platform metadata only
- Engines own business data
- Derived search/cache — never authoritative

See [011](../011-platform-data-architecture-database-design-principles.md).

---

## Event architecture

- Platform Services publish events
- Modules do not notify/search/audit directly
- At-least-once delivery; idempotent subscribers
- Correlation IDs end-to-end

See [012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [029](../029-platform-event-sdk-event-bus-event-manifest-specification.md).

---

## Security architecture

Zero Trust on every request: identity, permission, integrity, intent, context.

See [013](../013-security-architecture-zero-trust-framework.md) · [Tenant Isolation Architecture](../architecture/APZHUB-Tenant-Isolation-Architecture.md).

---

## Metrics architecture

Platform Metrics SoR (**APZMETRICS-006**): programme **closed/frozen**. Canonical enterprise System of Record for metric definitions and KPI governance metadata. **Architecture Frozen.** Classification **PRODUCTION_READY_WITH_LIMITATIONS** retained. Exposed via `gateway.metrics.*`, `/api/v1/metrics/*`, and `/workspace/metrics`. Not Prometheus/Grafana/OTel; no collection or formula/KPI execution. Further Metrics changes require ADR + owner approval.

See [Freeze Notice](../architecture/APZHUB-Metrics-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Metrics-Reference-Standard.md) · [APZMETRICS-006 Completion](../sprint/APZMETRICS-006-completion-report.md).

## Observability architecture

Platform Observability SoR (**APZOBSERVE-006 frozen**): metadata governance for health, metrics definitions/samples, alerts metadata, logs/traces metadata, dashboards definitions, incidents references, maintenance windows, diagnostics. Not live Grafana/Prometheus/Loki/OTel/AlertManager. Consumes Platform Metrics for definition governance as programmes evolve.

See [Freeze Notice](../architecture/APZHUB-Observability-Architecture-Freeze-Notice.md) · [Reference Standard](../architecture/APZHUB-Observability-Reference-Standard.md) · [014](../014-observability-monitoring-telemetry-health-framework.md) · [Capability Health Model](../architecture/APZHUB-Capability-Health-Model.md).

---

## Design patterns

**Canonical:** [Platform Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

---

## Architecture reviews and baselines

| Document                                                                              | Status                      |
| ------------------------------------------------------------------------------------- | --------------------------- |
| [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md)    | Frozen                      |
| [Platform Core v2 Certification](../reviews/APZHUB-Platform-Core-v2-Certification.md) | CERTIFIED WITH OBSERVATIONS |
| [Architecture Compliance Report](../reviews/APZHUB-Architecture-Compliance-Report.md) | PRH-011                     |

---

## Quick references

Derived lookup tables in `docs/` root: [architecture-quick-reference.md](../architecture-quick-reference.md), [platform-services-quick-reference.md](../platform-services-quick-reference.md), [integration-sdk-quick-reference.md](../integration-sdk-quick-reference.md).
