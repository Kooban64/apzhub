# APZ TCMS — Execution History

**Milestone:** APZTCMS-006

---

## Model

Immutable append-only history entries via `TestingPersistence.executionHistory`:

| Field           | Role                                                     |
| --------------- | -------------------------------------------------------- |
| `sessionId`     | Parent session                                           |
| `eventType`     | Transition / assignment / step / evidence / approval key |
| `occurredAt`    | Timestamp                                                |
| `actorUserId`   | Actor                                                    |
| `correlationId` | Request correlation                                      |
| `summary`       | Human-readable                                           |
| `details`       | Structured JSON                                          |

No update/delete of payload after append.

---

## What is recorded

- Status transitions (start, pause, resume, complete, cancel, review, approve, reject, reopen, archive, …)
- Assignments (tester / reviewer / handover)
- Step updates and overall-result changes
- Evidence bind / lifecycle changes when linked to the execution
- Approval decisions affecting the execution

Additionally, `DomainEventCollector` holds in-process domain events for the same mutations (**not** a platform Event Bus).

---

## Related

[Manual Execution Engine](./APZHUB-APZ-TCMS-Manual-Execution-Engine.md)
