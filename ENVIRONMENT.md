# APZ Platform Environment Record

> Snapshot: 2026-06-28. Update after any stack changes.
> Host: `ip-172-31-22-124` (AWS EC2, Ubuntu 24.04, 8 vCPU, 30 GB RAM, 193 GB disk ~77% used).

## Docker disk usage (post-cleanup 2026-06-28)

Cleanup: unused images + build cache pruned; volumes skipped (8.2 GB unused retained).

| Type        | Total | Active | Size    | Reclaimable                 |
| ----------- | ----- | ------ | ------- | --------------------------- |
| Images      | 33    | 33     | 28.3 GB | —                           |
| Containers  | 42    | 42     | 918 MB  | 0                           |
| Volumes     | 233   | 35     | 10.0 GB | 8.2 GB (unused, not pruned) |
| Build cache | 0     | 0      | 0       | 0                           |

Host disk: **76 GB used / 118 GB free (40%)** — ~71 GB recovered from pre-cleanup 77%.

```
Internet → host nginx (:443 TLS) → Docker nginx-gateway (:8080) → app containers
                                    ↘ direct host proxies (contracts, v2 dev, etc.)
```

- **Primary stack**: `apz-stack` — `/home/ubuntu/apzportal/docker/compose.yml`
- **Cyclos (Boxer)**: separate compose — `/home/ubuntu/boxer/cyclos-local/docker-compose.yml`
- **TLS**: Let's Encrypt on host nginx (`/etc/nginx/sites-enabled/`)
- **Identity (legacy stack)**: Authentik (`apz-authentik-server`) inside apz-stack; gateway uses forward-auth + group maps — **coexistence only; retire when APZPRD is working**
- **Identity (APZHUB)**: **BetterAuth only** — see [OWNER-BETTERAUTH-SOLE-AUTHN](./docs/decisions/OWNER-BETTERAUTH-SOLE-AUTHN.md). Do not add Authentik to the APZHUB login path.
- **Engines**: **Outside the hub** — see [OWNER-ENGINES-OUTSIDE-HUB](./docs/decisions/OWNER-ENGINES-OUTSIDE-HUB.md) · [APZHUB-OWNED-ENGINE-TOPOLOGY](./docs/operations/APZHUB-OWNED-ENGINE-TOPOLOGY.md). Legacy `18081–18088` / `15678` stay for the older platform until APZHUB-owned LTS cutover.
- **Shared DB**: `apzpg` container, host port `54333` (PostgreSQL for authentik, n8n, abode, portal audit, etc.)

## Running Docker Containers (43 apz-stack + 2 cyclos = 45 total)

### User-facing applications

| Container(s)                   | Service                    | Public hostname                      | Host port (debug) | Status  |
| ------------------------------ | -------------------------- | ------------------------------------ | ----------------- | ------- |
| apz-portal                     | Next.js portal hub         | apzportal.apzor.com                  | internal 3000     | healthy |
| cyclos-app + cyclos-db         | Cyclos banking/marketplace | boxer.apzportal.apzor.com            | 18088             | running |
| apz-abode-api, apz-abode-web   | Abode property platform    | abode.apzportal.apzor.com            | internal          | healthy |
| apz-kimai + apz-kimai-db       | Kimai time tracking        | apztime.apzportal.apzor.com          | 18083             | healthy |
| apz-zammad-* (8 containers)    | Zammad helpdesk            | apzservice.apzportal.apzor.com       | 18081             | running |
| apz-paperless + db + redis     | Paperless NGX docs         | apzdocuments.apzportal.apzor.com     | 18082             | healthy |
| apz-metabase + apz-metabase-db | Metabase BI                | apzanalytics.apzportal.apzor.com     | 18084             | healthy |
| apz-plane-* (12 containers)    | Plane project mgmt         | apzprojects.apzportal.apzor.com      | 18085             | running |
| apz-kiwi + apz-kiwi-db         | Kiwi TCMS testing          | apztesting.apzportal.apzor.com       | 18086, 18443      | healthy |
| apz-grafana                    | Grafana dashboards         | apzobservability.apzportal.apzor.com | 18087             | healthy |
| apz-n8n                        | n8n workflows              | apzworkflows.apzportal.apzor.com     | 15678             | healthy |

### Platform / infrastructure (not directly user-facing)

| Container(s)                                                         | Role                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| apz-nginx-gateway                                                    | Internal reverse proxy, Authentik forward-auth, vhost routing |
| apz-authentik-server, apz-authentik-worker, apz-authentik-redis      | SSO / identity provider                                       |
| apzpg                                                                | Shared PostgreSQL (exposed on 0.0.0.0:54333)                  |
| apz-plane-db, apz-plane-mq, apz-plane-redis, apz-plane-minio         | Plane backing services                                        |
| apz-zammad-pg, apz-zammad-es, apz-zammad-redis, apz-zammad-memcached | Zammad backing services                                       |
| apz-paperless-db, apz-paperless-redis                                | Paperless backing services                                    |
| apz-metabase-db                                                      | Metabase backing DB                                           |

## Host nginx sites (`/etc/nginx/sites-enabled/`)

| Config                      | Hostname(s)                      | Backend         | Notes                              |
| --------------------------- | -------------------------------- | --------------- | ---------------------------------- |
| apzportal-wildcard.conf     | `*.apzportal.apzor.com`          | 127.0.0.1:8080  | Wildcard TLS, main entry           |
| 00-apzhub-apzportal.conf    | apzportal.apzor.com              | 127.0.0.1:8080  | Apex portal (overlaps wildcard)    |
| 00-apzhub-apzportal.conf    | staging.apzportal.apzor.com      | 127.0.0.1:3001  | **NOT RUNNING**                    |
| 00-apzauth.conf             | apzauth.apzportal.apzor.com      | 127.0.0.1:8080  | Also routed inside gateway         |
| 05-apzcontracts-portal.conf | apzcontracts.apzportal.apzor.com | 18090/18091     | **NOT RUNNING**                    |
| frontend-v2.conf            | v2.apzportal.apzor.com           | 127.0.0.1:3100  | **NOT RUNNING**                    |
| portal-v2.conf              | pv2.apzportal.apzor.com          | 127.0.0.1:3200  | **NOT RUNNING**                    |
| apztesting.conf             | apztesting.apzportal.apzor.com   | 127.0.0.1:8080  | Dedicated TLS cert                 |
| kiwi-test.conf              | kiwi-test.apzportal.apzor.com    | 127.0.0.1:19443 | **NOT RUNNING** (temp test bypass) |
| Per-subdomain confs         | apztime, apzservice, etc.        | 127.0.0.1:8080  | Redundant with wildcard            |

## Host-level services (non-Docker)

| Service                   | Port    | Notes                                                                         |
| ------------------------- | ------- | ----------------------------------------------------------------------------- |
| nginx                     | 80, 443 | TLS termination, reverse proxy                                                |
| ssh                       | 22      |                                                                               |
| dockerd + containerd      | —       |                                                                               |
| amazon-ssm-agent          | —       | AWS management                                                                |
| node (abode-tokenisation) | 18092   | `/home/ubuntu/applications/abode-tokenisation` — API server, **not in nginx** |

## Code / deploy locations (not all running)

| Path                                            | Purpose                                | Running?                               |
| ----------------------------------------------- | -------------------------------------- | -------------------------------------- |
| `/home/ubuntu/apzportal/`                       | Main monorepo + apz-stack compose      | **YES** (primary)                      |
| `/home/ubuntu/boxer/cyclos-local/`              | Cyclos Docker compose                  | **YES**                                |
| `/home/ubuntu/applications/abode/`              | Abode source (built into stack images) | via stack                              |
| `/home/ubuntu/applications/apzcontracts/`       | OpenContracts (Django)                 | **NO** (nginx configured, ports down)  |
| `/home/ubuntu/applications/apzauth/`            | Separate Authentik fork compose        | **NO** (compose exists, no containers) |
| `/home/ubuntu/applications/abode-tokenisation/` | Tokenisation API (node)                | **PARTIAL** (port 18092 only)          |
| `/home/ubuntu/apzportv4/`                       | Portal v4 compose experiment           | **NO**                                 |
| `/home/ubuntu/apzportal-v3/`                    | Legacy portal v3                       | unknown                                |
| `/home/ubuntu/old-do-not-touch-apzportal/`      | Legacy archive                         | do not touch                           |
| `/home/ubuntu/apz-portal/`                      | APZHUB monorepo (SPR-001)              | **IN DEVELOPMENT**                     |

## APZHUB public hostname (coexistence)

| Item         | Value                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public URL   | **https://apzhub.apzportal.apzor.com**                                                                                                                                                  |
| DNS          | A record → host (coexists with `*.apzportal.apzor.com`)                                                                                                                                 |
| Host nginx   | `/etc/nginx/sites-enabled/05-apzhub-platform.conf` → `127.0.0.1:3300`                                                                                                                   |
| TLS          | Dedicated LE cert `apzhub.apzportal.apzor.com` (wildcard LE cert is **EXPIRED** — do not rely on it for this host)                                                                      |
| Brand sites  | Planned: `apzqa` / `apzqep` / `apzpentest` → same `:3300` (see [MKT-MULTI-SITE-HOSTS](./docs/operations/MKT-MULTI-SITE-HOSTS.md)); Productivity Suite is a later bundle, not a host yet |
| Legacy stack | Unchanged — wildcard still routes other subdomains to gateway `:8080`                                                                                                                   |

**Bring-up (ops):** Postgres `:54334` + Redis `:6380` via APZHUB compose; set `APP_URL` / `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` to the public URL; `NODE_ENV=production`; rebuild `@apzhub/web`; start with `bash scripts/run-web-prod.sh` on **3300** (forces bind `0.0.0.0` — do not inherit shell `HOSTNAME`). After rebuild, **restart** the process so HTML and `/_next/static/chunks/*.css` hashes match (stale deleted-cwd processes serve unstyled pages). Do not bind legacy ports.

## APZHUB development ports (SPR-001)

Dedicated ports for `/home/ubuntu/apz-portal` — chosen to avoid `apz-stack` conflicts (`54333`, `8080`, `18081–18088`, etc.).

**Controls (R12-OPS-03):** [docs/operations/HOST-COEXISTENCE-CONTROLS.md](./docs/operations/HOST-COEXISTENCE-CONTROLS.md) · audit via `pnpm ops:host-coexistence-audit`.

| Service                 | Host port | Notes                             |
| ----------------------- | --------- | --------------------------------- |
| `@apzhub/web` (Next.js) | **3300**  | Public hostname proxies here      |
| Storybook               | **6006**  | `pnpm storybook`                  |
| PostgreSQL (`apzhub`)   | **54334** | Docker; legacy `apzpg` uses 54333 |
| Redis                   | **6380**  | Docker                            |
| Meilisearch             | **17700** | Docker (`apzhub-meilisearch`)     |
| Caddy HTTP              | **3080**  | Optional local reverse proxy      |
| Caddy HTTPS             | **3443**  | `tls internal` for local dev      |

### APZHUB-owned CE/LTS engines (reserved ports · bring-up per sprint)

See [APZHUB-OWNED-ENGINE-TOPOLOGY](./docs/operations/APZHUB-OWNED-ENGINE-TOPOLOGY.md). Never reuse legacy `18081–18088` / `15678`.

**Hard rule:** Do **not** stop, restart, or reconfigure legacy `apz-*` / Authentik until Owner confirms APZHUB is a solid working product ([OWNER-ENGINES-OUTSIDE-HUB](./docs/decisions/OWNER-ENGINES-OUTSIDE-HUB.md) · [SPR-ADOPT-004](./docs/sprint/SPR-ADOPT-004-lts-backed-engines-dogfood.md)).

| Service (planned) | Host port | Product                                                              |
| ----------------- | --------- | -------------------------------------------------------------------- |
| Zammad LTS        | **19081** | Support — **UP** (`apzhub-zammad-lts`)                               |
| Paperless LTS     | **19082** | Documents DMS — **UP** (`apzhub-paperless-lts`) · foundation adapter |
| Kimai LTS         | **19083** | Time — **UP** (`apzhub-kimai-lts`)                                   |
| Metabase LTS      | **19084** | Analytics — **UP** (`apzhub-metabase-lts`)                           |
| Plane LTS         | **19085** | Projects — **UP** (`apzhub-plane-lts`)                               |
| n8n LTS           | **19678** | Workflow — **UP** (`apzhub-n8n-lts`)                                 |

\*Native Documents SoR remains primary; DMS is optional health/list via `/api/v1/documents/dms/*` ([ADR-0095](./docs/adr/ADR-0095-paperless-ngx-documents-dms-provider.md)).

Compose file: `infrastructure/docker/docker-compose.dev.yml`

### Entity mapping persistence (OSS-110-05)

| Variable                                    | Default                                 | Notes                              |
| ------------------------------------------- | --------------------------------------- | ---------------------------------- |
| `ENTITY_MAPPING_STORE_MODE`                 | `memory` (non-prod) / `postgres` (prod) | `memory` \| `postgres`             |
| `ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION` | `false`                                 | Explicit escape hatch only         |
| `DATABASE_URL`                              | required for postgres mode              | Never silently fall back to memory |

Apply schema with `pnpm db:migrate` (includes `0015_platform_entity_mapping`).

## Listening ports summary

| Port        | Listener                | Exposure                                       |
| ----------- | ----------------------- | ---------------------------------------------- |
| 22          | ssh                     | public                                         |
| 80, 443     | host nginx              | public                                         |
| 8080        | apz-nginx-gateway       | localhost only                                 |
| 54333       | apzpg PostgreSQL        | **0.0.0.0** (security note)                    |
| 15678       | n8n                     | localhost                                      |
| 19081       | APZHUB Zammad LTS       | localhost — `apzhub-zammad-lts` when running   |
| 19083       | APZHUB Kimai LTS        | localhost — `apzhub-kimai-lts` when running    |
| 19084       | APZHUB Metabase LTS     | localhost — `apzhub-metabase-lts` when running |
| 19678       | APZHUB n8n LTS          | localhost — `apzhub-n8n-lts` when running      |
| 19085       | APZHUB Plane LTS        | localhost — `apzhub-plane-lts` when running    |
| 18081–18088 | various apps            | localhost                                      |
| 18092       | abode-tokenisation node | all interfaces                                 |
| 18443       | Kiwi HTTPS              | localhost                                      |
| 3300        | APZHUB web (dev)        | localhost — when `pnpm dev` running            |
| 54334       | APZHUB PostgreSQL       | localhost — when APZHUB compose running        |
| 6380        | APZHUB Redis            | localhost — when APZHUB compose running        |
| 17700       | APZHUB Meilisearch      | localhost — when APZHUB compose running        |
| 3080, 3443  | APZHUB Caddy            | localhost — when APZHUB compose running        |
| 6006        | APZHUB Storybook        | localhost — when `pnpm storybook` running      |

## Networks

- `apz_frontend` — gateway ↔ apps
- `apz_backend` — apps ↔ databases
- `cyclos-local_default` — cyclos internal
- Cyclos app also attached to `apz_frontend` (reachable from gateway)

## Confirmed NOT running (nginx may still reference them)

- apzcontracts (18090 UI, 18091 API)
- staging portal (3001)
- frontend-v2 dev (3100)
- portal-v2 (3200)
- kiwi-test standalone (19443)
- apzportv4 stack
- apzauth standalone compose (15432/16379 not listening)
- pm2 — not installed/used
