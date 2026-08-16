#!/usr/bin/env bash
# SPR-UX-001 U0 — run APZHUB web in production on :3300 (standalone).
# Prerequisites: `NODE_ENV=production pnpm --filter @apzhub/web build`
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"
STANDALONE="$WEB/.next/standalone/apps/web"

if [[ ! -f "$STANDALONE/server.js" ]]; then
  echo "Missing standalone server. Run: NODE_ENV=production pnpm --filter @apzhub/web build" >&2
  exit 1
fi

mkdir -p "$STANDALONE/.next"
rm -rf "$STANDALONE/.next/static"
cp -a "$WEB/.next/static" "$STANDALONE/.next/static"
if [[ -d "$WEB/public" ]]; then
  rm -rf "$STANDALONE/public"
  cp -a "$WEB/public" "$STANDALONE/public"
fi

set -a
# shellcheck disable=SC1091
[[ -f "$ROOT/.env" ]] && . "$ROOT/.env"
set +a

export NODE_ENV=production
export PORT="${PORT:-3300}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export APZHUB_WORKSPACE_ROOT="${APZHUB_WORKSPACE_ROOT:-$ROOT}"
export APZHUB_SECRETS_DIR="${APZHUB_SECRETS_DIR:-$ROOT/.secrets}"
# Production must not enable public self-registration by default.
# Stream 1 dogfood: set ALLOW_SELF_SERVE_REGISTER=true (and NEXT_PUBLIC_*) opt-in.
export ALLOW_DEV_REGISTRATION=false
export NEXT_PUBLIC_ALLOW_DEV_REGISTRATION=false
export ALLOW_SELF_SERVE_REGISTER="${ALLOW_SELF_SERVE_REGISTER:-false}"
export NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER="${NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER:-false}"
# Standalone NFT path can trip fail-fast; tolerant mode until U7 hardening
export APZHUB_RUNTIME_FAIL_FAST="${APZHUB_RUNTIME_FAIL_FAST:-false}"

cd "$STANDALONE"
exec node server.js
