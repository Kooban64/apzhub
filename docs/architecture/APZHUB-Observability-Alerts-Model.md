# Observability Alerts Model

**Milestone:** APZOBSERVE-001

## AlertDefinition

Catalogue: key, name, severity (`info` | `warning` | `critical`), provider kind/ref, status.

## AlertState

Runtime state metadata: `inactive` | `pending` | `firing` | `resolved` | `silenced`.

## Lifecycle

Fail-closed transitions via `assertObserveAlertStateTransition` in observe-core.

## Non-goals

- No AlertManager integration
- No notification delivery (belongs to Notification Platform / later observe milestones)
