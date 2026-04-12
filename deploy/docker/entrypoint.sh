#!/bin/sh
set -e
# Hydrate env vars that must not use node:fs in client-importable modules (see lib/adapters/env.ts).
# Expects *_FILE paths (e.g. /run/secrets/...) mounted read-only.
read_one_line() {
  f=$1
  if [ ! -f "$f" ]; then
    return 0
  fi
  tr -d '\r' <"$f" | awk 'NR==1{print; exit}'
}

if [ -n "${APZHUB_LAUNCH_JWT_SIGNING_SECRET_FILE:-}" ]; then
  v=$(read_one_line "$APZHUB_LAUNCH_JWT_SIGNING_SECRET_FILE")
  if [ -n "$v" ]; then
    export APZHUB_LAUNCH_JWT_SIGNING_SECRET="$v"
  fi
fi

if [ -n "${APZHUB_LAUNCH_OIDC_STATE_SECRET_FILE:-}" ]; then
  v=$(read_one_line "$APZHUB_LAUNCH_OIDC_STATE_SECRET_FILE")
  if [ -n "$v" ]; then
    export APZHUB_LAUNCH_OIDC_STATE_SECRET="$v"
  fi
fi

# Session cookies are signed with resolveSessionSigningSecret() (env + *_FILE). The Next proxy
# decodes via getSessionSigningSecretFromEnv() (inline env only, no fs) — hydrate so they match.
if [ -n "${APZHUB_SESSION_SIGNING_SECRET_FILE:-}" ]; then
  v=$(read_one_line "$APZHUB_SESSION_SIGNING_SECRET_FILE")
  if [ -n "$v" ]; then
    export APZHUB_SESSION_SIGNING_SECRET="$v"
  fi
fi

exec "$@"
