# Restore Procedures — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A4  
> **Related:** `docs/operations/runbooks/platform-db-restore.md` · backup restore drill

## Preconditions

- Change record for Production restore.
- Valid `.dump` + `.sha256`.
- Maintenance window accepted.

## Steps (production container)

```bash
CONTAINER=apzhub-postgres-prod
DUMP=infrastructure/backups/postgres/apzhub-apzhub-YYYYMMDDTHHMMSSZ.dump
sha256sum -c "${DUMP}.sha256"

# Stop web to avoid writes
docker stop apzhub-web-prod

# Restore into a new DB first (preferred) OR replace after owner approval
docker exec -i -e PGPASSWORD "$CONTAINER" \
  pg_restore -U apzhub -d apzhub --clean --if-exists < "${DUMP}"

docker start apzhub-web-prod
PLAYWRIGHT_BASE_URL=... pnpm test:production-smoke
```

## Drill (non-destructive)

```bash
pnpm ops:backup-restore-drill -- --mode live --environment staging
```

Uses isolated `apzhub_restore_drill` database — preferred verification path.

## Rollback of a bad restore

Keep pre-restore dump; re-restore previous artefact; re-run smoke.
