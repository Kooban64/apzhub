# SPR-OPS-LTS-PLANE-001 — APZHUB-owned Plane CE/LTS bring-up

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-LTS-001](./SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Stop/reconfigure legacy `apz-plane-*` (18085) · Authentik · Cap reopen

## Outcome

Stand up an **APZHUB-owned** Plane CE stack on reserved **`127.0.0.1:19085`**, bootstrap workspace + API token, and retarget APZHUB Projects adapter env away from legacy `18085`.

## Ships

| ID  | Ship                 | Landed                                                                  |
| --- | -------------------- | ----------------------------------------------------------------------- |
| P1  | Isolated compose     | `infrastructure/docker/engines/plane-lts/` (project `apzhub-plane-lts`) |
| P2  | Pin CE image digests | `image-pins.env` (local cache reuse)                                    |
| P3  | Bring-up on 19085    | Proxy healthy; legacy 18085 still listening                             |
| P4  | Instance bootstrap   | Workspace `apzhub` + adapter API token (gitignored)                     |
| P5  | Retarget APZHUB      | `.env` / `.secrets/plane` → `http://127.0.0.1:19085`                    |

## Acceptance

1. `curl http://127.0.0.1:19085/` succeeds; legacy `18085` still succeeds.
2. BetterAuth `GET /api/v1/projects/health` → `liveListOk: true`, `authentikUsed: false`.
3. `GET /api/v1/projects` lists projects from the **new** workspace (not legacy catalogue).
4. No Authentik / legacy Plane container changes.

## Ops

See [engines/plane-lts/README.md](../../infrastructure/docker/engines/plane-lts/README.md).
