# Platform-1.4-ENG-001B-P1 — Durable Notification Runtime Implementation – Phase 1

> **Programme:** Platform-1.4-ENG-001B-P1  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Baseline:** Platform 1.4  
> **Parent design:** [Platform-1.4-ENG-001A](../platform-1.4-eng-001a/README.md) (**ACCEPTED**)  
> **Parent phase:** [Platform-1.4-ENG-001B-P0](../platform-1.4-eng-001b-p0/README.md) (**ACCEPTED**)  
> **Authoritative ADR:** ADR-0073 (**ACCEPTED** — Option A)  
> **Status:** **ACCEPTED**  
> **Date:** 2026-07-23

## Scope (Phase 1 only)

Durable repository + persistence interfaces + DB↔domain mapping + DI that compiles. Process-local delivery runtime remains active. Feature flag default OFF.

## Explicitly out of scope

Worker · claim loop · lease acquisition · retry scheduler execution · dispatch · runtime activation · SMTP · Email SoR · Workflow Execute · FIN-001 · WebSockets · admin UI.

## Pack

| Document          | Path                                                           |
| ----------------- | -------------------------------------------------------------- |
| Preconditions     | [PRECONDITION-VERIFICATION.md](./PRECONDITION-VERIFICATION.md) |
| Repository design | [REPOSITORY-DESIGN.md](./REPOSITORY-DESIGN.md)                 |
| Persistence layer | [PERSISTENCE-LAYER.md](./PERSISTENCE-LAYER.md)                 |
| Test results      | [TEST-RESULTS.md](./TEST-RESULTS.md)                           |
| Quality           | [QUALITY-RESULTS.md](./QUALITY-RESULTS.md)                     |
| Completion        | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                 |
| Owner Acceptance  | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                   |

## Downstream

**Platform-1.4-ENG-001B-P2** — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** — [pack](../platform-1.4-eng-001b-p2/README.md).

## STOP

Phase 1 **ACCEPTED**. Downstream: ENG-001B-P2 only until Owner Phase 2 Acceptance.
