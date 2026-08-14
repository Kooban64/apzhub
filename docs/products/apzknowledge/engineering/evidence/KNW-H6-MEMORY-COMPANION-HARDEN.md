# KNW-H6 — Memory Companion harden (parallel track)

| Field     | Value                                            |
| --------- | ------------------------------------------------ |
| Status    | **LOCAL PROOF** 2026-08-09                       |
| Kind      | Enhance-only Operational Learning harden         |
| Authority | Owner opened FLAGSHIP parallel track after F0–F6 |

## Scope

| In                                          | Out                                 |
| ------------------------------------------- | ----------------------------------- |
| `knowledge.manage` catalogue + steward role | Knowledge 2.0 / AI / RAG            |
| Wave A sidebar nav                          | Consumer overlays in other products |
| Live memory on Home + Companion             | Documents / Paperless               |
| In-product find on Wave A lists             | Enterprise search                   |
| Unmocked create → list → detail proof       | Redesign                            |

## Changes

- Auth: `knowledge.manage`, role `knowledge-steward`, opt-in `APZHUB_KNOWLEDGE_STEWARD_AUTO_ASSIGN`, helper `scripts/knowledge-assign-steward.ts`
- Module `platform-knowledge` 0.1.1 — Wave A sidebar + manage permission
- UI: live memory panel; lessons/library/decision find; illustrative catalogue demoted

## Proof (local 2026-08-09)

1. `scripts/knowledge-assign-steward.ts` for `dev@apzhub.local`
2. `POST /api/v1/knowledge/lessons` → **201** (`kobj_cf01d81cb949494995b86a2502f0a8ed`)
3. `GET /api/v1/knowledge/objects?kind=lesson` → **200** (includes new lesson)
4. `GET /api/v1/knowledge/objects/{id}` → **200**
5. Pre-harden create without manage was **403** (confirmed)
6. Units: filter + permissions + home/companion (10 passed)
