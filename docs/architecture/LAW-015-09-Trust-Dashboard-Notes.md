# LAW-015-09 — Trust Dashboard Notes

> **Story:** LAW-015-09  
> **Status:** Implemented — in-memory only  
> **Last updated:** 2026-07-07

---

## 1. Purpose

Executive-style trust overview at `/workspace/law/trust`. Composes metrics from in-memory trust services via `composeTrustDashboardSnapshot()`.

---

## 2. Widgets

| Widget                    | Source                                                                      |
| ------------------------- | --------------------------------------------------------------------------- |
| Total trust balance       | `TrustLedgerService.getBalances()` — account scope                          |
| Matter trust balances     | Balance projections — matter scope                                          |
| Client trust balances     | Balance projections — client scope                                          |
| Recent trust transactions | `TrustLedgerService.listTransactions()` — top 5 by posting date             |
| Pending drafts            | `InMemoryTrustTransactionDraftRepository.listByAccount()` — draft/validated |
| Reconciliation status     | Latest `TrustReconciliationRun`                                             |
| Interest pending          | Interest postings with status draft/approved                                |
| Transfer summary          | Posted transfers count and total                                            |
| Report shortcuts          | Links to reports view (trial balance, transactions, reconciliation summary) |
| Compliance alerts         | Placeholder — ZA-LPC profile message                                        |
| Diagnostics panel         | Session diagnostics across all trust engine layers                          |

---

## 3. Composition function

`composeTrustDashboardSnapshot(bundle: TrustWorkbenchBundle)` in `trust-dashboard-composition.ts`:

- Pure read-only — no mutations
- Deterministic for a given workbench bundle state
- Used by `TrustDashboardPage` via `useTrustWorkflow().getDashboardSnapshot()`

---

## 4. Quick actions

Dashboard quick actions navigate to:

- Trust accounts, allocations, reconciliation, interest, transfers (sub-routes)
- Report shortcuts navigate to reports view

---

## 5. Future (LAW-015-10+)

- Wire dashboard to persisted trust data via Platform Service
- Real compliance alerts from `ComplianceProfile` adapter
- Matter/client name resolution from Client/Matter modules
- Dashboard refresh on trust domain events
