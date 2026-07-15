# ADR-0059: APZ TCMS Native Product Architecture

## Status

Accepted — APZTCMS-001 (documentation / architecture only)

## Context

APZHUB previously planned a **Quality Engineering** native capability (OSS-002 planning) and an OSS Testing wave centred on **Kiwi TCMS**. Those plans established useful domain intent (plans, cases, runs, gates) but left product identity ambiguous: “Quality Engineering” vs productivity “Testing”, and residual Kiwi-as-engine messaging.

APZHUB requires a clear, commercial-grade **Test & Certification Management System** that:

- Is a **brand-new native product**, not a Kiwi fork and not a Playwright/Vitest wrapper
- **Orchestrates** testing while leaving execution engines independent
- Uses **platform PostgreSQL** as System of Record for TCMS metadata and **S3-compatible** storage for evidence
- Embeds a **certification engine** (states, gates, approvals, signatures) inside the product
- Obeys Module → Platform Service → Connector → Engine (003, 008, 009) and Document 015
- Coexists with the **Integration SDK certification harness**, which certifies adapters — not product releases

APZTCMS-001 is documentation and architecture only — no implementation.

## Decision

1. **Product name:** **APZ TCMS** (APZHUB Test & Certification Management System). User-facing module name: **Testing**; Certification is a view set within that module. Module ID: `testing`.
2. **Native architecture:** Domain SoR in **platform PostgreSQL**; evidence blobs in **object storage**; Platform Services **`TestingService`** and **`CertificationService`** own business logic.
3. **Orchestration model:** External runners/engines (Vitest, Playwright, Jest, JUnit, Allure, axe, Lighthouse, ZAP, k6, etc.) remain independent. Future **result adapters** (Integration SDK pattern) ingest results only. Modules never call engines.
4. **Supersession:**
   - Product identity **“Quality Engineering”** is superseded by **APZ TCMS** / **Testing & Certification**. QE strategy, QE reference architecture, and QE backlog become planning predecessors (status banners).
   - **Kiwi TCMS** as user-facing / SoR Testing engine remains **superseded**.
5. **Certification:** Formal certification state machine and approvals live **inside** APZ TCMS (`CertificationService`), distinct from the Integration SDK adapter harness.
6. **AI:** Suggestions only; humans certify. No auto-certification.
7. **Implementation gate:** **No implementation in APZTCMS-001.** Next recommended milestone **APZTCMS-002** (Core Platform Foundation) requires explicit owner approval.

## Consequences

- Foundation catalogues, product catalogue, and active backlog record APZ TCMS and APZTCMS milestone IDs.
- Naming forbids `KiwiService`, `PlaywrightService`, etc., in Platform Services.
- Later milestones introduce `module.yaml` / `service.yaml` before production code (024–027).
- OSS Wave “Kiwi → Testing” is not the delivery path for APZ TCMS.
- QE-001+ story IDs are not used for new work; use **APZTCMS-*** IDs.

## Related

- [Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md)
- [Reference Architecture](../architecture/APZHUB-APZ-TCMS-Reference-Architecture.md)
- [Domain Model](../architecture/APZHUB-APZ-TCMS-Domain-Model.md)
- [APZTCMS Backlog](../backlog/APZTCMS-Backlog.md)
- [APZTCMS-001 Completion Report](../sprint/APZTCMS-001-completion-report.md)
- [QE Strategy (superseded identity)](../strategy/APZHUB-Quality-Engineering-Platform-Strategy.md)
- [ADR-0057](./ADR-0057-sdk-harness-vs-adapter-operations-certification.md) — harness orthogonality
