# APZHUB deployment and operations checklist

Use this when moving from local mock defaults to a real Postgres-backed stack.

For a **section-by-section backlog** (UI, backend, frontend, services, auth, admin, users) and what is already implemented vs follow-ups, see [`docs/PLATFORM_UX_BACKLOG.md`](PLATFORM_UX_BACKLOG.md).

**Persistence:** durable data (users, access, sessions, jobs, launch events) lives in **Postgres** on a **named Docker volume** in the provided compose files — it survives **`web` rebuilds and restarts**. See [`docs/DATA_PERSISTENCE.md`](DATA_PERSISTENCE.md) for what persists, what does not, and commands (e.g. `docker compose down -v`) that wipe volumes.

## 1. Required environment

| Area | Variables (see `lib/adapters/env.ts`) | Notes |
|------|----------------------------------------|--------|
| Database | `APZHUB_DATABASE_URL` or `DATABASE_URL`, or `APZHUB_DATABASE_URL_FILE` | Resolved via `loadAppSecrets()` in server paths (see `lib/config/secrets.ts`, `db/client.ts`, `scripts/migrate.ts`). |
| Identity | `APZHUB_IDENTITY_SOURCE` | `local` for built-in accounts; adjust per environment. |
| Access | `APZHUB_ACCESS_SOURCE` | `real` uses Postgres for assignments/overrides; catalog baseline remains in-repo until product replaces it. |
| Access (dev UX) | `APZHUB_ACCESS_OPTIMISTIC_REALIZATION` | When `true`, materialized matrix rows use **`provisioned`** instead of **`pending`** so launcher works without the provisioning worker (staging/local only). |
| Access (fail-hard) | `APZHUB_ACCESS_STRICT_REAL` | When `true` with `APZHUB_ACCESS_SOURCE=real`, Postgres/file load failures **throw** (503 from APIs) instead of silently returning mock catalog data. |
| Provisioning | `APZHUB_PROVISIONING_SOURCE` | `real` requires DB + optional worker (`npm run worker:provisioning`). |
| Launch | `APZHUB_LAUNCH_SOURCE` | `real` enables JWT mint and OIDC start routes; requires secrets below. |
| Launch (browser) | `NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE` | Should match server intent so `buildLaunchTransportTarget` targets API routes from the client. |
| JWT | `APZHUB_LAUNCH_JWT_SIGNING_SECRET` or `APZHUB_LAUNCH_JWT_SIGNING_SECRET_FILE` | Inline env is read by `lib/adapters/env.ts`. In Docker, compose sets `*_FILE` and [`deploy/docker/entrypoint.sh`](../deploy/docker/entrypoint.sh) exports the inline var before Node starts (keeps client bundles free of `fs`). |
| OIDC start | `APZHUB_LAUNCH_OIDC_URL_TEMPLATE`, `APZHUB_LAUNCH_OIDC_USE_INTERNAL_START` | Template placeholders `{service}`, `{query}`, `{state}`; optional `APZHUB_LAUNCH_OIDC_STATE_SECRET` or `APZHUB_LAUNCH_OIDC_STATE_SECRET_FILE` (same entrypoint pattern as JWT). |

### Go-live matrix (access, admin, workspace launch)

Use this before users rely on **portal login + workspace tiles + launch**:

1. **Rebuild the `web` image** after any change to `NEXT_PUBLIC_*` variables. Next.js bakes those into the client bundle at **build** time; restarting the container alone does not refresh them.

2. **Server and browser must agree on access + launch mode**
   - If `APZHUB_ACCESS_SOURCE=real`, set **`NEXT_PUBLIC_APZHUB_ACCESS_SOURCE=real`** (or any non-`mock` value your build uses consistently). If the client stays on `mock`, workspace posture uses only in-repo mock matrix data and **real portal UUID users see no access** on tiles even when Postgres is correct (see `getAccessPostureUsesApi` in `lib/adapters/env.ts` and `readMatrixPostureForUserSync` in `lib/launch/workspace-launch-bridge.ts`).
   - If `APZHUB_LAUNCH_SOURCE=real`, set **`NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE=real`** so `buildLaunchTransportTarget` targets real API routes from the browser.

3. **Realization vs provisioning worker**
   - With real access, matrix `realization` defaults to **`pending`** until provisioning marks services **`provisioned`**, and `resolveLaunchDecision` blocks launch while pending.
   - **Either** set **`APZHUB_ACCESS_OPTIMISTIC_REALIZATION=true`** on staging/local (tiles become launch-ready without waiting on the worker), **or** run **`npm run worker:provisioning`** until jobs complete (simulated connectors are acceptable per §8).

4. **Secrets for real JWT** — set `APZHUB_LAUNCH_JWT_SIGNING_SECRET` or `APZHUB_LAUNCH_JWT_SIGNING_SECRET_FILE` (see `deploy/docker/entrypoint.sh`).

5. **Automated sanity check** — after exporting the same env your compose build uses, run **`npm run verify:preflight`** (optional `APZHUB_PREFLIGHT_ENV_FILE=path/to/.env`). It fails fast on common access/launch mis-pairs.

6. **Seeds** — `npm run db:migrate` → `npm run db:seed` → `npm run db:seed:apzor-testing` or `db:seed:hub-demo` against the **same** database URL the app uses.

## 2. Migrations

```bash
npm run db:migrate
```

Runs `scripts/migrate.ts` against the configured URL (including `APZHUB_DATABASE_URL_FILE`). Ensure all migrations through **`0004_launch_events`** (and later) are applied before relying on persisted launch telemetry or admin `/admin/launch`.

**Docker:** use the one-shot `migrate` service in compose (see §8); if migrations fail, the `web` service must not start (`service_completed_successfully` dependency).

## 3. Startup order

1. Postgres reachable with migrated schema.
2. Next app: `npm run build` then `npm run start` (or `npm run dev` for local).
3. Optional: `npm run worker:provisioning` on a schedule or separate process when `APZHUB_PROVISIONING_SOURCE=real`.

## 4. Health verification

After deploy:

1. Open **Admin** home and confirm the health strip (control-plane merge in `lib/adapters/health/merge-adapter-health-strip.ts`).
2. Check **identity**, **access**, **provisioning**, **launch**, **launch events (DB)**, **connector** rows (when provisioning is real and configured).
3. Visit **`/admin/launch`** once you have exercised a launch path; rows should appear if DB writes succeed.

## 5. Transitional behavior (retained by design)

### Access `APZHUB_ACCESS_SOURCE=real`

- **Catalog**: bundle/service directory baseline may still come from in-repo mock data while **mutable** assignments live in Postgres (`access_subject_*` tables). This is intentional for the current slice.
- **`bundles_from_db`**: When `access_subject_flags.bundlesFromDb` is true for a subject, bundle membership is authoritative from `access_subject_bundle_assignments` only. Not a temporary bridge flag; do not remove without replacing semantics.
- **Fallback to mock**: If materialization from Postgres throws, or the database URL is missing while `real` is set, `getAdminAccessData` falls back to `getMockAccessData()` with structured logs. Operators should watch logs and health; the access health row mentions this. Tightening to hard-fail would break dev UX where Postgres is optional.

### Launch env split

- **Server** routes honor `APZHUB_LAUNCH_SOURCE` and server-only secrets.
- **Client** `buildLaunchTransportTarget` reads `NEXT_PUBLIC_APZHUB_LAUNCH_*` in the browser. Misalignment yields wrong hrefs while the server still behaves correctly — keep both sides aligned in each environment.

### Launch event persistence

- Writes use `tryInsertLaunchEvent` so **telemetry failures never block** user launch flows; errors go to server logs.

## 6. CI and Postgres integration tests

Vitest suites under `test/**` that use `describe.skipIf(!hasDb)` require:

- `APZHUB_DATABASE_URL` or `DATABASE_URL` set, or a readable `APZHUB_DATABASE_URL_FILE`, and  
- `npm run db:migrate` executed against that database **before** `npm test`

Otherwise those tests are skipped (see `test/setup.ts` console hint).

### Hub demo user (full catalog access)

After `npm run db:seed` (primary admin), run:

```bash
npm run db:seed:hub-demo
```

This creates `demo.all-services@example.com` (override with `APZHUB_SEED_DEMO_EMAIL`) with bundles **`b-admin` + `b-core`** and **per-service max overrides for every catalog service** (see [`lib/dev/catalog-max-access.ts`](../lib/dev/catalog-max-access.ts)). With `APZHUB_ACCESS_SOURCE=real` and **`APZHUB_ACCESS_OPTIMISTIC_REALIZATION=true`**, workspace launch decisions succeed for every tile in the default tenant allowlist without waiting on provisioning jobs.

### Apzor testing roster (optional)

After migrations and `npm run db:seed`:

```bash
npm run db:seed:apzor-testing
```

Seeds a deterministic `@apzor.com` roster (superadmin, admin, and standard users) with the same full-catalog access profile as hub demo. Override the shared password with **`APZHUB_SEED_APZOR_PASSWORD`** (minimum length matches hub policy in [`lib/identity/password-policy.ts`](../lib/identity/password-policy.ts)).

### Portal passwords vs vendor apps

**APZHUB portal** passwords (local identity, admin password set, reset link) apply only to signing into this app. They are **not** synchronized to Plane, Zammad, Kimai, or other vendor databases. Vendor SSO or per-app credentials remain separate; use [`scripts/import-legacy-vendor-users-to-portal.ts`](../scripts/import-legacy-vendor-users-to-portal.ts) only when intentionally provisioning portal rows from vendor sources. Native “sync vendor password with portal” is **not** implemented in this slice.

Integration coverage: [`test/integration/hub-demo-access.integration.test.ts`](../test/integration/hub-demo-access.integration.test.ts), [`test/integration/apzor-testing-users.integration.test.ts`](../test/integration/apzor-testing-users.integration.test.ts) (same access profile as apzor seed), and SSO edge JWT: [`test/integration/sso-first-party-edge.integration.test.ts`](../test/integration/sso-first-party-edge.integration.test.ts).

## 7. Optional E2E: persisted JWT launch

When the Playwright server has real launch env + migrated DB, you can add an assertion that `GET /api/admin/launch/events` returns rows after a JWT flow (see comment in `test/e2e/workspace-launch.spec.ts`). Not part of default mock e2e.

## 8. Docker (staging and production)

Use **two environments only**: separate hosts (recommended) or clearly separate compose stacks, **never** a shared Postgres or secrets directory between staging and production.

### 8.1 Layout and entrypoints

- **Repo assets:** [`deploy/README.md`](../deploy/README.md), [`deploy/staging/docker-compose.yml`](../deploy/staging/docker-compose.yml), [`deploy/production/docker-compose.yml`](../deploy/production/docker-compose.yml), [`deploy/docker/Dockerfile`](../deploy/docker/Dockerfile).
- **On server:** follow `/opt/apzhub/{app,deploy,secrets,data,backups}` as in `deploy/README.md`. Keep secrets **only** on the host mount (see [`deploy/secrets/README.md`](../deploy/secrets/README.md)).
- **Image:** one production image for `web`, `migrate`, and `worker` (different `command`). Compose declares **`build:` only on `web`**; `migrate` and `worker` share the same tag so parallel same-tag image exports cannot race. **TLS:** either a **single** edge Caddy ([`deploy/edge`](../deploy/edge/) + [`deploy/Caddyfile.dual-host.example`](../Caddyfile.dual-host.example)) on one host, or **per-stack** Caddy by enabling the Compose profile `bundled-caddy` (see [`deploy/README.md`](../deploy/README.md)).

### 8.2 Startup order (frozen)

1. **Postgres** up and **healthy** (`pg_isready`).
2. **Migrate** one-shot: `npm run db:migrate` — **must exit 0**; on failure, stop the deploy (do not route traffic to `web`).
3. **Web** starts only after migrate completed successfully; container **HEALTHCHECK** hits `GET /api/health` (liveness only).
4. **Worker** starts after **web** and **postgres** are healthy.
5. **Caddy (optional):** per-stack `caddy` is behind profile **`bundled-caddy`** so default `up` does not bind `:80/:443` twice on one host. For the locked **one host / dual hostname** model, skip bundled Caddy and start **edge** Caddy after both `web` services are healthy (see [`deploy/edge/README.md`](../deploy/edge/README.md)).

### 8.3 Secret files and env split

- Typed loader: [`lib/config/secrets.ts`](../lib/config/secrets.ts) (`APZHUB_DATABASE_URL_FILE`, session, SMTP `*_FILE`, optional token/encryption files).
- Launch signing secrets use **`deploy/docker/entrypoint.sh`** to map `*_FILE` → inline env (see §1 table) because `lib/adapters/env.ts` is importable from the client graph.
- **Postgres** superuser password: `POSTGRES_PASSWORD_FILE` pointing at `/run/secrets/postgres_password` (same bind mount as app secrets).
- **Non-secret** runtime flags live in `deploy/<stack>/.env` (copy from `env.example`). **Email links** for local identity use `APZHUB_PUBLIC_BASE_URL` (must match the URL users use behind TLS).

### 8.4 Production mode matrix (initial cut)

| Rule | Staging / production |
|------|----------------------|
| Identity | `APZHUB_IDENTITY_SOURCE=local` (first cut; no SAML/SCIM in this step). |
| Data plane | `APZHUB_ACCESS_SOURCE=real`, `APZHUB_PROVISIONING_SOURCE=real`, `APZHUB_LAUNCH_SOURCE=real` with DB + secrets. |
| Browser launch alignment | `NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE=real` (and related `NEXT_PUBLIC_*` templates) must match server. |
| Connectors | `APZHUB_PROVISIONING_CONNECTOR_PROFILE=simulated` acceptable until real connectors are ready. |
| Dev token logging | `NODE_ENV=production` and **`APZHUB_AUTH_DEV_LOG_EMAIL_TOKENS` unset or `0`** (never `1` in prod). |
| Cookies | `NODE_ENV=production` enables **Secure** session cookies in `lib/auth/session-issuer.server.ts` — HTTPS required at the edge. |
| Mock access fallback | Real access may still fall back to mock data on errors (see §5); treat health strip + logs as the control surface. |

### 8.5 Migrations policy

- Run **one** migration job per deploy (the compose `migrate` service). Do not run concurrent migrators against the same database from multiple replicas.

### 8.6 Backups and restore

- Schedule [`deploy/scripts/backup-postgres.sh`](../deploy/scripts/backup-postgres.sh) (e.g. nightly). Copy dumps **off-host**. **Restore tests** belong on staging first.
- **Production deploy:** take a backup **before** `docker compose up` when schema may change.

### 8.7 Rollback

1. If the new `web`/`worker` images are bad but **migrations did not change** schema incompatibly: stop containers, pin the previous image tag, `up -d` again.
2. If a **migration** introduced an incompatible schema and the app cannot run: **stop** traffic, restore Postgres from the last known-good backup **only** with explicit operator approval (pre-deploy backups exist for this).

### 8.8 Smoke tests (mandatory after each deploy)

Automated minimum: [`deploy/scripts/smoke.sh`](../deploy/scripts/smoke.sh) (`/api/health`, `/login`).

Manual checklist (same intent as Step 16.19): login; session persists; **Admin** loads; users/access pages; provisioning queue; one provisioning job; workspace; one JWT launch path; launch event visible under `/admin/launch`; profile; forgot-password request returns success path; **Admin** health strip sane (merged adapter health via `GET` data used by `app/api/admin/control-plane`).

### 8.9 Logging and monitoring (first cut)

- Rely on **per-container** Docker logs (`docker compose logs -f web` / `worker`). Categories already use structured logging for auth, provisioning, launch, and adapter health in server code paths.
- Add Prometheus/Grafana/Loki later; do not block first production on dashboards.

### 8.10 Who can deploy / where logs live

- Document your org’s approvers in internal runbooks. **Logs:** default Docker logging driver on each host; optionally ship to central logging later.
