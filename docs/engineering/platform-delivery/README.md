# APZHUB Platform Delivery Standard

> **Programme:** APZHUB-ENGINEERING-001 — **ACCEPTED / CLOSED**  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** Mandatory engineering methodology for all future platform capabilities and commercial products  
> **Evidence base:** Analytics Platform · Workflow Platform · commercial APZ product certifications  
> **Bootstrap:** [AI-MANIFEST](../../foundation/AI-MANIFEST.md) · repository evidence only  
> **Date:** 2026-07-19  
> **Owner Acceptance:** 2026-07-19 — Owner Decision authorising APZ-DOCUMENTS-001

---

## Purpose

This pack is the **single authoritative Platform Delivery Standard** for APZHUB. Future programmes shall reference it instead of recreating engineering instructions.

It does **not** authorise implementation. It governs how Owner-approved programmes are planned, delivered, certified, and released.

---

## Documents

| Document                                                         | Purpose                                                                                                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [PLATFORM-DELIVERY-STANDARD.md](./PLATFORM-DELIVERY-STANDARD.md) | Canonical standard (normative)                                                                                                                     |
| [ENGINEERING-LIFECYCLE.md](./ENGINEERING-LIFECYCLE.md)           | Mandatory lifecycle phases                                                                                                                         |
| [STAGE-GATES.md](./STAGE-GATES.md)                               | Per-phase purpose, I/O, exit criteria, stop conditions                                                                                             |
| [QUALITY-GATES.md](./QUALITY-GATES.md)                           | Mandatory quality gates                                                                                                                            |
| [PROGRAMME-GOVERNANCE.md](./PROGRAMME-GOVERNANCE.md)             | Naming, Approval, Acceptance, freeze, SemVer, stop/continue                                                                                        |
| [PACKAGE-STANDARDS.md](./PACKAGE-STANDARDS.md)                   | Integration / contracts / services / HTTP / workbench / product packs                                                                              |
| [BEST-PRACTICES.md](./BEST-PRACTICES.md)                         | Proven practices from Analytics & Workflow                                                                                                         |
| [EXAMPLES.md](./EXAMPLES.md)                                     | Reference programmes on disk                                                                                                                       |
| [templates/](./templates/)                                       | Reusable programme templates                                                                                                                       |
| Completion                                                       | [APZHUB-ENGINEERING-001-completion-report.md](../../sprint/APZHUB-ENGINEERING-001-completion-report.md)                                            |
| Acceptance                                                       | [APZHUB-ENGINEERING-001-programme-acceptance-report.md](../../foundation/completion-reports/APZHUB-ENGINEERING-001-programme-acceptance-report.md) |

---

## Mandatory lifecycle (summary)

```text
Commercial Planning
      ↓
Platform Foundation
      ↓
Information Model
      ↓
Provider Integration
      ↓
Contracts
      ↓
Platform Services
      ↓
HTTP API
      ↓
Workbench Module
      ↓
Product Certification
      ↓
Production Release
```

Each arrow requires **Owner Acceptance** of the prior programme before the next programme may be recommended. Each programme requires **Owner Approval** before implementation.

---

## Related

- [AI-WORKFLOW](../../foundation/AI-WORKFLOW.md) — AI operating procedure (references this standard)
- [ENGINEERING-HANDBOOK](../../foundation/ENGINEERING-HANDBOOK.md)
- [AI-ENGINEERING-STANDARDS](../../foundation/AI-ENGINEERING-STANDARDS.md)
- [REPOSITORY-GUIDE](../../foundation/REPOSITORY-GUIDE.md)
- Constitution [000](../../000-apzhub-engineering-constitution.md) · Quality [015](../../015-software-quality-testing-qa-cicd-release-management-framework.md)

---

## Status

**ACCEPTED / CLOSED.** Future programmes must cite this standard. Active commercial planning: [APZ-DOCUMENTS-001](../../products/apz-documents/README.md).
