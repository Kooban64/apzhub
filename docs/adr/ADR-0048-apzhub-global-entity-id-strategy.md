# ADR-0048: APZHUB Global Entity ID Strategy

## Status

Accepted — OSS-110-03

## Context

Platform services must expose stable, vendor-neutral entity identifiers to modules and future API consumers. The Plane adapter currently emits provisional IDs such as `proj_plane_{engineId}` at the adapter boundary. Those IDs:

- Leak vendor identity into platform surfaces
- Are unsuitable as permanent APZHUB global IDs
- Cannot survive engine replacement

OSS-110-03 introduces an `EntityMappingStore` that maps APZHUB global IDs to provider-native IDs. A formal global ID format is required before mapping-aware services can ship.

## Decision

1. **Format:** `{prefix}_{32-hex}` where `{prefix}` encodes the canonical entity type and `{32-hex}` is UUID v4 entropy without hyphens.

   Examples:
   - `proj_a1b2c3d4e5f64789a0b1c2d3e4f56789`
   - `ws_9f8e7d6c5b4a3928170615243f2e1d0c`
   - `sprint_…`, `label_…`, `status_…`, `module_…`, `member_…`

2. **Prefix catalogue** (constrained):

   | Entity type | Prefix |
   |-------------|--------|
   | workspace | `ws` |
   | project | `proj` |
   | task | `task` |
   | sprint | `sprint` |
   | milestone | `milestone` |
   | label | `label` |
   | status | `status` |
   | module | `module` |
   | member | `member` |
   | team | `team` |
   | user | `user` |

3. **Properties:**
   - Opaque to consumers (no vendor semantics)
   - Type-validatable via prefix
   - Collision-resistant (122 bits of UUID entropy)
   - Independent of Plane and all future engines
   - Suitable as primary key in the entity mapping store

4. **Provisional adapter IDs** (`*_plane_*`) remain adapter-boundary artefacts only. Mapping-aware platform services strip them when creating mappings and never return them to consumers.

5. **Generation** is performed by the platform mapping/orchestration layer — never by adapters writing platform IDs.

## Alternatives considered

1. **ULID / KSUID** — sortable and compact; deferred to avoid new dependencies in OSS-110-03. UUID hex meets uniqueness requirements.
2. **Keep `proj_plane_*` as platform IDs** — rejected; violates vendor neutrality (002, 009).
3. **Pure UUID without type prefix** — rejected; loses cheap type validation and debugging clarity.

## Consequences

- Platform service consumers must treat IDs as opaque strings matching the format above.
- Migration of any provisional IDs already observed in tests/docs is a mapping-layer concern — create new global IDs and bind provider-native IDs.
- Future persistent mapping store (PostgreSQL) uses the same ID format without consumer changes.
- ADR-0047 remains authoritative for Projects/Plane layering; this ADR governs identity only.

## Related

- [ADR-0047](./ADR-0047-projects-plane-integration-architecture.md)
- [Entity Mapping Specification](../specs/APZHUB-Entity-Mapping-Specification.md)
- OSS-110-03 completion report
