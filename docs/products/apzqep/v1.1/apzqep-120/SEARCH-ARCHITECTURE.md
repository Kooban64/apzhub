# Search Architecture — APZQEP-120-S11

Search is the **first consumer** of the Quality Knowledge Index — not the index itself.

```text
Events → Projections (QKI) → KnowledgeSearchService → Hits
```

- Filtering, sorting, paging, ranking abstraction, highlight metadata
- `projectionOnly: true` on every response
- No Meilisearch / vector / semantic search in S11 (out of scope)
