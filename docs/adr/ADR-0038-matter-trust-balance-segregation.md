# ADR-0038 — Matter Trust Balance Segregation Model

> **Status:** Accepted (planning)  
> **Date:** 2026-07-06  
> **Story:** LAW-015-01  
> **Authority:** [LAW-Trust-Accounting-Reference-Architecture](../architecture/LAW-Trust-Accounting-Reference-Architecture.md)

---

## Context

South African trust accounting requires that client funds be identifiable per client and, where applicable, per matter. A firm may operate one or more trust bank accounts, but internal records must support matter-level allocation and client fund segregation for examination.

The existing domain model (APZHUB-Law-Domain-Model) defines Trust Account and Trust Transaction at a high level but lacks the segregation hierarchy required for three-way reconciliation.

---

## Decision

Trust balances are tracked at **three hierarchical levels**:

1. **Firm Trust Ledger** — aggregate of all trust bank accounts for the tenant (firm).
2. **Trust Account (Bank Account) Ledger** — per regulated trust bank account linked to institution details.
3. **Matter Trust Ledger** — sub-ledger allocations within a trust account, keyed by `clientId` + optional `matterId`.

Every posted trust transaction must:

- Debit and credit trust journal accounts (double-entry).
- Carry `clientId` (required for client fund segregation).
- Carry `matterId` when funds are matter-specific (required for matter billing integration).
- Reference `trustAccountId` for bank account mapping.

**Unallocated client funds** (client-level pool without matter) are permitted as a distinct allocation bucket within a trust account — not commingled with firm operating funds.

---

## Alternatives considered

| Alternative                      | Rejected because                                                |
| -------------------------------- | --------------------------------------------------------------- |
| Client-only balances (no matter) | Insufficient for conveyancing and litigation matter segregation |
| Matter-only without client       | Breaks client fund identity for LPC examination                 |
| Single firm-wide trust pool      | Fails matter segregation requirement                            |

---

## Consequences

- `TrustAllocation` entity links transactions to matter/client buckets (LAW-015-04).
- Reconciliation compares bank statement ↔ trust account ledger ↔ matter allocation sum (LAW-015-05).
- Billing trust application (`trustAppliedAmount` on Invoice) draws from matter trust balance via allocation rules.

---

## Related

- ADR-0039 — Jurisdiction-Adaptive Compliance Profile
- [LAW-Trust-Domain-Model](../architecture/LAW-Trust-Domain-Model.md)
