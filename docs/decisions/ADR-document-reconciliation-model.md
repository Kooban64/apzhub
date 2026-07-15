# ADR — Document Reconciliation Model

> **Status:** Accepted  
> **Date:** 2026-07-13  
> **Milestone:** APZDOCS-002

## Context

Without distributed transactions, partial failures leave metadata and binaries inconsistent. Full worker infrastructure (queues, Event Bus) is out of APZDOCS-002 scope.

## Decision

Ship **status-driven reconciliation contracts** only:

- Domain marks `reconciliation_required` / `failed` on partial failure
- `inspectReconciliation` surfaces candidates
- `repairReconciliationIssue` is a **non-operational stub** documenting that workers are deferred

No schedulers, no automatic repair, no Event Bus.

## Consequences

- Operators can detect debt; repair is manual until a later milestone
- Clear boundary for APZDOCS-003+ / async processing programmes

## Alternatives considered

- Inline best-effort delete/compensate on every failure — rejected (unsafe, incomplete)
- Full job framework now — rejected (scope / Event Bus dependency)
