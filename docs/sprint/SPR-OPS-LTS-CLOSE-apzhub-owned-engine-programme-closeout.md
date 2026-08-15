# SPR-OPS-LTS-CLOSE — APZHUB-owned CE/LTS engine programme closeout

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-LTS-001](./SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Stop legacy `apz-*` · Authentik retire

## Outcome

All reserved APZHUB-owned CE/LTS listeners are **up** on this coexistence host. Adapter-backed products (Projects, Support, Time, Analytics, Workflow) are retargeted off legacy ports. Documents DMS foundation is wired to Paperless LTS ([ADR-0095](../adr/ADR-0095-paperless-ngx-documents-dms-provider.md) Accepted · [SPR-OPS-PAPERLESS-002](./SPR-OPS-PAPERLESS-002-documents-dms-paperless-foundation.md)); native Documents SoR remains primary.

## Fleet

| Port  | Engine    | Product       | Sprint                   | Wiring                                      |
| ----- | --------- | ------------- | ------------------------ | ------------------------------------------- |
| 19085 | Plane     | Projects      | SPR-OPS-LTS-PLANE-001    | Retargeted                                  |
| 19081 | Zammad    | Support       | SPR-OPS-LTS-ZAMMAD-001   | Retargeted                                  |
| 19083 | Kimai     | Time          | SPR-OPS-LTS-KIMAI-001    | Retargeted                                  |
| 19084 | Metabase  | Analytics     | SPR-OPS-LTS-METABASE-001 | Retargeted                                  |
| 19678 | n8n       | Workflow      | SPR-OPS-LTS-N8N-001      | Retargeted                                  |
| 19082 | Paperless | Documents DMS | SPR-OPS-PAPERLESS-002    | Foundation health/list (native SoR primary) |

## Acceptance

1. Topology doc lists all six LTS ports as **UP**.
2. BetterAuth dogfood paths succeed against new listeners for the five wired products.
3. Legacy listeners remain up and untouched.
4. Documents DMS foundation dogfood against Paperless LTS (SPR-OPS-PAPERLESS-002).

## Next (Owner)

1. Treat [SPR-ADOPT-004](./SPR-ADOPT-004-lts-backed-engines-dogfood.md) + Paperless DMS dogfood as API gates — **not** permission to touch legacy.
2. Decide later whether Documents binaries/OCR move behind Paperless (dual-path) — out of foundation slice.
3. Plan broader product confirmation (UX / Playwright / operator dogfood) before legacy `apz-*` deprecation.
4. **Leave legacy running** until that confirmation is explicit.
