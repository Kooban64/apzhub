# APZOR Financial Engine vs Law Platform — Separation Matrix

> **Story:** FIN-001 — Architecture extraction (planning only)  
> **Status:** **Analysis complete**  
> **Last updated:** 2026-07-07

---

## 1. Purpose

Explicitly identify which capabilities from the LAW-015 Trust Accounting implementation belong in a reusable **APZOR Financial Engine** versus what must remain in the **Law Platform**.

This matrix covers every component delivered in LAW-015-01 through LAW-015-08.

---

## 2. Summary

| Category                                              | Count | Action                         |
| ----------------------------------------------------- | :---: | ------------------------------ |
| Generic — move to Financial Engine (with abstraction) |  42   | Extract in phased migration    |
| Law-specific — remain in Law Platform                 |  28   | Keep as adapter / policy layer |
| Platform capability — remain in APZHUB Platform       |  12   | No move                        |
| Shared utility — extract to neutral package           |   3   | Extract with Financial Engine  |
| Defer / unclear until second product                  |   5   | Validate in FIN-002+           |

---

## 3. Component analysis matrix

### 3.1 LAW-015-02 — Ledger Engine

| Component                                     | Classification          | Reusable? |  Move?  | Rationale                                                     |
| --------------------------------------------- | ----------------------- | :-------: | :-----: | ------------------------------------------------------------- |
| Double-entry posting builder                  | Generic Financial       |    ✅     |   ✅    | Universal accounting pattern                                  |
| Balanced debit/credit validation              | Generic Financial       |    ✅     |   ✅    | Universal invariant                                           |
| Append-only journal                           | Generic Financial       |    ✅     |   ✅    | ADR-0037 applies to any regulated ledger                      |
| Journal entry / posting types                 | Generic Financial       |    ✅     |   ✅    | Rename `Trust*` → generic; dimensions abstracted              |
| Transaction types (core)                      | Generic Financial       |    ✅     |   ✅    | deposit, withdrawal, adjustment, reversal, interest, transfer |
| Balance projection from journal               | Generic Financial       |    ✅     |   ✅    | Generic derived read model                                    |
| Reversal-only correction                      | Generic Financial       |    ✅     |   ✅    | Universal control                                             |
| Reference numbering (TRX/JE)                  | Generic Financial       |    ✅     |   ✅    | Move to neutral reference package                             |
| `TrustAccount` entity shape                   | Mixed                   |  Partial  | Adapter | Generic account + Law bank metadata adapter                   |
| Chart codes `TRUST-CASH`, `TRUST-LIABILITY-*` | Law-specific naming     |  Partial  | Adapter | Generic posting rules; Law supplies chart                     |
| `clientId` / `matterId` on postings           | Law-specific dimensions |  Partial  | Adapter | Become product dimensions in generic engine                   |
| Balance scopes `client`, `matter`             | Law-specific            |  Partial  | Adapter | Generic `dimension` scope with Law schema                     |
| Tenant isolation                              | Platform Capability     |    ✅     |   ❌    | Engine enforces field; Platform RLS in persistence            |
| `TrustLedgerService` orchestration            | Generic Financial       |    ✅     |   ✅    | Rename to `LedgerService`                                     |
| In-memory ledger repository                   | Generic Financial       |    ✅     |   ✅    | Interface + in-memory impl move together                      |
| Ledger diagnostics                            | Generic Financial       |    ✅     |   ✅    | Product-agnostic telemetry hooks                              |
| Ledger domain events                          | Mixed                   |  Partial  | Adapter | Generic `financial.*` + Law maps to `legal.trust.*`           |
| Institution / masked account number           | Law-specific            |    ❌     |   ❌    | Trust bank account regulatory metadata                        |
| LPC / compliance profile on account           | Law-specific            |    ❌     |   ❌    | Product policy layer                                          |

### 3.2 LAW-015-03 — Transaction Workflow

| Component                              | Classification    | Reusable? |  Move?  | Rationale                                       |
| -------------------------------------- | ----------------- | :-------: | :-----: | ----------------------------------------------- |
| Draft lifecycle (draft→validate→post)  | Generic Financial |    ✅     |   ✅    | Standard controlled posting workflow            |
| Idempotent post                        | Generic Financial |    ✅     |   ✅    | Universal API safety pattern                    |
| Transaction validator (amounts, dates) | Generic Financial |    ✅     |   ✅    | Core validation                                 |
| Append-only audit trail                | Generic Financial |    ✅     |   ✅    | Universal audit pattern                         |
| Draft / audit repositories             | Generic Financial |    ✅     |   ✅    | Interface pattern proven                        |
| Workflow diagnostics                   | Generic Financial |    ✅     |   ✅    |                                                 |
| `clientId` required on draft           | Law-specific      |  Partial  | Adapter | Law policy: client mandatory on trust movements |
| Matter optional on draft               | Law-specific      |  Partial  | Adapter | Law segregation rule                            |
| Workflow domain events                 | Mixed             |  Partial  | Adapter | Generic + product mapping                       |
| Invoice / payment linkage fields       | Law-specific      |    ❌     |   ❌    | Billing integration — Law Platform only         |

### 3.3 LAW-015-04 — Allocations

| Component                                | Classification    | Reusable? |  Move?  | Rationale                                 |
| ---------------------------------------- | ----------------- | :-------: | :-----: | ----------------------------------------- |
| Append-only allocation records           | Generic Financial |    ✅     |   ✅    | Sub-ledger pattern used in banking/escrow |
| Allocation effects (increase/decrease)   | Generic Financial |    ✅     |   ✅    |                                           |
| Balance projection from allocations      | Generic Financial |    ✅     |   ✅    |                                           |
| Transaction allocation summary           | Generic Financial |    ✅     |   ✅    |                                           |
| Allocation validator                     | Generic Financial |    ✅     | Partial | Core moves; Law rules in adapter          |
| Types: `client`, `matter`, `unallocated` | Law-specific      |  Partial  | Adapter | Generic `allocationType` registry         |
| Matter segregation invariant             | Law-specific      |    ❌     |   ❌    | ADR-0038 — Law compliance policy          |
| Split allocation across matters          | Law-specific      |  Partial  | Adapter | Generic split; Law defines matter rules   |
| Allocation domain events                 | Mixed             |  Partial  | Adapter |                                           |

### 3.4 LAW-015-05 — Reconciliation

| Component                       | Classification    | Reusable? | Move? | ✅                              |
| ------------------------------- | ----------------- | :-------: | :---: | ------------------------------- |
| Ledger vs sub-ledger comparison | Generic Financial |    ✅     |  ✅   | Internal control — universal    |
| Variance detection engine       | Generic Financial |    ✅     |  ✅   | Pure function — highly reusable |
| Immutable reconciliation run    | Generic Financial |    ✅     |  ✅   |                                 |
| Variance type taxonomy          | Generic Financial |    ✅     |  ✅   | Applies beyond law              |
| Read-only service pattern       | Generic Financial |    ✅     |  ✅   |                                 |
| Bank statement reconciliation   | Product-specific  |    ❌     |  ❌   | Not implemented; APZBNK scope   |
| Three-way bank reconciliation   | Product-specific  |    ❌     |  ❌   | Banking / treasury products     |

### 3.5 LAW-015-06 — Interest

| Component                             | Classification    | Reusable? |  Move?  | Rationale                                            |
| ------------------------------------- | ----------------- | :-------: | :-----: | ---------------------------------------------------- |
| Accrual engine (simple daily/monthly) | Generic Financial |    ✅     |   ✅    | Standard interest math                               |
| Interest rule versioning              | Generic Financial |    ✅     |   ✅    |                                                      |
| Draft → approve → post workflow       | Generic Financial |    ✅     |   ✅    |                                                      |
| Interest posting to ledger            | Generic Financial |    ✅     |   ✅    |                                                      |
| Per-line allocation on interest post  | Generic Financial |    ✅     | Partial | Engine posts; Law defines dimension split            |
| `complianceProfileId` on rules        | Law-specific      |    ❌     |   ❌    | Rename to generic `policyProfileId`; Law owns ZA-LPC |
| `strategyRef` external rate hook      | Generic Financial |    ✅     |   ✅    | Product supplies rate source                         |
| Minimum balance threshold             | Generic Financial |    ✅     |   ✅    | Configurable rule                                    |

### 3.6 LAW-015-07 — Transfers

| Component                                    | Classification    | Reusable? |  Move?  | Rationale                              |
| -------------------------------------------- | ----------------- | :-------: | :-----: | -------------------------------------- |
| Paired out/in journal postings               | Generic Financial |    ✅     |   ✅    | Universal clearing account pattern     |
| Transfer draft workflow                      | Generic Financial |    ✅     |   ✅    |                                        |
| Sufficient balance check                     | Generic Financial |    ✅     |   ✅    |                                        |
| Allocation updates on post                   | Generic Financial |    ✅     |   ✅    |                                        |
| Transfer clearing account                    | Generic Financial |    ✅     |   ✅    | Chart code configurable                |
| `matter_to_matter`, `client_to_client` types | Law-specific      |  Partial  | Adapter | Product-defined transfer type registry |
| `account_to_account` cross-account           | Generic Financial |    ✅     |   ✅    | Banking/wallet reuse                   |
| Client-to-client source matter rule          | Law-specific      |    ❌     |   ❌    | TD-T23 — Law segregation policy        |

### 3.7 LAW-015-08 — Reporting

| Component                                  | Classification    | Reusable? |  Move?  | Rationale                                 |
| ------------------------------------------ | ----------------- | :-------: | :-----: | ----------------------------------------- |
| Read-only report orchestration             | Generic Financial |    ✅     |   ✅    | Proven pattern                            |
| Pure report payload builders               | Generic Financial |    ✅     |   ✅    | Deterministic projections                 |
| Immutable report store                     | Generic Financial |    ✅     |   ✅    |                                           |
| Trial balance report                       | Generic Financial |    ✅     |   ✅    |                                           |
| Journal / transaction reports              | Generic Financial |    ✅     |   ✅    |                                           |
| Allocation / interest / transfer summaries | Generic Financial |    ✅     |   ✅    |                                           |
| Reconciliation summary                     | Generic Financial |    ✅     |   ✅    |                                           |
| Client trust statement                     | Law-specific      |    ❌     |   ❌    | Law regulatory artefact                   |
| Matter trust statement                     | Law-specific      |    ❌     |   ❌    | Matter segregation — Law only             |
| LPC / examiner export profile              | Law-specific      |    ❌     |   ❌    | ZA regulatory export                      |
| PDF / Excel / CSV export                   | Platform/Product  |    ❌     |   ❌    | Deferred — not in LAW-015-08              |
| Reporting period close gate                | Mixed             |  Partial  | Adapter | Generic period; Law close rules in policy |

### 3.8 Cross-cutting

| Component                                              | Classification        | Reusable? | Move? | Rationale                                 |
| ------------------------------------------------------ | --------------------- | :-------: | :---: | ----------------------------------------- |
| `createTrustId` / ID generation                        | Generic Financial     |    ✅     |  ✅   | Rename to financial ID prefix             |
| In-memory event buses                                  | Generic Financial     |    ✅     |  ✅   | Dev/test; production uses Platform outbox |
| Session diagnostics                                    | Generic Financial     |    ✅     |  ✅   |                                           |
| Repository interface pattern                           | Generic Financial     |    ✅     |  ✅   | Already persistence-ready                 |
| `@apzhub/legal-business-core` ReferenceNumberGenerator | Shared utility        |    ✅     |  ✅   | Move to neutral package                   |
| `legal-business-core` simplified TrustAccount type     | Law-specific / legacy |    ❌     |  ❌   | Deprecate in favour of engine model       |
| PostgreSQL trust tables (planned)                      | Law-specific          |    ❌     |  ❌   | Law persistence adapter                   |
| Workbench / API routes                                 | Platform/Product      |    ❌     |  ❌   | LAW-015-09 / LAW-015-10                   |
| Permissions `legal.trust.*`                            | Law-specific          |    ❌     |  ❌   | Law permission catalogue                  |
| Event catalogue `legal.trust.*`                        | Law-specific          |    ❌     |  ❌   | Product mapping from `financial.*`        |

---

## 4. Remain in Financial Engine

| Capability                           | Notes                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| Double-entry ledger                  | Authority for all products                                                         |
| Journal / posting / transaction core | With dimension abstraction                                                         |
| Transaction workflow                 | Draft, validate, post, reverse, idempotency                                        |
| Append-only audit                    | Workflow audit records                                                             |
| Sub-ledger allocation engine         | Generic dimensional allocations                                                    |
| Balance projection                   | Account + dimension scopes                                                         |
| Internal reconciliation              | Ledger vs sub-ledger                                                               |
| Interest accrual and posting         | Configurable rules                                                                 |
| Transfer engine                      | Paired postings + clearing                                                         |
| Reporting engine (generic reports)   | Trial balance, journal, summaries                                                  |
| Reference numbering                  | Neutral package                                                                    |
| Repository interfaces                | Persistence-ready contracts                                                        |
| Pure calculation engines             | posting-builder, balance, reconciliation-engine, interest-engine, reporting-engine |
| In-memory implementations            | Test fixtures and dev mode                                                         |

---

## 5. Remain in Law Platform

| Capability                                    | Notes                                                   |
| --------------------------------------------- | ------------------------------------------------------- |
| Trust regulations and LPC compliance          | ZA Legal Practice Council rules via compliance profiles |
| Matter allocations and segregation            | ADR-0038 — client/matter dimensional policy             |
| Trust statements (client / matter)            | Regulatory client-facing artefacts                      |
| Legal reporting and examiner exports          | ZA-LPC export profile                                   |
| Client money regulations                      | Jurisdiction-specific policy adapter                    |
| Trust account bank metadata                   | Institution, branch, LPC registration                   |
| Chart of accounts naming (`TRUST-*`)          | Law chart configuration                                 |
| Transfer types (matter↔matter, client↔client) | Law transfer policy registry                            |
| `legal.trust.*` events and permissions        | Law product catalogue                                   |
| Trust workbench and actions                   | LAW-015-09                                              |
| Trust REST APIs                               | LAW-015-10                                              |
| Trust PostgreSQL schema                       | Law persistence                                         |
| Billing integration (`trustAppliedAmount`)    | Law billing module                                      |
| Invoice / payment linkage on transactions     | Law workflow extension                                  |

---

## 6. Complete separation matrix (by file)

| File                                    | Engine |   Law   | Platform |
| --------------------------------------- | :----: | :-----: | :------: |
| `trust-ledger-posting-builder.ts`       |   ✅   |         |          |
| `trust-ledger-balance.ts`               |   ✅   |         |          |
| `trust-ledger-validation.ts`            |   ✅   | adapter |          |
| `trust-ledger-types.ts`                 |   ✅   | adapter |          |
| `trust-ledger-service.ts`               |   ✅   | adapter |          |
| `trust-ledger-errors.ts`                |   ✅   |         |          |
| `trust-ledger-events.ts`                |   ✅   |   map   |          |
| `trust-ledger-diagnostics.ts`           |   ✅   |         |          |
| `in-memory-trust-ledger-repository.ts`  |   ✅   |         |          |
| `trust-transaction-workflow-service.ts` |   ✅   | adapter |          |
| `trust-transaction-validator.ts`        |   ✅   | adapter |          |
| `trust-transaction-workflow-types.ts`   |   ✅   | adapter |          |
| `trust-transaction-*-repository.ts`     |   ✅   |         |          |
| `trust-allocation-service.ts`           |   ✅   | adapter |          |
| `trust-allocation-balance.ts`           |   ✅   |         |          |
| `trust-allocation-validator.ts`         |   ✅   | adapter |          |
| `trust-allocation-types.ts`             |   ✅   | adapter |          |
| `trust-reconciliation-engine.ts`        |   ✅   |         |          |
| `trust-reconciliation-service.ts`       |   ✅   |         |          |
| `trust-interest-engine.ts`              |   ✅   |         |          |
| `trust-interest-service.ts`             |   ✅   | adapter |          |
| `trust-transfer-service.ts`             |   ✅   | adapter |          |
| `trust-transfer-validator.ts`           |   ✅   | adapter |          |
| `trust-reporting-engine.ts`             |   ✅   | adapter |          |
| `trust-reporting-service.ts`            |   ✅   | adapter |          |
| Law compliance profiles (ADR-0039)      |        |   ✅    |          |
| Trust workbench manifests               |        |   ✅    |          |
| Trust API routes                        |        |   ✅    |          |
| Platform event outbox wiring            |        |         |    ✅    |
| IAM permissions                         |        |         |    ✅    |

**adapter** = file moves to engine with Law-specific rules extracted to `law-platform/lib/trust/policy/` or equivalent.

---

## 7. Product reuse assessment (planning only)

| Product               | Reuse potential | Primary engine modules                      | Law-specific parts                                  |
| --------------------- | :-------------: | ------------------------------------------- | --------------------------------------------------- |
| APZHUB Platform       |       N/A       | —                                           | Hosts products; no direct engine use                |
| Law Platform          |     ✅ High     | All modules via adapter                     | Full trust policy layer                             |
| APZBNK                |     ✅ High     | Ledger, workflow, reconciliation, reporting | Banking chart, customer dimensions, bank feed recon |
| APZEX                 |    ✅ Medium    | Ledger, transfers, balance                  | Trading pair settlement, exchange-specific types    |
| Escrow Platform       |     ✅ High     | Ledger, allocation, transfer, reporting     | Escrow contract dimensions, release conditions      |
| Wallet Platform       |     ✅ High     | Ledger, transfers, balance                  | Wallet/user dimensions, payment rail hooks          |
| Stablecoin Platform   |    ✅ Medium    | Ledger, transfers                           | Token mint/burn as product types                    |
| Payment Platform      |    ✅ Medium    | Ledger, workflow                            | Payment intent linkage (product)                    |
| Treasury Platform     |     ✅ High     | Ledger, interest, reconciliation, reporting | Portfolio dimensions                                |
| Merchant Platform     |    ✅ Medium    | Ledger, allocation                          | Merchant/settlement dimensions                      |
| Lending Platform      |    ✅ Medium    | Ledger, interest                            | Loan account dimensions                             |
| Digital Asset Custody |    ✅ Medium    | Ledger, allocation, transfer                | Asset/custody dimensions                            |
| Client Money Platform |     ✅ High     | Full stack (closest to Law)                 | Jurisdiction profiles vary                          |

**Conclusion:** ~70% of the LAW-015 implementation is generic financial capability. ~30% is Law-specific policy, naming, or integration. No product design performed in FIN-001 — reuse assessed at capability level only.

---

## 8. Decision implications

| If Financial Engine created | Law Platform becomes                          |
| --------------------------- | --------------------------------------------- |
| Generic ledger + workflows  | `LawTrustPolicyAdapter` + trust metadata      |
| Generic reporting           | Law statement templates + LPC export profiles |
| Generic events              | Maps `financial.*` → `legal.trust.*`          |
| Generic dimensions          | `{ clientId, matterId }` schema registration  |

Law Platform **continues to own** trust as a legal capability — it does not become a thin wrapper. The engine provides accounting mechanics; Law provides regulatory semantics.
