# Domain Events — Verification

> **Programme:** APZQEP-ENG-040A  
> **Architecture:** APZQEP-ARCH-009 **ACCEPTED**  
> **Source:** `verification-events.ts`

## Nature

Builders only — events are produced on the aggregate (`domainEvents`) for later platform wiring. **No Event Bus publish** under ENG-040A.

## Envelope

Every event carries:

| Field            | Role                   |
| ---------------- | ---------------------- |
| `eventId`        | Unique id (UUID)       |
| `occurredAt`     | ISO timestamp          |
| `correlationId`  | End-to-end correlation |
| `tenantId`       | Tenant scope           |
| `verificationId` | Aggregate id (`ver_*`) |
| `type`           | Past-tense event type  |

## Catalogue

| Type                          | Payload extras                       |
| ----------------------------- | ------------------------------------ |
| `qep.verification.created`    | `status`, `subjectKind`              |
| `qep.verification.requested`  | —                                    |
| `qep.verification.assigned`   | `assigneeId`                         |
| `qep.verification.started`    | —                                    |
| `qep.verification.completed`  | `outcome`                            |
| `qep.verification.verified`   | `outcome`                            |
| `qep.verification.failed`     | `outcome` (when outcome is `failed`) |
| `qep.verification.rejected`   | `outcome`                            |
| `qep.verification.expired`    | —                                    |
| `qep.verification.withdrawn`  | —                                    |
| `qep.verification.superseded` | `successorVerificationId`            |
| `qep.verification.cancelled`  | —                                    |
| `qep.verification.retired`    | —                                    |

## Emission pairing

| Transition                                      | Events emitted                                            |
| ----------------------------------------------- | --------------------------------------------------------- |
| Create                                          | `created`                                                 |
| Request / assign / start                        | matching single event                                     |
| Verify                                          | `verified` + `completed`                                  |
| Reject                                          | `rejected` + `completed` (+ `failed` if outcome=`failed`) |
| Expire / withdraw / supersede / cancel / retire | matching single event                                     |

## Non-goals

- No outbox / bus wiring
- No notification or search subscribers
- No AI-authored truth events
