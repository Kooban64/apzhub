# APZOR Financial Engine — Reference Architecture

> **Story:** FIN-001 — Architecture extraction (planning only)  
> **Status:** **Planning** — no implementation  
> **Authority:** [LAW-Trust-Accounting-Reference-Architecture](./LAW-Trust-Accounting-Reference-Architecture.md) · [LAW-015-02 through LAW-015-08](./LAW-Architecture-Index.md)  
> **Platform baseline:** [APZHUB Platform v5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**  
> **Last updated:** 2026-07-07

---

## 1. Purpose

The **APZOR Financial Engine** is a proposed shared accounting capability that generalises the generic financial patterns proven in the Law Platform Trust Accounting implementation (LAW-015-02 through LAW-015-08).

Its purpose is to provide:

- Immutable double-entry ledger semantics
- Transaction workflow and audit
- Sub-ledger allocation and balance projection
- Internal reconciliation controls
- Interest accrual and posting
- Controlled transfers
- Read-only financial reporting

**without** embedding Law Platform-specific concepts (trust regulation, matter segregation, LPC compliance, legal statements).

FIN-001 determines feasibility and boundaries only. **No code extraction occurs in FIN-001.**

---

## 2. Responsibilities

### 2.1 In scope (Financial Engine owns)

| Responsibility           | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| Ledger authority         | Single source of truth for posted financial movements         |
| Double-entry journal     | Balanced debit/credit postings, append-only                   |
| Transaction lifecycle    | Draft → validate → post → reverse                             |
| Balance projection       | Derived balances from journal (account + optional dimensions) |
| Sub-ledger allocation    | Append-only allocation records against posted transactions    |
| Internal reconciliation  | Ledger vs sub-ledger integrity checks                         |
| Interest engine          | Accrual calculation and posting workflow                      |
| Transfer engine          | Paired movements with clearing accounts                       |
| Reporting projections    | Immutable read models from accounting services                |
| Reference numbering      | Journal and transaction reference generation                  |
| Domain events (contract) | Standard `financial.*` event envelope definitions             |
| Repository interfaces    | Persistence-ready contracts                                   |

### 2.2 Out of scope (product or platform owns)

| Responsibility                                                 | Owner                                  |
| -------------------------------------------------------------- | -------------------------------------- |
| UI, workbench, dashboards                                      | Product (e.g. Law Platform LAW-015-09) |
| REST APIs and OpenAPI                                          | Product Platform Service layer         |
| PostgreSQL schema and RLS                                      | Product persistence (LAW-012 patterns) |
| Platform Event Bus / outbox wiring                             | APZHUB Platform 5.0                    |
| Auth, permissions, tenant provisioning                         | APZHUB Platform IAM                    |
| Regulatory compliance rules                                    | Product policy layer                   |
| Bank feed import, payment rails                                | Product integration adapters           |
| Product-specific chart of accounts naming                      | Product configuration                  |
| Business entity relationships (Client, Matter, Account holder) | Product domain                         |

---

## 3. Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Product Layer (Law, Bank, Exchange, …)                │
│  Workbench · Actions · APIs · Compliance Profiles · Product Domain Entities  │
├─────────────────────────────────────────────────────────────────────────────┤
│                   Product Financial Policy Adapter                           │
│  Chart mapping · Dimension schema · Posting rules · Report catalogue         │
│  Compliance gates · Statement templates · Regulatory export profiles         │
├─────────────────────────────────────────────────────────────────────────────┤
│                     APZOR Financial Engine (proposed)                        │
│  LedgerService · TransactionWorkflowService · AllocationService                │
│  ReconciliationService · InterestService · TransferService                   │
│  ReportingService · Pure engines · Repository interfaces                       │
├─────────────────────────────────────────────────────────────────────────────┤
│              Product Persistence Adapters (implement repositories)           │
│  PostgreSQL · RLS · migrations · outbox projection                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                     APZHUB Platform 5.0 (frozen)                             │
│  Identity · Permissions · Event Bus · Notifications · Observability          │
└─────────────────────────────────────────────────────────────────────────────┘
```

The Financial Engine is a **shared library / domain package**, not a Platform 5.0 framework extension. Products consume it through Platform Services and adapters — they do not modify Platform internals.

---

## 4. Layering

Strict layering mirrors the proven LAW-015 stack:

```text
Presentation (Product UI)
  ↓
Product Platform Service (orchestration, permissions, audit envelope)
  ↓
Product Financial Policy Adapter (compliance, dimensions, chart)
  ↓
APZOR Financial Engine Services
  ↓
Repository Interfaces
  ↓
Persistence Adapters (product-owned)
```

### 4.1 Engine service stack

| Layer | Service                      |           Mutates ledger?           |
| ----- | ---------------------------- | :---------------------------------: |
| 1     | `LedgerService`              |            ✅ Authority             |
| 2     | `TransactionWorkflowService` |             Via ledger              |
| 3     | `AllocationService`          | Via allocations (not journal edits) |
| 4     | `InterestService`            |           Via ledger post           |
| 5     | `TransferService`            |      Via ledger + allocations       |
| 6     | `ReconciliationService`      |            ❌ Read-only             |
| 7     | `ReportingService`           |            ❌ Read-only             |

**Rule:** Reconciliation and reporting never mutate accounting data. Upper layers never bypass the ledger.

---

## 5. Boundaries

### 5.1 Financial Engine ↔ Product

| Boundary          | Financial Engine                                          | Product                                                                |
| ----------------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| Account entity    | Generic `FinancialAccount` (id, currency, tenant, status) | Trust account metadata, bank details, LPC registration                 |
| Dimensions        | Opaque dimension keys (`Record<string, string>`)          | Client, Matter, Wallet, Escrow contract, Merchant ID                   |
| Transaction types | Core set + extensible registry                            | Trust deposit/withdrawal; bank debit/credit; exchange trade settlement |
| Chart of accounts | Configurable codes                                        | `TRUST-*` vs `BANK-*` vs `WALLET-*`                                    |
| Compliance        | Hooks and policy interfaces                               | ZA-LPC, banking regulations, exchange rules                            |
| Events            | `financial.ledger.*`, `financial.transaction.*`           | Product events (`legal.trust.*`, `bank.ledger.*`) via adapter          |

### 5.2 Financial Engine ↔ APZHUB Platform

| Capability    | Integration pattern                                                     |
| ------------- | ----------------------------------------------------------------------- |
| Events        | Engine emits domain events; product maps to Platform Event Bus + outbox |
| Permissions   | Engine has no auth; product Platform Service enforces                   |
| Observability | Engine diagnostics hooks; product wires to Platform telemetry           |
| Multi-tenancy | `tenantId` on all entities; RLS in product persistence                  |

**Platform 5.0 remains frozen.** The Financial Engine does not require platform changes.

---

## 6. Dependencies

### 6.1 Financial Engine may depend on

| Dependency                        | Purpose                                                             |
| --------------------------------- | ------------------------------------------------------------------- |
| `@apzhub/shared-types` (proposed) | Common IDs, money types, result envelopes                           |
| Reference number utility          | Journal/transaction references (extracted from legal-business-core) |

### 6.2 Financial Engine must not depend on

| Dependency                 | Reason                            |
| -------------------------- | --------------------------------- |
| Law Platform modules       | Prevents circular coupling        |
| APZHUB Platform frameworks | Engine is below platform boundary |
| Product persistence        | Repository interfaces only        |
| UI packages                | Presentation-free domain          |

### 6.3 Current LAW-015 dependency (to resolve on extraction)

| Current                                                  | Resolution                                             |
| -------------------------------------------------------- | ------------------------------------------------------ |
| `@apzhub/legal-business-core` `ReferenceNumberGenerator` | Move to `@apzor/financial-core` or `@apzhub/reference` |

---

## 7. Extension model

Products extend the engine through **configuration and adapters**, not forked engine code.

| Extension point   | Mechanism                                                     |
| ----------------- | ------------------------------------------------------------- |
| Chart of accounts | Product-supplied account code registry                        |
| Transaction types | Registry with posting rule bindings                           |
| Posting rules     | `PostingRule` maps transaction type → debit/credit lines      |
| Dimension schema  | Product defines required/optional dimensions per account type |
| Allocation types  | Product-defined allocation effect rules                       |
| Transfer types    | Product-defined endpoint validation                           |
| Interest policies | Rule templates bound to compliance profile                    |
| Report catalogue  | Product registers report types and payload mappers            |
| Compliance gates  | Pre-post and pre-close hooks (product implements)             |

```text
Product registers:
  chart.yaml · posting-rules.yaml · dimension-schema.yaml · report-catalogue.yaml
Engine loads at runtime via Product Financial Policy Adapter
```

---

## 8. Ownership

| Asset                             | Owner                               |
| --------------------------------- | ----------------------------------- |
| APZOR Financial Engine package(s) | APZOR / APZHUB platform engineering |
| Generic domain model and engines  | Financial Engine team (shared)      |
| Law trust policy adapter          | Law Platform team                   |
| Banking / exchange adapters       | Respective product teams            |
| Persistence schemas               | Each product                        |
| Compliance profiles               | Each product (SA-LPC for Law)       |

---

## 9. Lifecycle

| Phase       | Activity                                                          | Status                           |
| ----------- | ----------------------------------------------------------------- | -------------------------------- |
| FIN-001     | Architecture extraction analysis                                  | **This document**                |
| LAW-015-09+ | Complete Law trust (dashboard, APIs, persistence)                 | In progress / planned            |
| FIN-002     | Generic domain model package design                               | Planned — after FIN-001 approval |
| FIN-003     | Extract ledger + workflow core                                    | Planned                          |
| FIN-004     | Extract allocation, reconciliation, interest, transfer, reporting | Planned                          |
| FIN-005     | Law Platform adapter + regression suite                           | Planned                          |
| Product N   | Second product validates reuse (APZBNK or APZEX)                  | Future                           |

**Governance:** Financial Engine changes require architecture review; breaking changes require semver major and product migration plan.

---

## 10. Proven foundation (LAW-015)

The following is **already implemented** in `apps/law-platform/lib/trust/` (in-memory, 94 tests):

| Story      | Capability           |            Reuse potential            |
| ---------- | -------------------- | :-----------------------------------: |
| LAW-015-02 | Ledger engine        |                 High                  |
| LAW-015-03 | Transaction workflow |                 High                  |
| LAW-015-04 | Allocations          | Medium (dimension abstraction needed) |
| LAW-015-05 | Reconciliation       |                 High                  |
| LAW-015-06 | Interest             |                 High                  |
| LAW-015-07 | Transfers            |   Medium (type abstraction needed)    |
| LAW-015-08 | Reporting            |                 High                  |

See [APZOR-Financial-vs-Law-Separation.md](./APZOR-Financial-vs-Law-Separation.md) for the complete separation matrix.

---

## 11. Related documents

| Document                                                                           | Role                         |
| ---------------------------------------------------------------------------------- | ---------------------------- |
| [APZOR-Financial-Engine-Domain-Model.md](./APZOR-Financial-Engine-Domain-Model.md) | Canonical generic domain     |
| [APZOR-Financial-vs-Law-Separation.md](./APZOR-Financial-vs-Law-Separation.md)     | Separation matrix            |
| [APZOR-Financial-Integration-Model.md](./APZOR-Financial-Integration-Model.md)     | Product integration patterns |
| [APZOR-Financial-Extraction-Plan.md](./APZOR-Financial-Extraction-Plan.md)         | Migration plan (if approved) |
| [FIN-001 Architecture Review](../reviews/FIN-001-Architecture-Review.md)           | Formal recommendation        |
