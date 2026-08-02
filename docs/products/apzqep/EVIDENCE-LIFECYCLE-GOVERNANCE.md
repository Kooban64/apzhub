# Evidence Lifecycle & Governance Platform

| Field      | Value                                  |
| ---------- | -------------------------------------- |
| Product    | APZ QEP                                |
| Slice      | APZQEP-120-S06                         |
| Status     | **IMPLEMENTED** (LIMITED_AVAILABILITY) |
| Capability | Lifecycle governance framework         |

---

## Purpose

Lifecycle governance framework with controlled state transitions and durable audit history.

APZQEP controls how evidence moves between authorised lifecycle states, who may perform each transition, what conditions must be satisfied, and what durable audit record proves the transition.

## Authority boundaries

| Concern                  | Authority                                       |
| ------------------------ | ----------------------------------------------- |
| Transition policy        | Evidence Lifecycle Platform Service             |
| Authoritative lifecycle  | Evidence Catalogue (`lifecycleGovernance`)      |
| Visibility               | Permission Engine (S01/S02)                     |
| Content integrity        | Integrity Platform (S04)                        |
| Content bytes            | Storage Platform (S03)                          |
| Durable transition proof | Lifecycle history + Evidence audit repositories |

## State model

```text
ACTIVE
RESTRICTED
ARCHIVE_ELIGIBLE
ARCHIVED          ← logical only (not cold/WORM storage)
SUPERSEDED
DISPOSAL_ELIGIBLE
LOGICALLY_DELETED ← catalogue retained; bytes not purged
UNAVAILABLE       ← content missing/unavailable ≠ deleted
```

`ARCHIVED` means logical archival governance state. It does **not** mean bytes were moved to archive storage.

`LOGICALLY_DELETED` preserves catalogue record, integrity linkage, storage reference, relationships, and audit history. Physical purge is out of scope.

## Transition matrix (controlled)

| Action               | From (examples)              | To                | Permission family |
| -------------------- | ---------------------------- | ----------------- | ----------------- |
| restrict             | ACTIVE, ARCHIVE_*, ARCHIVED  | RESTRICTED        | review / admin    |
| restore              | RESTRICTED                   | ACTIVE            | review / admin    |
| markArchiveEligible  | ACTIVE                       | ARCHIVE_ELIGIBLE  | archive / admin   |
| markArchived         | ARCHIVE_ELIGIBLE, ACTIVE     | ARCHIVED          | archive / admin   |
| markSuperseded       | ACTIVE, RESTRICTED, ARCHIVED | SUPERSEDED        | associate / admin |
| markDisposalEligible | ACTIVE, ARCHIVED, SUPERSEDED | DISPOSAL_ELIGIBLE | dispose / admin   |
| logicallyDelete      | DISPOSAL_ELIGIBLE, …         | LOGICALLY_DELETED | dispose / admin   |

Arbitrary `PATCH lifecycleState` is prohibited. All changes go through governed commands.

## Retention hooks

Fields: `retentionStatus` (`NOT_CONFIGURED` | `CONFIGURED`), `retentionClass`, `retentionUntil`, `retentionPolicyReference`, `disposalEligibleAt`.

No jurisdictional periods are invented. Untrusted callers cannot shorten retention through lifecycle APIs.

## Legal-hold extension hooks

`holdStatus`: `NOT_HELD` | `HELD` (synced with existing legal-hold commands).

Held evidence cannot become disposal-eligible or logically deleted.

Full legal-hold / matter workflows remain deferred.

## Supersession

Typed relationship `superseded_by` + `supersededByEvidenceId` / `supersedesEvidenceId`.

Prevents self-links, cross-tenant/cross-project successors, and simple supersession loops. History is preserved.

## Durable audit history

Table `qep_evidence_lifecycle_history` (append-only) plus existing `qep_evidence_audit`.

History retrieval requires `qep.evidence.audit` (or admin).

## Event readiness (S07)

Internal audit hooks exist. Future bus contracts (not published in S06):

```text
qep.evidence.lifecycle.transitioned
qep.evidence.lifecycle.restricted
qep.evidence.lifecycle.archived
qep.evidence.lifecycle.superseded
qep.evidence.lifecycle.disposal-eligible
qep.evidence.lifecycle.logically-deleted
```

## Limitations (explicit)

- Not physical archival / cold storage / WORM
- Not hard deletion or purge
- Not full retention policy engine or regulatory schedules
- Not legal-hold case management
- Not platform event-bus publication
- Not package promotion or deployment

## Related

- [EVIDENCE-CATALOGUE-PLATFORM.md](./EVIDENCE-CATALOGUE-PLATFORM.md)
- [EVIDENCE-INTEGRITY-PLATFORM.md](./EVIDENCE-INTEGRITY-PLATFORM.md)
- [v1.1/apzqep-120/S06-ENGINEERING-NOTES.md](./v1.1/apzqep-120/S06-ENGINEERING-NOTES.md)
