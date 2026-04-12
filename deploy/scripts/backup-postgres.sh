#!/usr/bin/env bash
set -euo pipefail

# Nightly-style logical backup: pg_dump from the postgres service in a compose stack.
# Usage (from host): APZHUB_HOST_SECRETS_DIR=./secrets deploy/scripts/backup-postgres.sh staging /opt/apzhub/backups
#
# Retention: delete local dumps older than KEEP_DAYS (default 14). Copy dumps off-host separately.

stack="${1:-}"
out_dir="${2:-./backups}"
if [[ "$stack" != "staging" && "$stack" != "production" ]]; then
  echo "usage: $0 staging|production [backup_output_dir]" >&2
  exit 1
fi

keep_days="${KEEP_DAYS:-14}"
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/$stack"

if [[ ! -f .env ]]; then
  echo "missing .env in $root/$stack" >&2
  exit 1
fi

mkdir -p "$out_dir"
ts="$(date -u +%Y%m%dT%H%M%SZ)"
file="$out_dir/apzhub-${stack}-${ts}.sql.gz"

echo "[backup] dumping to $file"
docker compose --env-file .env exec -T postgres \
  sh -c 'pg_isready -U "${POSTGRES_USER:-apzhub}" -d "${POSTGRES_DB:-apzhub}" >/dev/null && pg_dump -U "${POSTGRES_USER:-apzhub}" "${POSTGRES_DB:-apzhub}"' \
  | gzip >"$file"

echo "[backup] pruning local files older than ${keep_days} days under $out_dir"
find "$out_dir" -maxdepth 1 -type f -name "apzhub-${stack}-*.sql.gz" -mtime "+${keep_days}" -delete || true

echo "[backup] done. Restore test on staging: gunzip -c $file | docker compose exec -T postgres psql -U apzhub apzhub"
