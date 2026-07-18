# APZHUB Metric Lifecycle Guide

**Milestone:** APZMETRICS-001  
**Implementation:** `@apzhub/metrics-core` → `lifecycle/transitions.ts`

## Statuses

`draft` → `active` → `inactive` → `archived`

## Allowed transitions

| From     | To                  |
| -------- | ------------------- |
| draft    | active, archived    |
| active   | inactive, archived  |
| inactive | active, archived    |
| archived | _(none — terminal)_ |

Same-status updates are allowed. Unknown transitions throw `MetricsDomainError` (`invalid_lifecycle_transition`).

Applies to metrics, definitions, KPIs, and other lifecycle-bearing metadata entities.
