# Production Configuration — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A3  
> **Template:** `.env.production.example`

## Required variables

| Variable                                    | Production value            | Notes                     |
| ------------------------------------------- | --------------------------- | ------------------------- |
| `NODE_ENV`                                  | `production`                | Mandatory                 |
| `APP_URL` / `NEXT_PUBLIC_APP_URL`           | `https://<hostname>`        | Must match TLS hostname   |
| `ALLOW_DEV_REGISTRATION`                    | `false`                     | Also `NEXT_PUBLIC_*`      |
| `BETTER_AUTH_SECRET`                        | ≥32 chars random            | `openssl rand -base64 48` |
| `BETTER_AUTH_URL`                           | Same as public URL          | Auth only                 |
| `AUTHORIZATION_PROVIDER_MODE`               | `production`                | **Never** `allow-all`     |
| `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION`     | `false`                     | Hard block                |
| `POSTGRES_PASSWORD`                         | Strong secret               | Compose required          |
| `DATABASE_URL`                              | Postgres DSN                | Host tools / migrate      |
| `REDIS_URL`                                 | Redis DSN                   |                           |
| `LAW_REPOSITORY_MODE`                       | `postgres`                  |                           |
| `ENTITY_MAPPING_STORE_MODE`                 | `postgres`                  |                           |
| `ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION` | `false`                     |                           |
| `PLATFORM_VERSION`                          | `1.2.0`                     | Health metadata           |
| `APZHUB_HOSTNAME`                           | Public/coexistence hostname | Caddy                     |

## Secret management

1. Store `.env.production` only on the host (mode `0600`).
2. Never commit secrets; never paste into tickets.
3. Rotate `BETTER_AUTH_SECRET` under Change with session invalidation.
4. Integration tokens (Plane/Zammad) via env refs — not in git.

## Authentication / authorization

- Better Auth = authentication only.
- APZHUB owns permissions; `AUTHORIZATION_PROVIDER_MODE=production` is authoritative.
- Dev registration **disabled**.

## Explicitly unchanged / gated

- Workflow Execute remains gated (`WORKFLOW_EXECUTE_GATED`).
- Email SoR not configured as platform SoR.
- FIN-001 not extracted.
