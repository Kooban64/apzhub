#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   deploy/scripts/deploy-stack.sh staging|production
#   deploy/scripts/deploy-stack.sh staging|production with-caddy
#
# Default: postgres + migrate + web + worker only (no bundled Caddy). Use for **one host** with
# [`deploy/edge`](../edge/) + [`Caddyfile.dual-host.example`](../Caddyfile.dual-host.example).
#
# Optional second arg `with-caddy` (or APZHUB_BUNDLED_CADDY=1): full stack including per-stack
# Caddy (`--profile bundled-caddy`). Requires `./Caddyfile` next to that stack’s compose file.

stack="${1:-}"
bundled="${2:-}"
if [[ "$stack" != "staging" && "$stack" != "production" ]]; then
  echo "usage: $0 staging|production [with-caddy]" >&2
  exit 1
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/$stack"

if [[ ! -f .env ]]; then
  echo "missing $root/$stack/.env — copy env.example to .env and edit." >&2
  exit 1
fi

if [[ "${APZHUB_BUNDLED_CADDY:-}" == "1" ]] || [[ "$bundled" == "with-caddy" ]]; then
  if [[ ! -f Caddyfile ]]; then
    echo "with-caddy requires $root/$stack/Caddyfile — copy Caddyfile.example" >&2
    exit 1
  fi
  echo "[deploy] building and starting stack: $stack (with bundled-caddy profile)"
  docker compose --env-file .env --profile bundled-caddy up -d --build
  echo "[deploy] done — bundled Caddy enabled; do not duplicate :80/:443 on the same host."
else
  echo "[deploy] building and starting stack: $stack (postgres, migrate, web, worker only)"
  docker compose --env-file .env up -d --build postgres migrate web worker
  echo "[deploy] done — one host + dual hostnames: start edge Caddy from deploy/edge (see deploy/edge/README.md)."
fi

echo "[deploy] Smoke from repo root: BASE_URL=https://staging.apzportal.apzor.com deploy/scripts/smoke.sh"
