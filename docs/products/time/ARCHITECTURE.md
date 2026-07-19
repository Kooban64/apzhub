# APZ Time — Architecture

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [time/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Purpose

Capture billable and non-billable time against work context under APZHUB branding.

## Primary users

Practitioners, project staff, finance operations.

## Boundary statement

Products extend the platform. **APZ Time does not redesign** frozen Platform Foundation, Integration SDK **1.0.0**, or other Architecture Frozen subsystems without ADR + Owner.

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

- Planned: log time against project/matter context → approve → report
- No implemented product workflows on disk

## Platform services consumed

Canonical Time Platform Services **present** (`@apzhub/platform-services` **0.26.1** · contracts **0.17.1**) — TimeTrackingService, Activity, Customer, ProjectTime, Timesheet, Tag, Reporting (foundation). Production Kimai path uses `domainMode: kimai` (KIMAI-002). HTTP surface: `/api/v1/time/*` (OpenAPI **1.10.0** unchanged).

## Required integrations

**Kimai** — `@apzhub/integration-kimai` **0.2.0** **present** (**CERTIFIED_DOMAIN**, KIMAI-002 **ACCEPTED**). Workbench module **present** (`services/time/manifests/time/module.yaml`) — Release **1.0.0** Phase 1.

## Events published

- None productised on disk (platform Event SDK available)

## Events consumed

None on disk.

## Security model

Platform AuthN/AuthZ + request pipeline for Time HTTP/services; Kimai connector secrets platform-owned. Product module permission surfaces incomplete.

## Provisioning model

Platform-provisioning available; Time product activation / Kimai domain enablement not productised.

## Extension points

Module manifest present (`services/time/manifests/time/module.yaml`). Platform Search SoR publication / reporting UI hooks — deferred beyond Phase 1.

## Platform / product work still required (post-1.0 Phase 1)

- Approvals / Reporting UI / Analytics (Phase 2+ — not authorised)
- Platform Search SoR publication adapter (optional later)
- Kimai domain expansion — **CLOSED** (KIMAI-002 **ACCEPTED**)

## Architecture references

- [APZHUB-PRODUCT-PORTFOLIO §3.2](../APZHUB-PRODUCT-PORTFOLIO.md)
- [OSS-CATALOGUE](../../foundation/OSS-CATALOGUE.md) Wave 3
- [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md)
- [Capability Abstraction Standard](../../architecture/APZHUB-Capability-Abstraction-Standard.md)

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
