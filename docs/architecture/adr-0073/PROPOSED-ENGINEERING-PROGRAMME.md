# Proposed Engineering Programme — Platform-1.4-ENG-001 (A/B)

> **Split:** Design (**ENG-001A**) then Implementation (**ENG-001B**)

## Platform-1.4-ENG-001A — Technical Design

| Field  | Value                                                                                        |
| ------ | -------------------------------------------------------------------------------------------- |
| Status | **COMPLETED / AWAITING OWNER DESIGN ACCEPTANCE**                                             |
| Pack   | [docs/engineering/platform-1.4-eng-001a/](../../engineering/platform-1.4-eng-001a/README.md) |
| Scope  | Design only — no implementation                                                              |

## Platform-1.4-ENG-001B — Implementation

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Status       | **PROPOSED / BLOCKED PENDING OWNER DESIGN ACCEPTANCE**     |
| Identifier   | Platform-1.4-ENG-001B                                      |
| Prerequisite | ENG-001A Design Acceptance + named Implementation Approval |
| Scope        | Implement ADR-0073 Option A per ENG-001A blueprint         |

## Objective (ENG-001B)

Wire Notification Delivery runtime to PostgreSQL SoR with lease-based claiming, durable retries/DLQ/attempts, cutover from process-local Phase A Maps.

## Authoritative inputs

ADR-0073 (Accepted) · ENG-001A design pack · ADR-0071 retained · ADR-0072 retained.
