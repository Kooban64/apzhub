# SPR-OPS-LTS-N8N-001 — APZHUB-owned n8n CE/LTS bring-up

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-LTS-001](./SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Stop/reconfigure legacy `apz-n8n` (15678) · Authentik · Cap reopen · shared `apzpg`

## Outcome

Stand up an **APZHUB-owned** n8n CE stack on reserved **`127.0.0.1:19678`**, complete owner setup + API key, and retarget APZHUB Workflow engine env away from legacy `15678`.

## Ships

| ID  | Ship               | Landed                                                              |
| --- | ------------------ | ------------------------------------------------------------------- |
| N1  | Isolated compose   | `infrastructure/docker/engines/n8n-lts/` (project `apzhub-n8n-lts`) |
| N2  | Dedicated Postgres | Own DB volume — not shared `apzpg`                                  |
| N3  | Bring-up on 19678  | `/healthz` ok; legacy 15678 still listening                         |
| N4  | Instance bootstrap | Owner + API key + demo workflow (gitignored)                        |
| N5  | Retarget APZHUB    | `.env` / `.secrets/n8n` → `http://127.0.0.1:19678`                  |

## Acceptance

1. `curl http://127.0.0.1:19678/healthz` → ok; legacy `15678` still succeeds.
2. BetterAuth `GET /api/v1/workflows/engine/health` → healthy against **19678**.
3. BetterAuth `GET /api/v1/workflows/engine/workflows` lists the LTS demo workflow.
4. No Authentik / legacy n8n container changes.

## Ops

See [engines/n8n-lts/README.md](../../infrastructure/docker/engines/n8n-lts/README.md).
