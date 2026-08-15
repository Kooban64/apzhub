# APZHUB-owned Plane CE/LTS engine

| Field   | Value                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Port    | `127.0.0.1:19085` (reserved — [SPR-OPS-LTS-001](../../../../docs/sprint/SPR-OPS-LTS-001-apzhub-owned-engine-topology.md)) |
| Project | `apzhub-plane-lts`                                                                                                        |
| Legacy  | **Do not touch** `apz-plane-*` on `18085`                                                                                 |

## Bring-up

```bash
cd infrastructure/docker/engines/plane-lts
cp plane-lts.env.example plane-lts.env   # set strong secrets
set -a && source image-pins.env && source plane-lts.env && set +a
docker compose --env-file plane-lts.env --env-file image-pins.env up -d
```

Wait until `curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:19085/` returns 200 (or Plane setup redirect).

Complete **God Mode** instance setup once (`/god-mode/`), create a workspace, then create an API token.

Point APZHUB (gitignored `.env`):

```bash
PLANE_INTEGRATION_ENABLED=true
PLANE_BASE_URL=http://127.0.0.1:19085
PLANE_API_BASE_URL=http://127.0.0.1:19085
PLANE_WORKSPACE_ID=<workspace-slug>
```

And `.secrets/plane`:

```bash
PLANE_API_TOKEN=<token>
PLANE_WORKSPACE_ID=<workspace-slug>
```

Restart `@apzhub/web`. Verify `GET /api/v1/projects/health` shows `liveListOk` against **19085**.

## Honesty

- Separate Docker network/volumes/names from legacy.
- Same CE image digests as the coexistence host pins (local reuse).
- Engines remain outside the hub process ([OWNER-ENGINES-OUTSIDE-HUB](../../../../docs/decisions/OWNER-ENGINES-OUTSIDE-HUB.md)).
