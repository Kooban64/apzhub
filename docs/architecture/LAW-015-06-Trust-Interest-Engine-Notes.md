# LAW-015-06 — Trust Interest Engine Notes

> **Story:** LAW-015-06  
> **Status:** Implemented — in-memory only  
> **Authority:** [LAW-015-05 Reconciliation Engine Notes](./LAW-015-05-Trust-Reconciliation-Engine-Notes.md)  
> **Last updated:** 2026-07-07

---

## 1. Purpose

In-memory Trust Interest accrual and posting workflow on allocated client/matter balances. Computes draft interest batches, supports approval, posts ledger `interest` transactions, and allocates credits per line.

**TrustLedgerService remains the accounting authority.** No UI, APIs, persistence, bank integration, reporting, or external rate sources.

---

## 2. Package location

```text
apps/law-platform/lib/trust/
  trust-interest-types.ts
  trust-interest-errors.ts
  trust-interest-engine.ts           # pure accrual policies + calculation
  trust-interest-rule-repository.ts
  in-memory-trust-interest-rule-repository.ts
  trust-interest-posting-repository.ts
  in-memory-trust-interest-posting-repository.ts
  trust-interest-events.ts
  trust-interest-diagnostics.ts
  trust-interest-service.ts
  trust-interest.test.ts
```

---

## 3. Layering

```text
TrustInterestService              ← LAW-015-06
  ↓ reads balances / writes postings
TrustAllocationService            ← LAW-015-04
TrustLedgerService                ← LAW-015-02 (authority)
TrustReconciliationService        ← LAW-015-05 (read-only cross-check only)
```

---

## 4. Interest calculation policies

| Policy field          | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `accrualMethod`       | `simple_daily` or `simple_monthly` (stub strategies) |
| `annualRatePercent`   | Inline rate — no external source                     |
| `minimumBalance`      | Skip accrual below threshold                         |
| `postingFrequency`    | `monthly` / `quarterly` / `annual` (metadata)        |
| `complianceProfileId` | Profile reference (ADR-0039 hook)                    |
| `strategyRef`         | Future plugin hook — not implemented                 |

---

## 5. Workflow

```text
Create Rule → Run Accrual (draft) → Approve → Post (ledger + allocation)
```

| Step             | Status transition     | Side effects                                    |
| ---------------- | --------------------- | ----------------------------------------------- |
| `runAccrual`     | → `draft`             | Accrual lines computed from allocation balances |
| `approvePosting` | `draft` → `approved`  | No ledger mutation                              |
| `postInterest`   | `approved` → `posted` | One `interest` ledger tx + allocation per line  |

---

## 6. In-memory events

| Event                           | When                                 |
| ------------------------------- | ------------------------------------ |
| `legal.trust.interest.accrued`  | Draft accrual batch created          |
| `legal.trust.interest.approved` | Draft approved for posting           |
| `legal.trust.interest.posted`   | Interest credited to clients/matters |

No outbox.

---

## 7. Out of scope (LAW-015-06)

Bank integration, reporting, APIs, UI, persistence, external interest rate sources.

---

## 8. Next story

See [LAW-015-06 completion report](../sprint/LAW-015-06-completion-report.md) for LAW-015-07 recommendation (Trust Transfers).
