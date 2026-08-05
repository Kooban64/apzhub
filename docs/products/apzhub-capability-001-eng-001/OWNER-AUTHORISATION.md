# Owner Authorisation — APZHUB-CAPABILITY-001-ENG-001

| Field          | Value                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Programme      | **APZHUB-CAPABILITY-001-ENG-001**                                                                                  |
| Title          | Unified Work Experience Composition Layer                                                                          |
| Status         | **AUTHORISED / EXECUTED**                                                                                          |
| Timestamp      | 20260805T103000Z                                                                                                   |
| Classification | Enterprise Portfolio Capability — Engineering                                                                      |
| Parent         | [../apzhub-capability-001/](../apzhub-capability-001/)                                                             |
| Validation     | [../apzhub-capability-001-validation/OWNER-RESOLUTION.md](../apzhub-capability-001-validation/OWNER-RESOLUTION.md) |

## Classification

| Concern                   | Status                         |
| ------------------------- | ------------------------------ |
| Engineering               | **AUTHORISED**                 |
| Architecture              | **UNCHANGED** (compose only)   |
| Repository                | Implementation + documentation |
| Products                  | **OWNERSHIP UNCHANGED**        |
| Systems of Record         | **NO NEW BUSINESS SoR**        |
| Reference Implementations | **UNCHANGED**                  |

## Purpose

Implement the first portfolio **composition layer** so users open APZHUB and see **their work**, not a catalogue of products.

## Design philosophy

> A user asks: **"What do I need to do?"** — not — **"Which product should I open?"**

## Authorised outcomes

1. Portfolio My Work projection surface on `/workspace/home` (My Work)
2. Read-only composition API aggregating product references
3. Lifecycle projection labels (non-authoritative)
4. Work-first Activity Bar entry (Home → My Work label)
5. Providers: Projects, Support, Time, QEP executions, Workflow inbox
6. Queues: Needs My Attention, Due Today, Waiting For Others, Recently Completed

## Mandatory rules

See [ENGINEERING-PRINCIPLES.md](./ENGINEERING-PRINCIPLES.md).

## Explicit exclusions

Unified Notifications, Unified Search, Executive Workspace, Documents RI, Risk SoR invention, product redesign, engine exposure, new authoritative business tables.
