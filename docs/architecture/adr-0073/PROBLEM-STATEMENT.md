# Problem Statement

## Verified problem

Platform 1.3 Notification Delivery Phase A keeps **authoritative runtime state in process memory** while migration **0065** already defines durable tables. Repository evidence (P13-KL-ND-03 · in-memory Maps · interval worker) supports:

| Risk                                                    | Supported?                  | Basis                                                       |
| ------------------------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| State loss on process restart                           | **Yes**                     | Process-local Maps; no durable runtime bind                 |
| Incomplete retry recovery after restart                 | **Yes**                     | Retry schedule lives in memory Maps                         |
| Inconsistent / non-shared worker state across instances | **Yes**                     | Single-process interval; no DB claim                        |
| Duplicate dispatch under multi-instance                 | **Plausible / design risk** | No lease/claim coordination evidenced                       |
| Abandoned delivery recovery                             | **Yes**                     | In-memory `processing` not recoverable after crash          |
| Limited multi-instance suitability                      | **Yes**                     | Process-local queue                                         |
| Weak dead-letter durability                             | **Yes**                     | `deadLetter` flag in memory unless Postgres wired           |
| Limited operational administration of durable queue     | **Yes**                     | Admin inspects service memory unless store wired            |
| Insufficient shared-host resilience for delivery plane  | **Yes**                     | CERT-002 capacity not claimed; process-local compounds risk |

## Out of scope for this problem

Email SoR · mailbox · marketing · Workflow Execute · provider-specific product logic · WebSockets.

## Objective

Select a durable, recoverable, operationally manageable runtime architecture that realises ADR-0071 persistence intent and Platform 1.4 MUST epic **P14-E01**, without implementation in this programme.
