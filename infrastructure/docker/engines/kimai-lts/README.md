# APZHUB-owned Kimai CE/LTS engine

| Field  | Value                                    |
| ------ | ---------------------------------------- |
| Port   | `127.0.0.1:19083`                        |
| Legacy | **Do not touch** `apz-kimai*` on `18083` |

## Bring-up

```bash
cd infrastructure/docker/engines/kimai-lts
cp kimai-lts.env.example .env   # set strong secrets
# TRUSTED_HOSTS must use single-backslash regex (see .env example / compose)
docker compose --env-file image-pins.env --env-file .env up -d
```

Wait until Apache is healthy. `GET /api/version` should return **401** (not TrustedHosts **400**).

Create a persistent Access Token for `admin@apzhub.local` (Doctrine `AccessToken`) and save it to gitignored `.api-token`.

Point APZHUB (gitignored `.env` — **no token here**):

```bash
APZHUB_TIME_ENABLED=true
KIMAI_INTEGRATION_ENABLED=true
KIMAI_BASE_URL=http://127.0.0.1:19083
KIMAI_API_BASE_URL=http://127.0.0.1:19083/api
```

`.secrets/kimai`:

```bash
KIMAI_API_TOKEN=<bearer-token>
```

Restart `@apzhub/web`. Verify `GET /api/v1/time/health` and `GET /api/v1/time/timesheets`.

## Honesty

Engines stay outside the hub. Legacy Kimai remains for the older platform until Owner deprecates it.
Image pin reuses the host CE build (`2.52.0`) — no registry pull required.
