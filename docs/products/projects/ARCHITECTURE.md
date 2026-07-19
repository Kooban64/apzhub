# APZ Projects — Architecture

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [projects/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Purpose

Plan and deliver work — projects, tasks, and sprints — under APZHUB branding with engine branding masked.

## Primary users

Project managers, engineers, delivery leads.

## Boundary statement

Products extend the platform. **APZ Projects does not redesign** frozen Platform Foundation, Integration SDK **1.0.0**, or other Architecture Frozen subsystems without ADR + Owner.

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

- Open Projects workspace → list projects → open project
- Create/update task → status change → assignment
- Sprint create → sprint complete

## Platform services consumed

`project-service` (`services/projects/service.yaml` **0.1.0**) · PlatformServiceGateway `projects` · HTTP `/api/v1/projects*` · `@apzhub/search-projects` **0.1.0**.

## Required integrations

`@apzhub/integration-plane` **0.6.0** (Plane, hidden) — Certified Reference Adapter (OSS-101-10).

## Events published

- projects.project.created / updated
- projects.task.created / updated / status_changed / assigned
- projects.sprint.created / completed

## Events consumed

Not declared in reviewed manifests (UNKNOWN).

## Security model

Platform AuthN (BetterAuth) · AuthZ via PermissionService using projects.* keys · tenant context on gateway · no Plane credentials in UI.

## Provisioning model

Product enablement via platform governance / `@apzhub/platform-provisioning`; connector config for Plane is platform-owned.

## Extension points

Module registration (workbench manifests) · Search provider · Event subscribers (search/activity) · Commands via Command Framework when UI lands.

## Platform work still required

**Platform Foundation:** none blocking Implementation Ready (closed; QA-002 PRODUCTION READY).

**Product programme work (not platform redesign):**

- Phase 1 Workbench **ACCEPTED** under [APZHUB-PROJECTS-001](../../sprint/APZHUB-PROJECTS-001-sprint-guide.md) — see [KNOWN-LIMITATIONS](./KNOWN-LIMITATIONS.md) · [Reference Implementation](../APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md)
- Optional adapter capabilities (analytics/webhooks) not certified — require Owner + ADR + programme

## Architecture references

- [Projects Capability Architecture](../../architecture/APZHUB-Projects-Capability-Architecture.md)
- [Projects Plane Reference Architecture](../../architecture/APZHUB-Projects-Plane-Reference-Architecture.md)
- [ADR-0047](../../adr/ADR-0047-projects-plane-integration-architecture.md)
- [OSS-101-10 Wave1 Certification](../../sprint/OSS-101-10-Wave1-Certification.md)

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
