# SPR-OPS-LTS-METABASE-001 — APZHUB-owned Metabase CE/LTS bring-up

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-LTS-001](./SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Stop/reconfigure legacy `apz-metabase*` (18084) · Authentik · Cap reopen

## Outcome

Stand up an **APZHUB-owned** Metabase CE stack on reserved **`127.0.0.1:19084`**, complete setup + Admin API key, and retarget APZHUB Analytics adapter env away from legacy `18084`.

## Ships

| ID  | Ship               | Landed                                                                        |
| --- | ------------------ | ----------------------------------------------------------------------------- |
| M1  | Isolated compose   | `infrastructure/docker/engines/metabase-lts/` (project `apzhub-metabase-lts`) |
| M2  | Pin CE digests     | `image-pins.env` (same Metabase + Postgres as coexistence host)               |
| M3  | Bring-up on 19084  | `/api/health` ok; legacy 18084 still listening                                |
| M4  | Instance bootstrap | Setup admin + `mb_…` API key (gitignored)                                     |
| M5  | Retarget APZHUB    | `.env` / `.secrets/metabase` → `http://127.0.0.1:19084`                       |

## Acceptance

1. `curl http://127.0.0.1:19084/api/health` → ok; legacy `18084` still succeeds.
2. BetterAuth `GET /api/v1/analytics/health` shows Metabase `auth=valid; api=reachable` against **19084**.
3. BetterAuth `GET /api/v1/analytics/dashboards` succeeds.
4. No Authentik / legacy Metabase container changes.

## Ops

See [engines/metabase-lts/README.md](../../infrastructure/docker/engines/metabase-lts/README.md).
