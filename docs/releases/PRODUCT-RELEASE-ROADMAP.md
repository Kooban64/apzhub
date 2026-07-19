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

| Product       | Current maturity     | Current version / baseline (disk-backed)                                                                                                       | Next planned release                                       |
| ------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| APZ Projects  | **Production**       | **1.1.0** (**ACCEPTED / CLOSED**) — Plane `@apzhub/integration-plane` **0.6.0**                                                                | Not scheduled — Owner direction required for 1.1.x / 1.2.0 |
| APZ Support   | **Production**       | UI PRWL (OSS-110-14); Zammad **0.6.0**; **2.0** planning Awaiting Acceptance ([assessment](./support/APZ-SUPPORT-2.0-READINESS-ASSESSMENT.md)) | 2.0 impl not authorised — named Approval required          |
| APZ Documents | **Production**       | APZDOCS-006 PRODUCTION_READY_WITH_LIMITATIONS (architecture frozen)                                                                            | Not scheduled — Owner-approved Product Release required    |
| APZ Workflow  | **Production**       | PRODUCTION_READY_WITH_LIMITATIONS; n8n `@apzhub/integration-n8n` **0.1.0**                                                                     | Not scheduled — Owner-approved Product Release required    |
| APZ Time      | **Production 1.0.0** | Phase 1 **ACCEPTED / CLOSED** · [evidence](./time/1.0.0/README.md)                                                                             | Next not scheduled — Owner Approval required               |
| APZ Analytics | **Concept**          | No product/package release                                                                                                                     | Not scheduled — concept → planning before any release      |
| Law Platform  | **In Development**   | `@apzhub/law-platform` **1.0.0**; planning notes Law Platform v1.0 / Trust v1.0                                                                | Not scheduled — Owner-approved Product Release required    |

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
| **Current Version**         | Engineering certification OSS-110-12 / OSS-110-14. Adapter `@apzhub/integration-zammad` **0.6.0**. No SemVer product baseline archive yet.                                                 |
| **Current Maturity**        | **Production** (certified with limitations) — past Implementation Ready                                                                                                                    |
| **Next Planned Release**    | **2.0** planning suite Awaiting Acceptance — implementation **not** authorised                                                                                                             |
| **Release Objectives**      | Packaging baseline + Owner-selected limitation tracks (events/webhooks/attachments/notifications) under named Approval                                                                     |
| **Known Limitations**       | [support/KNOWN-LIMITATIONS.md](../products/support/KNOWN-LIMITATIONS.md) — no Event Bus publish; no webhook ingress; no binary attachments; no Support realtime/notifications as certified |
| **Future Major Milestones** | Owner Approval of named Support Major / 2.0 programme after planning Acceptance                                                                                                            |

**Pack:** [products/support/](../products/support/) · **Planning:** [releases/support/](./support/README.md)

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

| Field                       | Detail                                                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Version**         | APZWORKFLOW engine wave frozen; `@apzhub/integration-n8n` **0.1.0**.                                                                                                       |
| **Current Maturity**        | **Production** (PRODUCTION_READY_WITH_LIMITATIONS; read-only engine wave)                                                                                                  |
| **Next Planned Release**    | Not scheduled                                                                                                                                                              |
| **Release Objectives**      | Governed discovery/diagnostics packaging; any execution/mutation capabilities only via Owner-approved release + ADR against freeze                                         |
| **Known Limitations**       | [workflow/KNOWN-LIMITATIONS.md](../products/workflow/KNOWN-LIMITATIONS.md) — no execution/scheduling/mutations/designer/webhooks in certified wave; live adapter env-gated |
| **Future Major Milestones** | Maintenance of read-only wave · Owner-gated engine capability expansions                                                                                                   |

**Pack:** [products/workflow/](../products/workflow/)

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

| Field                       | Detail                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Version**         | None — no Analytics product package or Metabase adapter on disk                                                                         |
| **Current Maturity**        | **Concept**                                                                                                                             |
| **Next Planned Release**    | Not scheduled                                                                                                                           |
| **Release Objectives**      | Advance Concept → Planning → Architecture before any Product Release; do not confuse with platform Metrics/Observability/Reporting SoRs |
| **Known Limitations**       | [analytics/KNOWN-LIMITATIONS.md](../products/analytics/KNOWN-LIMITATIONS.md)                                                            |
| **Future Major Milestones** | Strategy/ADR → adapter → Platform Analytics service → Workbench → certification                                                         |

**Pack:** [products/analytics/](../products/analytics/) · **Metabase:** absent on disk

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
