# SPR-OPS-LTS-001 — APZHUB-owned engine topology (outside hub)

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** SPR-ADOPT-003 · host coexistence controls · Owner engines-outside-hub decision  
> **AuthN:** BetterAuth only  
> **Does not:** Start LTS containers · stop legacy engines · Authentik · Paperless adapter

## Outcome

Freeze the rule that **engines live outside the hub**, reserve **non-colliding host ports** for future APZHUB-owned CE/LTS engines, and document cutover without touching the running older platform.

## Ships

| ID  | Ship                                       | Landed                                                                        |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| L1  | Owner decision — engines outside hub       | [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)        |
| L2  | Topology + cutover ops doc                 | [APZHUB-OWNED-ENGINE-TOPOLOGY](../operations/APZHUB-OWNED-ENGINE-TOPOLOGY.md) |
| L3  | Reserve LTS ports in coexistence catalogue | `APZHUB_RESERVED_HOST_PORTS` (+ Meilisearch 17700)                            |
| L4  | ENVIRONMENT / controls alignment           | `ENVIRONMENT.md` · `HOST-COEXISTENCE-CONTROLS.md`                             |

## Acceptance

1. Docs state engines are external; hub uses adapters only.
2. Planned LTS ports do not overlap forbidden legacy `18081–18088` / `15678`.
3. No legacy container restarted or reconfigured in this slice.
4. Bring-up of LTS engines requires a later Owner-authorised slice (compose + verify).

## Next (not this sprint)

Authorise per-engine LTS compose bring-up (e.g. Plane on `19085`) and retarget adapter env URLs away from legacy listeners.
