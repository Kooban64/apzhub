# Secret files (host layout)

On the server, keep real secret files **outside** the git checkout, e.g. under `/opt/apzhub/secrets/`, and point `APZHUB_HOST_SECRETS_DIR` in `deploy/staging/.env` or `deploy/production/.env` at that directory.

Compose mounts the directory read-only at **`/run/secrets`** in app containers. **Do not commit real values.**

## Required files for the bundled compose stacks

| Host filename (example) | In-container path | Consumed via |
|-------------------------|--------------------|--------------|
| `postgres_password` | `/run/secrets/postgres_password` | `POSTGRES_PASSWORD_FILE` (Postgres image) |
| `db_url` | `/run/secrets/db_url` | `APZHUB_DATABASE_URL_FILE` → [`loadAppSecrets`](../../lib/config/secrets.ts) / [`db/client`](../../db/client.ts) |
| `session_signing_secret` | `/run/secrets/session_signing_secret` | `APZHUB_SESSION_SIGNING_SECRET_FILE` |
| `launch_jwt_signing_secret` | `/run/secrets/launch_jwt_signing_secret` | `APZHUB_LAUNCH_JWT_SIGNING_SECRET_FILE` → entrypoint exports `APZHUB_LAUNCH_JWT_SIGNING_SECRET` (see [`deploy/docker/entrypoint.sh`](../docker/entrypoint.sh)) |
| `launch_oidc_state_secret` | `/run/secrets/launch_oidc_state_secret` | `APZHUB_LAUNCH_OIDC_STATE_SECRET_FILE` → entrypoint exports `APZHUB_LAUNCH_OIDC_STATE_SECRET` |
| `smtp_host` | `/run/secrets/smtp_host` | `APZHUB_SMTP_HOST_FILE` |
| `smtp_user` | `/run/secrets/smtp_user` | `APZHUB_SMTP_USER_FILE` |
| `smtp_password` | `/run/secrets/smtp_password` | `APZHUB_SMTP_PASSWORD_FILE` |
| `smtp_from` | `/run/secrets/smtp_from` | `APZHUB_SMTP_FROM_FILE` |

**SMTP port** is not a mounted secret in this stack: set **`APZHUB_SMTP_PORT`** (e.g. `587`) in each environment’s `.env` next to the compose file.

Use **single-line** UTF-8 text in each file (no trailing commentary). `db_url` is a standard Postgres connection URI.

## Optional (typed loader supports them)

- `APZHUB_TOKEN_SIGNING_SECRET_FILE`, `APZHUB_ENCRYPTION_SECRET_FILE` — set in compose `environment` if you add mounts; see [`lib/config/secrets.ts`](../../lib/config/secrets.ts).

## Examples

Committed `*.example` files here are **placeholders only** — copy to your host secrets dir without the `.example` suffix and replace with real values.
