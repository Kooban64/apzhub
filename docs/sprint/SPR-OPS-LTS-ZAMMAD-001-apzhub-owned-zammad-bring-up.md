# SPR-OPS-LTS-ZAMMAD-001 — APZHUB-owned Zammad CE/LTS bring-up

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-LTS-001](./SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Stop/reconfigure legacy `apz-zammad-*` (18081) · Authentik · Cap reopen

## Outcome

Stand up an **APZHUB-owned** Zammad CE stack on reserved **`127.0.0.1:19081`**, complete first-time setup + API token, and retarget APZHUB Support adapter env away from legacy `18081`.

## Ships

| ID  | Ship                 | Landed                                                                    |
| --- | -------------------- | ------------------------------------------------------------------------- |
| Z1  | Isolated compose     | `infrastructure/docker/engines/zammad-lts/` (project `apzhub-zammad-lts`) |
| Z2  | Pin CE image digests | `image-pins.env` (local cache reuse)                                      |
| Z3  | Bring-up on 19081    | Nginx healthy; legacy 18081 still listening                               |
| Z4  | Instance bootstrap   | AutoWizard admin + persistent API token (gitignored)                      |
| Z5  | Retarget APZHUB      | `.env` / `.secrets/zammad` → `http://127.0.0.1:19081`                     |

## Acceptance

1. `curl http://127.0.0.1:19081/` succeeds; legacy `18081` still succeeds.
2. BetterAuth `GET /api/v1/support-requests` lists tickets from the **new** instance (demo + seed), not a legacy-only catalogue.
3. No Authentik / legacy Zammad container changes.

## Ops

See [engines/zammad-lts/README.md](../../infrastructure/docker/engines/zammad-lts/README.md).
