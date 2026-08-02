# APZQEP Deployment Guide

| Field     | Value                     |
| --------- | ------------------------- |
| Programme | APZQEP-150-04             |
| Consumes  | Platform 1.2.0 deployment |

## Topology

Follow `docs/operations/platform-1.2.0-production-readiness/DEPLOYMENT-GUIDE.md`.

APZQEP Caps A–F run inside `@apzhub/web`. There is no separate Cap deployable.

## Pre-deploy checklist

1. Feature freeze confirmed (APZQEP-150).
2. `.env.production` hardened (platform guide).
3. Host coexistence validated (`ENVIRONMENT.md`, `pnpm ops:host-coexistence-audit` if available).
4. Operators acknowledge **KNOWN-LIMITATIONS.md** (IN-MEMORY Cap SoR).

## Deploy

```bash
pnpm docker:build:prod   # or platform-equivalent
pnpm db:migrate          # platform metadata only
pnpm docker:up:prod
curl -fsS "$BASE_URL/api/health"
```

## Post-deploy smoke

- Sign-in
- Open `/workspace/qep/suites`, `/execution-plans`, `/execution-workspace`, `/defects`, `/enterprise-requirements`, `/enterprise-reporting`
- Confirm Cap data is process-local (resets on process restart) until Postgres programme

## Not authorised under APZQEP-150

Production Release decision and customer cutover — Owner/Product Board only.
