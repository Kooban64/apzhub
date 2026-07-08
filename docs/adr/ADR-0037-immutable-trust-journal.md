# ADR-0037 — Immutable Trust Journal and Append-Only Ledger

> **Status:** Accepted (planning)  
> **Date:** 2026-07-06  
> **Story:** LAW-015-01  
> **Authority:** [LAW-Trust-Accounting-Specification](../specs/LAW-Trust-Accounting-Specification.md)

---

## Context

Trust accounting requires audit-grade financial records. Mutable ledger rows, in-place balance updates, and delete operations are incompatible with regulatory examination and forensic reconstruction.

The persistence foundation (LAW-012) established outbox and tenant isolation patterns but deferred trust tables.

---

## Decision

Trust financial state follows **double-entry bookkeeping** with these non-negotiable rules:

1. **Trust Journal Entries** are immutable once posted. Corrections use **reversal entries** referencing the original entry — never UPDATE or DELETE on posted journal lines.
2. **Trust Transactions** are append-only business events that produce journal entries. Transaction records may carry a `status` lifecycle (draft → posted → reversed) but posted amounts are never mutated.
3. **Trust Balances** are **derived projections** (materialised for query performance) recomputed from journal entries. Balances are not authoritative — the journal is the source of truth.
4. **No ledger mutation** — no operation may change historical debit/credit amounts, accounts, or posting dates after post.

Draft transactions may be discarded before posting. After posting, only reversal + replacement (new transaction) is permitted.

---

## Alternatives considered

| Alternative                   | Rejected because                               |
| ----------------------------- | ---------------------------------------------- |
| Single-entry trust log        | Insufficient for bank reconciliation and audit |
| Mutable balance column as SoR | Cannot reconstruct history; fails audit        |
| Soft-delete posted entries    | Appears as deletion in audit trail             |

---

## Consequences

- Repository adapters must enforce append-only writes at application layer; database triggers may add defence in depth (LAW-015-02+).
- API DELETE on posted trust resources returns `409 CONFLICT` or equivalent — never silent removal.
- Balance cache invalidation follows journal append events.

---

## Related

- [LAW-Trust-Domain-Model](../architecture/LAW-Trust-Domain-Model.md) — aggregate roots and lifecycle
- ADR-0038 — Matter Trust Balance Segregation
