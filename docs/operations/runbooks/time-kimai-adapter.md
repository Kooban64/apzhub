# Time — enable Kimai CE adapter (host)

| Field    | Value                                                                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Ops · platform admins                                                                                                                     |
| Related  | [SPR-OPS-KIMAI-001](../../sprint/SPR-OPS-KIMAI-001-time-kimai-adapter-host.md) · [time-adapter-unhealthy.md](./time-adapter-unhealthy.md) |
| AuthN    | BetterAuth only — Kimai API token is **server-side**; users never see Kimai login                                                         |

## Intent

Close the usefulness residual where Time HTTP exists but Kimai is off (`KIMAI_INTEGRATION_ENABLED` / `APZHUB_TIME_ENABLED` false).

## Preconditions

- Legacy Kimai CE reachable on this host (`ENVIRONMENT.md` — typically `127.0.0.1:18083`).
- A Kimai **Access Token** exists (User → API Access), not a stale portal copy.
- Org subscribed to a package that includes `time` (e.g. `pkg.apzprd.time`) and the user has `time.*` permissions.

## Steps

1. Create gitignored secret file (never commit):

   ```bash
   umask 077
   cat > .secrets/kimai <<'EOF'
   KIMAI_API_TOKEN=<paste-kimai-access-token>
   EOF
   chmod 600 .secrets/kimai
   ```

2. In `.env` (gitignored) enable Time + Kimai — **no token here**:

   ```bash
   APZHUB_TIME_ENABLED=true
   KIMAI_INTEGRATION_ENABLED=true
   KIMAI_BASE_URL=http://127.0.0.1:18083
   KIMAI_API_BASE_URL=http://127.0.0.1:18083/api
   ```

3. Restart `apps/web` so dotenv + `.secrets/kimai` load.

4. Verify as an entitled BetterAuth user:

   - `GET /api/v1/time/health` → healthy / ready against Kimai
   - `GET /api/v1/time/timesheets` → collection (may be empty if no entries)

## Notes

- Kimai client paths are relative to `/api` (e.g. `/timesheets`). Keep `KIMAI_API_BASE_URL` as **`{host}/api`**.
- Prefer Bearer access tokens (Kimai 2.13+). Legacy `X-AUTH-USER` / `X-AUTH-TOKEN` is supported by the adapter but not required on this host.

## Rollback

Set `APZHUB_TIME_ENABLED=false` and `KIMAI_INTEGRATION_ENABLED=false`, then restart. Remove `.secrets/kimai` if needed.

## Honesty

- Does **not** stop Authentik containers.
- Does **not** send users to Kimai UI for normal work.
- Token stays server-side (`.secrets/kimai` or vault later).
