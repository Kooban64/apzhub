# SPR-OPS-LTS-KIMAI-001 — APZHUB-owned Kimai CE/LTS bring-up

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-LTS-001](./SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Stop/reconfigure legacy `apz-kimai*` (18083) · Authentik · Cap reopen

## Outcome

Stand up an **APZHUB-owned** Kimai CE stack on reserved **`127.0.0.1:19083`**, bootstrap admin Access Token, and retarget APZHUB Time adapter env away from legacy `18083`.

## Ships

| ID  | Ship                   | Landed                                                                  |
| --- | ---------------------- | ----------------------------------------------------------------------- |
| K1  | Isolated compose       | `infrastructure/docker/engines/kimai-lts/` (project `apzhub-kimai-lts`) |
| K2  | Pin CE image           | `image-pins.env` (host CE `2.52.0` + MySQL digest)                      |
| K3  | Bring-up on 19083      | Apache healthy; legacy 18083 still listening                            |
| K4  | Instance bootstrap     | Admin + Bearer Access Token + demo timesheet (gitignored secrets)       |
| K5  | Retarget APZHUB        | `.env` / `.secrets/kimai` → `http://127.0.0.1:19083`                    |
| K6  | Kimai `+0000` datetime | `toIsoDateTime` normalizes CE offsets so timesheet list does not 503    |

## Acceptance

1. `curl http://127.0.0.1:19083/api/version` returns 401 without token (not TrustedHosts 400); legacy `18083` still succeeds.
2. BetterAuth `GET /api/v1/time/health` shows Kimai API/auth/version checks passing against **19083**.
3. BetterAuth `GET /api/v1/time/timesheets` lists the LTS demo entry.
4. No Authentik / legacy Kimai container changes.

## Ops

See [engines/kimai-lts/README.md](../../infrastructure/docker/engines/kimai-lts/README.md).
