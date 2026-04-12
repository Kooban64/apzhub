#!/usr/bin/env bash
set -euo pipefail

# Quick post-deploy checks (no auth). Set BASE_URL to public origin or http://127.0.0.1:PORT
# Example: BASE_URL=https://staging.example.com ./deploy/scripts/smoke.sh

base="${BASE_URL:-http://127.0.0.1:3000}"
base="${base%/}"

echo "[smoke] GET $base/api/health"
curl -fsS "$base/api/health"
echo

echo "[smoke] GET $base/login (expect 200)"
curl -fsS -o /dev/null -w "%{http_code}\n" "$base/login"

echo "[smoke] ok — now sign in to Admin and confirm the health strip + provisioning + launch paths (see docs/DEPLOYMENT.md §8)."

if [[ "${PREFLIGHT:-}" == "1" ]]; then
  echo "[smoke] PREFLIGHT=1 — npm run verify:preflight (optional APZHUB_PREFLIGHT_ENV_FILE=path/to/.env; see docs/DEPLOYMENT.md Go-live matrix)."
  if command -v npm >/dev/null 2>&1; then
    repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
    if [[ -n "${APZHUB_PREFLIGHT_ENV_FILE:-}" ]]; then
      (cd "$repo_root" && npm run verify:preflight -- "$APZHUB_PREFLIGHT_ENV_FILE")
    else
      (cd "$repo_root" && npm run verify:preflight)
    fi
  else
    echo "[smoke] npm not found; skip verify:preflight"
  fi
fi
