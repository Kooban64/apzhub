# Law Platform — Architecture

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [law/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Purpose

Legal practice management — matters, clients, documents, time, billing, calendar, and trust accounting.

## Primary users

Lawyers, paralegals, practice managers, trust accountants.

## Boundary statement

Products extend the platform. **Law Platform does not redesign** frozen Platform Foundation, Integration SDK **1.0.0**, or other Architecture Frozen subsystems without ADR + Owner.

## Request path (mandatory)

```text
Client / Module UI
  → APZHUB API Gateway
  → Auth → Authz → Validation
  → Platform Service
  → Service Connector (Adapter)   # when OSS-backed
  → Backend Engine                # when OSS-backed
```

Native products use Platform Services → platform persistence (still no Module → DB bypass).

## Major workflows

- Open matter workspace → manage parties/documents/tasks
- Time entry → invoice adjacency
- Trust ledger operations (LAW-015)
- Client lifecycle

## Platform services consumed

`apps/law-platform` **1.0.0** · `@apzhub/legal-business-core` **1.0.0** · `services/legal-platform/service.yaml` **1.0.0** · consumes Workbench, IAM/Authz, Search/Knowledge, Notifications, Activity, Documents patterns, Events/Outbox, Gateway.

## Required integrations

Native Law persistence (platform PostgreSQL schemas). Core Law SoR is **not** Plane/Zammad-backed.

## Events published

- legal.module.opened
- legal.feature.available (documented placeholder for future features)
- Outbox/async boundaries documented under LAW-012 plans

## Events consumed

Not fully declared in reviewed event manifests (UNKNOWN beyond platform ENF consumption patterns).

## Security model

Platform AuthN · AuthZ (OBS-LAW-01 closed — APZHUB-1.1-001) · legal permission keys · tenant isolation goals per readiness · trust controls per LAW-015.

## Provisioning model

Law app/tenant enablement via platform identity/governance/provisioning; native schemas migrated with platform DB.

## Extension points

Law workbench modules · knowledge registration · outbox drafts · ENF hooks.

## Platform work still required

- Product validation polish (readiness approved for product validation)
- PermissionService production wiring — OBS-LAW-01 closed (APZHUB-1.1-001)
- Persistent activity/notification stores — OBS-LAW-02 closed (APZHUB-1.1-002 durable platform session stores)
- Financial Engine extraction deferred (FIN-001)
- Placeholder UX surfaces remaining in places

## Architecture references

- [Law Platform Reference Architecture](../../architecture/APZHUB-Law-Platform-Reference-Architecture.md)
- [Law Capability Map](../../architecture/APZHUB-Law-Capability-Map.md)
- [Law Domain Model](../../architecture/APZHUB-Law-Domain-Model.md)
- [Law Platform Readiness](../../reviews/APZHUB-Law-Platform-Readiness.md)
- [LAW Architecture Index](../../architecture/LAW-Architecture-Index.md)

## Related standards

- [PRODUCT-ARCHITECTURE-STANDARD](../PRODUCT-ARCHITECTURE-STANDARD.md)
- [003 System Architecture](../../003-overall-system-architecture-design-principles.md)

## Implementation rule

A product may enter implementation only when:

1. This Product Definition Pack is complete
2. Architecture is Owner-approved
3. Dependencies are available on the platform
4. Product is marked **Implementation Ready** in [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)

Until then: **no production code** for this product programme.
