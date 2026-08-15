# APZHUB-owned engine topology (outside the hub)

| Field    | Value                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Ops · platform owners                                                                                                                                                                                               |
| Related  | [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md) · [HOST-COEXISTENCE-CONTROLS](./HOST-COEXISTENCE-CONTROLS.md) · [SPR-OPS-LTS-001](../sprint/SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) |
| Status   | **IN PROGRESS** — Plane LTS `19085` · Zammad LTS `19081` up; Kimai/Metabase/n8n/Paperless reserved                                                                                                                  |

## Principle

```
APZHUB Hub (BetterAuth · Gateway · Platform Services · Shell)
        │
        │  adapters only (tokens server-side)
        ▼
External CE/LTS engines (separate processes / compose projects)
```

Engines are **not** part of the hub process. They are replaceable backends behind Integration Adapters.

## Port map (this host)

### Leave alone (legacy / older platform)

| Port        | Occupant                        | Rule                                    |
| ----------- | ------------------------------- | --------------------------------------- |
| 18081–18088 | Legacy Plane/Zammad/… listeners | **Do not bind APZHUB compose here**     |
| 15678       | Legacy n8n                      | **Do not bind APZHUB compose here**     |
| Authentik   | `apz-authentik-*`               | Coexistence only — no APZHUB AuthN path |

### Hub platform (already reserved)

| Port        | Service            |
| ----------- | ------------------ |
| 3300        | `@apzhub/web`      |
| 54334       | APZHUB PostgreSQL  |
| 6380        | APZHUB Redis       |
| 17700       | APZHUB Meilisearch |
| 3080 / 3443 | Caddy (optional)   |

### APZHUB-owned CE/LTS engines

| Port  | Engine    | Product surface | Adapter today                     | Host status                                                                                                               |
| ----- | --------- | --------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 19085 | Plane     | Projects        | `integrations/plane`              | **UP** — `apzhub-plane-lts` ([SPR-OPS-LTS-PLANE-001](../sprint/SPR-OPS-LTS-PLANE-001-apzhub-owned-plane-bring-up.md))     |
| 19081 | Zammad    | Support         | `integrations/zammad`             | **UP** — `apzhub-zammad-lts` ([SPR-OPS-LTS-ZAMMAD-001](../sprint/SPR-OPS-LTS-ZAMMAD-001-apzhub-owned-zammad-bring-up.md)) |
| 19083 | Kimai     | Time            | `integrations/kimai`              | Reserved                                                                                                                  |
| 19084 | Metabase  | Analytics       | `integrations/metabase`           | Reserved                                                                                                                  |
| 19678 | n8n       | Workflow engine | `integrations/n8n`                | Reserved                                                                                                                  |
| 19082 | Paperless | Documents DMS   | **No adapter yet** (ADR required) | Reserved                                                                                                                  |

Encoded in `@apzhub/platform-operations` → `APZHUB_RESERVED_HOST_PORTS`.

## Cutover sequence (when Owner authorises bring-up)

1. Bring up **one** APZHUB-owned LTS engine on its reserved port (compose under `infrastructure/` — separate project name from `apz-stack`).
2. Point APZHUB `.env` base URLs at the new listener; keep `.secrets/*` fill-only loaders.
3. Verify BetterAuth dogfood (health + one list path).
4. Leave legacy engine running until Owner deprecates the older platform.
5. Repeat per engine. Do not batch-cutover without capacity review.

## Temporary coexistence (current)

Dogfood may still call legacy localhost ports via adapters. That is **explicitly transitional**. Do not treat it as the end state.

## Honesty

- Does **not** stop or reconfigure legacy containers in this programme step.
- Does **not** put Authentik on the APZHUB login path.
- Does **not** invent a Paperless adapter without ADR + Owner.
