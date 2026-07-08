# APZOR Financial Engine — Integration Model

> **Story:** FIN-001 — Architecture extraction (planning only)  
> **Status:** **Planning** — no implementation  
> **Last updated:** 2026-07-07

---

## 1. Purpose

Describe how products connect to the proposed APZOR Financial Engine. This document defines integration patterns only — no APIs, packages, or runtime changes in FIN-001.

---

## 2. Integration principles

| Principle                      | Rule                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| Engine is library, not service | Products embed via Platform Services — no standalone Financial Engine microservice in v1 |
| Product owns persistence       | Engine defines repository interfaces; products implement PostgreSQL adapters             |
| Product owns permissions       | Engine has no auth; Platform Service enforces before engine calls                        |
| Product owns events            | Engine emits domain events; product maps to Platform Event Bus + outbox                  |
| Policy over fork               | Products extend via adapters and configuration — never fork engine code                  |
| One ledger authority           | Each product instance has one engine ledger per financial account                        |

---

## 3. Standard integration stack

```text
┌─────────────────────────────────────────────────────────┐
│  Product UI (Workbench / Dashboard / Mobile)             │
└───────────────────────────┬─────────────────────────────┘
                            │ actions / API
┌───────────────────────────▼─────────────────────────────┐
│  Product Platform Service                                │
│  TrustService · BankLedgerService · WalletService        │
│  Auth · Authz · Validation · Audit envelope · Rate limit │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Product Financial Policy Adapter                        │
│  Chart · Dimensions · Posting rules · Compliance gates   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  APZOR Financial Engine                                  │
│  LedgerService · WorkflowService · AllocationService …   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Product Repository Adapters (PostgreSQL + RLS)          │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  APZHUB Platform 5.0                                     │
│  Event Bus · Outbox · Notifications · Observability      │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Law Platform integration

### 4.1 Current state (LAW-015-02–08)

```text
apps/law-platform/lib/trust/   ← monolithic in-memory implementation
  (not yet wired to APIs, workbench, or persistence)
```

### 4.2 Target state (post-extraction)

```text
apps/law-platform/
  lib/trust/
    policy/                    ← Law-specific: chart, dimensions, transfer types, LPC
    adapter/                   ← Maps Trust* API → Financial Engine
    service/                   ← LawTrustPlatformService (orchestration)
  lib/persistence/trust/       ← PostgreSQL repository adapters (LAW-015-10+)

packages/
  @apzor/financial-engine/     ← generic engine (proposed)
  @apzor/financial-core/       ← types, reference numbering (proposed)
```

### 4.3 Law adapter responsibilities

| Responsibility                                           | Law adapter |
| -------------------------------------------------------- | ----------- |
| Register chart `TRUST-CASH`, `TRUST-LIABILITY-CLIENT`, … | ✅          |
| Require `clientId` on posted movements                   | ✅          |
| Enforce matter segregation (ADR-0038)                    | ✅          |
| Map transfer types (matter↔matter, etc.)                 | ✅          |
| Map `financial.*` events → `legal.trust.*`               | ✅          |
| Client / matter trust statements                         | ✅          |
| LPC compliance profile gates                             | ✅          |
| Billing invoice / payment linkage                        | ✅          |

### 4.4 Law integration touchpoints

| Law module | Integration                                  |
| ---------- | -------------------------------------------- |
| Clients    | `clientId` dimension validation              |
| Matters    | `matterId` dimension + segregation           |
| Billing    | `trustAppliedAmount`, invoice apply workflow |
| Workbench  | Trust workspace views (LAW-015-09)           |
| APIs       | `/api/law/v1/trust/*` (LAW-015-10)           |
| Events     | Platform outbox from `legal.trust.*`         |
| Knowledge  | Trust search provider (LAW-015-11)           |

---

## 5. Banking (APZBNK) integration

### 5.1 Reuse assessment

| Engine module  | APZBNK use                                                                     |
| -------------- | ------------------------------------------------------------------------------ |
| Ledger         | Customer account ledger, nostro/vostro                                         |
| Workflow       | Controlled payment posting                                                     |
| Allocation     | Sub-account / product allocation                                               |
| Reconciliation | Ledger vs core banking sub-ledger; **plus** bank statement feed (APZBNK-owned) |
| Interest       | Savings / deposit interest                                                     |
| Transfer       | Internal account transfers                                                     |
| Reporting      | Regulatory returns, account statements                                         |

### 5.2 APZBNK adapter (conceptual)

| APZBNK owns               | Engine provides                               |
| ------------------------- | --------------------------------------------- |
| Customer entity, KYC      | Generic dimensions `{ customerId }`           |
| Bank chart of accounts    | Posting rule registration                     |
| Payment rails, SWIFT, ACH | External settlement refs on transactions      |
| Three-way reconciliation  | Extends reconciliation with bank feed adapter |
| Banking regulations       | Policy profile                                |

**Integration pattern:** `BankLedgerPlatformService` → `BankFinancialPolicyAdapter` → Financial Engine.

---

## 6. Exchange (APZEX) integration

### 6.1 Reuse assessment

| Engine module  | APZEX use                                    |
| -------------- | -------------------------------------------- |
| Ledger         | User balance ledger, exchange house accounts |
| Transfer       | Internal transfers, settlement movements     |
| Workflow       | Controlled trade settlement posts            |
| Allocation     | Asset / pair allocation                      |
| Reconciliation | Ledger vs order book settlement              |
| Interest       | Margin interest (if applicable)              |

### 6.2 APZEX adapter (conceptual)

| APZEX owns                | Engine provides                   |
| ------------------------- | --------------------------------- |
| Trading pairs, orders     | External refs on transactions     |
| Asset types (crypto/fiat) | Multi-account per asset via chart |
| Settlement workflow       | Transfer + ledger post            |
| Exchange compliance       | Policy profile                    |

**Lower reuse than banking/law** for interest and trust-specific statements — core ledger and transfer patterns still apply.

---

## 7. Wallets integration

| Engine module | Wallet use                             |
| ------------- | -------------------------------------- |
| Ledger        | Wallet balance authority               |
| Transfer      | P2P, wallet-to-wallet                  |
| Workflow      | Top-up / withdrawal approval           |
| Balance       | Real-time available balance projection |

**Adapter dimensions:** `{ walletId, userId }`. Payment rail integration stays outside engine.

---

## 8. Escrow integration

| Engine module  | Escrow use                       |
| -------------- | -------------------------------- |
| Ledger         | Escrow pool account              |
| Allocation     | Beneficiary / milestone slices   |
| Transfer       | Release, partial release, refund |
| Reconciliation | Escrow balance vs contract terms |
| Reporting      | Escrow statements                |

**Adapter dimensions:** `{ escrowContractId, beneficiaryId, milestoneId }`. Release conditions are product workflow — not engine logic.

**High reuse** — structurally similar to Law trust (held funds + segregation).

---

## 9. Treasury integration

| Engine module  | Treasury use                      |
| -------------- | --------------------------------- |
| Ledger         | Treasury accounts, cash positions |
| Interest       | Instrument accrual                |
| Reconciliation | Position vs ledger                |
| Reporting      | Cash flow, trial balance          |
| Transfer       | Inter-account treasury movements  |

**Adapter dimensions:** `{ portfolioId, instrumentId, counterpartyId }`.

---

## 10. Future products (high-level)

| Product               | Primary engine modules       | Key adapter concern                    |
| --------------------- | ---------------------------- | -------------------------------------- |
| Stablecoin            | Ledger, Transfer             | Mint/burn transaction types            |
| Payment               | Ledger, Workflow             | Payment intent lifecycle               |
| Merchant              | Ledger, Allocation           | Settlement batches                     |
| Lending               | Ledger, Interest             | Loan principal/interest split          |
| Digital Asset Custody | Ledger, Allocation, Transfer | Asset-level segregation                |
| Client Money          | Full stack                   | Jurisdiction profiles (similar to Law) |

No product design in FIN-001 — patterns only.

---

## 11. Platform integration (APZHUB)

The Financial Engine integrates with Platform 5.0 **through products**, not by modifying platform frameworks.

| Platform capability | Integration path                                     |
| ------------------- | ---------------------------------------------------- |
| Event Bus           | Product maps `financial.*` → product events → outbox |
| Notifications       | Product subscribes to mapped events                  |
| Activity Timeline   | Product publishes activity from workflow audit       |
| Permissions         | Product Platform Service checks before engine call   |
| Observability       | Engine diagnostics → product telemetry adapter       |
| Persistence         | Product implements engine repository interfaces      |
| API Gateway         | Product REST layer — engine never exposed directly   |

---

## 12. Anti-patterns (prohibited)

| Anti-pattern                         | Why                                             |
| ------------------------------------ | ----------------------------------------------- |
| Module calls engine directly from UI | Bypasses auth, audit, Platform Service boundary |
| Engine imports product domain        | Circular coupling                               |
| Engine owns PostgreSQL schema        | Product tenancy and RLS differ                  |
| Duplicate ledger in product          | Two sources of truth                            |
| Fork engine for one product rule     | Policy adapter required                         |
| Modify Platform 5.0 for engine       | Platform frozen                                 |

---

## 13. Migration integration order (Law Platform first)

1. Law completes LAW-015-09 (dashboard) and LAW-015-10 (APIs + persistence) on current monolith
2. Extract engine packages (FIN-003+)
3. Introduce Law adapter layer — behaviour parity via regression suite
4. Wire persistence adapters to engine repositories
5. Second product (APZBNK or APZEX) implements own adapter — validates reuse

See [APZOR-Financial-Extraction-Plan.md](./APZOR-Financial-Extraction-Plan.md) for phased detail.
