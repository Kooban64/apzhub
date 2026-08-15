# Workflow — enable n8n CE engine adapter (host)

| Field    | Value                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Ops · platform admins                                                                                                                         |
| Related  | [SPR-OPS-N8N-001](../../sprint/SPR-OPS-N8N-001-workflow-n8n-adapter-host.md) · [automation-deferred-flood.md](./automation-deferred-flood.md) |
| AuthN    | BetterAuth only — n8n API key is **server-side**; users never see n8n login                                                                   |

## Intent

Close the usefulness residual where Workflow Platform HTTP exists but the n8n engine adapter is off (`APZHUB_WORKFLOW_ENGINE_ENABLED` / `APZHUB_WORKFLOW_ENABLED` false).

## Preconditions

- Legacy n8n CE reachable on this host (`ENVIRONMENT.md` — typically `127.0.0.1:15678`).
- An n8n **API key** exists (Settings → API), not a stale portal copy.
- Org subscribed to a package that includes `workflow` (e.g. `pkg.apzprd.operations`) and the user has `workflow.*` permissions.

## Steps

1. Create gitignored secret file (never commit):

   ```bash
   umask 077
   cat > .secrets/n8n <<'EOF'
   APZHUB_WORKFLOW_ENGINE_API_KEY=<paste-n8n-api-key>
   EOF
   chmod 600 .secrets/n8n
   ```

   Raw one-line key files are also accepted by the loader (`N8N_API_KEY=` alias supported).

2. In `.env` (gitignored) enable Workflow Platform + engine — **no key here**:

   ```bash
   APZHUB_WORKFLOW_ENABLED=true
   APZHUB_WORKFLOW_ENGINE_ENABLED=true
   APZHUB_WORKFLOW_ENGINE_BASE_URL=http://127.0.0.1:15678
   APZHUB_WORKFLOW_ENGINE_API_BASE_URL=http://127.0.0.1:15678/api/v1
   ```

3. Restart `apps/web` so dotenv + `.secrets/n8n` load.

4. Verify as an entitled BetterAuth user:

   - `GET /api/v1/workflow/health` → platform workflow healthy
   - `GET /api/v1/workflows/engine/health` → n8n engine healthy / reachable
   - `GET /api/v1/workflows/engine/workflows` → collection (may be empty)

## Notes

- n8n public API paths are under `/api/v1`. Keep `APZHUB_WORKFLOW_ENGINE_API_BASE_URL` as **`{host}/api/v1`**.
- Auth header is `X-N8N-API-KEY` (`APZHUB_WORKFLOW_ENGINE_AUTH_MODE=api_key`).

## Rollback

Set `APZHUB_WORKFLOW_ENABLED=false` and `APZHUB_WORKFLOW_ENGINE_ENABLED=false`, then restart. Remove `.secrets/n8n` if needed.

## Honesty

- Does **not** stop Authentik containers.
- Does **not** send users to n8n UI for normal work.
- API key stays server-side (`.secrets/n8n` or vault later).
- Does **not** unlock unrestricted n8n execute from the product shell (automation policy still applies).
