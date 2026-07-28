# APZHUB Capacity Planning

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Host evidence:** [ENVIRONMENT.md](../../ENVIRONMENT.md)

---

## Capacity domains

| Domain               | Watch                                                         |
| -------------------- | ------------------------------------------------------------- |
| Compute              | Host CPU/RAM; container limits; coexistence with legacy stack |
| Storage              | Disk %; Docker volumes; PostgreSQL growth; object storage     |
| Database connections | Platform PG + engine DBs                                      |
| Redis memory         | Sessions/cache                                                |
| Event / outbox depth | Relay lag, DLQ growth                                         |
| Search index size    | Publication volume                                            |
| Adapter rate limits  | Engine API quotas                                             |

## Planning cadence

| Cadence     | Activity                                          |
| ----------- | ------------------------------------------------- |
| Weekly      | Disk / container health glance                    |
| Monthly     | Growth trends; backup size                        |
| Quarterly   | Capacity review vs product adoption               |
| Pre-release | Estimate load for new features (Owner programmes) |

## Triggers for Change

- Disk > 80% sustained
- Outbox/DLQ growth without drain
- P2 latency from resource saturation
- New product enablement via provisioning

## Host coexistence controls (R12-OPS-03)

Authoritative controls: [HOST-COEXISTENCE-CONTROLS.md](./HOST-COEXISTENCE-CONTROLS.md)

```bash
pnpm ops:host-coexistence-audit
pnpm ops:host-coexistence-audit -- --live
```

| Control                 | Meaning                                                       |
| ----------------------- | ------------------------------------------------------------- |
| Reserved APZHUB ports   | 3300, 6006, 54334, 6380, 3080, 3443                           |
| Forbidden compose binds | Legacy listeners (e.g. 54333, 8080, 18081–18088)              |
| Disk warn/critical      | 80% / 90% used                                                |
| Change gate             | Host Changes that may disrupt `apz-stack` need Owner Approval |

Runbook: [runbooks/host-coexistence-capacity.md](./runbooks/host-coexistence-capacity.md)

## Honesty

Legacy stack density on shared hosts is a primary capacity risk — treat coexistence as first-class.
