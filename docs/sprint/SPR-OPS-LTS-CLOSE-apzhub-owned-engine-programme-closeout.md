# SPR-OPS-LTS-CLOSE — APZHUB-owned CE/LTS engine programme closeout

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-LTS-001](./SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Stop legacy `apz-*` · Authentik retire · Paperless Documents adapter

## Outcome

All reserved APZHUB-owned CE/LTS listeners are **up** on this coexistence host. Adapter-backed products (Projects, Support, Time, Analytics, Workflow) are retargeted off legacy ports. Paperless is infrastructure-ready only pending ADR-0095.

## Fleet

| Port  | Engine    | Product     | Sprint                    | Wiring                         |
| ----- | --------- | ----------- | ------------------------- | ------------------------------ |
| 19085 | Plane     | Projects    | SPR-OPS-LTS-PLANE-001     | Retargeted                     |
| 19081 | Zammad    | Support     | SPR-OPS-LTS-ZAMMAD-001    | Retargeted                     |
| 19083 | Kimai     | Time        | SPR-OPS-LTS-KIMAI-001     | Retargeted                     |
| 19084 | Metabase  | Analytics   | SPR-OPS-LTS-METABASE-001  | Retargeted                     |
| 19678 | n8n       | Workflow    | SPR-OPS-LTS-N8N-001       | Retargeted                     |
| 19082 | Paperless | Documents\* | SPR-OPS-LTS-PAPERLESS-001 | Infra only — ADR-0095 Proposed |

\*Native Documents SoR unchanged.

## Acceptance

1. Topology doc lists all six LTS ports as **UP**.
2. BetterAuth dogfood paths succeed against new listeners for the five wired products.
3. Legacy listeners remain up and untouched.
4. Paperless has no product adapter until Owner accepts ADR-0095.

## Next (Owner)

1. Accept or reject [ADR-0095](../adr/ADR-0095-paperless-ngx-documents-dms-provider.md).
2. Plan legacy `apz-*` deprecation when ready — not automatic.
3. Capacity review before adding more heavy engines on this host.
