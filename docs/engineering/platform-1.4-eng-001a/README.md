# Platform-1.4-ENG-001A — Durable Notification Runtime Technical Design

> **Programme:** Platform-1.4-ENG-001A  
> **Classification:** ENGINEERING DESIGN  
> **Baseline:** Platform 1.4  
> **Parent ADR:** ADR-0073 **ACCEPTED** (Option A — PostgreSQL-Owned Durable Runtime)  
> **Status:** **ACCEPTED** (Owner Decision — Platform-1.4-ENG-001B-P0 bootstrap)  
> **Date:** 2026-07-23  
> **Rule:** Design only — **no implementation**

## Purpose

Complete implementation blueprint so **Platform-1.4-ENG-001B** can execute without new architectural decisions.

## Pack

| Document              | Path                                                           |
| --------------------- | -------------------------------------------------------------- |
| Preconditions         | [PRECONDITION-VERIFICATION.md](./PRECONDITION-VERIFICATION.md) |
| Package design        | [PACKAGE-DESIGN.md](./PACKAGE-DESIGN.md)                       |
| Database design       | [DATABASE-DESIGN.md](./DATABASE-DESIGN.md)                     |
| Worker design         | [WORKER-DESIGN.md](./WORKER-DESIGN.md)                         |
| State machine         | [STATE-MACHINE.md](./STATE-MACHINE.md)                         |
| Transactions          | [TRANSACTION-DESIGN.md](./TRANSACTION-DESIGN.md)               |
| Idempotency           | [IDEMPOTENCY-DESIGN.md](./IDEMPOTENCY-DESIGN.md)               |
| Observability         | [OBSERVABILITY-DESIGN.md](./OBSERVABILITY-DESIGN.md)           |
| Administration        | [ADMINISTRATION-DESIGN.md](./ADMINISTRATION-DESIGN.md)         |
| Test strategy         | [TEST-STRATEGY.md](./TEST-STRATEGY.md)                         |
| Rollout               | [ROLLOUT-PLAN.md](./ROLLOUT-PLAN.md)                           |
| Rollback              | [ROLLBACK-PLAN.md](./ROLLBACK-PLAN.md)                         |
| Implementation phases | [IMPLEMENTATION-PHASES.md](./IMPLEMENTATION-PHASES.md)         |
| Quality gates         | [QUALITY-GATES.md](./QUALITY-GATES.md)                         |
| Completion            | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                 |
| Owner Acceptance      | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                   |

## Downstream

**Platform-1.4-ENG-001B-P0** authorised (Phase 0 only). Later phases remain **BLOCKED** pending named Approvals.

## STOP

Design **ACCEPTED**. Downstream: ENG-001B-P0 only until Owner Phase 0 Acceptance.
