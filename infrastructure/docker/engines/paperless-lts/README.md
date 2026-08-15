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

## Honesty — no Documents product wiring

- Native APZHUB Documents SoR remains authoritative ([APZDOCS](../../../../docs/products/APZHUB-PRODUCT-PORTFOLIO.md)).
- **No** `integrations/paperless` adapter exists; **no** Documents env retarget in this slice.
- Adapter work requires Owner acceptance of [ADR-0095](../../../../docs/adr/ADR-0095-paperless-ngx-documents-dms-provider.md).
- No Authentik remote-user on this stack (BetterAuth is hub AuthN only).

## Legacy

Older platform Paperless on `18082` stays running until Owner deprecates it.
