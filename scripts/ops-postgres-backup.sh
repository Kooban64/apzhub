#!/usr/bin/env bash
# APZHUB-OPS-002 A4 — Host-side wrapper for platform PostgreSQL backup
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE="${ROOT}/infrastructure/docker/docker-compose.prod.yml"
ENV_FILE="${ROOT}/.env.production"
CONTAINER="${APZHUB_POSTGRES_CONTAINER:-apzhub-postgres-prod}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
HOST_BACKUP_DIR="${APZHUB_BACKUP_HOST_DIR:-${ROOT}/infrastructure/backups/postgres}"
mkdir -p "${HOST_BACKUP_DIR}"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  set -a && source "${ENV_FILE}" && set +a
fi

if ! docker inspect -f '{{.State.Running}}' "${CONTAINER}" 2>/dev/null | grep -q true; then
  echo "ERROR: postgres container '${CONTAINER}' is not running." >&2
  echo "Start production stack: pnpm docker:up:prod" >&2
  exit 1
fi

FILE_BASENAME="apzhub-${POSTGRES_DB:-apzhub}-${STAMP}.dump"
echo "[ops-postgres-backup] dumping from ${CONTAINER} → ${HOST_BACKUP_DIR}/${FILE_BASENAME}"

docker exec -e PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD required}" "${CONTAINER}" \
  pg_dump -U "${POSTGRES_USER:-apzhub}" -d "${POSTGRES_DB:-apzhub}" -Fc \
  > "${HOST_BACKUP_DIR}/${FILE_BASENAME}"

sha256sum "${HOST_BACKUP_DIR}/${FILE_BASENAME}" > "${HOST_BACKUP_DIR}/${FILE_BASENAME}.sha256"

find "${HOST_BACKUP_DIR}" -type f -name 'apzhub-*.dump' -mtime "+${RETENTION_DAYS}" -print -delete
find "${HOST_BACKUP_DIR}" -type f -name 'apzhub-*.dump.sha256' -mtime "+${RETENTION_DAYS}" -print -delete

echo "[ops-postgres-backup] OK (retention ${RETENTION_DAYS}d)"
ls -lah "${HOST_BACKUP_DIR}" | tail -n 15

# optional compose one-shot profile
if [[ "${1:-}" == "--compose-profile" ]]; then
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE}" --profile backup run --rm postgres-backup
fi
