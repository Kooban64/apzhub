# APZHUB Platform 1.0.0 — Portfolio Overview

> **Programme:** APZHUB-PORTFOLIO-001 (Platform Release 1.0)  
> **Date:** 2026-07-19

---

## One platform

APZHUB is an **Enterprise Operating Platform**. Users interact through Workbench surfaces and APZHUB APIs. Backend engines (Plane, Kimai, Zammad, Metabase, n8n, …) are masked behind Platform Services and Integration SDK adapters.

```text
Client / Workbench
  → API Gateway
  → Auth → Authz → Validation
  → Platform Services
  → Service Connectors (when OSS-backed)
  → Backend Engines
```

## Portfolio composition (Release 1.0.0)

| Tier                | Members                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Governance & KF     | Constitution · AI-MANIFEST · Acceptance Register · QA-002                                                          |
| Delivery standard   | Platform Delivery Standard                                                                                         |
| Shared platform     | Identity · Workbench · Search · Events/Outbox · Notifications · Analytics · Workflow · Documents · Testing · Legal |
| Commercial products | Projects · Time · Support · Documents · TCMS · Analytics · Workflow · Law                                          |

## Cohesion rules

1. Modules never call connectors or each other.
2. Business logic lives in Platform Services.
3. One System of Record per datum (011).
4. Events for async side effects (012 / 029).
5. Product SemVer packaging does not rewrite frozen SDK/architecture without ADR + Owner.

## Related

- [Architecture Overview](./ARCHITECTURE-OVERVIEW.md)
- [Product Catalogue](./PRODUCT-CATALOGUE.md)
- [Capability Catalogue](./CAPABILITY-CATALOGUE.md)
- [PORTFOLIO-INTEGRATION-STRATEGY](../../../products/PORTFOLIO-INTEGRATION-STRATEGY.md) (prior strategy programme)
