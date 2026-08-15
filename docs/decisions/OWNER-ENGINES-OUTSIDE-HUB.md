# Owner decision — Engines live outside APZHUB; BetterAuth only

| Field     | Value                                                                                                                                                                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | **IN FORCE**                                                                                                                                                                                                                                         |
| Date      | 2026-08-15                                                                                                                                                                                                                                           |
| Authority | Owner                                                                                                                                                                                                                                                |
| Related   | [OWNER-BETTERAUTH-SOLE-AUTHN](./OWNER-BETTERAUTH-SOLE-AUTHN.md) · [008](../008-module-connector-integration-architecture.md) · [SPR-OPS-LTS-001](../sprint/SPR-OPS-LTS-001-apzhub-owned-engine-topology.md) · [ENVIRONMENT.md](../../ENVIRONMENT.md) |

## Decision

1. **Engines are outside the hub.** Plane, Zammad, Kimai, Metabase, n8n, Paperless (future), and peers are **external backend engines**. APZHUB never embeds their runtimes in `@apzhub/web` or Platform Services processes.
2. **Integration path only:** Client → Gateway → Platform Service → Service Connector / Integration Adapter → Engine. Modules never call engines directly ([008](../008-module-connector-integration-architecture.md), [003](../003-layered-architecture.md)).
3. **AuthN for APZHUB users is BetterAuth only.** Engine API tokens/keys stay server-side in adapters. Users never complete engine or Authentik login for normal APZHUB work.
4. **Legacy host engines stay alone until cutover.** Running `apz-*` containers and Authentik remain for the older platform’s limited use. Do not restart, reconfigure, or “fix” them for APZHUB convenience.
5. **Target state:** APZHUB-owned **CE/LTS** engine instances on dedicated host ports (see SPR-OPS-LTS-001). Temporary coexistence API wiring to legacy listeners is transitional dogfood only.
6. **Deprecate the older platform** when APZHUB + its owned engines are the working path — not before.

## Consequences

- Prefer bring-up of APZHUB-owned LTS compose over deepening dependency on `18081–18088` / `15678`.
- Paperless (and any engine without an on-disk adapter) still needs ADR + Owner before adapter work.
- Host port catalogue must keep hub ports, forbidden legacy ports, and planned LTS ports distinct.

## Non-goals

Standing up all LTS engines in this decision · Stopping Authentik today · Moving engine binaries into the monorepo runtime.
