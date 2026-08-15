# APZHUB-owned Metabase CE/LTS engine

| Field  | Value                                       |
| ------ | ------------------------------------------- |
| Port   | `127.0.0.1:19084`                           |
| Legacy | **Do not touch** `apz-metabase*` on `18084` |

## Bring-up

```bash
cd infrastructure/docker/engines/metabase-lts
cp metabase-lts.env.example .env   # set strong DB password
docker compose --env-file image-pins.env --env-file .env up -d
```

Wait for `/api/health` → `{"status":"ok"}`. Complete first-time setup (`/api/setup`), then create an Admin API key (`mb_…`) and save to gitignored `.api-key`.

Point APZHUB (gitignored `.env` — **no key here**):

```bash
APZHUB_ANALYTICS_ENABLED=true
METABASE_INTEGRATION_ENABLED=true
METABASE_BASE_URL=http://127.0.0.1:19084
METABASE_API_BASE_URL=http://127.0.0.1:19084/api
```

`.secrets/metabase`:

```bash
METABASE_API_KEY=mb_…
```

Restart `@apzhub/web`. Verify `GET /api/v1/analytics/health` and dashboards list.

## Honesty

Engines stay outside the hub. Legacy Metabase remains until Owner deprecates it.
