# Vendor services (Plane, Kimai, …) + APZHUB on one Docker host

This directory holds **reference copies** of compose fragments from the legacy stack under `~/apzportal/docker/compose/` (see `upstream-from-apzportal/`). The live definitions remain in `~/apzportal`; refresh copies when upstream files change.

## Internal names ↔ upstream compose file

| Internal name   | Product    | Upstream file (snapshot in this repo) |
|-----------------|------------|----------------------------------------|
| ApzProjects     | Plane      | `upstream-from-apzportal/plane.yml`    |
| ApzTime         | Kimai      | `upstream-from-apzportal/kimai.yml`  |
| ApzWorkflows    | N8N        | `upstream-from-apzportal/n8n.yml`    |
| ApzDoc          | Paperless  | `upstream-from-apzportal/paperless.yml` |
| ApzServices     | Zammad     | `upstream-from-apzportal/zammad.yml` |
| ApzTesting      | Kiwi-TCMS  | `upstream-from-apzportal/kiwi.yml`   |
| ApzAnalytics    | Metabase   | `upstream-from-apzportal/metabase.yml`|

**Not** copied here: `portal.yml`, `authentik.yml`, `grafana.yml`, `gateway.yml` (portal replacement is APZHUB; other stacks are out of the seven-app set).

## Single Docker network: `apzhub_internal`

APZHUB staging/production compose attaches **postgres**, **web**, **worker**, **migrate**, and **caddy** (when used) to an **external** network named `apzhub_internal`.

1. Create it once on the host:

   ```bash
   docker network create apzhub_internal
   ```

2. When you add vendor compose projects on the same host, attach their services to **the same** external network (same `name: apzhub_internal`). Containers can reach each other by name on that network.

3. **First deploy after this change:** if `docker compose up` fails with “network apzhub_internal not found”, run step 1, then retry.

## Secrets and APIs

- Keep **API keys, DB passwords, and git deploy credentials** only on the host (e.g. `deploy/staging/secrets/` or a path referenced by `APZHUB_HOST_SECRETS_DIR`), never in git.
- Repo-root `/.secrets/` is **gitignored** — prefer the deploy `secrets/` layout documented in `deploy/secrets/README.md`.

## DNS

Per-service hostnames (e.g. `apzprojects.apzportal.apzor.com`) are terminated on your **edge** (Caddy/nginx). Route each hostname to the correct **container:port** on `apzhub_internal`.

## Paperless HTTP remote user (self-hosted identity)

Paperless-ngx can trust an email header from **your** gateway (default `HTTP_X_APZHUB_USER_EMAIL` in [`upstream-from-apzportal/paperless.yml`](upstream-from-apzportal/paperless.yml)). This is optional: set `PAPERLESS_ENABLE_HTTP_REMOTE_USER=false` (and the API variant) if you only use Django username/password until the edge injects the header. No third-party IdP is required—only a reverse proxy you control.

### First-party edge attestation (optional)

APZHUB can mint a short-lived HMAC JWT for the gateway using the same secret family as internal launch JWTs (`signFirstPartyEdgeJwt` in [`lib/edge/first-party-edge-jwt.ts`](../../lib/edge/first-party-edge-jwt.ts)). The gateway verifies `iss` / `aud` (`{base}:first-party-edge`) and `sub` (portal email), then sets the upstream header Paperless expects. Keep verification **only** on your edge; do not expose the signing secret to browsers.

## Community / OSS editions

See [`COMMUNITY_EDITION.md`](COMMUNITY_EDITION.md) for a high-level matrix of free self-hosted vs paid-only features (not legal advice).

## Data migration (vendor DBs)

- Take **vendor-native or engine-native backups** (`pg_dump` per logical database, etc.) from the running legacy volumes.
- Restore into **new** volumes used by compose under this repo or a sibling compose file; **leave legacy volumes untouched** until you decommission the old stack.

### Same-major raw volume copy (Plane / Kimai / Kiwi / Zammad PG)

When legacy data was created with the **same Postgres or MySQL/MariaDB major** as this stack, you can `docker compose stop`, clone with a throwaway `alpine` container (`find /to -mindepth 1 -delete` then `cp -a /from/. /to/`), then `docker compose up -d`. On this host, legacy sources used for the main four were: `apz-stack_plane_pgdata`, `apz-stack_plane_uploads`, `apz-stack_kimai_mysql`, `apz-stack_kimai_var`, `apz-stack_kiwi_db_data`, `apz-stack_kiwi_uploads`, `zammad_postgresql-data`, `zammad_elasticsearch-data`.

**Zammad Postgres password:** copied clusters keep the old SCRAM hash. If `.env.vendor` uses `ZAMMAD_POSTGRES_PASS=zammad` but TCP auth fails, run once: `docker exec apz-zammad-pg psql -U zammad -d zammad_production -c "ALTER USER zammad WITH PASSWORD 'zammad';"` (adjust the password literal to match your env).

## GitHub backup (operator)

Before large infra changes: push branches and tag, e.g. `backup/pre-vendor-migration-YYYYMMDD`. This repo may have **no `origin`** configured on some machines — the tag is still a useful local checkpoint.
