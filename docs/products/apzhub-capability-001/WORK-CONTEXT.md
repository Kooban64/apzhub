# Work Context — Unified Work Experience

| Field     | Value                 |
| --------- | --------------------- |
| Programme | APZHUB-CAPABILITY-001 |
| Status    | **COMPLETE**          |
| Timestamp | 20260805T083000Z      |
| Kind      | Capability definition |

## Purpose

Define the context every work item should expose so a person can act without hunting across products.

No implementation. No APIs. No schemas.

## Minimum context for every work item

| Context field                | Question it answers                           |
| ---------------------------- | --------------------------------------------- |
| **Title / intent**           | What am I being asked to do?                  |
| **Owner / actor**            | Who must act next?                            |
| **Requester / originator**   | Who asked for this (when relevant)?           |
| **Priority**                 | How urgent is this relative to other work?    |
| **Status**                   | Where is it in the shared lifecycle?          |
| **Due / commitment**         | When is attention expected?                   |
| **Related delivery**         | What initiative or deliverable does it serve? |
| **Related people**           | Who else is involved?                         |
| **Related artefacts**        | What documents or records matter?             |
| **Related service needs**    | What help requests are connected?             |
| **Related quality evidence** | What quality/release proof is attached?       |
| **Related effort**           | What time or effort has been recorded?        |
| **History summary**          | What changed recently?                        |

## Context principles

1. Context is **enough to act**, not a dump of every related record.
2. Related items are shown as **work-relevant links**, not engine identifiers.
3. Missing context is honest (“Unavailable” / “None”) — never raw technical IDs as the primary UI.
4. Context respects permissions; absence may mean “not allowed,” not “does not exist.”
5. Context is platform-shaped; products contribute fields, they do not invent incompatible models.

## Context panel (experience intent)

When a work item is selected, APZHUB should present:

| Section       | Contents                                   |
| ------------- | ------------------------------------------ |
| Summary       | Title, status, priority, due               |
| People        | Owner, requester, collaborators            |
| Relationships | Delivery, artefacts, service needs, effort |
| Quality       | Evidence / readiness (when applicable)     |
| Actions       | Next allowed actions for this actor        |

This aligns with existing shell Context Panel patterns without redesigning the shell.
