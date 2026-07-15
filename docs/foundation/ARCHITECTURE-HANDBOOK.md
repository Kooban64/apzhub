# APZHUB Architecture Handbook

> **Purpose:** Architectural reference index for the Knowledge Foundation  
> **Audience:** Architects, senior engineers, AI agents  
> **Authoritative references:** [003 — System Architecture](../003-overall-system-architecture-design-principles.md) · [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md)  
> **Related documents:** [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md) · [INTEGRATION-CATALOGUE](./INTEGRATION-CATALOGUE.md)  
> **Reading order:** After Engineering Handbook  
> **Last updated:** 2026-07-14  
> **Current status:** Active — index to canonical architecture docs; Search Vertical **PRODUCTION_READY_WITH_LIMITATIONS** (008) + Integration **0.1.0** (009) + product adapters Projects/Support/Documents **0.1.0** (010–012); Document Vertical (APZDOCS-006)

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

| Layer | Responsibility | Never does |
|-------|----------------|------------|
| **Module** | Presentation, routes, nav | Direct connector calls; business logic |
| **Platform Service** | Business rules, orchestration | UI; raw engine API exposure |
| **Connector/Adapter** | Translation, health, errors | Business logic; user-facing names |

See [008](../008-module-plugin-connector-architecture.md) · [009](../009-platform-service-layer-integration-framework.md).

---

## Platform Core architecture

**Canonical:** [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md)

| Capability | Package | Architecture doc |
|------------|---------|------------------|
| Runtime | `@apzhub/platform-runtime` | Registry, discovery, bootstrap |
| Workbench | `@apzhub/workbench-framework` | [workbench-framework.md](../architecture/workbench-framework.md) |
| Identity | `@apzhub/platform-identity` | [Platform Identity Reference](../architecture/APZHUB-Platform-Identity-Reference-Architecture.md) |
| Authorization | `@apzhub/platform-authorization` | [Platform Authorization Reference](../architecture/APZHUB-Platform-Authorization-Reference-Architecture.md) |
| Operations | `@apzhub/platform-operations` | [Platform Operations Reference](../architecture/APZHUB-Platform-Operations-Reference-Architecture.md) |
| Personalisation | `@apzhub/platform-personalisation` | [Platform Personalisation Reference](../architecture/APZHUB-Platform-Personalisation-Reference-Architecture.md) |
| Governance | `@apzhub/platform-governance` | [Platform Governance Reference](../architecture/APZHUB-Platform-Governance-Reference-Architecture.md) |
| Security | `@apzhub/platform-security` | [Platform Security Reference](../architecture/APZHUB-Platform-Security-Reference-Architecture.md) |
| Bootstrap | `@apzhub/platform-bootstrap` | [Platform Bootstrap Architecture](../architecture/APZHUB-Platform-Bootstrap-Architecture.md) |
| Lifecycle | `@apzhub/platform-lifecycle` | [Platform Lifecycle Architecture](../architecture/APZHUB-Platform-Lifecycle-Architecture.md) |
| Reporting | `@apzhub/reporting-contracts` · `@apzhub/reporting-core` · `/api/v1/reporting` | [Vertical Certification](../architecture/APZHUB-Platform-Reporting-Vertical-Certification.md) · [HTTP API](../architecture/APZHUB-Platform-Reporting-HTTP-API.md) |
| Documents | `@apzhub/document-contracts` · `@apzhub/document-core` · `@apzhub/document-persistence` · `@apzhub/document-storage` · `platform-services` gateway · `/api/v1/documents` · `/workspace/documents` | [Document Vertical Certification](../architecture/APZHUB-Platform-Document-Vertical-Certification.md) · [Document Workbench](../architecture/APZHUB-Platform-Document-Workbench.md) · [Document HTTP API](../architecture/APZHUB-Platform-Document-HTTP-API.md) · [Document Platform Services Architecture](../architecture/APZHUB-Document-Platform-Services-Architecture.md) |
| Search | `@apzhub/search-contracts` **0.4.0** · `@apzhub/search-persistence` **0.2.0** · `@apzhub/platform-services` **0.18.0** · `@apzhub/integration-search-sdk` **0.1.0** · `@apzhub/integration-meilisearch` **0.1.0** · `@apzhub/search-integration` **0.1.0** · `@apzhub/search-projects` **0.1.0** · `@apzhub/search-support` **0.1.0** · `@apzhub/search-documents` **0.1.0** · `@apzhub/search-testing` **0.1.0** — **008 CERTIFIED** + **009–013** | [Testing Search Adapter](../architecture/APZHUB-Testing-Search-Publication-Adapter.md) · [Documents Search Adapter](../architecture/APZHUB-Documents-Search-Publication-Adapter.md) · [Support Search Adapter](../architecture/APZHUB-Support-Search-Publication-Adapter-Architecture.md) · [Projects Search Adapter](../architecture/APZHUB-Projects-Search-Publication-Adapter-Architecture.md) · [Search Vertical Certification](../reviews/APZSEARCH-008-search-vertical-certification.md) |

Per-capability detail: [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md).

---

## Cross-cutting frameworks (M4–M7)

| Framework | Package | Architecture |
|-----------|---------|--------------|
| Action / Command | `@apzhub/command-framework` | [command-framework.md](../architecture/command-framework.md) |
| Knowledge & Discovery | `@apzhub/knowledge-discovery-framework` | [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md) |
| Event & Notification | `@apzhub/event-notification-framework` | [event-notification-framework.md](../architecture/event-notification-framework.md) |
| Activity & Timeline | `@apzhub/activity-timeline-framework` | [activity-timeline-framework.md](../architecture/activity-timeline-framework.md) |

---

## Integration architecture

**Canonical:** [OSS Integration Master Architecture](../architecture/APZHUB-OSS-Integration-Master-Architecture.md)

| Component | Reference |
|-----------|-----------|
| Integration SDK | [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md) |
| Adapter pattern | [Base Adapter Pattern](../architecture/APZHUB-Base-Adapter-Pattern.md) |
| Authentication | [Integration Authentication Architecture](../architecture/APZHUB-Integration-Authentication-Architecture.md) |
| Connection management | [Integration Connection Management](../architecture/APZHUB-Integration-Connection-Management.md) |
| Health & diagnostics | [Integration Health & Diagnostics Model](../architecture/APZHUB-Integration-Health-Diagnostics-Model.md) |
| Error translation | [Integration Error Translation Model](../architecture/APZHUB-Integration-Error-Translation-Model.md) |

Credential flow (OSS-100-02):

```text
Capability Service → Vendor Adapter → Integration SDK → Auth Provider → Connection Manager
```

---

## Product architecture

| Product | Reference |
|---------|-----------|
| Law Platform | [Law Platform Reference Architecture](../architecture/APZHUB-Law-Platform-Reference-Architecture.md) |
| Trust Accounting | [LAW Trust Reference Architecture](../architecture/LAW-Trust-Reference-Architecture.md) |
| Projects (planned) | [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md) |

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

## Observability architecture

Metrics, logs, traces, health — correlated via correlation IDs.

See [014](../014-observability-monitoring-telemetry-health-framework.md) · [Capability Health Model](../architecture/APZHUB-Capability-Health-Model.md).

---

## Design patterns

**Canonical:** [Platform Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

---

## Architecture reviews and baselines

| Document | Status |
|----------|--------|
| [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) | Frozen |
| [Platform Core v2 Certification](../reviews/APZHUB-Platform-Core-v2-Certification.md) | CERTIFIED WITH OBSERVATIONS |
| [Architecture Compliance Report](../reviews/APZHUB-Architecture-Compliance-Report.md) | PRH-011 |

---

## Quick references

Derived lookup tables in `docs/` root: [architecture-quick-reference.md](../architecture-quick-reference.md), [platform-services-quick-reference.md](../platform-services-quick-reference.md), [integration-sdk-quick-reference.md](../integration-sdk-quick-reference.md).
