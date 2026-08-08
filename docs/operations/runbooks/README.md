# APZHUB Platform Runbooks

> **Programme:** APZHUB-1.2-003 · **Backlog:** R12-OPS-02  
> **Standard:** [RUNBOOK-STANDARDS.md](../RUNBOOK-STANDARDS.md)  
> **Alert strategy:** [MONITORING-AND-ALERTING.md](../MONITORING-AND-ALERTING.md)

---

## Index (minimum Production set)

| Runbook                                                                      | Alert policy                             | Priority |
| ---------------------------------------------------------------------------- | ---------------------------------------- | -------- |
| [identity-unavailable.md](./identity-unavailable.md)                         | `alert.identity.unavailable`             | P1       |
| [gateway-5xx.md](./gateway-5xx.md)                                           | `alert.gateway.5xx`                      | P1       |
| [platform-db-restore.md](./platform-db-restore.md)                           | `alert.platform-db.restore`              | P1       |
| [redis-session-storm.md](./redis-session-storm.md)                           | `alert.redis.session-storm`              | P1       |
| [support-adapter-unhealthy.md](./support-adapter-unhealthy.md)               | `alert.support.adapter-unhealthy`        | P2       |
| [analytics-adapter-unhealthy.md](./analytics-adapter-unhealthy.md)           | `alert.analytics.adapter-unhealthy`      | P2       |
| [knowledge-memory-store-unhealthy.md](./knowledge-memory-store-unhealthy.md) | `alert.knowledge.memory-store-unhealthy` | P2       |
| [time-adapter-unhealthy.md](./time-adapter-unhealthy.md)                     | `alert.time.adapter-unhealthy`           | P2       |
| [law-authz-denials-spike.md](./law-authz-denials-spike.md)                   | `alert.law.authz-denials-spike`          | P2       |
| [event-bus-publish-failures.md](./event-bus-publish-failures.md)             | `alert.event-bus.publish-failures`       | P2       |
| [automation-deferred-flood.md](./automation-deferred-flood.md)               | `alert.automation.deferred-flood`        | INFO     |
| [observe-unavailable.md](./observe-unavailable.md)                           | `alert.observe.unavailable`              | P2       |
| [host-coexistence-capacity.md](./host-coexistence-capacity.md)               | OPS-R-01 / R12-OPS-03                    | P1/P2    |

## Honesty

- Delivery posture is **manual triage** — Observe metadata SoR has no live alert evaluation/paging.
- Do not invent Email/SMS delivery under these runbooks.
- Engine brands stay masked in user communications.
