# Disaster Recovery — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A4  
> **Authority:** `docs/operations/DISASTER-RECOVERY.md`

## Governance targets (not commercial SLAs)

| Tier                 | RTO  | RPO   |
| -------------------- | ---- | ----- |
| Platform PG (Tier A) | ≤ 8h | ≤ 24h |

## Failure scenarios

| Scenario               | Response                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| Web container crash    | Compose restart policy · redeploy image tag                           |
| Postgres volume loss   | Restore latest dump · migrate if needed · smoke                       |
| Redis loss             | Restart Redis · sessions re-auth (acceptable)                         |
| Host loss              | Rebuild from git + `.env.production` from secrets store + latest dump |
| Shared-host contention | Host coexistence runbook · capacity check                             |

## Communication

Follow [ONCALL-PROCEDURES.md](./ONCALL-PROCEDURES.md) and Incident Management. Do not claim Email SoR delivery for DR notifications.
