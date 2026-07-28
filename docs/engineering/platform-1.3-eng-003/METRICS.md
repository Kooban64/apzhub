# Metrics — Platform-1.3-ENG-003

## Phase A surface

Counters are exposed via diagnostics (and health connection count):

| Metric              | Source field                |
| ------------------- | --------------------------- |
| Active connections  | `activeConnections`         |
| Events delivered    | `eventsDelivered`           |
| Back-pressure drops | `eventsDroppedBackpressure` |
| Heartbeats          | `heartbeatsSent`            |
| Authz denials       | `authzDenials`              |
| Tenant mismatches   | `tenantMismatches`          |

Prometheus scrape integration is **not** required for ENG-003; diagnostics JSON is the certified metrics surface for Phase A.
