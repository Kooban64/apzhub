# SPR-OPS-PAPERLESS-002 — Documents DMS Paperless foundation

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [ADR-0095](../adr/ADR-0095-paperless-ngx-documents-dms-provider.md) **Accepted** · [SPR-OPS-LTS-PAPERLESS-001](./SPR-OPS-LTS-PAPERLESS-001-apzhub-owned-paperless-bring-up.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Touch legacy `apz-paperless*` / `18082` · Replace native Documents SoR · Upload/OCR/viewer

## Outcome

Shipped foundation `@apzhub/integration-paperless` + Platform Documents DMS health/list against APZHUB-owned Paperless on **`127.0.0.1:19082`**. Native `/api/v1/documents` stays primary (separate SoR; may remain disabled until Documents platform is enabled).

## Ships

| ID  | Ship                      | Landed                                                                     |
| --- | ------------------------- | -------------------------------------------------------------------------- |
| D1  | ADR Accepted              | ADR-0095                                                                   |
| D2  | Integration package       | `integrations/paperless` (`integration.yaml` + adapter)                    |
| D3  | Secrets + LTS env         | `.secrets/paperless` · `PAPERLESS_*` → 19082                               |
| D4  | Platform DMS facet + HTTP | `GET /api/v1/documents/dms/health` · `GET /api/v1/documents/dms/documents` |
| D5  | BetterAuth dogfood        | Health `auth=valid; api=reachable` · list returns mapped items             |

## Acceptance

1. ADR-0095 **Accepted** — PASS
2. BetterAuth DMS health healthy on **19082** — PASS
3. BetterAuth DMS list mapped catalogue (no Paperless brand) — PASS
4. Native Documents path unchanged (still independent) — PASS
5. Legacy `18082` listening; no `apz-paperless*` restart — PASS

## Ops

See [engines/paperless-lts/README.md](../../infrastructure/docker/engines/paperless-lts/README.md).
