# Event Contracts

| Event                        | Manifest                                       |
| ---------------------------- | ---------------------------------------------- |
| `observe.alert.fired`        | `events/observe/alert-fired/event.yaml`        |
| `observe.alert.acknowledged` | `events/observe/alert-acknowledged/event.yaml` |
| `observe.alert.resolved`     | `events/observe/alert-resolved/event.yaml`     |
| `observe.alert.suppressed`   | `events/observe/alert-suppressed/event.yaml`   |

Publisher: `observe-service` via fail-soft DomainEventPublisher. Delivery hook is a seam only.
