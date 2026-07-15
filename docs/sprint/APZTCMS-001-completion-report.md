# APZTCMS-001 — Completion Report

**Milestone:** APZTCMS-001 — Product Vision, Architecture & Foundation  
**Product:** APZ TCMS (APZHUB Test & Certification Management System)  
**Date:** 2026-07-12  
**Outcome:** **COMPLETE** — documentation & architecture only  
**Next:** **APZTCMS-002** (Core Platform Foundation) — **awaiting owner approval**

---

## Executive Summary

APZTCMS-001 establishes **APZ TCMS** as a brand-new native APZHUB product for Test & Certification Management. The product **orchestrates** testing; execution engines remain independent; TCMS consumes results through future Integration SDK–pattern adapters. Platform PostgreSQL is the System of Record for domain metadata; S3-compatible storage holds evidence blobs.

This milestone delivers the full vision, persona, architecture, ADR, backlog, and foundation catalogue updates. **No implementation** was performed. Prior **Quality Engineering** product naming and the **Kiwi TCMS** wave-as-SoR path are superseded for new work. The Integration SDK certification harness remains **orthogonal**.

---

## Product Vision

| Aspect      | Decision                                                                    |
| ----------- | --------------------------------------------------------------------------- |
| Product     | APZ TCMS                                                                    |
| User-facing | Testing module; Certification views within module                           |
| Module ID   | `testing`                                                                   |
| Services    | `TestingService`, `CertificationService`                                    |
| Philosophy  | Orchestrate; do not fork Kiwi; do not wrap Playwright/Vitest as the product |
| Commercial  | Bundled suite capability with enterprise certification narrative            |

See [Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md).

---

## Architecture Summary

```text
Engines → Result Adapters → TestingService / CertificationService
        → Workbench Module + Dashboards + Certification + Release decision
```

- Layered APZHUB compliance (Module → Service → Connector → Engine)
- Async workers for ingestion/heavy jobs (012)
- AI suggests only; humans certify
- Manifest-first planned for APZTCMS-002+ (`module.yaml`, `service.yaml`)

See [Reference Architecture](../architecture/APZHUB-APZ-TCMS-Reference-Architecture.md) · [Domain Model](../architecture/APZHUB-APZ-TCMS-Domain-Model.md).

---

## Module Breakdown

Single workbench module **`testing`** with capability areas: Dashboard, Requirements, Plans, Suites, Cases, Executions, Automation, Evidence, Defects, Coverage, Certification, Reports, Admin.

See [Module Catalogue](../architecture/APZHUB-APZ-TCMS-Module-Catalogue.md) · [UI Architecture](../architecture/APZHUB-APZ-TCMS-UI-Architecture.md).

---

## Technology Evaluation

TCMS product stack follows Document 004 (Next.js workbench, Platform Services, PostgreSQL, Redis, object storage). External tools are **integration targets**, not the product.

See [Technology Decisions](../architecture/APZHUB-APZ-TCMS-Technology-Decisions.md).

---

## Recommended OSS Components + Reasons

| Component         | Why                                                         |
| ----------------- | ----------------------------------------------------------- |
| **Vitest**        | Platform-standard unit runner; structured JSON for adapters |
| **Playwright**    | Document 015 E2E standard; rich evidence artefacts          |
| **JUnit XML**     | Broadest CI interchange format for a first generic adapter  |
| **Allure**        | Optional rich report/attachment enrichment — not TCMS UI    |
| **axe-core**      | OSS a11y results aligned to WCAG programme                  |
| **Lighthouse**    | OSS perf/a11y CI JSON                                       |
| **OWASP ZAP**     | Self-hosted DAST results                                    |
| **k6**            | OSS load testing results                                    |
| **OpenTelemetry** | Correlate ingestion/run telemetry (014)                     |

**Rejected as product SoR/UI:** Kiwi TCMS; embedding engine UIs as APZ TCMS.

---

## Implementation Phases

| ID              | Theme                                                                            | Status                |
| --------------- | -------------------------------------------------------------------------------- | --------------------- |
| APZTCMS-001     | Vision & architecture                                                            | **COMPLETE**          |
| APZTCMS-002     | Core platform foundation                                                         | Next (await approval) |
| APZTCMS-003…012 | Domain → manual → ingestion → certification → UI → AI → integrations → readiness | Planned               |

See [Backlog](../backlog/APZTCMS-Backlog.md) · [Milestone Roadmap](../backlog/APZTCMS-Milestone-Roadmap.md).

---

## Risks

| Risk                               | Mitigation                                                  |
| ---------------------------------- | ----------------------------------------------------------- |
| Confusion with QE / Kiwi naming    | ADR-0059 + predecessor banners + catalogue updates          |
| Confusion with SDK “certification” | Explicit orthogonality in vision, ADR, integration strategy |
| Scope creep into runners           | Architecture invariant: orchestration only                  |
| Premature implementation           | Hard stop before APZTCMS-002                                |
| Over-building UI before domain     | UI after foundation/persistence milestones                  |

---

## Dependencies

| Dependency                              | Need                                         |
| --------------------------------------- | -------------------------------------------- |
| Platform Core (IAM, workbench, gateway) | Module registration and permission-driven UI |
| Platform PostgreSQL + object storage    | SoR + evidence                               |
| Integration SDK                         | Future result adapters                       |
| Projects / Support services             | Defect and work-item refs                    |
| Document 015 CI                         | Engine execution ownership                   |

---

## Technical Debt

None introduced in code (docs-only milestone). Planning debt accepted: QE docs retained as historical predecessors rather than deleted.

---

## Recommended APZTCMS-002 Scope

**Core Platform Foundation** (still no full UI/runners):

1. `module.yaml` for `testing`
2. `service.yaml` for `TestingService` and `CertificationService`
3. Service contracts / shell implementations
4. Domain types from the conceptual model
5. Schema design and migration **start**
6. Permission model stubs
7. Module shell registration (placeholder only)

**Await owner approval** before starting. Record approval in `CURRENT-MILESTONE.md`.

---

## Deliverables checklist

| Deliverable            | Path                                                          |
| ---------------------- | ------------------------------------------------------------- |
| Product vision         | `docs/strategy/APZHUB-APZ-TCMS-Product-Vision.md`             |
| Personas               | `docs/product/APZHUB-APZ-TCMS-User-Personas.md`               |
| Reference architecture | `docs/architecture/APZHUB-APZ-TCMS-Reference-Architecture.md` |
| Domain model           | `docs/architecture/APZHUB-APZ-TCMS-Domain-Model.md`           |
| Module catalogue       | `docs/architecture/APZHUB-APZ-TCMS-Module-Catalogue.md`       |
| UI architecture        | `docs/architecture/APZHUB-APZ-TCMS-UI-Architecture.md`        |
| Integration strategy   | `docs/architecture/APZHUB-APZ-TCMS-Integration-Strategy.md`   |
| Technology decisions   | `docs/architecture/APZHUB-APZ-TCMS-Technology-Decisions.md`   |
| ADR-0059               | `docs/adr/ADR-0059-apz-tcms-native-product-architecture.md`   |
| Backlog                | `docs/backlog/APZTCMS-Backlog.md`                             |
| Milestone roadmap      | `docs/backlog/APZTCMS-Milestone-Roadmap.md`                   |
| This report            | `docs/sprint/APZTCMS-001-completion-report.md`                |

Foundation catalogues and QE predecessor banners updated as part of closeout.

---

## Sign-off

| Gate                                                               | Result   |
| ------------------------------------------------------------------ | -------- |
| Documentation complete                                             | **PASS** |
| Architecture aligned to 000–029 / 015 / Reference Adapter Standard | **PASS** |
| No implementation in 001                                           | **PASS** |
| Stop before APZTCMS-002                                            | **PASS** |
