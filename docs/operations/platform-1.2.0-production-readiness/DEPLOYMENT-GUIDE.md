# Deployment Guide — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A1 / A7

## Topology

```text
Clients
   ↓
Host nginx (optional public TLS) OR Caddy public ACME
   ↓
Caddy (APZHUB) :3080/:3443  [coexistence defaults]
   ↓
web (apzhub/web:1.2.0) :3300
   ↓
postgres :5432 (host 54334) · redis :6379 (host 6380)
```

## Prerequisites

1. Copy `.env.production.example` → `.env.production` and harden (A3).
2. Disk & coexistence: `pnpm ops:capacity-check` (A5).
3. Change record approved (A7).

## Deploy steps

```bash
# 1) Build versioned image
export BUILD_NUMBER="$(date -u +%Y%m%dT%H%M%SZ)"
pnpm docker:build:prod

# 2) Migrate platform DB (from host against exposed 54334, or one-shot)
pnpm db:migrate

# 3) Start stack
pnpm docker:up:prod

# 4) Smoke
PLAYWRIGHT_BASE_URL="https://${APZHUB_HOSTNAME}:3443" pnpm test:production-smoke
# or http://127.0.0.1:3080 when using host nginx TLS termination
```

## Image versioning

| Tag                               | Meaning                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| `apzhub/web:1.2.0`                | Platform SemVer floating patch line pointer for this freeze |
| `apzhub/web:1.2.0-<BUILD_NUMBER>` | Immutable build                                             |

Labels: `apzhub.platform.version`, OCI `org.opencontainers.image.version`.

## Outbox worker

Run outside request handlers (host or separate unit):

```bash
pnpm worker:outbox
```

## Rollback

See [ROLLBACK-GUIDE.md](./ROLLBACK-GUIDE.md).
