# SPR-OPS-LTS-PAPERLESS-001 — APZHUB-owned Paperless CE/LTS bring-up (infra only)

> **Status:** **COMPLETE · DELIVERED (infrastructure only)** — 2026-08-15  
> **Depends on:** [SPR-OPS-LTS-001](./SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)  
> **AuthN:** BetterAuth only (hub) — no Authentik remote-user on LTS Paperless  
> **Does not:** Documents product wiring · `integrations/paperless` · stop legacy `apz-paperless*` (18082)

## Outcome

Stand up an **APZHUB-owned** Paperless-ngx CE stack on reserved **`127.0.0.1:19082`** for topology honesty. Native Documents SoR stays authoritative. Adapter work waits on [ADR-0095](../adr/ADR-0095-paperless-ngx-documents-dms-provider.md) Owner acceptance.

## Ships

| ID  | Ship              | Landed                                                                           |
| --- | ----------------- | -------------------------------------------------------------------------------- |
| P1  | Isolated compose  | `infrastructure/docker/engines/paperless-lts/` (project `apzhub-paperless-lts`)  |
| P2  | Pin CE digests    | `image-pins.env` (local paperless-ngx + Postgres + Redis)                        |
| P3  | Bring-up on 19082 | HTTP healthy; legacy 18082 still listening                                       |
| P4  | ADR draft         | [ADR-0095](../adr/ADR-0095-paperless-ngx-documents-dms-provider.md) **Proposed** |

## Acceptance

1. `curl http://127.0.0.1:19082/` succeeds (or login redirect); legacy `18082` still succeeds.
2. No Documents `.env` retarget; no new adapter package.
3. No Authentik / legacy Paperless container changes.
4. ADR-0095 filed as Proposed for Owner.

## Ops

See [engines/paperless-lts/README.md](../../infrastructure/docker/engines/paperless-lts/README.md).
