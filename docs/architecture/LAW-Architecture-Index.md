# LAW Platform — Architecture Index

> **Status:** Active index — updated with LAW-015 Trust Accounting milestone closeout  
> **Last updated:** 2026-07-08

---

## Core Law Platform architecture

| Document                                                                                      | Description                         |
| --------------------------------------------------------------------------------------------- | ----------------------------------- |
| [APZHUB-Law-Platform-Reference-Architecture](./APZHUB-Law-Platform-Reference-Architecture.md) | Platform → Law layer model          |
| [APZHUB-Law-Capability-Map](./APZHUB-Law-Capability-Map.md)                                   | Legal modules → platform frameworks |
| [APZHUB-Law-Domain-Model](./APZHUB-Law-Domain-Model.md)                                       | Canonical legal domain vocabulary   |
| [APZHUB-Legal-Business-Core](./APZHUB-Legal-Business-Core.md)                                 | Shared types package                |

---

## Persistence & integration

| Document                                                                              | Description                       |
| ------------------------------------------------------------------------------------- | --------------------------------- |
| [LAW-Persistence-Reference-Architecture](./LAW-Persistence-Reference-Architecture.md) | PostgreSQL, RLS, outbox           |
| [LAW-Persistence-Data-Model](./LAW-Persistence-Data-Model.md)                         | Entity tables (Phase 1 + planned) |
| [LAW-Integration-Reference-Architecture](./LAW-Integration-Reference-Architecture.md) | APIs, webhooks, workers           |
| [LAW-Webhook-Architecture](./LAW-Webhook-Architecture.md)                             | Webhook delivery model            |
| [LAW-External-Service-Abstractions](./LAW-External-Service-Abstractions.md)           | File, email, payment interfaces   |

---

## Trust Accounting (LAW-015) — **milestone closed**

| Document                                                                                            | Description                                                                 |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [LAW-Trust-Reference-Architecture](./LAW-Trust-Reference-Architecture.md)                           | **Canonical as-built** trust subsystem architecture                         |
| [LAW-Trust-Domain-Reference](./LAW-Trust-Domain-Reference.md)                                       | **Canonical** aggregates, entities, events, state machines                  |
| [LAW-Trust-Accounting-Reference-Architecture](./LAW-Trust-Accounting-Reference-Architecture.md)     | Original planning architecture (superseded for as-built by reference above) |
| [LAW-015-02 Trust Ledger Engine Notes](./LAW-015-02-Trust-Ledger-Engine-Notes.md)                   | In-memory engine implementation (LAW-015-02)                                |
| [LAW-015-02 Accounting Rules Notes](./LAW-015-02-Trust-Accounting-Rules-Notes.md)                   | Enforced posting and validation rules                                       |
| [LAW-015-03 Workflow Notes](./LAW-015-03-Trust-Transaction-Workflow-Notes.md)                       | Draft workflow layer (LAW-015-03)                                           |
| [LAW-015-03 Audit Notes](./LAW-015-03-Trust-Transaction-Audit-Notes.md)                             | Append-only workflow audit                                                  |
| [LAW-015-04 Allocation Notes](./LAW-015-04-Trust-Allocation-Notes.md)                               | Allocation layer (LAW-015-04)                                               |
| [LAW-015-04 Allocation Model](./LAW-015-04-Trust-Allocation-Model.md)                               | Allocation entity and patterns                                              |
| [LAW-015-05 Reconciliation Engine Notes](./LAW-015-05-Trust-Reconciliation-Engine-Notes.md)         | Read-only reconciliation engine (LAW-015-05)                                |
| [LAW-015-05 Reconciliation Model](./LAW-015-05-Trust-Reconciliation-Model.md)                       | Reconciliation run and variance model                                       |
| [LAW-015-06 Interest Engine Notes](./LAW-015-06-Trust-Interest-Engine-Notes.md)                     | Interest accrual and posting workflow (LAW-015-06)                          |
| [LAW-015-06 Interest Model](./LAW-015-06-Trust-Interest-Model.md)                                   | Interest rule and posting model                                             |
| [LAW-015-07 Transfer Engine Notes](./LAW-015-07-Trust-Transfer-Engine-Notes.md)                     | Transfer workflow engine (LAW-015-07)                                       |
| [LAW-015-07 Transfer Model](./LAW-015-07-Trust-Transfer-Model.md)                                   | Trust transfer aggregate model                                              |
| [LAW-015-08 Reporting Engine Notes](./LAW-015-08-Trust-Reporting-Engine-Notes.md)                   | Read-only reporting engine (LAW-015-08)                                     |
| [LAW-015-08 Report Model](./LAW-015-08-Trust-Report-Model.md)                                       | Trust report read model                                                     |
| [LAW-015-09 Workbench UI Notes](./LAW-015-09-Trust-Workbench-UI-Notes.md)                           | Trust workbench UI (LAW-015-09)                                             |
| [LAW-015-09 Dashboard Notes](./LAW-015-09-Trust-Dashboard-Notes.md)                                 | Trust dashboard composition                                                 |
| [LAW-015-10 Approval Notes](./LAW-015-10-Trust-Approval-Notes.md)                                   | Trust approval governance (LAW-015-10)                                      |
| [LAW-015-10 Operational Controls](./LAW-015-10-Operational-Controls-Notes.md)                       | Trust operational controls                                                  |
| [LAW-015-11 Persistence Notes](./LAW-015-11-Trust-Persistence-Notes.md)                             | PostgreSQL trust persistence (LAW-015-11)                                   |
| [LAW-015-11 API Notes](./LAW-015-11-Trust-API-Notes.md)                                             | Trust REST API surface                                                      |
| [LAW-015-11 Migration Notes](./LAW-015-11-Migration-Notes.md)                                       | Trust SQL migrations                                                        |
| [LAW-015-11 RLS Notes](./LAW-015-11-RLS-Notes.md)                                                   | Trust row-level security                                                    |
| [LAW-015-11 Technical Debt](./LAW-015-11-Technical-Debt.md)                                         | Debt and LAW-015-12 recommendation                                          |
| [LAW-015-12 Trust Export Notes](./LAW-015-12-Trust-Export-Notes.md)                                 | Trust report CSV/HTML export (LAW-015-12)                                   |
| [LAW-015-12 CSV Format Notes](./LAW-015-12-Trust-CSV-Format-Notes.md)                               | Trust CSV column maps                                                       |
| [LAW-015-12 Print View Notes](./LAW-015-12-Trust-Print-View-Notes.md)                               | Trust HTML print view                                                       |
| [LAW-015-12 Technical Debt](./LAW-015-12-Technical-Debt.md)                                         | Debt and LAW-015-13 recommendation                                          |
| [LAW-015-13 E2E Validation Report](./LAW-015-13-E2E-Validation-Report.md)                           | Trust Playwright validation (LAW-015-13)                                    |
| [LAW-015-13 API Validation Matrix](./LAW-015-13-API-Validation-Matrix.md)                           | Trust REST API validation matrix                                            |
| [LAW-015-13 UI Validation Matrix](./LAW-015-13-UI-Validation-Matrix.md)                             | Trust workbench UI validation matrix                                        |
| [LAW-015-13 Technical Debt](./LAW-015-13-Technical-Debt.md)                                         | Debt and LAW-015-14 recommendation                                          |
| [LAW-015 Trust Accounting Review](../reviews/LAW-015-Trust-Accounting-Review.md)                    | Formal milestone review — PASS WITH OBSERVATIONS                            |
| [LAW Trust v1.0](../releases/LAW-Trust-v1.0.md)                                                     | Trust Accounting release notes (no tag)                                     |
| [LAW Trust Developer Guide](../developer/LAW-Trust-Developer-Guide.md)                              | Developer guide                                                             |
| [LAW Trust Operations Guide](../operator/LAW-Trust-Operations-Guide.md)                             | Operator guide                                                              |
| [APZOR Financial Engine Reference Architecture](./APZOR-Financial-Engine-Reference-Architecture.md) | FIN-001 — proposed shared financial engine                                  |
| [APZOR Financial Engine Domain Model](./APZOR-Financial-Engine-Domain-Model.md)                     | FIN-001 — canonical generic financial domain                                |
| [APZOR Financial vs Law Separation](./APZOR-Financial-vs-Law-Separation.md)                         | FIN-001 — separation matrix                                                 |
| [APZOR Financial Integration Model](./APZOR-Financial-Integration-Model.md)                         | FIN-001 — product integration patterns                                      |
| [APZOR Financial Extraction Plan](./APZOR-Financial-Extraction-Plan.md)                             | FIN-001 — deferred extraction plan                                          |
| [LAW-Trust-Domain-Model](./LAW-Trust-Domain-Model.md)                                               | Trust entities, aggregates, lifecycles                                      |
| [LAW-Trust-Accounting-Specification](../specs/LAW-Trust-Accounting-Specification.md)                | Posting rules, compliance profiles                                          |
| [LAW-Trust-Events](../specs/LAW-Trust-Events.md)                                                    | `legal.trust.*` event catalogue                                             |
| [LAW-Trust-Permissions](../specs/LAW-Trust-Permissions.md)                                          | `legal.trust.*` permission keys                                             |
| [LAW-Trust-Workbench-Planning](../specs/LAW-Trust-Workbench-Planning.md)                            | Future workbench modules                                                    |
| [LAW-015 Backlog](../backlog/LAW-015-Trust-Accounting-Backlog.md)                                   | LAW-015-01–015-15 — **milestone closed**                                    |
| [LAW-015 Readiness](../reviews/LAW-015-Trust-Accounting-Readiness.md)                               | Planning gate review                                                        |
| [LAW-015 Review](../reviews/LAW-015-Trust-Accounting-Review.md)                                     | Milestone closeout review — PASS WITH OBSERVATIONS                          |

### Trust ADRs

| ADR                                                                     | Title                                          |
| ----------------------------------------------------------------------- | ---------------------------------------------- |
| [ADR-0036](../adr/ADR-0036-trust-accounting-law-capability.md)          | Trust Accounting as Law Platform Capability    |
| [ADR-0037](../adr/ADR-0037-immutable-trust-journal.md)                  | Immutable Trust Journal and Append-Only Ledger |
| [ADR-0038](../adr/ADR-0038-matter-trust-balance-segregation.md)         | Matter Trust Balance Segregation Model         |
| [ADR-0039](../adr/ADR-0039-jurisdiction-adaptive-compliance-profile.md) | Jurisdiction-Adaptive Compliance Profile       |

---

## UX & API (Law Platform)

| Document                                                                | Description               |
| ----------------------------------------------------------------------- | ------------------------- |
| [LAW-001-02 UX Foundation](./LAW-001-02-ux-foundation-specification.md) | Legal UX standards        |
| [LAW-API-Framework](../specs/LAW-API-Framework.md)                      | Shared API infrastructure |
| [LAW-OpenAPI-v1](../specs/LAW-OpenAPI-v1.yaml)                          | OpenAPI contract          |

---

## Roadmaps & backlogs

| Document                                                         | Description                  |
| ---------------------------------------------------------------- | ---------------------------- |
| [LAW Platform Backlog](../backlog/LAW-Platform-Backlog.md)       | LAW-001–LAW-015 milestones   |
| [LAW Persistence Roadmap](../roadmap/LAW-Persistence-Roadmap.md) | Phase 2 persistence sequence |

---

_LAW Platform Architecture Index — navigation aid for legal architecture documents._
