# Product Release Roadmap

> **Classification:** Documentation only  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md) · [Portfolio Readiness Summary](../products/APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md) · product Definition Packs · disk `package.json`  
> **Operating model:** [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md)  
> **Rule:** No implementation dates invented. Next releases require Owner-approved Product Release scope.

---

## Release model (all products)

```text
Owner-approved Product Release scope
  → Definition of Ready
  → Implementation (routine delivery / named release)
  → Testing & Certification
  → Owner Acceptance
  → Version tag + production deploy
  → Maintenance / Hotfix as needed
```

- Products extend the closed Platform Foundation; they do not redesign it.
- Engine names stay connector-internal; user-facing product names only.
- Maturity and limitations come from Portfolio + Definition Packs (honesty rule).
- Independent product SemVer is declared only when Owner-approved release evidence records it; otherwise baselines cite accepted programmes and package versions on disk.

---

## Portfolio summary

| Product       | Current maturity                                          | Current version / baseline (disk-backed)                                                                         | Next planned release                                          |
| ------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| APZ Projects  | **Production**                                            | **1.1.0** (**ACCEPTED / CLOSED**) — Plane `@apzhub/integration-plane` **0.6.0**                                  | Not scheduled — Owner direction required for 1.1.x / 1.2.0    |
| APZ Support   | **Production 1.0.0**                                      | SemVer **1.0.0** ([evidence](./support/1.0.0/README.md)); Zammad **0.6.0**; **2.0** planning Awaiting Acceptance | 2.0 impl not authorised — named Approval required             |
| APZ Documents | **Production**                                            | APZDOCS-006 PRODUCTION_READY_WITH_LIMITATIONS (architecture frozen)                                              | Not scheduled — Owner-approved Product Release required       |
| APZ Workflow  | **Production** (platform) / **Planning** (commercial 1.0) | Platform PRWL frozen · APZ-WORKFLOW-001 Awaiting Acceptance · **READY WITH CONDITIONS**                          | Commercial 1.0.0 not scheduled — Owner Approval required      |
| APZ Time      | **Production 1.0.0**                                      | Phase 1 **ACCEPTED / CLOSED** · [evidence](./time/1.0.0/README.md)                                               | Next not scheduled — Owner Approval required                  |
| APZ Analytics | **Production 1.0.0**                                      | Certification filed (APZ-ANALYTICS-002 Awaiting Acceptance) · PRWL                                               | Next not scheduled — Owner Approval for 1.0.x / 1.1.0 / 2.0.0 |
| Law Platform  | **In Development**                                        | `@apzhub/law-platform` **1.0.0**; planning notes Law Platform v1.0 / Trust v1.0                                  | Not scheduled — Owner-approved Product Release required       |

Workspace root version remains `0.1.0-foundation` until a Platform Release advances it ([PLATFORM-RELEASE-ROADMAP](./PLATFORM-RELEASE-ROADMAP.md)).

---

## APZ Projects

| Field                       | Detail                                                                                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Version**         | **1.1.0** — current Production Release (**ACCEPTED / CLOSED**). Adapter `@apzhub/integration-plane` **0.6.0**.                                                                                |
| **Current Maturity**        | **Production** (documented limitations)                                                                                                                                                       |
| **Next Planned Release**    | Not scheduled — Owner Approval required for Patch **1.1.x** / Minor **1.2.0** / Major **2.0.0**                                                                                               |
| **Release Objectives**      | 1.1.0 delivered Workbench depth on existing HTTP — [evidence](./projects/1.1.0/README.md) · [notes](./projects/APZ-PROJECTS-1.1-RELEASE-NOTES.md)                                             |
| **Known Limitations**       | [projects/KNOWN-LIMITATIONS.md](../products/projects/KNOWN-LIMITATIONS.md) — no sprint list/CRUD HTTP; roadmap is due-date ordering; My Work needs project selection; Search index dependency |
| **Future Major Milestones** | Maintenance of Production slice · optional deeper Plane coverage (ADR + Owner if beyond Wave 1) · product packaging polish                                                                    |

**Pack:** [products/projects/](../products/projects/) · **Reference pattern:** [Product Engineering Reference Implementation](../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md)

---

## APZ Support

| Field                       | Detail                                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Current Version**         | **1.0.0** — current Production SemVer (APZHUB-RELEASES-001 packaging of OSS-110-12/14). Adapter `@apzhub/integration-zammad` **0.6.0**.                                                    |
| **Current Maturity**        | **Production** (PRODUCTION_READY_WITH_LIMITATIONS)                                                                                                                                         |
| **Next Planned Release**    | Patch **1.0.x** / Minor **1.1.0** / Major **2.0.0** — naming only; **2.0** planning Awaiting Acceptance — implementation **not** authorised                                                |
| **Release Objectives**      | 1.0.0 packages existing Production Workbench; future Major tracks Owner-selected limitation lifts under named Approval                                                                     |
| **Known Limitations**       | [support/KNOWN-LIMITATIONS.md](../products/support/KNOWN-LIMITATIONS.md) — no Event Bus publish; no webhook ingress; no binary attachments; no Support realtime/notifications as certified |
| **Future Major Milestones** | Owner Approval of named Support Major / 2.0 programme after planning Acceptance                                                                                                            |

**Pack:** [products/support/](../products/support/) · **Evidence:** [releases/support/1.0.0/](./support/1.0.0/README.md) · **Planning:** [releases/support/](./support/README.md)

---

## APZ Documents

| Field                       | Detail                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Version**         | APZDOCS-006 certification baseline (architecture frozen). Native Documents SoR — no Paperless adapter on disk.                                              |
| **Current Maturity**        | **Production** (PRODUCTION_READY_WITH_LIMITATIONS)                                                                                                          |
| **Next Planned Release**    | Not scheduled                                                                                                                                               |
| **Release Objectives**      | Product packaging within freeze; Search publication consumers as already certified; no binary/OCR expansion without ADR + Owner                             |
| **Known Limitations**       | [documents/KNOWN-LIMITATIONS.md](../products/documents/KNOWN-LIMITATIONS.md) — metadata-first; uploads/downloads/OCR/preview/editing out of certified scope |
| **Future Major Milestones** | Maintenance · optional OSS document engine only via ADR + Owner                                                                                             |

**Pack:** [products/documents/](../products/documents/)

---

## APZ Workflow

| Field                       | Detail                                                                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Version**         | Platform: APZWORKFLOW frozen · n8n **0.1.0**. Commercial SemVer: **None** — Release 1.0 Planning ([apz-workflow](../products/apz-workflow/README.md)) |
| **Current Maturity**        | Platform **Production** (PRWL). Commercial **Planning** — APZ-WORKFLOW-001 **Awaiting Acceptance** · **READY WITH CONDITIONS**                        |
| **Next Planned Release**    | Not scheduled — target naming **1.0.0** only after implementation + certification programmes                                                          |
| **Release Objectives**      | Commercial Release 1.0: catalogue + execute/schedule/approvals intent — ADR + Owner required against freeze                                           |
| **Known Limitations**       | [apz-workflow/KNOWN-LIMITATIONS.md](../products/apz-workflow/KNOWN-LIMITATIONS.md)                                                                    |
| **Future Major Milestones** | ADR unlock → implementation → SemVer 1.0.0 · multi-provider post-1.0                                                                                  |

**Pack:** [products/apz-workflow/](../products/apz-workflow/) · [products/workflow/](../products/workflow/) · **n8n:** **0.1.0**

---

## APZ Time

| Field                       | Detail                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Version**         | **1.0.0** Phase 1 — **ACCEPTED / CLOSED** — Kimai **0.2.0** · services **0.26.1** · HTTP **1.10.0**                                         |
| **Current Maturity**        | **Production** (documented limitations) — [evidence](./time/1.0.0/README.md)                                                                |
| **Next Planned Release**    | Not scheduled — Patch **1.0.x** / Minor **1.1.0** / Major **2.0.0** require Owner Approval                                                  |
| **Release Objectives**      | Maintain Production 1.0.0 baseline; further releases Owner-gated                                                                            |
| **Known Limitations**       | [time/KNOWN-LIMITATIONS.md](../products/time/KNOWN-LIMITATIONS.md) — Phase 1 excludes approvals/reporting UI/analytics; tags search partial |
| **Future Major Milestones** | Patch **1.0.x** / Minor **1.1.0** / Major **2.0.0** — Owner Approval required                                                               |

**Pack:** [products/time/](../products/time/) · **Releases:** [releases/time/](./time/README.md) · **Kimai:** **0.2.0** CERTIFIED_DOMAIN

---

## APZ Analytics

| Field                       | Detail                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Current Version**         | **1.0.0** — [releases/analytics/1.0.0/](./analytics/1.0.0/README.md) · Awaiting Acceptance (APZ-ANALYTICS-002)  |
| **Current Maturity**        | **Production** (PRODUCTION_READY_WITH_LIMITATIONS)                                                              |
| **Next Planned Release**    | Not scheduled                                                                                                   |
| **Release Objectives**      | Hold Production baseline; do not confuse with platform Metrics/Observability/Reporting SoRs                     |
| **Known Limitations**       | [apz-analytics/KNOWN-LIMITATIONS.md](../products/apz-analytics/KNOWN-LIMITATIONS.md)                            |
| **Future Major Milestones** | 1.0.x / 1.1.0 / 2.0.0 only with Owner Approval — no AI / predictive / external BI / custom SQL without Approval |

**Pack:** [products/apz-analytics/](../products/apz-analytics/) · **Metabase:** **0.1.0** CERTIFIED_FOUNDATION

---

## Law Platform

| Field                       | Detail                                                                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Version**         | App `@apzhub/law-platform` **1.0.0**. Planning artefacts: [APZHUB-Law-Platform-v1.0](./APZHUB-Law-Platform-v1.0.md) · [LAW-Trust-v1.0](./LAW-Trust-v1.0.md). Commercial GA not declared by portfolio packs. |
| **Current Maturity**        | **In Development**                                                                                                                                                                                          |
| **Next Planned Release**    | Not scheduled                                                                                                                                                                                               |
| **Release Objectives**      | Product validation polish, UX hardening, commercial packaging under Owner-approved Product Release; trust accounting baseline retained                                                                      |
| **Known Limitations**       | [law/KNOWN-LIMITATIONS.md](../products/law/KNOWN-LIMITATIONS.md) — placeholder UX; Financial Engine extraction deferred (FIN-001); permission/activity deferrals per pack                                   |
| **Future Major Milestones** | Validation → Certification → Production maturity · FIN-001 remains Owner-gated                                                                                                                              |

**Pack:** [products/law/](../products/law/)

---

## Authorisation

No Product Release in this roadmap is authorised by this document. Implementation begins only through **explicit Owner Approval** of a Product Release (or Platform Release / ADR where applicable).
