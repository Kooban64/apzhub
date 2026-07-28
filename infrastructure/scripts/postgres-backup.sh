#!/bin/sh
# APZHUB-OPS-002 A4 — Platform PostgreSQL backup (pg_dump custom format)
# Used by: host cron, compose profile `backup`, or manual ops:backup:postgres
set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
PGHOST="${PGHOST:-postgres}"
PGPORT="${PGPORT:-5432}"
PGUSER="${POSTGRES_USER:-apzhub}"
PGDATABASE="${POSTGRES_DB:-apzhub}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="${BACKUP_DIR}/apzhub-${PGDATABASE}-${STAMP}.dump"

mkdir -p "${BACKUP_DIR}"
echo "[apzhub-backup] starting dump → ${FILE}"

pg_dump \
  --host="${PGHOST}" \
  --port="${PGPORT}" \
  --username="${PGUSER}" \
  --dbname="${PGDATABASE}" \
  --format=custom \
  --file="${FILE}"

# checksum sidecar
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "${FILE}" > "${FILE}.sha256"
fi

# retention
find "${BACKUP_DIR}" -type f -name 'apzhub-*.dump' -mtime "+${RETENTION_DAYS}" -print -delete 2>/dev/null || true
find "${BACKUP_DIR}" -type f -name 'apzhub-*.dump.sha256' -mtime "+${RETENTION_DAYS}" -print -delete 2>/dev/null || true

echo "[apzhub-backup] complete (${RETENTION_DAYS}d retention)"
ls -lah "${BACKUP_DIR}" | tail -n 20
