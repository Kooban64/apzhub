# APZHUB-owned Paperless-ngx CE/LTS engine (infrastructure only)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Port   | `127.0.0.1:19082`                            |
| Legacy | **Do not touch** `apz-paperless*` on `18082` |

## Bring-up

```bash
cd infrastructure/docker/engines/paperless-lts
cp paperless-lts.env.example .env   # set strong secrets
docker compose --env-file image-pins.env --env-file .env up -d
```

Wait for HTTP on 19082 (redirect to login is fine).

## APZHUB Documents DMS wiring

Native APZHUB Documents remains the authoritative SoR. The optional read-only DMS
foundation exposes engine health and catalogue listing only.

Create an API token in the LTS engine for a least-privilege service account and
store it outside git:

```bash
cd /home/ubuntu/apz-portal
mkdir -p .secrets
printf 'PAPERLESS_API_TOKEN=%s\n' '<token>' > .secrets/paperless
chmod 600 .secrets/paperless
```

Enable the APZHUB facet:

```dotenv
APZHUB_DOCUMENTS_DMS_ENABLED=true
PAPERLESS_INTEGRATION_ENABLED=true
PAPERLESS_BASE_URL=http://127.0.0.1:19082
PAPERLESS_API_BASE_URL=http://127.0.0.1:19082/api
# Optional; defaults to paperless/api-token
PAPERLESS_API_TOKEN_REF=paperless/api-token
```

BetterAuth remains the only user authentication layer. No Authentik or
remote-user configuration is used.

## Legacy

Older platform Paperless on `18082` stays running until Owner deprecates it.
