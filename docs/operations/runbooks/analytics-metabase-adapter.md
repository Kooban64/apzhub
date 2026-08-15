# Analytics — enable Metabase CE adapter (host)

| Field    | Value                                                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Ops · platform admins                                                                                                                                             |
| Related  | [SPR-OPS-METABASE-001](../../sprint/SPR-OPS-METABASE-001-analytics-metabase-adapter-host.md) · [analytics-adapter-unhealthy.md](./analytics-adapter-unhealthy.md) |
| AuthN    | BetterAuth only — Metabase API key is **server-side**; users never see Metabase login                                                                             |

## Intent

Close the usefulness residual where Analytics HTTP exists but Metabase is off (`METABASE_INTEGRATION_ENABLED` / `APZHUB_ANALYTICS_ENABLED` false).

## Preconditions

- Legacy Metabase CE reachable on this host (`ENVIRONMENT.md` — typically `127.0.0.1:18084`).
- A Metabase **API key** exists (Admin → Settings → Authentication → API Keys), not a DB bcrypt hash.
- Org subscribed to a package that includes `analytics` (e.g. `pkg.apzprd.delivery`) and the user has `analytics.*` permissions.

## Steps

1. Create gitignored secret file (never commit):

   ```bash
   umask 077
   cat > .secrets/metabase <<'EOF'
   METABASE_API_KEY=<paste-metabase-api-key>
   EOF
   chmod 600 .secrets/metabase
   ```

   Raw `mb_…` one-line files are also accepted by the loader.

2. In `.env` (gitignored) enable Analytics + Metabase — **no key here**:

   ```bash
   APZHUB_ANALYTICS_ENABLED=true
   METABASE_INTEGRATION_ENABLED=true
   METABASE_BASE_URL=http://127.0.0.1:18084
   METABASE_API_BASE_URL=http://127.0.0.1:18084/api
   ```

3. Restart `apps/web` so dotenv + `.secrets/metabase` load.

4. Verify as an entitled BetterAuth user:

   - `GET /api/v1/analytics/health` → healthy against Metabase
   - `GET /api/v1/analytics/readiness` → ready
   - `GET /api/v1/analytics/dashboards` → catalogue (may be empty if no dashboards)

## Notes

- Metabase client paths are relative to `/api` (e.g. `/dashboard`). Keep `METABASE_API_BASE_URL` as **`{host}/api`**.
- Prefer `X-Api-Key` (`METABASE_AUTH_MODE=api_key`). Session username/password is supported by the adapter but not required on this host.

## Rollback

Set `APZHUB_ANALYTICS_ENABLED=false` and `METABASE_INTEGRATION_ENABLED=false`, then restart. Remove `.secrets/metabase` if needed.

## Honesty

- Does **not** stop Authentik containers.
- Does **not** send users to Metabase UI for normal work.
- API key stays server-side (`.secrets/metabase` or vault later).
