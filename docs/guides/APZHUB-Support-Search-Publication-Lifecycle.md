# Support Search Publication Lifecycle

**Milestone:** APZSEARCH-011

Explicit hooks only (no webhooks, polling, sync, workers, Event Bus):

| Hook | Behaviour |
| ---- | --------- |
| `onSupportRequestUpserted` / Article / Organisation / Group / User | publish or update |
| `on*Removed` | remove |

`SupportSearchLifecycle.suggestFromDomainStatus` suggests states from ticket status; it does not schedule transitions.
