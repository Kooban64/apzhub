# APZHUB Search Publication Architecture Freeze Notice

**Programme:** Search Publication (APZSEARCH-009–019)  
**Effective:** 2026-07-18 (APZSEARCH-019)  
**Status:** **Architecture Frozen**

---

## Frozen architecture

```text
Product Services
        ↓
Composition Hooks
        ↓
Publication Journal
        ↓
Search Orchestrator
        ↓
Retry Engine
        ↓
Search Integration Framework
        ↓
Frozen Search Platform
        ↓
Meilisearch Adapter
```

Operations overlay (APZSEARCH-017) — also frozen:

```text
Publication Workbench
→ Typed Client
→ HTTP `/api/v1/search/publication/*`
→ Publication Admin Gateway
→ Authz (search.publication.*)
→ Admin Service
→ Orchestrator public APIs
→ Journal
```

No alternative publication paths are permitted.

---

## What is frozen

| Surface                    | Freeze scope                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Framework                  | `@apzhub/search-integration` **0.2.0**                                                                                |
| Product publishers         | projects / support / documents / testing / reporting **0.1.x**                                                        |
| Orchestrator               | `@apzhub/search-orchestrator` **0.1.0**                                                                               |
| Administration             | `@apzhub/search-publication-admin` **0.1.0**                                                                          |
| Journal schema             | Migrations **0058** / **0059**                                                                                        |
| Bootstrap                  | `APZHUB_SEARCH_ORCHESTRATION_ENABLED` (deny-by-default)                                                               |
| HTTP                       | `/api/v1/search/publication/*`                                                                                        |
| Typed client               | `createHttpSearchPublicationAdminClient`                                                                              |
| Workbench                  | `/workspace/search/publication` + `platform-search-publication`                                                       |
| Authorization              | `search.publication.read\|retry\|deadletter\|admin\|diagnostics`                                                      |
| Downstream Search Platform | contracts **0.4.0** · persistence **0.2.0** · SDK **0.1.0** · Meilisearch **0.1.0** (already frozen at APZSEARCH-008) |

---

## Dependency rules (frozen)

1. Product services publish only through composition hooks
2. Orchestrator publishes only via `@apzhub/search-integration`
3. Product publishers must not import Meilisearch / search-persistence / platform-services
4. Admin package must not import search-contracts / search-persistence / Meilisearch
5. Typed client / Workbench must not import orchestrator internals or provider SDKs
6. No reverse dependencies (framework ↛ product adapters)
7. No bypass of journal / orchestrator for durable publication

---

## Extension points (permitted without thaw)

- Documentation and certification evidence updates that do not alter runtime behaviour
- Future capabilities listed in the Future Search Publication Guide — only after ADR + owner approval + new milestone

---

## Prohibited modifications

Without ADR + owner approval + architecture review + new milestone:

- Changing the frozen publication chain or ops overlay path
- Direct product → Meilisearch / Search Platform / provider SDK calls
- Skipping composition hooks, journal, or orchestrator
- Expanding publication permissions into frozen `search-contracts`
- Event Bus–driven publication, AI publication, semantic/vector indexing as part of this programme
- Silent in-memory production journal when orchestration is enabled

---

## Future evolution process

1. Formal ADR describing the proposed change
2. Explicit owner approval
3. Architecture review against this Freeze Notice and the Reference Standard
4. New approved milestone (not APZSEARCH-019)
5. Re-certification of affected boundaries

Certification-only documentation updates that do not alter behaviour remain permitted under later governance milestones.

---

## Classification retained

**PRODUCTION_READY_WITH_LIMITATIONS** (APZSEARCH-015 / 018 evidence).

---

## See also

- [Search Publication Reference Standard](./APZHUB-Search-Publication-Reference-Standard.md)
- [APZSEARCH-019 Completion Report](../sprint/APZSEARCH-019-completion-report.md)
- [APZSEARCH-018 Publication Certification](../reviews/APZSEARCH-018-publication-certification.md)
