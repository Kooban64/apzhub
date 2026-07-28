# Search Live Drain — Operational Model

> **Programme:** Platform-1.3-ENG-001 · Epic P13-E01

---

## Frozen path (unchanged)

```text
Product Services / Law Workflows
  → Composition Hooks (apps/*/lib/search)
  → Publication Journal (PostgreSQL 0058/0059)
  → Search Orchestrator processBatch
  → Search Integration Publisher
  → Publication Sink (memory + optional Meilisearch mirror)
```

---

## Activation

1. Apply journal migrations **0058** / **0059** (already in 1.2 baseline).
2. Set `APZHUB_SEARCH_ORCHESTRATION_ENABLED=true`.
3. Optionally set `SEARCH_MEILISEARCH_ENDPOINT` (+ API key / index prefix) for best-effort engine mirror.
4. Time mutations via Platform Gateway and Law workflow mutations enqueue publications.
5. Drain runs via scheduled microtask after enqueue **and** via Publication Admin `POST /api/v1/search/publication/drain`.

---

## Products activated

| Product  | Composition root                    | Entities                                                                   |
| -------- | ----------------------------------- | -------------------------------------------------------------------------- |
| **Time** | `apps/web` gateway bootstrap        | `time_entry`, `time_activity`, `time_customer`, `time_project`, `time_tag` |
| **Law**  | `apps/law-platform` action executor | `law_matter`, `law_client`, `law_document`, `law_task`                     |

---

## Diagnostics

Publication Admin `compositionRegistered` reflects real Time/Law (and optional Projects) registration flags from the shared runtime — not a hardcoded `true`.

---

## Honesty

- Search Integration remains the durable publication target per freeze.
- Meilisearch mirror is **best-effort** and does not redefine SoR.
- Do not claim “Search GA for all products” — only Time/Law live drain for this programme.
