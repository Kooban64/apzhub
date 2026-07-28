# Operations Runbook Review — Platform 1.2.0

> **Programme:** APZHUB-OPS-001  
> **Status:** **READY**

## Catalogue

| Guide / runbook            | Path                                     | Status           |
| -------------------------- | ---------------------------------------- | ---------------- |
| Runbook index              | `docs/operations/runbooks/README.md`     | Present          |
| Identity unavailable       | `runbooks/identity-unavailable.md`       | Present          |
| Gateway 5xx                | `runbooks/gateway-5xx.md`                | Present          |
| Platform DB restore        | `runbooks/platform-db-restore.md`        | Present          |
| Redis session storm        | `runbooks/redis-session-storm.md`        | Present          |
| Support adapter unhealthy  | `runbooks/support-adapter-unhealthy.md`  | Present          |
| Law AuthZ denials spike    | `runbooks/law-authz-denials-spike.md`    | Present          |
| Event bus publish failures | `runbooks/event-bus-publish-failures.md` | Present          |
| Automation deferred flood  | `runbooks/automation-deferred-flood.md`  | Present          |
| Observe unavailable        | `runbooks/observe-unavailable.md`        | Present          |
| Host coexistence capacity  | `runbooks/host-coexistence-capacity.md`  | Present          |
| Deployment strategy        | `DEPLOYMENT-STRATEGY.md`                 | Present (manual) |
| Incident management        | `INCIDENT-MANAGEMENT.md`                 | Present          |
| Support model              | `SUPPORT-MODEL.md`                       | Present          |
| Hotfix policy              | `HOTFIX-POLICY.md`                       | Present          |
| Backup restore drill       | `BACKUP-RESTORE-DRILL-RUNBOOK.md`        | Present          |

## Finding

Minimum Production runbook set exists and is linked from the alert strategy. Delivery posture is **manual triage** (no Email/SMS from Observe metadata plane).

## Before production

Walk P1 runbooks once with named on-call owners; confirm escalation contacts.
