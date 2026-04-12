# Docker deployment (Step 16)

Two **separate** stacks: [`staging/`](staging/) and [`production/`](production/). Each has its own Postgres volume, compose project name, and secrets directory. **Never** share a database or secret files between staging and production.

Operational checklist, smoke tests, rollback, and backups are documented in [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) (see **§8 Docker**). What survives **`docker compose` rebuilds vs what wipes data** (`down -v`, volumes) is spelled out in [docs/DATA_PERSISTENCE.md](../docs/DATA_PERSISTENCE.md).

## Locked approach: one host (APZ)

**Model**

- **One** machine (`32.192.31.113`).
- **One** edge Caddy terminating TLS for both hostnames.
- Use [`deploy/Caddyfile.dual-host.example`](Caddyfile.dual-host.example) via the small edge stack in [`deploy/edge/`](edge/).
- Each stack’s `web` publishes a **different host port** via `APZHUB_WEB_PUBLISH_PORT` (defaults: **staging `3001`**, **production `3000`** — see `env.example` files).

**Rules**

- Do **not** run two compose **`caddy`** services on the same host (both want `:80` / `:443`).
- Default `docker compose up` for each app stack starts **`postgres`**, **`migrate`**, **`web`**, **`worker`** only. Bundled per-stack Caddy is opt-in: `docker compose --profile bundled-caddy up -d` (only on a **dedicated** host per stack, with that stack’s `Caddyfile`).
- After both stacks are up, start **one** Caddy from [`deploy/edge`](edge/) (host network — see [`deploy/edge/README.md`](edge/README.md)).

**Image build:** only the **`web`** service declares `build:`; **`migrate`** and **`worker`** reuse the same `image:` tag so Compose does not run three parallel exports into one tag (avoids the `image … already exists` race). `docker compose … up -d --build postgres migrate web worker` is therefore safe; optional explicit first build: `docker compose … build web`.

### Path B: host nginx already uses `:80` / `:443` (APZ)

If **system nginx** (or another reverse proxy) already binds 80/443, do **not** start `deploy/edge` Caddy on the same host. Instead:

1. Install the APZHUB vhost (wildcard TLS paths must match your server):

   ```bash
   sudo cp deploy/nginx/00-apzhub-apzportal.conf /etc/nginx/sites-available/
   sudo ln -sf /etc/nginx/sites-available/00-apzhub-apzportal.conf /etc/nginx/sites-enabled/00-apzhub-apzportal.conf
   ```

2. **Remove the apex hostname** from the old catch-all that proxies to `:8080` — in `/etc/nginx/sites-available/apzportal-wildcard.conf` use only `server_name *.apzportal.apzor.com;` (not `apzportal.apzor.com`) so `apzportal.apzor.com` is handled only by the APZHUB block.

3. `sudo nginx -t && sudo systemctl reload nginx`

4. Publish staging/production `web` on host ports **3001** / **3000** as in [`deploy/Caddyfile.dual-host.example`](Caddyfile.dual-host.example).

**Deploy order (summary)**

Staging app stack → staging checks → production app stack → **one** edge Caddy → production checks. Details below.

### First real run on the server (one host)

1. **Staging app stack** — Create `deploy/staging/.env` (from `env.example`) and staging secrets dir (`APZHUB_HOST_SECRETS_DIR`). From `deploy/staging`:

   ```bash
   docker compose --env-file .env up -d --build postgres migrate web worker
   ```

   (Or from repo root: `deploy/scripts/deploy-stack.sh staging`.)

2. **Staging verification** — Until edge TLS is up, you can smoke the published port directly, e.g. `BASE_URL=http://127.0.0.1:3001 ./deploy/scripts/smoke.sh`. For **`https://staging.apzportal.apzor.com`**, DNS must point at the host and **`deploy/edge`** Caddy must be running (you may start edge after step 1; the production site block may **502** until step 3 is done). Then check in the browser: login, admin, users/access, provisioning queue, one launch path, launch event visibility, health strip.

3. **Production app stack** — Create `deploy/production/.env` and **separate** production secrets. From `deploy/production`:

   ```bash
   docker compose --env-file .env up -d --build postgres migrate web worker
   ```

4. **Edge Caddy once** — From `deploy/edge`: `cp ../Caddyfile.dual-host.example ./Caddyfile`, then `docker compose up -d`. Confirm **ACME / certificates** for both hostnames (`docker compose logs caddy`). Do **not** also enable `bundled-caddy` on the app stacks on this host.

5. **Production verification** — `BASE_URL=https://apzportal.apzor.com ./deploy/scripts/smoke.sh` and repeat the same manual checks as staging.

### If something fails — what to send

Include exactly these four items so the first deployment can be narrowed quickly:

1. **Edge** — Confirm one host; confirm **`deploy/edge`** was used (not per-stack `bundled-caddy` on the same box).
2. **TLS** — Caddy log lines showing certificate success, **or** the full ACME error text.
3. **Smoke** — Pass or fail, and the **exact** `BASE_URL` you used.
4. **First failure** — From the relevant stack directory (`deploy/staging` or `deploy/production`):

   ```bash
   docker compose --env-file .env logs --tail=200 migrate
   docker compose --env-file .env logs --tail=200 web
   docker compose --env-file .env logs --tail=200 postgres
   ```

   Plus the **browser or admin symptom** (e.g. 502, blank page, login error).

**Scripts**

- [`deploy/scripts/deploy-stack.sh`](scripts/deploy-stack.sh) `staging|production` — app stack only (no bundled Caddy).
- [`deploy/scripts/deploy-stack.sh`](scripts/deploy-stack.sh) `staging|production` `with-caddy` — includes bundled Caddy (needs `./Caddyfile` in that stack dir).

## DNS and TLS (APZ deployment)

| Use | Hostname | DNS |
|-----|----------|-----|
| Production | `apzportal.apzor.com` | A (or AAAA) → `32.192.31.113` |
| Staging | `staging.apzportal.apzor.com` | A (or AAAA) → `32.192.31.113` |

Open **TCP 80** and **TCP 443** on the host for ACME and HTTPS.

Smoke (from repo root after TLS works):

```bash
BASE_URL=https://staging.apzportal.apzor.com ./deploy/scripts/smoke.sh
BASE_URL=https://apzportal.apzor.com ./deploy/scripts/smoke.sh
```

## Two dedicated hosts (optional)

If staging and production each have their **own** server, you may use **per-stack** Caddy: copy `deploy/<stack>/Caddyfile.example` → `Caddyfile`, then:

```bash
docker compose --env-file .env --profile bundled-caddy up -d --build
```

(or `APZHUB_BUNDLED_CADDY=1 deploy/scripts/deploy-stack.sh staging with-caddy`).

## Server layout (recommended)

```text
/opt/apzhub/app       # git checkout or release artifact (no secrets in tree)
/opt/apzhub/deploy    # copy or symlink this repo `deploy/` subtree
/opt/apzhub/secrets   # host files mounted read-only to /run/secrets (separate dirs per env recommended)
/opt/apzhub/data      # optional: bind-mount Postgres data instead of named volume
/opt/apzhub/backups   # pg_dump output (see scripts/backup-postgres.sh)
```

Point `APZHUB_HOST_SECRETS_DIR` in each stack’s `.env` at that stack’s secrets directory (e.g. `/opt/apzhub/secrets-staging` vs `/opt/apzhub/secrets-production`).

## Bootstrap superadmin (local identity)

After the stack is up and migrations have run, create the first operator account (idempotent on email):

```bash
docker compose -f deploy/staging/docker-compose.yml --env-file deploy/staging/.env run --rm --no-deps \
  -e APZHUB_SEED_IDENTITY_EMAIL='you@example.com' \
  -e APZHUB_SEED_IDENTITY_PASSWORD='your-secure-password' \
  -e APZHUB_SEED_IDENTITY_PLATFORM_ROLE=superadmin \
  -e APZHUB_SEED_IDENTITY_DISPLAY_NAME='Your Name' \
  web npm run db:seed
```

Optional env: `APZHUB_SEED_IDENTITY_*` are documented in [`scripts/seed-local-identity.ts`](../scripts/seed-local-identity.ts). Hub password minimum length is centralized in [`lib/identity/password-policy.ts`](../lib/identity/password-policy.ts) (seeds, admin APIs, and password reset all align to the same minimum).

## Bulk import: legacy vendor users → portal + admin matrix

When Plane / Zammad / Kimai / Kiwi / Paperless / n8n run as Docker services on the same host (see `deploy/vendor-services/`), you can merge their user lists into APZHUB `users`, set a shared initial password for **new** accounts, and write per-vendor service overrides so the admin access matrix reflects legacy roles. Run from the **app** container (same secrets as migrate). Override DB URLs if needed: `APZHUB_IMPORT_PAPERLESS_DATABASE_URL`, `APZHUB_IMPORT_N8N_DATABASE_URL` (n8n is skipped with a warning if the Postgres database is not provisioned, e.g. SQLite-only n8n).

```bash
docker compose -f deploy/staging/docker-compose.yml --env-file deploy/staging/.env run --rm --no-deps \
  -e APZHUB_IMPORT_DEFAULT_PASSWORD='choose-a-long-password-here' \
  web npm run db:import-legacy-users
```

Optional: `APZHUB_IMPORT_RESET_PASSWORDS=1` (rewrites password hashes for existing users too — use only on staging). See header comment in [`scripts/import-legacy-vendor-users-to-portal.ts`](../scripts/import-legacy-vendor-users-to-portal.ts). Community vs paid feature notes: [`deploy/vendor-services/COMMUNITY_EDITION.md`](vendor-services/COMMUNITY_EDITION.md).

## First-time setup

1. Copy [`deploy/secrets/*.example`](secrets/) to each stack’s host secrets dir **without** the `.example` suffix. See [`deploy/secrets/README.md`](secrets/README.md).
2. Copy `deploy/<stack>/env.example` → `deploy/<stack>/.env` and edit (especially `APZHUB_PUBLIC_BASE_URL`, `APZHUB_WEB_PUBLISH_PORT`, OIDC templates, `NEXT_PUBLIC_*`).
3. **One host:** do **not** rely on per-stack `Caddyfile` for go-live; use [`deploy/edge`](edge/) after stacks are up. **Dedicated host per stack:** copy `Caddyfile.example` → `Caddyfile` and use `with-caddy` or `--profile bundled-caddy`.
4. Run [`deploy/scripts/deploy-stack.sh`](scripts/deploy-stack.sh) `staging` then `production` (one-host), or enable bundled Caddy per stack on separate servers.

## Startup order (per app stack)

Postgres (healthy) → **migrate** (must succeed) → **web** (healthy) → **worker**.

Edge Caddy ([`deploy/edge`](edge/)) or bundled Caddy profile: start only after the relevant **`web`** service(s) are reachable on the published host ports.

## Scripts

| Script | Purpose |
|--------|---------|
| [`deploy-stack.sh`](scripts/deploy-stack.sh) | Build and `up -d` app stack; optional `with-caddy` |
| [`smoke.sh`](scripts/smoke.sh) | Curl `/api/health` and `/login` |
| [`backup-postgres.sh`](scripts/backup-postgres.sh) | `pg_dump` via `docker compose exec` |

Make them executable on the server: `chmod +x deploy/scripts/*.sh`.

## Image

Built from [`deploy/docker/Dockerfile`](docker/Dockerfile) with root context = **repository root**. Entrypoint: [`deploy/docker/entrypoint.sh`](docker/entrypoint.sh) (launch JWT/OIDC `*_FILE` → env before Node starts).
