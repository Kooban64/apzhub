# Support — enable Zammad CE adapter (host)

| Field    | Value                                                                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Ops · platform admins                                                                                                                                                             |
| Related  | [SPR-OPS-ZAMMAD-001](../../sprint/SPR-OPS-ZAMMAD-001-support-zammad-adapter-host.md) · [Administrator Guide](../../products/apzsupport/release-1.0/guides/ADMINISTRATOR-GUIDE.md) |
| AuthN    | BetterAuth only — Zammad API token is **server-side**; users never see Zammad login                                                                                               |

## Intent

Close the usefulness residual where Support UI/API exists but the live Zammad adapter is off (`ZAMMAD_INTEGRATION_ENABLED=false`).

## Preconditions

- Legacy Zammad CE reachable on this host (`ENVIRONMENT.md` — typically `127.0.0.1:18081`).
- A Zammad **API token** already exists (or create one — operator-only).
- Org subscribed to a package that includes `support` (e.g. `pkg.apzprd.service`) and the user has Support grants + `support.*` permissions.

## Steps

1. Create gitignored secret file (never commit):

   ```bash
   umask 077
   cat > .secrets/zammad <<'EOF'
   ZAMMAD_API_TOKEN=<paste-zammad-api-token>
   EOF
   chmod 600 .secrets/zammad
   ```

2. In `.env` (gitignored) enable the adapter URLs — **no token here**:

   ```bash
   ZAMMAD_INTEGRATION_ENABLED=true
   ZAMMAD_BASE_URL=http://127.0.0.1:18081
   ZAMMAD_API_BASE_URL=http://127.0.0.1:18081
   ```

3. Restart `apps/web` so dotenv + `.secrets/zammad` load.

4. Verify as an entitled BetterAuth user:

   - `GET /api/v1/support-requests` → collection (not empty solely due to adapter off)
   - Engine brand names stay out of the user-facing shell

## Notes

- Client paths already include `/api/v1/...`. Set `ZAMMAD_API_BASE_URL` to the **host root** (same as `ZAMMAD_BASE_URL`). Do not append `/api/v1` or you get `/api/v1/api/v1/...`.
- Auth header is `Authorization: Token token=<api-token>` (Zammad CE).

## Rollback

Set `ZAMMAD_INTEGRATION_ENABLED=false` and restart. Remove or empty `.secrets/zammad` if needed.

## Honesty

- Does **not** stop Authentik containers.
- Does **not** send users to Zammad UI for normal work.
- Token stays server-side (`.secrets/zammad` or vault later).
