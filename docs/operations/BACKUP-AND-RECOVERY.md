# APZHUB Backup and Recovery

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Backup strategy

| Data class                          | Backup approach                                                  | RPO target (ops)                |
| ----------------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| Platform PostgreSQL                 | Automated DB dumps / snapshots                                   | ≤ 24h (tighten per org policy)  |
| Redis                               | Ephemeral sessions — rebuild from AuthN; optional AOF if enabled | Session loss acceptable         |
| S3-compatible object storage        | Bucket versioning / replication                                  | ≤ 24h                           |
| Engine databases (Plane, Zammad, …) | Per-engine backup jobs (legacy stack)                            | Per engine OLA                  |
| Secrets                             | Secret store backup / sealed recovery                            | Immediate revoke+rotate if lost |
| Config / compose                    | Git + encrypted secret store                                     | N/A (rebuild)                   |

## Recovery strategy

| Scenario                    | Action                                                    |
| --------------------------- | --------------------------------------------------------- |
| Single service config error | Rollback Change                                           |
| Platform DB corruption      | Restore latest verified dump; re-run migrations if needed |
| Engine DB loss              | Restore engine backup; re-validate adapter mappings       |
| Secret compromise           | Rotate, invalidate sessions, audit                        |
| Full host loss              | [DISASTER-RECOVERY.md](./DISASTER-RECOVERY.md)            |

## Verification

- Quarterly restore test for platform PostgreSQL (document date/result).
- After each major release, confirm backup jobs still cover new volumes.
- **R12-OPS-01 (APZHUB-1.2-002):** executable drill + evidence — see [BACKUP-RESTORE-DRILL-RUNBOOK.md](./BACKUP-RESTORE-DRILL-RUNBOOK.md) and [evidence/backup-restore/](./evidence/backup-restore/README.md).

```bash
pnpm ops:backup-restore-drill -- --mode dry-run
pnpm ops:backup-restore-drill -- --mode live
```

Live drills use isolated DB `apzhub_restore_drill` only.

## Honesty

Browser-local Law ENF/ATF session stores are **not** platform DB backups — users may lose local UX state; Production SoR remains server-side.
