# LAW-015 — Trust Accounting Backlog

> **Milestone:** LAW-015 — Trust Accounting  
> **Mode:** **Milestone closed** — LAW-015-14 complete (2026-07-08)  
> **Authority:** [LAW-Trust-Reference-Architecture](../architecture/LAW-Trust-Reference-Architecture.md)  
> **Last updated:** 2026-07-08

---

## Effort scale

| Label | Estimate  |
| ----- | --------- |
| S     | 0.5–1 day |
| M     | 1–2 days  |
| L     | 2–4 days  |
| XL    | 4–8 days  |

---

## Story map

```text
LAW-015-01 Foundation (planning) ✅
    ↓
LAW-015-02 Ledger Engine ✅
    ↓
LAW-015-03 Trust Transactions ✅
    ↓
LAW-015-04 Allocations ✅
    ↓
LAW-015-05 Reconciliation ✅
    ↓
LAW-015-06 Interest ✅
    ↓
LAW-015-07 Transfers ✅
    ↓
LAW-015-08 Reporting ✅
    ↓
LAW-015-09 Dashboard / Workbench ✅
    ↓
LAW-015-10 Approvals & Operational Controls ✅
    ↓
LAW-015-11 REST APIs & Persistence ✅
    ↓
LAW-015-12 Trust Reports Export Pack ✅
    ↓
LAW-015-13 E2E Validation ✅
    ↓
LAW-015-14 Milestone Closeout ✅
    ↓
LAW-015-15 Production Readiness (optional — await owner approval)
```

Parallel constraints: 015-09 requires 015-03+; 015-10 requires 015-02+; 015-11 requires 015-03+ and events catalogue.

---

## LAW-015-01 — Trust Accounting Foundation (Planning)

| Field                   | Value                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Objective**           | Authorise Trust Accounting through canonical architecture, domain model, specs, ADRs, and backlog                            |
| **Scope**               | Documentation only — architecture, domain, events, permissions, workbench planning, readiness review                         |
| **Out of scope**        | All code, UI, persistence, APIs, calculations                                                                                |
| **Deliverables**        | Reference architecture, domain model, specification, events, permissions, workbench plan, backlog, readiness, ADRs 0036–0039 |
| **Tests**               | N/A — documentation gate; quality gates on repo unchanged                                                                    |
| **Dependencies**        | LAW-014 business APIs complete; LAW-012 persistence foundation                                                               |
| **Platform validation** | Planning — cites Persistence, API, Event, Workbench consumption model                                                        |
| **Effort**              | L                                                                                                                            |
| **Status**              | ✅ Complete                                                                                                                  |

---

## LAW-015-02 — Trust Ledger Engine

| Field                   | Value                                                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**           | Implement in-memory double-entry journal posting, balance projection, and reference numbering                                     |
| **Scope**               | `TrustLedgerService`, `InMemoryTrustLedgerRepository`, journal model, chart of accounts, balance rebuild, in-memory domain events |
| **Out of scope**        | UI; REST APIs; PostgreSQL; outbox; interest calculations                                                                          |
| **Deliverables**        | `apps/law-platform/lib/trust/`, unit tests, engine notes, accounting rules notes                                                  |
| **Tests**               | 14 unit tests — balance, reversal, immutability, tenant isolation, diagnostics                                                    |
| **Dependencies**        | LAW-015-01 approved; ADR-0037                                                                                                     |
| **Platform validation** | In-memory ledger engine (persistence deferred)                                                                                    |
| **Effort**              | XL                                                                                                                                |
| **Status**              | ✅ Complete — in-memory only                                                                                                      |

---

## LAW-015-03 — Trust Transactions

| Field                   | Value                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **Objective**           | Workflow layer for draft trust transactions, validation, idempotent post, reversal, audit |
| **Scope**               | `TrustTransactionWorkflowService`, draft/audit repositories, validator, in-memory events  |
| **Out of scope**        | Transfers (015-07); interest (015-06); UI; APIs; persistence; outbox                      |
| **Deliverables**        | Workflow service, in-memory repos, 11 unit tests, workflow + audit notes                  |
| **Tests**               | Draft CRUD; validate; post; idempotency; cancel; reversal; audit; diagnostics             |
| **Dependencies**        | LAW-015-02                                                                                |
| **Platform validation** | Workflow over TrustLedgerService (in-memory)                                              |
| **Effort**              | L                                                                                         |
| **Status**              | ✅ Complete — in-memory only                                                              |

---

## LAW-015-04 — Trust Allocations

| Field                   | Value                                                                         |
| ----------------------- | ----------------------------------------------------------------------------- |
| **Objective**           | Matter/client allocation buckets and matter trust balance queries             |
| **Scope**               | `TrustAllocationWorkflowService`, allocation on post, unallocated client pool |
| **Out of scope**        | Reconciliation UI; billing apply                                              |
| **Deliverables**        | Allocation repository, matter balance projection, allocation events           |
| **Tests**               | Split allocation; matter closed rejection; sum equals transaction             |
| **Dependencies**        | LAW-015-03                                                                    |
| **Platform validation** | Allocation layer over posted transactions (in-memory)                         |
| **Effort**              | L                                                                             |
| **Status**              | ✅ Complete — in-memory only                                                  |

---

## LAW-015-05 — Trust Reconciliation

| Field                   | Value                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**           | Read-only reconciliation engine validating ledger vs allocation integrity                                                          |
| **Scope**               | `TrustReconciliationService`, pure reconciliation checks, variance detection, immutable run records, diagnostics, in-memory events |
| **Out of scope**        | Bank feed import (three-way); PDF export; persistence; UI; APIs                                                                    |
| **Deliverables**        | Reconciliation engine, append-only run repository, variance model, events, 12 unit tests                                           |
| **Tests**               | Ledger/allocation variance detection; orphan/duplicate/reversal checks; immutable runs; tenant isolation                           |
| **Dependencies**        | LAW-015-04; ADR-0038                                                                                                               |
| **Platform validation** | Read-only reconciliation over ledger and allocations (in-memory)                                                                   |
| **Effort**              | L                                                                                                                                  |
| **Status**              | ✅ Complete — in-memory only · [completion report](../sprint/LAW-015-05-completion-report.md)                                      |

---

## LAW-015-06 — Trust Interest

| Field                   | Value                                                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**           | Interest rules, accrual engine, approval, and posting on allocated balances                                                              |
| **Scope**               | `TrustInterestService`, `TrustInterestRule`, accrual engine, draft/approved/posted workflow, ledger `interest` type, per-line allocation |
| **Out of scope**        | External rate sources; bank integration; reporting; APIs; UI; persistence                                                                |
| **Deliverables**        | Interest policies, accrual engine, posting workflow, events, diagnostics, 12 unit tests                                                  |
| **Tests**               | Policy creation; accrual draft; approve/post; minimum balance; tenant isolation                                                          |
| **Dependencies**        | LAW-015-04; LAW-015-05 (read-only cross-check only); ADR-0039                                                                            |
| **Platform validation** | In-memory accrual and posting over ledger + allocations                                                                                  |
| **Effort**              | L                                                                                                                                        |
| **Status**              | ✅ Complete — in-memory only · [completion report](../sprint/LAW-015-06-completion-report.md)                                            |

---

## LAW-015-07 — Trust Transfers

| Field                   | Value                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| **Objective**           | Controlled in-memory trust fund movement via paired journal postings                                     |
| **Scope**               | `TrustTransferService`, validator, repository, diagnostics, `transfer_out`/`transfer_in` ledger types    |
| **Out of scope**        | Bank transfers; payment gateways; UI; APIs; persistence; reporting                                       |
| **Deliverables**        | Transfer workflow, paired postings, allocation updates, events, 12 unit tests                            |
| **Tests**               | Matter/client/account transfers; insufficient balance; reversal; ledger integrity; interest preservation |
| **Dependencies**        | LAW-015-04; LAW-015-06 (interest preservation)                                                           |
| **Platform validation** | Ledger + allocation integration (in-memory)                                                              |
| **Effort**              | L                                                                                                        |
| **Status**              | ✅ Complete — in-memory only · [completion report](../sprint/LAW-015-07-completion-report.md)            |

---

## LAW-015-08 — Trust Reporting

| Field                   | Value                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Objective**           | In-memory read-only report projections from accounting services                               |
| **Scope**               | `TrustReportingService`, 10 report types, diagnostics, in-memory events                       |
| **Out of scope**        | UI, APIs, persistence, PDF/Excel/CSV export, scheduled reports, email                         |
| **Deliverables**        | Report model, pure builders, repository, 20 unit tests                                        |
| **Tests**               | Every report type; deterministic output; tenant isolation; period filtering                   |
| **Dependencies**        | LAW-015-02 through LAW-015-07                                                                 |
| **Platform validation** | Read-only service composition                                                                 |
| **Effort**              | L                                                                                             |
| **Status**              | ✅ Complete — in-memory only · [completion report](../sprint/LAW-015-08-completion-report.md) |

---

## LAW-015-09 — Trust Dashboard & Workbench

| Field                   | Value                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| **Objective**           | Trust workbench UI over in-memory trust services                                                          |
| **Scope**               | Dashboard, accounts, transactions, allocations, reconciliation, interest, transfers, reports, diagnostics |
| **Out of scope**        | APIs, persistence, export, full post forms                                                                |
| **Deliverables**        | `legal-trust` manifest, UI components, commands, knowledge, search                                        |
| **Tests**               | 9 UI tests — routes, dashboard, router, bootstrap, knowledge                                              |
| **Dependencies**        | LAW-015-02 through LAW-015-08                                                                             |
| **Platform validation** | **Workbench** + **Action Framework** + **Knowledge**                                                      |
| **Effort**              | XL                                                                                                        |
| **Status**              | ✅ Complete — in-memory only · [completion report](../sprint/LAW-015-09-completion-report.md)             |

---

## LAW-015-10 — Trust Approvals & Operational Controls

| Field                   | Value                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Objective**           | Configurable approval governance over trust financial actions                                                        |
| **Scope**               | `TrustApprovalService`, rules, requests, validator, diagnostics, events, domain integration                          |
| **Out of scope**        | APIs, persistence, email, workflow designer, bank integration                                                        |
| **Deliverables**        | Approval service layer, gate integration, 15 unit tests, architecture notes                                          |
| **Tests**               | Single/dual approval, rejection, cancellation, threshold, self-approval, roles, audit, diagnostics, tenant isolation |
| **Dependencies**        | LAW-015-03, LAW-015-06, LAW-015-07                                                                                   |
| **Platform validation** | Operational governance layer                                                                                         |
| **Effort**              | L                                                                                                                    |
| **Status**              | ✅ Complete — in-memory only · [completion report](../sprint/LAW-015-10-completion-report.md)                        |

---

## LAW-015-11 — Trust REST APIs & Persistence

| Field                   | Value                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Objective**           | Expose trust resources at `/api/law/v1/trust/*`; persist approval rules and requests    |
| **Scope**               | Accounts, transactions, transfers, reconciliations, balances, audit, approval endpoints |
| **Out of scope**        | Financial Engine extraction, bank integration, exports                                  |
| **Deliverables**        | Route handlers, Postgres adapters, OpenAPI update, integration tests                    |
| **Tests**               | Auth, tenant, permission, envelope parity with Client API pattern                       |
| **Dependencies**        | LAW-015-02+; LAW-015-10; LAW-014-05 framework                                           |
| **Platform validation** | **API Framework** + **Persistence**                                                     |
| **Effort**              | XL                                                                                      |
| **Status**              | ✅ Complete · [completion report](../sprint/LAW-015-11-completion-report.md)            |

---

## LAW-015-12 — Trust Reports Export Pack

| Field                   | Value                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| **Objective**           | Export Trust reports for internal review, auditors, and compliance preparation                         |
| **Scope**               | CSV and print-friendly HTML for all ten report types; REST export route; workbench UI buttons          |
| **Out of scope**        | PDF/Excel engines, scheduled reports, email, bank feeds, accounting integration, outbox workers        |
| **Deliverables**        | `trust-report-export.ts`, `/reports/{reportId}/export`, workbench Export CSV / Print View              |
| **Tests**               | CSV/HTML export, unsupported format, permission denied, tenant isolation, report not found, UI buttons |
| **Dependencies**        | LAW-015-08, LAW-015-09, LAW-015-11                                                                     |
| **Platform validation** | **API Framework** + **Presentation**                                                                   |
| **Effort**              | M                                                                                                      |
| **Status**              | ✅ Complete · [completion report](../sprint/LAW-015-12-completion-report.md)                           |

---

## LAW-015-12 (deferred) — Trust Platform Integration

| Field                   | Value                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| **Objective**           | Wire trust to Client, Matter, Billing, Events, Notifications, Knowledge, Dashboard                        |
| **Scope**               | Manifest events/activities/notifications; matter/client tabs; invoice trust apply; TrustKnowledgeProvider |
| **Out of scope**        | Payment gateway                                                                                           |
| **Deliverables**        | Event registrations, notification routes, activity types, billing workflow hook                           |
| **Tests**               | Event emission on post; matter timeline item; knowledge search hit                                        |
| **Dependencies**        | LAW-015-03; LAW-015-09 partial                                                                            |
| **Platform validation** | **Event/Notification** + **Activity/Timeline** + **Knowledge**                                            |
| **Effort**              | L                                                                                                         |
| **Status**              | Deferred — recommend folding into LAW-015-13+ after owner approval                                        |

---

## LAW-015-13 — Trust E2E Validation

| Field                   | Value                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **Objective**           | End-to-end trust journey validating cross-framework composition                              |
| **Scope**               | Playwright: open trust workspace → post deposit → allocate to matter → reconcile → statement |
| **Out of scope**        | Load testing                                                                                 |
| **Deliverables**        | E2E spec, validation evidence update                                                         |
| **Tests**               | Full trust smoke path; permission denial paths                                               |
| **Dependencies**        | LAW-015-09, LAW-015-11                                                                       |
| **Platform validation** | **All frameworks** — cross-cutting                                                           |
| **Effort**              | M                                                                                            |
| **Status**              | ✅ Complete · [completion report](../sprint/LAW-015-13-completion-report.md)                 |

---

## LAW-015-14 — Trust Accounting Milestone Closeout

| Field                   | Value                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**           | Formally close Trust Accounting milestone; produce canonical documentation set                                                                                                                                                                                                                                                                                                                                                          |
| **Scope**               | Reference architecture, domain reference, developer guide, operator guide, formal review, release notes, index updates                                                                                                                                                                                                                                                                                                                  |
| **Out of scope**        | Production code, APIs, UI, persistence, Financial Engine extraction                                                                                                                                                                                                                                                                                                                                                                     |
| **Deliverables**        | [LAW-Trust-Reference-Architecture](../architecture/LAW-Trust-Reference-Architecture.md), [LAW-Trust-Domain-Reference](../architecture/LAW-Trust-Domain-Reference.md), [LAW-Trust-Developer-Guide](../developer/LAW-Trust-Developer-Guide.md), [LAW-Trust-Operations-Guide](../operator/LAW-Trust-Operations-Guide.md), [LAW-015 Review](../reviews/LAW-015-Trust-Accounting-Review.md), [LAW-Trust-v1.0](../releases/LAW-Trust-v1.0.md) |
| **Tests**               | Quality gates only — lint, typecheck, build, test, coverage                                                                                                                                                                                                                                                                                                                                                                             |
| **Dependencies**        | LAW-015-13                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Platform validation** | Governance                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Effort**              | M                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Status**              | ✅ Complete · [completion report](../sprint/LAW-015-14-completion-report.md)                                                                                                                                                                                                                                                                                                                                                            |

---

## LAW-015-15 — Trust Production Readiness (optional)

| Field                   | Value                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **Objective**           | Readiness review, permission seed, quality gate confirmation, technical debt update                  |
| **Scope**               | Readiness review doc, TD closure plan, RBAC seed for trust permissions, OpenAPI registration, CI E2E |
| **Out of scope**        | Commercial GA certification                                                                          |
| **Deliverables**        | Production readiness review, updated technical debt register                                         |
| **Tests**               | Full lint, typecheck, build, test, coverage; Playwright E2E green                                    |
| **Dependencies**        | LAW-015-14                                                                                           |
| **Platform validation** | Cross-cutting                                                                                        |
| **Effort**              | M                                                                                                    |
| **Status**              | ⏸ Await owner approval                                                                               |

---

## Optional stretch stories (post-015-15)

| Story      | Title                       | Notes                             |
| ---------- | --------------------------- | --------------------------------- |
| LAW-015-16 | Bank statement import       | File upload + parse               |
| LAW-015-17 | Trust payment gateway       | PaymentGatewayService integration |
| LAW-015-18 | Multi-jurisdiction profiles | Non-ZA profiles                   |

---

## Constraints

- **Do not modify** Platform 5.0 frameworks except documented bug fixes
- **Do not duplicate** ledger, event, or API infrastructure
- **Complete one story** before the next within critical path (02 → 03 → 04 → 05)
- **Every story** cites platform framework(s) validated

---

## Gate

**Trust Accounting milestone is closed (LAW-015-14).**

Do **not** begin Financial Engine extraction, bank integration, Trust Phase 2, LAW-015-15 production readiness, or any new Trust implementation until owner approves [LAW-015-14 completion report](../sprint/LAW-015-14-completion-report.md).

---

_LAW-015 Trust Accounting Backlog — milestone closed 2026-07-08._
