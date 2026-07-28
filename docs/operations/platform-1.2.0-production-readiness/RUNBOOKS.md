# Runbooks — Platform 1.2.0 Production Index

> **Programme:** APZHUB-OPS-002 · **Action:** A6

## Validated runbook set

| Scenario                   | Path                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------- |
| Identity unavailable       | [../runbooks/identity-unavailable.md](../runbooks/identity-unavailable.md)             |
| Gateway 5xx                | [../runbooks/gateway-5xx.md](../runbooks/gateway-5xx.md)                               |
| Platform DB restore        | [../runbooks/platform-db-restore.md](../runbooks/platform-db-restore.md)               |
| Redis session storm        | [../runbooks/redis-session-storm.md](../runbooks/redis-session-storm.md)               |
| Support adapter unhealthy  | [../runbooks/support-adapter-unhealthy.md](../runbooks/support-adapter-unhealthy.md)   |
| Law AuthZ denials spike    | [../runbooks/law-authz-denials-spike.md](../runbooks/law-authz-denials-spike.md)       |
| Event bus publish failures | [../runbooks/event-bus-publish-failures.md](../runbooks/event-bus-publish-failures.md) |
| Automation deferred flood  | [../runbooks/automation-deferred-flood.md](../runbooks/automation-deferred-flood.md)   |
| Observe unavailable        | [../runbooks/observe-unavailable.md](../runbooks/observe-unavailable.md)               |
| Host coexistence capacity  | [../runbooks/host-coexistence-capacity.md](../runbooks/host-coexistence-capacity.md)   |

## Production additions (this programme)

| Topic    | Path                                             |
| -------- | ------------------------------------------------ |
| Deploy   | [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)     |
| Rollback | [ROLLBACK-GUIDE.md](./ROLLBACK-GUIDE.md)         |
| Backup   | [BACKUP-PROCEDURES.md](./BACKUP-PROCEDURES.md)   |
| Restore  | [RESTORE-PROCEDURES.md](./RESTORE-PROCEDURES.md) |

## Validation expectation

Before go-live, on-call walks P1 runbooks (identity, gateway 5xx, DB restore, coexistence) once.
