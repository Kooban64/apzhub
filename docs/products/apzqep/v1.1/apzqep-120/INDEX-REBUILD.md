# Index Rebuild — APZQEP-120-S11

| Mode           | Method                                               |
| -------------- | ---------------------------------------------------- |
| Incremental    | Per-event `applyEvent` via processors                |
| Full rebuild   | `rebuildFromEvents` (clear + ordered replay)         |
| Version-aware  | Documents carry `projectionVersion`                  |
| Reconciliation | Compare rebuild output to prior snapshot (ops later) |

Rebuild consumes **event history only** — never live business service queries.
