# Backup Procedures — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A4

## Scope

Platform **PostgreSQL** (`apzhub` database) — authoritative platform metadata SoR.  
Redis is ephemeral-acceptable (sessions rebuild). Engine DBs remain under legacy OLAs.

## Automated backup (host cron)

```bash
# /etc/cron.d/apzhub-postgres-backup
# Daily 02:15 UTC — Platform 1.2.0
15 2 * * * ubuntu cd /home/ubuntu/apz-portal && BACKUP_RETENTION_DAYS=14 /usr/bin/pnpm ops:backup:postgres >> /var/log/apzhub-backup.log 2>&1
```

Script: `scripts/ops-postgres-backup.sh` → `infrastructure/backups/postgres/apzhub-<db>-<stamp>.dump` (+ `.sha256`).

## Compose one-shot

```bash
docker compose --env-file .env.production \
  -f infrastructure/docker/docker-compose.prod.yml \
  --profile backup run --rm postgres-backup
```

## Retention policy

| Parameter               | Default                |
| ----------------------- | ---------------------- |
| `BACKUP_RETENTION_DAYS` | **14**                 |
| Format                  | `pg_dump -Fc` (custom) |
| Checksum                | SHA-256 sidecar        |

## Verification

1. Confirm dump file size > 0 and checksum matches.
2. Quarterly: `pnpm ops:backup-restore-drill -- --mode live --environment production` under Change.
3. Keep live PASS evidence ≤ 90 days (`docs/operations/evidence/backup-restore/`).

## Configuration backup

- Retain hardened `.env.production` in an approved secrets store (not git).
- Caddy/compose files are in git (this repository).
