# Backup and Recovery — Platform 1.2.0

> **Programme:** APZHUB-OPS-001  
> **Status:** **PARTIAL** (practice **READY** · automation **GAP**)

## Verified

| Item             | Evidence                                                             | Result                                           |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Policy           | `docs/operations/BACKUP-AND-RECOVERY.md`                             | Platform PG RPO ≤24h; Redis ephemeral acceptable |
| Drill runbook    | `BACKUP-RESTORE-DRILL-RUNBOOK.md`                                    | Present                                          |
| Drill runner     | `pnpm ops:backup-restore-drill`                                      | Present                                          |
| Live evidence    | `evidence/backup-restore/20260720T083654Z-R12-OPS-01-live-PASS.json` | **PASS** (dev; keep ≤90 days)                    |
| Dry-run evidence | `20260720T082312Z-R12-OPS-01-dry-run-PASS.json`                      | **PASS**                                         |
| Programme        | APZHUB-1.2-002 **ACCEPTED**                                          | Closed                                           |
| DR targets       | `DISASTER-RECOVERY.md`                                               | Tier A RTO ≤8h · RPO ≤24h (governance)           |
| Restore runbook  | `runbooks/platform-db-restore.md`                                    | Present                                          |

## Limitations

- Drill scope = **platform PostgreSQL** (isolated restore DB), not all engine databases.
- No in-repo scheduled production backup job.
- Document/object storage backup depends on product storage topology (not in APZHUB compose).
- Live evidence is **dev**, not Production Change-window drill.

## Before production

1. Enable/verify automated platform PostgreSQL dumps or snapshots on the production path.
2. Execute staging/prod restore drill under Change; file evidence.
3. Owner accept RTO/RPO for this host topology.
