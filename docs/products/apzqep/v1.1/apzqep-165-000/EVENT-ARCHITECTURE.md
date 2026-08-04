# EVENT-ARCHITECTURE — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Rules

- Past-tense event names
- Standard envelope (correlationId, causationId, tenant/org, actor, occurredAt)
- At-least-once delivery; subscribers idempotent
- Manifest-first (`event.yaml` / Event SDK 029) at engineering time
- Extend catalogue by composition — do not redesign bus/outbox

## Orchestration event catalogue (additions)

| Event                                 | When                                           |
| ------------------------------------- | ---------------------------------------------- |
| `orchestration.trigger.received`      | Trigger accepted                               |
| `orchestration.trigger.ignored`       | No binding / filtered                          |
| `orchestration.flow.started`          | Flow run entered RUNNING path                  |
| `orchestration.flow.step.started`     | Capability step invoked                        |
| `orchestration.flow.step.completed`   | Capability step succeeded                      |
| `orchestration.flow.step.failed`      | Capability step failed                         |
| `orchestration.gates.evaluated`       | Gate policy evaluation finished                |
| `orchestration.approval.requested`    | Approval pending                               |
| `orchestration.approval.resolved`     | Approved / rejected / expired                  |
| `orchestration.waiver.recorded`       | Gate waiver audited                            |
| `orchestration.release.recommended`   | Recommendation produced                        |
| `orchestration.release.decided`       | GO / NO-GO / conditional / deferred / rejected |
| `orchestration.flow.completed`        | Terminal success                               |
| `orchestration.flow.failed`           | Terminal failure                               |
| `orchestration.flow.cancelled`        | Cancelled                                      |
| `orchestration.flow.timed_out`        | Timed out                                      |
| `orchestration.capability.registered` | Capability registry change                     |

## Consumed events (examples)

| Event (peer)                   | Orchestration reaction                |
| ------------------------------ | ------------------------------------- |
| SCM normalised change events   | Trigger router                        |
| Automation run terminal events | Advance / fail steps                  |
| QI evaluation completed        | Advance to gates                      |
| Evidence completeness signals  | Clear AWAITING_EVIDENCE               |
| Notification action events     | Approval / retry intents via services |

## Idempotency

Flow step handlers key on `(flowRunId, stepId, eventId)`. Duplicate peer events do not double-invoke capabilities when contracts declare idempotency keys.
