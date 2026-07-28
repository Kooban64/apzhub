# Product Document Map

> **Programme:** APZHUB-PRODUCTS-000 (predecessor) · Binding: [framework/](./framework/README.md) · [definition/](./definition/README.md)  
> **Official product:** [apzqep/](./apzqep/README.md) · Active: [APZQEP-ENG-020D](./apzqep/requirements/versioning/README.md) (**IMPLEMENTED / AWAITING OWNER ACCEPTANCE**)

> **Related:** [DOCUMENT-MAP](../foundation/DOCUMENT-MAP.md) · [PROJECT-INDEX](../foundation/PROJECT-INDEX.md)

---

## Binding standards (Platform 1.4)

| Document                                                                      | Purpose                                                                                             |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [framework/](./framework/README.md)                                           | **APZHUB-PRODUCTS-002 ACCEPTED** — Engineering Framework                                            |
| [definition/](./definition/README.md)                                         | **APZHUB-PRODUCTS-003 ACCEPTED** — Definition Standard                                              |
| [requirements/](./requirements/README.md)                                     | **APZHUB-PRODUCTS-004 ACCEPTED** — Requirements Standard                                            |
| [apzqep/](./apzqep/README.md)                                                 | APZ QEP official root · Transition **ACCEPTED**                                                     |
| [apzqep/requirements/](./apzqep/requirements/README.md)                       | **APZQEP-REQ-001** — Requirements Baseline (**ACCEPTED**)                                           |
| [apzqep/discovery/](./apzqep/discovery/README.md)                             | **APZQEP-DISCOVERY-001** — Product Discovery (**ACCEPTED**)                                         |
| [apzqep/constitution/](./apzqep/constitution/README.md)                       | **APZQEP-CONSTITUTION-001** — Constitution (**ACCEPTED / CLOSED**)                                  |
| [apzqep/product-definition/](./apzqep/product-definition/README.md)           | **APZQEP-DEF-002** — Product Definition (**ACCEPTED**)                                              |
| [apzqep/architecture/](./apzqep/architecture/README.md)                       | **APZQEP-ARCH-001** — Enterprise Architecture (**ACCEPTED**)                                        |
| [apzqep/engineering-plan/](./apzqep/engineering-plan/README.md)               | **APZQEP-PLAN-001** — Engineering Delivery Plan (**ACCEPTED**)                                      |
| [apzqep/engineering/](./apzqep/engineering/README.md)                         | **APZQEP-ENG-010** — Engineering Foundation (**ACCEPTED**)                                          |
| [apzqep/requirements/versioning/](./apzqep/requirements/versioning/README.md) | **APZQEP-ENG-020D** — Requirements Content Versioning (**IMPLEMENTED / AWAITING OWNER ACCEPTANCE**) |
| [apztcms/requirements/](./apztcms/requirements/README.md)                     | **APZTCMS-REQ-001** — historical TCMS Requirements (**PRESERVED**)                                  |

---

## Framework documents (`docs/products/`)

| Document                                                                                                           | Purpose                                                             |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [README.md](./README.md)                                                                                           | Framework entry                                                     |
| [APZHUB-PRODUCT-PORTFOLIO.md](./APZHUB-PRODUCT-PORTFOLIO.md)                                                       | **Authoritative product portfolio & roadmap** (APZHUB-PRODUCTS-001) |
| [APZHUB-PRODUCT-IMPLEMENTATION-READINESS-MATRIX.md](./APZHUB-PRODUCT-IMPLEMENTATION-READINESS-MATRIX.md)           | Historical cross-product readiness matrix                           |
| [APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md](./APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md)                   | Historical portfolio readiness summary                              |
| [APZHUB-PRODUCT-READINESS-ADVANCEMENT.md](./APZHUB-PRODUCT-READINESS-ADVANCEMENT.md)                               | Historical IR advancement (ID reused by Definition Standard)        |
| [APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md](./APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md) | Transition report + reusable product pattern (post PROJECTS-001)    |
| [PORTFOLIO-INTEGRATION-STRATEGY.md](./PORTFOLIO-INTEGRATION-STRATEGY.md)                                           | Cross-product collaboration strategy (APZHUB-PORTFOLIO-001)         |
| [PLATFORM-EVENT-CATALOGUE.md](./PLATFORM-EVENT-CATALOGUE.md)                                                       | Portfolio event catalogue (design)                                  |
| [AUTOMATION-ROADMAP.md](./AUTOMATION-ROADMAP.md)                                                                   | Near / medium / long automation roadmap                             |
| [PORTFOLIO-INTERACTION-DIAGRAM.md](./PORTFOLIO-INTERACTION-DIAGRAM.md)                                             | Interaction diagrams                                                |
| [PRODUCT-ENGINEERING-HANDBOOK.md](./PRODUCT-ENGINEERING-HANDBOOK.md)                                               | How product engineering works                                       |
| [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md)                                                                     | Idea → Maintenance lifecycle                                        |
| [PRODUCT-ARCHITECTURE-STANDARD.md](./PRODUCT-ARCHITECTURE-STANDARD.md)                                             | Product vs platform architecture rules                              |
| [PRODUCT-BACKLOG-STANDARD.md](./PRODUCT-BACKLOG-STANDARD.md)                                                       | Product backlog shape                                               |
| [PRODUCT-RELEASE-STANDARD.md](./PRODUCT-RELEASE-STANDARD.md)                                                       | Release records                                                     |
| [PRODUCT-CERTIFICATION-STANDARD.md](./PRODUCT-CERTIFICATION-STANDARD.md)                                           | Minimum certification gates                                         |
| [PRODUCT-DOCUMENT-MAP.md](./PRODUCT-DOCUMENT-MAP.md)                                                               | This map                                                            |

---

## Requirements (mandatory first activity) — APZHUB-PRODUCTS-004

Before Product Definition:

| Path                                                       | Purpose                                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `docs/products/{id}/requirements/REQUIREMENTS-BASELINE.md` | Filled [requirements template](./requirements/REQUIREMENTS-TEMPLATE.md) |
| `docs/products/{id}/requirements/REQUIREMENTS-APPROVAL.md` | Requirements Approval record                                            |
| `docs/products/{id}/requirements/CHECKLIST.md`             | Completed checklist                                                     |
| `docs/products/{id}/requirements/TRACEABILITY-MATRIX.md`   | Traceability (or embedded)                                              |

See [REQUIREMENTS-ENGINEERING-STANDARD.md](./requirements/REQUIREMENTS-ENGINEERING-STANDARD.md).

## Product Definition (after Requirements Approval) — APZHUB-PRODUCTS-003

Before Architecture / Engineering / Implementation:

| Path                                                  | Purpose                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `docs/products/{id}/definition/PRODUCT-DEFINITION.md` | Filled [definition template](./definition/PRODUCT-DEFINITION-TEMPLATE.md) |
| `docs/products/{id}/definition/BUSINESS-APPROVAL.md`  | Business Approval record                                                  |
| `docs/products/{id}/definition/CHECKLIST.md`          | Completed checklist                                                       |

See [PRODUCT-DEFINITION-STANDARD.md](./definition/PRODUCT-DEFINITION-STANDARD.md).

## Living product packs (after Definition)

Required for active products (complements Definition; does not replace it):

| File                          | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| `README.md`                   | Entry / status                            |
| `VISION.md`                   | Product vision                            |
| `ARCHITECTURE.md`             | How it is engineered (Architecture stage) |
| `CAPABILITIES.md`             | Capabilities                              |
| `INTEGRATIONS.md`             | Integrations                              |
| `ROADMAP.md`                  | Roadmap                                   |
| `BACKLOG.md`                  | Backlog themes                            |
| `KNOWN-LIMITATIONS.md`        | Limitations                               |
| `RELEASE-PLAN.md`             | Release posture                           |
| `IMPLEMENTATION-READINESS.md` | Readiness assessment                      |

Optional when a product programme is active: `ADR-INDEX.md` · `RELEASES.md`

---

## Portfolio folders

| Portfolio                        | Path                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------- |
| **APZ QEP** (official)           | [apzqep/](./apzqep/) — Quality Engineering Platform                              |
| APZ TCMS (historical commercial) | [apz-tcms/](./apz-tcms/) · preserved REQ [apztcms/](./apztcms/)                  |
| Projects                         | [projects/](./projects/)                                                         |
| Time                             | [time/](./time/)                                                                 |
| Support                          | [support/](./support/)                                                           |
| Documents                        | [documents/](./documents/)                                                       |
| Analytics                        | [analytics/](./analytics/) · Release 1.0 pack [apz-analytics/](./apz-analytics/) |
| Workflow                         | [workflow/](./workflow/)                                                         |
| Law                              | [law/](./law/)                                                                   |

---

## Knowledge Foundation cross-links

| Topic                             | KF document                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| AI bootstrap                      | [AI-MANIFEST](../foundation/AI-MANIFEST.md)                                                           |
| Stop / approval                   | [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)                                               |
| Phase 3 policy                    | [APZHUB-PHASE-3](../foundation/APZHUB-PHASE-3-Product-Engineering-Commencement.md)                    |
| Platform closeout                 | [APZHUB-FOUNDATION-001](../foundation/APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md) |
| Product catalogue (platform view) | [PRODUCT-CATALOGUE](../foundation/PRODUCT-CATALOGUE.md)                                               |
| Capability inventory              | [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md) |

No duplicate standards: product docs specialise products; KF retains platform authority.
