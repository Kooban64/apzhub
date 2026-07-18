# APZHUB Production Deployment Guide

> **Programme:** PRH-012–018 — Production Hardening & Operational Readiness  
> **Story:** PRH-012  
> **Audience:** Platform operators  
> **Coexistence:** Aligns with [ENVIRONMENT.md](../../ENVIRONMENT.md) — do not collide with legacy `apz-stack` ports

---

## Purpose

Definitive self-hosted deployment guide for `@apzhub/web` (and optional law-platform) with PostgreSQL, Redis, and Caddy. Covers **staging** and **production** profiles.

---

## Architecture (self-hosted)

```text
Internet / TLS edge (host nginx or Caddy)
        ↓
  Caddy (optional reverse proxy)  :3080 / :3443
        ↓
  Next.js @apzhub/web             :3300
        ↓
  PostgreSQL (platform)           :54334 (dev host map) / internal in prod
  Redis                           :6380 (dev host map) / internal in prod
```

Workers (outbox) run **outside** HTTP request handlers:

```text
pnpm worker:outbox [--once]
```

---

## Port coexistence (mandatory)

| Service          | APZHUB port         | Legacy `apz-stack` (avoid) |
| ---------------- | ------------------- | -------------------------- |
| Web              | **3300**            | 3000 / 8080 gateway        |
| PostgreSQL       | **54334**           | 54333 (`apzpg`)            |
| Redis            | **6380**            | stack Redis                |
| Caddy HTTP/HTTPS | **3080** / **3443** | host nginx 80/443          |

See [ENVIRONMENT.md](../../ENVIRONMENT.md).

---

## Prerequisites

- Node.js LTS + `pnpm`
- Docker + Docker Compose (for Postgres/Redis/Caddy)
- Secrets manager or secure env injection (Vault deferred to PCv2-04)
- TLS certificates at the edge

---

## Staging profile

| Setting                                               | Value                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| `NODE_ENV`                                            | `production` (or `staging` if supported by validation)              |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` | Staging public URL                                                  |
| `DATABASE_URL`                                        | Staging Postgres                                                    |
| `REDIS_URL`                                           | Staging Redis                                                       |
| `AUTHORIZATION_PROVIDER_MODE`                         | `production`                                                        |
| `ENTITY_MAPPING_STORE_MODE`                           | `postgres`                                                          |
| `ALLOW_DEV_REGISTRATION`                              | `false`                                                             |
| Compose                                               | `infrastructure/docker/docker-compose.dev.yml` (or staging overlay) |

### Staging bring-up

```bash
cd /home/ubuntu/apz-portal
cp .env.example .env   # then edit secrets
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d postgres redis
pnpm install
pnpm db:migrate
pnpm --filter @apzhub/web build
pnpm --filter @apzhub/web start   # PORT=3300
# optional edge:
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d caddy
```

### Staging health probes

| Probe               | URL                                  | Expect                                  |
| ------------------- | ------------------------------------ | --------------------------------------- |
| Liveness / health   | `GET /api/health`                    | `200`, `status: healthy` (deps healthy) |
| Platform API health | `GET /api/v1/health`                 | Authenticated envelope when required    |
| Event Bus health    | `GET /api/v1/platform/events/health` | Authenticated                           |

---

## Production profile

| Setting                                     | Value                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `NODE_ENV`                                  | `production`                                                                    |
| Secrets                                     | Strong unique `BETTER_AUTH_SECRET` (≥32 chars); no defaults from `.env.example` |
| `AUTHORIZATION_PROVIDER_MODE`               | `production`                                                                    |
| `ENTITY_MAPPING_STORE_MODE`                 | `postgres`                                                                      |
| `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION`     | unset / `false`                                                                 |
| `ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION` | unset / `false`                                                                 |
| `APZHUB_WEBHOOK_INGRESS_SECRET`             | Set if webhook ingress is exposed                                               |
| `APZHUB_OUTBOX_WORKER_ENABLED`              | `true` when draining outbox                                                     |
| CSP                                         | Enforced (not Report-Only) — PRH-002                                            |
| Rate limits                                 | Auth + privileged APIs — PRH-005                                                |
| TLS                                         | Mandatory at edge                                                               |

### Production bring-up (checklist)

1. Provision Postgres + Redis (dedicated instance; backups enabled).
2. Inject env from secret store (never commit `.env`).
3. `pnpm install --frozen-lockfile`
4. `pnpm db:migrate` (see [Upgrade & Rollback Guide](./APZHUB-Platform-Upgrade-Rollback-Guide.md))
5. `pnpm --filter @apzhub/web build && pnpm --filter @apzhub/web start`
6. Start `pnpm worker:outbox` as a supervised process (systemd/supervisor).
7. Configure Caddy/nginx TLS + reverse proxy to `:3300`.
8. Run [Production Operations Checklist](./APZHUB-Production-Operations-Checklist.md).
9. Run production smoke: `pnpm test:production-smoke` against the target URL.

---

## Environment variables (core)

Refer to [`.env.example`](../../.env.example). Minimum production set:

| Variable                                              | Required           |
| ----------------------------------------------------- | ------------------ |
| `DATABASE_URL`                                        | Yes                |
| `REDIS_URL`                                           | Yes                |
| `BETTER_AUTH_SECRET`                                  | Yes                |
| `BETTER_AUTH_URL` / `APP_URL` / `NEXT_PUBLIC_APP_URL` | Yes                |
| `PLATFORM_VERSION` / `BUILD_NUMBER`                   | Recommended        |
| `AUTHORIZATION_PROVIDER_MODE`                         | Yes (`production`) |

---

## Migrations

```bash
pnpm db:migrate
```

Journal: `packages/config/drizzle/meta/_journal.json`  
SQL: `packages/config/drizzle/*.sql`

Never edit applied journal entries in production. Failed migration → follow rollback guide.

---

## Caddy (optional edge)

Dev compose maps **3080/3443**. Production may use host nginx or Caddy with TLS. Edge rate-limit configuration is documented under traffic governance (PRH-005); dedicated gateway service is **PCv2-09** (out of scope).

---

## Explicit non-goals (this guide)

- M17 GitHub Actions CI pipeline
- Vault secret backend (PCv2-04)
- BullMQ / PCv2-08 workers platform
- Commercial provisioning UI (OSS-100-12+ / PCv2-03)
- New OSS adapters (Kimai, etc.)

---

## Related

- [Upgrade & Rollback Guide](./APZHUB-Platform-Upgrade-Rollback-Guide.md)
- [Production Operations Checklist](./APZHUB-Production-Operations-Checklist.md)
- [Operational Readiness Guide](./APZHUB-Operational-Readiness-Guide.md)
- [Production Verification Guide](./APZHUB-Production-Verification-Guide.md)
