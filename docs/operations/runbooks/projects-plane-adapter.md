# Projects — enable Plane CE adapter (host)

| Field    | Value                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Audience | Ops · platform admins                                                                                                                                              |
| Related  | [SPR-OPS-PLANE-001](../../sprint/SPR-OPS-PLANE-001-projects-plane-adapter-host.md) · [Plane Environment Guide](../../governance/APZHUB-Plane-Environment-Guide.md) |
| AuthN    | BetterAuth only — Plane API token is **server-side**; users never see Plane login                                                                                  |

## Intent

Close the dogfood residual where Projects Readiness is healthy but the list is empty because `PLANE_INTEGRATION_ENABLED=false`.

## Preconditions

- Legacy Plane CE reachable on this host (`ENVIRONMENT.md` — typically `127.0.0.1:18085`).
- A Plane **API token** already exists in Plane admin (or create one — operator-only).
- Workspace slug known (this host: `apzportal`).

## Steps

1. Create gitignored secret file (never commit):

   ```bash
   umask 077
   cat > .secrets/plane <<'EOF'
   PLANE_API_TOKEN=<paste-plane-api-token>
   PLANE_WORKSPACE_ID=apzportal
   EOF
   chmod 600 .secrets/plane
   ```

2. In `.env` (gitignored) enable the adapter URLs — **no token here**:

   ```bash
   PLANE_INTEGRATION_ENABLED=true
   PLANE_BASE_URL=http://127.0.0.1:19085
   PLANE_API_BASE_URL=http://127.0.0.1:19085
   PLANE_WORKSPACE_ID=apzhub
   ```

   Prefer APZHUB-owned Plane LTS on **19085** ([SPR-OPS-LTS-PLANE-001](../../sprint/SPR-OPS-LTS-PLANE-001-apzhub-owned-plane-bring-up.md)). Legacy `18085` remains for the older platform only — do not reconfigure it.

3. Restart `apps/web` so dotenv + `.secrets/plane` load.

4. Verify as an entitled BetterAuth user:

   - `GET /api/v1/projects/health` → `authN: betterauth`, `authentikUsed: false`, Plane `configured`, `liveListOk: true|false`
   - `GET /api/v1/projects` → collection (not empty solely due to adapter off)
   - UI Readiness identity posture still shows Authentik used = **no**

## Rollback

Set `PLANE_INTEGRATION_ENABLED=false` and restart. Remove or empty `.secrets/plane` if needed.

## Notes

- Plane CE on this host expects **`/api/v1/workspaces/...`** with header **`X-Api-Key`** (not legacy `/api/workspaces/...`).
- Set `PLANE_API_BASE_URL` to the **host root** (same as `PLANE_BASE_URL`). Client paths already include `/api/v1/...` — do not append `/api` or you get `/api/api/v1/...`.

## Honesty

- Does **not** stop Authentik containers.
- Does **not** send users to Plane UI for normal work.
- Token stays server-side (`.secrets/plane` or vault later).
