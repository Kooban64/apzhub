#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NET="${APZHUB_DOCKER_NETWORK:-apzhub_internal}"
VEND="$ROOT/deploy/vendor-services"

if docker ps -a --format '{{.Names}}' | grep -qE '^apz-(n8n|kimai|plane-api|metabase|paperless|zammad-rails|kiwi)$'; then
  echo "Warning: apz-* vendor containers already exist. Stop the legacy ~/apzportal stack first to avoid name clashes." >&2
fi

if ! docker network inspect "$NET" >/dev/null 2>&1; then
  docker network create "$NET"
fi

cd "$VEND"
exec docker compose \
  --project-name apzhub-vendors \
  --env-file image-pins.env \
  --env-file .env.vendor \
  "$@"
