# Data persistence across builds and restarts

APZHUB is designed so **durable state lives outside the application container**. Rebuilding or restarting **`web`** or **`worker`** does not erase users, access rows, sessions, migrations, or launch telemetry when you use the provided Docker layout.

## What persists (by default in staging / production compose)

| Data | Where it lives |
|------|----------------|
| Portal users, credentials, sessions | **Postgres** (`users`, `user_credentials`, `user_sessions`, …) |
| Access assignments, overrides, flags | **Postgres** (`access_subject_*`) |
| Provisioning jobs and realization overlay | **Postgres** |
| Launch events (when enabled) | **Postgres** |
| Postgres itself | Docker **named volume** `postgres_data` → `/var/lib/postgresql/data` in the `postgres` service ([`deploy/staging/docker-compose.yml`](../deploy/staging/docker-compose.yml), [`deploy/production/docker-compose.yml`](../deploy/production/docker-compose.yml)) |
| Secrets (DB URL, session JWT, launch secrets, SMTP) | **Host directory** mounted read-only at `/run/secrets` (`APZHUB_HOST_SECRETS_DIR`, see [`deploy/secrets/README.md`](../deploy/secrets/README.md)) |

Re **`docker compose build` / `up --build`**: only the **`web`** image layers are rebuilt. The **`postgres`** container and its volume are unchanged unless you explicitly remove them.

## What does not persist (ephemeral)

| Item | Notes |
|------|--------|
| Anything written only inside **`web`** or **`worker`** filesystem | Containers are disposable; no app feature should rely on writing there for durability. |
| **`NEXT_PUBLIC_*` values** | Resolved at **image build** time for the browser bundle. Changing `.env` alone does not change client behavior until you **rebuild** `web` (see [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) Go-live matrix). |
| In-memory / mock adapters | With `APZHUB_*_SOURCE=mock`, data is not in Postgres. |

## Operations that can delete or orphan data (avoid in production)

- **`docker compose down -v`** — the `-v` flag **removes named volumes** for the project, including **`postgres_data`**. That wipes the database. Use **`docker compose down`** (no `-v`) for normal restarts.
- **`docker volume rm …`** — same effect as above for that volume.
- **Recreating Postgres with a new empty volume** without restore — treat as disaster unless you have backups.
- **Pointing `APZHUB_DATABASE_URL` at a different database** — the app will show whatever that DB contains; it does not migrate data between hosts automatically.

## Optional: bind-mount Postgres data to the host

For easier host-level backup/SAN snapshots, you can replace the named volume with a bind mount (see [`deploy/README.md`](../deploy/README.md) paths under `/opt/apzhub/data`). Keep permissions and one-writer discipline (only one Postgres instance on that path).

## Backups

Use scheduled **`pg_dump`** (or your platform snapshot) and store dumps **off the application host**. See [`deploy/scripts/backup-postgres.sh`](../deploy/scripts/backup-postgres.sh) and [`deploy/README.md`](../deploy/README.md).

## Local development

- With **Docker**: same rules — keep the **`postgres_data`** volume unless you intend to reset.
- With **Postgres on localhost** and `DATABASE_URL`: data persists in that server’s data directory; rebuilding Next.js does not touch it.

## Checklist before “we lost everything after deploy”

1. Confirm **`postgres`** service is healthy and still using the **same** `postgres_data` volume (`docker volume ls`, `docker compose ps`).
2. Confirm **`APZHUB_DATABASE_URL` / `*_FILE`** still points at that instance.
3. Confirm nobody ran **`down -v`** or volume prune on production.
4. Run **`npm run db:migrate`** (or the compose `migrate` service) after upgrades so **schema** matches the new image; migrations do not delete business data by design.

For environment and access-mode alignment, see [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) and [`docs/PLATFORM_UX_BACKLOG.md`](PLATFORM_UX_BACKLOG.md).
