# APZHUB-owned n8n CE/LTS engine

| Field  | Value                                 |
| ------ | ------------------------------------- |
| Port   | `127.0.0.1:19678`                     |
| Legacy | **Do not touch** `apz-n8n` on `15678` |

## Bring-up

```bash
cd infrastructure/docker/engines/n8n-lts
cp n8n-lts.env.example .env   # set strong DB + encryption secrets
docker compose --env-file image-pins.env --env-file .env up -d
```

Wait for `/healthz` → ok. Complete owner setup, create an API key, save to gitignored `.api-key`.

Point APZHUB (gitignored `.env` — **no key here**):

```bash
APZHUB_WORKFLOW_ENABLED=true
APZHUB_WORKFLOW_ENGINE_ENABLED=true
APZHUB_WORKFLOW_ENGINE_BASE_URL=http://127.0.0.1:19678
APZHUB_WORKFLOW_ENGINE_API_BASE_URL=http://127.0.0.1:19678/api/v1
```

`.secrets/n8n`:

```bash
APZHUB_WORKFLOW_ENGINE_API_KEY=<n8n-api-key>
```

Restart `@apzhub/web`. Verify workflow engine health + workflows list.

## Honesty

Engines stay outside the hub. Dedicated Postgres — does not use shared `apzpg`.
Legacy n8n remains until Owner deprecates it.
