# APZHUB Portfolio Release Register

> **Programme:** APZHUB-RELEASES-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [RELEASE-NAMING-STANDARD](./RELEASE-NAMING-STANDARD.md) · [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md)  
> **Last updated:** 2026-07-23 (Platform **1.3 CLOSED** · **PRODUCTION READY WITH LIMITATIONS** · [Platform-1.4-ARCH-001](../strategy/platform-1.4/README.md) **AWAITING OWNER ARCHITECTURE ACCEPTANCE**)  
> **Repository quality:** QA-002 **PRODUCTION READY**

---

## Purpose

Single register of Production product SemVer baselines across the APZHUB portfolio.  
Update this register when Owner Acceptance closes a product release.

---

## Production portfolio

| Product              | Current Version | Current Production Release | Patch Line | Minor Line | Major Line | Current Maturity                                   | Owner Acceptance                                                                                                                                                                            | Repository Status                                                                                                                                        |
| -------------------- | --------------- | -------------------------- | ---------- | ---------- | ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **APZHUB Platform**  | **1.3**         | **1.3** (PRWL)             | **1.3.x**  | **1.4.0**  | **2.0.0**  | **Production** (PRODUCTION_READY_WITH_LIMITATIONS) | Platform 1.3 programme **CLOSED** · CERT-002 **ACCEPTED** · [1.4-ARCH-001](../strategy/platform-1.4/OWNER-ACCEPTANCE-PLATFORM-1.4-ARCH-001.md) **Awaiting Owner Architecture Acceptance**   | [1.4-ARCH-001](../strategy/platform-1.4/README.md) · CERT-002 [pack](../engineering/platform-1.3-cert-002/README.md) · freeze notes in CURRENT-MILESTONE |
| **APZ Projects**     | **1.1.0**       | **1.1.0**                  | **1.1.x**  | **1.2.0**  | **2.0.0**  | **Production** (documented limitations)            | **ACCEPTED / CLOSED** — [report](../foundation/completion-reports/APZ-PROJECTS-1.1-release-acceptance-report.md)                                                                            | Evidence [projects/1.1.0/](./projects/1.1.0/README.md) · [RELEASES.md](../products/projects/RELEASES.md)                                                 |
| **APZ Time**         | **1.0.0**       | **1.0.0** Phase 1          | **1.0.x**  | **1.1.0**  | **2.0.0**  | **Production** (documented limitations)            | **ACCEPTED / CLOSED** — [report](../foundation/completion-reports/APZ-TIME-1.0-release-acceptance-report.md)                                                                                | Evidence [time/1.0.0/](./time/1.0.0/README.md) · [RELEASES.md](../products/time/RELEASES.md)                                                             |
| **APZ Support**      | **1.0.0**       | **1.0.0**                  | **1.0.x**  | **1.1.0**  | **2.0.0**  | **Production** (PRODUCTION_READY_WITH_LIMITATIONS) | **ACCEPTED / CLOSED** — [report](../foundation/completion-reports/APZ-SUPPORT-1.0-release-acceptance-report.md) · Engineering OSS-110 **ACCEPTED** · Packaging via RELEASES-001 / OWNER-001 | Evidence [support/1.0.0/](./support/1.0.0/README.md) · [RELEASES.md](../products/support/RELEASES.md)                                                    |
| **APZ Analytics**    | **1.0.0**       | **1.0.0**                  | **1.0.x**  | **1.1.0**  | **2.0.0**  | **Production** (PRODUCTION_READY_WITH_LIMITATIONS) | **ACCEPTED / CLOSED** — [report](../foundation/completion-reports/APZ-ANALYTICS-002-programme-acceptance-report.md) · **PRODUCTION READY**                                                  | Evidence [analytics/1.0.0/](./analytics/1.0.0/README.md) · [RELEASES.md](../products/apz-analytics/RELEASES.md)                                          |
| **APZ Workflow**     | **1.0.0**       | **1.0.0**                  | **1.0.x**  | **1.1.0**  | **2.0.0**  | **Production** (PRODUCTION_READY_WITH_LIMITATIONS) | **ACCEPTED / CLOSED** — [report](../foundation/completion-reports/APZ-WORKFLOW-002-programme-acceptance-report.md) · **PRODUCTION READY**                                                   | Evidence [workflow/1.0.0/](./workflow/1.0.0/README.md) · [RELEASES.md](../products/apz-workflow/RELEASES.md)                                             |
| **APZ Documents**    | **1.0.0**       | **1.0.0**                  | **1.0.x**  | **1.1.0**  | **2.0.0**  | **Production** (PRODUCTION_READY_WITH_LIMITATIONS) | **ACCEPTED / CLOSED** — [report](../foundation/completion-reports/APZ-DOCUMENTS-002-programme-acceptance-report.md) · recommendation **PRODUCTION READY**                                   | Evidence [documents/1.0.0/](./documents/1.0.0/README.md) · [RELEASES.md](../products/apz-documents/RELEASES.md)                                          |
| **APZ TCMS**         | **1.0.0**       | **1.0.0**                  | **1.0.x**  | **1.1.0**  | **2.0.0**  | **Production** (PRODUCTION_READY_WITH_LIMITATIONS) | **ACCEPTED / CLOSED** — [report](../foundation/completion-reports/APZ-TCMS-002-programme-acceptance-report.md) · **PRODUCTION READY**                                                       | Evidence [tcms/1.0.0/](./tcms/1.0.0/README.md) · [RELEASES.md](../products/apz-tcms/RELEASES.md)                                                         |
| **APZ Law Platform** | **1.0.0**       | **1.0.0**                  | **1.0.x**  | **1.1.0**  | **2.0.0**  | **Production** (PRODUCTION_READY_WITH_LIMITATIONS) | **ACCEPTED / CLOSED** — [report](../foundation/completion-reports/APZ-LAW-002-programme-acceptance-report.md) · **PRODUCTION READY**                                                        | Evidence [law/1.0.0/](./law/1.0.0/README.md) · [RELEASES.md](../products/apz-law/RELEASES.md)                                                            |

---

## Non-Production products (register note)

| Product          | SemVer Production Release | Maturity (portfolio) | Notes                                                          |
| ---------------- | ------------------------- | -------------------- | -------------------------------------------------------------- |
| (none currently) | —                         | —                    | Law Platform moved to Production portfolio above (1.0.0 filed) |

---

## Planning tracks (not Production SemVer)

| Track                        | Status              | Relation to register                                        |
| ---------------------------- | ------------------- | ----------------------------------------------------------- |
| APZ Support **2.0** planning | Awaiting Acceptance | Future **Major 2.0.0** candidate — **not** current baseline |

---

## Rules

1. Patch / Minor / Major columns are **naming only** until Owner Approval authorises a release.
2. Engine versions (Plane, Kimai, Zammad) are connector-internal — never user-facing product versions.
3. Mandatory release artefacts: [RELEASE-GOVERNANCE-CHECKLIST.md](./RELEASE-GOVERNANCE-CHECKLIST.md).
4. Repository must remain **PRODUCTION READY** (QA-002) unless Owner accepts a temporary exception.

---

## Related

| Document                     | Path                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Product Release Roadmap      | [PRODUCT-RELEASE-ROADMAP.md](./PRODUCT-RELEASE-ROADMAP.md)                                                   |
| Release Calendar             | [RELEASE-CALENDAR.md](./RELEASE-CALENDAR.md)                                                                 |
| Portfolio Consistency Report | [APZHUB-RELEASES-001-portfolio-consistency-report.md](./APZHUB-RELEASES-001-portfolio-consistency-report.md) |
| Product Portfolio            | [APZHUB-PRODUCT-PORTFOLIO.md](../products/APZHUB-PRODUCT-PORTFOLIO.md)                                       |
