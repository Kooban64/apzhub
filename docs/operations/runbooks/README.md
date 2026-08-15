# APZHUB Platform Runbooks

> **Programme:** APZHUB-1.2-003 · **Backlog:** R12-OPS-02  
> **Standard:** [RUNBOOK-STANDARDS.md](../RUNBOOK-STANDARDS.md)  
> **Alert strategy:** [MONITORING-AND-ALERTING.md](../MONITORING-AND-ALERTING.md)

---

## Index (minimum Production set)

| Runbook                                                                      | Alert policy                              | Priority |
| ---------------------------------------------------------------------------- | ----------------------------------------- | -------- |
| [identity-unavailable.md](./identity-unavailable.md)                         | `alert.identity.unavailable`              | P1       |
| [gateway-5xx.md](./gateway-5xx.md)                                           | `alert.gateway.5xx`                       | P1       |
| [platform-db-restore.md](./platform-db-restore.md)                           | `alert.platform-db.restore`               | P1       |
| [redis-session-storm.md](./redis-session-storm.md)                           | `alert.redis.session-storm`               | P1       |
| [support-adapter-unhealthy.md](./support-adapter-unhealthy.md)               | `alert.support.adapter-unhealthy`         | P2       |
| [analytics-adapter-unhealthy.md](./analytics-adapter-unhealthy.md)           | `alert.analytics.adapter-unhealthy`       | P2       |
| [knowledge-memory-store-unhealthy.md](./knowledge-memory-store-unhealthy.md) | `alert.knowledge.memory-store-unhealthy`  | P2       |
| [time-adapter-unhealthy.md](./time-adapter-unhealthy.md)                     | `alert.time.adapter-unhealthy`            | P2       |
| [law-authz-denials-spike.md](./law-authz-denials-spike.md)                   | `alert.law.authz-denials-spike`           | P2       |
| [event-bus-publish-failures.md](./event-bus-publish-failures.md)             | `alert.event-bus.publish-failures`        | P2       |
| [automation-deferred-flood.md](./automation-deferred-flood.md)               | `alert.automation.deferred-flood`         | INFO     |
| [observe-unavailable.md](./observe-unavailable.md)                           | `alert.observe.unavailable`               | P2       |
| [host-coexistence-capacity.md](./host-coexistence-capacity.md)               | OPS-R-01 / R12-OPS-03                     | P1/P2    |
| [retire-authentik.md](./retire-authentik.md)                                 | BetterAuth cutover / APZPRD               | P1       |
| [qep-automation-live.md](./qep-automation-live.md)                           | SPR-210 live Playwright                   | P2       |
| [projects-plane-adapter.md](./projects-plane-adapter.md)                     | SPR-OPS-PLANE-001 Projects ↔ Plane        | P1       |
| [support-zammad-adapter.md](./support-zammad-adapter.md)                     | SPR-OPS-ZAMMAD-001 Support ↔ Zammad       | P1       |
| [time-kimai-adapter.md](./time-kimai-adapter.md)                             | SPR-OPS-KIMAI-001 Time ↔ Kimai            | P1       |
| [analytics-metabase-adapter.md](./analytics-metabase-adapter.md)             | SPR-OPS-METABASE-001 Analytics ↔ Metabase | P1       |
| [workflow-n8n-adapter.md](./workflow-n8n-adapter.md)                         | SPR-OPS-N8N-001 Workflow ↔ n8n            | P1       |
| [qep-scm-github-live.md](./qep-scm-github-live.md)                           | SPR-210 live SCM                          | P2       |
| [qep-dispatch-record-only.md](./qep-dispatch-record-only.md)                 | SPR-210 dispatch safety                   | INFO     |
| [qep-typst-report-pack.md](./qep-typst-report-pack.md)                       | SPR-210 Typst PDF                         | P2       |

## Honesty

- Delivery posture is **manual triage** — Observe metadata SoR has no live alert evaluation/paging.
- Do not invent Email/SMS delivery under these runbooks.
- Engine brands stay masked in user communications.
