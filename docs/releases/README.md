# APZHUB Releases

> **Status:** Active — Operational Delivery  
> **Authority:** [Engineering Operating Model](../operations/ENGINEERING-OPERATING-MODEL.md) · [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md)  
> **Quality baseline:** [QA-002 PRODUCTION READY](../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md)  
> **AI entry:** [AI-MANIFEST](../foundation/AI-MANIFEST.md)

---

## Purpose

Operational home for **Product Releases**, **Platform Releases**, naming, and release workflow.

Repository-wide governance programmes are **CLOSED**. Future delivery is managed as:

- Product Releases
- Platform Releases
- ADR-driven platform evolution
- Routine engineering under the [Engineering Operating Model](../operations/README.md)

---

## Start here

| Document                                                                                 | Purpose                                                                                                  |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [platform-1.2.0](./platform-1.2.0/README.md)                                             | **APZHUB-RELEASE-001** — Platform 1.2.0 official baseline freeze · **Awaiting Owner Release Acceptance** |
| [PRODUCT-RELEASE-ROADMAP](./PRODUCT-RELEASE-ROADMAP.md)                                  | Per-product release posture                                                                              |
| [PLATFORM-RELEASE-ROADMAP](./PLATFORM-RELEASE-ROADMAP.md)                                | Platform versioning & cadence                                                                            |
| [RELEASE-CALENDAR](./RELEASE-CALENDAR.md)                                                | Release workflow (no calendar dates)                                                                     |
| [RELEASE-NAMING-STANDARD](./RELEASE-NAMING-STANDARD.md)                                  | SemVer, RC, hotfix, LTS, deprecation                                                                     |
| [PORTFOLIO-RELEASE-REGISTER](./PORTFOLIO-RELEASE-REGISTER.md)                            | Production SemVer register (Projects · Time · Support · Documents · TCMS · Analytics · Workflow)         |
| [RELEASE-GOVERNANCE-CHECKLIST](./RELEASE-GOVERNANCE-CHECKLIST.md)                        | **Mandatory** before Product Release Owner Acceptance                                                    |
| [APZHUB-RELEASES-001 consistency](./APZHUB-RELEASES-001-portfolio-consistency-report.md) | Portfolio consistency — Awaiting Acceptance                                                              |
| [APZ Projects releases](./projects/README.md)                                            | Current Production Release **1.1.0** — **ACCEPTED / CLOSED**                                             |
| [APZ Time releases](./time/README.md)                                                    | **1.0.0** Phase 1 — **ACCEPTED / CLOSED** · current Time Production                                      |
| [APZ Support releases](./support/README.md)                                              | Current Production SemVer **1.0.0** · **2.0** planning Awaiting Acceptance                               |
| [APZ Documents releases](./documents/README.md)                                          | Current Production SemVer **1.0.0** · APZ-DOCUMENTS-002 **ACCEPTED / CLOSED** · **PRODUCTION READY**     |
| [APZ QEP Requirements capability](./apzqep/requirements/README.md)                       | `@apzhub/qep-requirements` **1.0.0 CERTIFIED / FROZEN** · APZQEP-REQ-001 **ACCEPTED**                    |
| [APZ QEP Traceability capability](./apzqep/traceability/README.md)                       | `@apzhub/qep-traceability` **1.0.0 CERTIFIED / FROZEN** · APZQEP-TRACE-001                               |
| [APZ QEP Verification capability](./apzqep/verification/README.md)                       | `@apzhub/qep-verification` **1.0.0 CERTIFIED / FROZEN** · APZQEP-CERT-040D **ACCEPTED**                  |
| [APZ TCMS releases](./tcms/README.md)                                                    | Current Production SemVer **1.0.0** · APZ-TCMS-002 Awaiting Acceptance · **PRODUCTION READY**            |
| [APZ Analytics releases](./analytics/README.md)                                          | Current Production SemVer **1.0.0** · APZ-ANALYTICS-002 Awaiting Acceptance · **PRODUCTION READY**       |
| [APZ Workflow releases](./workflow/README.md)                                            | Current Production SemVer **1.0.0** · APZ-WORKFLOW-002 Awaiting Acceptance · **PRODUCTION READY**        |
| [Release 1.1 planning](./1.1-planning/README.md)                                         | APZHUB-RELEASE-001 **ACCEPTED / CLOSED**                                                                 |
| [APZHUB-1.1-001 OBS-LAW-01](./1.1/APZHUB-1.1-001/README.md)                              | Law AuthZ hardening — **ACCEPTED / CLOSED**                                                              |
| [APZHUB-1.1-002 OBS-LAW-02](./1.1/APZHUB-1.1-002/README.md)                              | Law operational persistence — **ACCEPTED / CLOSED**                                                      |
| [APZHUB-1.1-003 Event Bus / Notify](./1.1/APZHUB-1.1-003/README.md)                      | Cross-platform Event Bus & Notification Foundation — **ACCEPTED / CLOSED**                               |
| [APZHUB-1.1-004 Automation](./1.1/APZHUB-1.1-004/README.md)                              | Cross-Product Automation Foundation — **ACCEPTED / CLOSED**                                              |
| [APZHUB-1.1-005 Readiness](./1.1/readiness/README.md)                                    | Release 1.1 Readiness Review — **ACCEPTED / CLOSED**                                                     |
| [Platform 1.1.0](./platform/1.1.0/README.md)                                             | APZHUB Platform **1.1.0** — **ACCEPTED** Production Baseline · **PRODUCTION_READY_WITH_LIMITATIONS**     |
| [Operations Framework](../operations/README.md)                                          | APZHUB-OPERATIONS-001 Platform Operations Framework — **ACCEPTED / CLOSED**                              |
| [Enterprise Operating Model](../governance/README.md)                                    | APZHUB-GOVERNANCE-001 Enterprise Operating Model — **ACCEPTED / CLOSED**                                 |
| [Commercialisation Strategy](../strategy/commercial/README.md)                           | APZHUB-STRATEGY-001 Commercialisation & GTM — **ACCEPTED / CLOSED**                                      |
| [Release 1.2 Planning](./1.2-planning/README.md)                                         | APZHUB-1.2-001 — **ACCEPTED / CLOSED**                                                                   |
| [APZHUB-1.2-002 R12-OPS-01](./1.2/APZHUB-1.2-002/README.md)                              | Backup restore drill — **ACCEPTED / CLOSED**                                                             |
| [APZHUB-1.2-003 R12-OPS-02](./1.2/APZHUB-1.2-003/IMPLEMENTATION-SUMMARY.md)              | Alert strategy / Observe runbooks — **ACCEPTED / CLOSED**                                                |
| [APZHUB-1.2-004 R12-OPS-03](./1.2/APZHUB-1.2-004/IMPLEMENTATION-SUMMARY.md)              | Host coexistence capacity controls — **Awaiting Acceptance** · **READY FOR OWNER ACCEPTANCE**            |

---

## Historical release notes

Individual release notes already in this folder (e.g. Platform v2–v5, Law Platform v1.0, Integration SDK 1.0.0) remain archival evidence. New work follows the standards above and [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md).

---

## Related

| Layer                    | Document                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| Operating model          | [docs/operations/](../operations/README.md)                           |
| Product portfolio        | [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md)   |
| Product release standard | [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md)   |
| Branching / SemVer       | [BRANCHING-AND-VERSIONING](../operations/BRANCHING-AND-VERSIONING.md) |
| Hotfix                   | [HOTFIX-POLICY](../operations/HOTFIX-POLICY.md)                       |

---

## Delivery artefacts

| Artefact                | Path                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| RELEASES-001 Completion | [APZHUB-RELEASES-001-completion-report](../sprint/APZHUB-RELEASES-001-completion-report.md)                                            |
| RELEASES-001 Acceptance | [APZHUB-RELEASES-001-programme-acceptance-report](../foundation/completion-reports/APZHUB-RELEASES-001-programme-acceptance-report.md) |
| Roadmaps Completion     | [APZHUB-RELEASE-ROADMAPS-completion-report](../sprint/APZHUB-RELEASE-ROADMAPS-completion-report.md)                                    |
| Roadmaps Acceptance     | [APZHUB-RELEASE-ROADMAPS-acceptance-report](../foundation/completion-reports/APZHUB-RELEASE-ROADMAPS-acceptance-report.md)             |
