# APZQEP Backup Procedure

1. Execute platform backup: `docs/operations/BACKUP-AND-RECOVERY.md` / `BACKUP-PROCEDURES.md`.
2. Include PostgreSQL (platform metadata) and Redis as required by platform.
3. Cap A–F business data is **not** in PostgreSQL under LIMITED_AVAILABILITY — there is nothing durable to back up for those Caps.
4. Evidence platform data (where Postgres-backed) follows evidence OPS guides.
