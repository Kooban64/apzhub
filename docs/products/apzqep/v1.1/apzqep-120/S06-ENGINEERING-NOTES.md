# APZQEP-120-S06 — Engineering Notes

| Field      | Value                                           |
| ---------- | ----------------------------------------------- |
| Slice      | APZQEP-120-S06 Evidence Lifecycle & Governance  |
| Process    | APZHUB-ENG-001 · ADR-0092 · ADR-0093 · ADR-0094 |
| Date       | 2026-08-02                                      |
| Depends on | S01–S05 (certified)                             |

---

## Capability statement

S06 delivers a **lifecycle governance framework** with controlled transitions and durable audit history.

It does **not** deliver purge, physical archival, retention schedules, legal-hold workflows, or event-bus publication.

## Architecture

```text
Handler / Application Service
  → EvidenceLifecyclePlatformService   (transition policy)
      → Permission Engine (S01/S02)
      → applyLifecycleGovernanceTransition (domain)
      → EvidenceRepository / Catalogue (S05)
      → EvidenceLifecycleHistoryRepository (append-only)
      → StoragePort.archive (optional, logical archive marker only)
```

Dispose / logical delete **no longer deletes evidence bytes**.

## Modules

| Component          | Path                                                           |
| ------------------ | -------------------------------------------------------------- |
| Lifecycle service  | `application/lifecycle/evidence-lifecycle-platform-service.ts` |
| Transition matrix  | `application/lifecycle/transition-matrix.ts`                   |
| Policy evaluator   | `application/lifecycle/transition-policy.ts`                   |
| Governance model   | `domain/evidence/lifecycle-governance.ts`                      |
| Domain transition  | `applyLifecycleGovernanceTransition` in `evidence.ts`          |
| History PG adapter | `infrastructure/postgres/lifecycle-history-repository.ts`      |
| Migrations         | `0091_apz_qep_evidence_lifecycle.sql`, `0092_*_rls.sql`        |

## Permissions (reuse)

Mapped to existing `qep.evidence.*` families (review, archive, dispose, associate, audit, admin). Default deny.

## Migration

Additive: `lifecycle_governance_json` on `qep_evidence`; new `qep_evidence_lifecycle_history` + FORCE RLS.

Existing records default via derivation / empty JSON → ACTIVE + NOT_CONFIGURED / NOT_HELD.

## Behaviour changes (intentional)

| Before S06                                             | After S06                                          |
| ------------------------------------------------------ | -------------------------------------------------- |
| `disposeEvidence` called storage.dispose (hard delete) | Logical deletion only; bytes preserved             |
| Catalogue state derived only                           | Authoritative `lifecycleGovernance.state` when set |

## Deferred

- S07 event-bus publication
- Retention period defaults (D-002)
- Legal-hold productisation
- Physical archive providers
- Purge / hard deletion
- TE EvidenceAccessPort

## Status markers

- `QEP_EVIDENCE_APPLICATION_STATUS = lifecycle-platform-s06`
- `QEP_EVIDENCE_INFRASTRUCTURE_STATUS = lifecycle-platform-s06`
