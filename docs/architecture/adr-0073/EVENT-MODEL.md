# Event Model

Publish **after** durable state commit (fail-soft). Events are not authoritative.

| Event (illustrative)                           | Class       |
| ---------------------------------------------- | ----------- |
| `notification.intent.accepted`                 | domain      |
| `notification.delivery.queued`                 | domain/ops  |
| `notification.delivery.started`                | ops         |
| `notification.delivery.delivered`              | domain      |
| `notification.delivery.failed`                 | domain/ops  |
| `notification.delivery.retry`                  | ops         |
| `notification.dead_letter.recorded` / replayed | ops + audit |
| `notification.delivery.cancelled` / suppressed | domain      |

Avoid event proliferation; reuse ENG-004 names where present.

Internal worker wake-up must not depend solely on events for correctness (DB poll/claim is authoritative).
