# SUP-PR-02 — Idempotency / mapping durability disposition

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-PR-02**    |
| Slice  | **APZSUP-202**   |
| Status | **Closed**       |
| Date   | 20260808T174000Z |

## Disposition

| Environment          | Mapping store                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Production           | **Postgres** `platform_entity_mapping` (default; memory forbidden without explicit escape hatch)                                  |
| Test / local         | **In-memory** (isolation)                                                                                                         |
| Support entity types | `support_request`, `support_organization`, `support_group`, `support_user`, `support_article` allowed by CHECK (migration `0141`) |

**Residual PRWL:** Zammad sync state remains in-memory (engine adapter concern — not Support SoR). HTTP `Idempotency-Key` is not a Support v1.0 surface.

## Changes

- Migration `0141_platform_entity_mapping_support_types.sql`
- Drizzle schema CHECK aligned
