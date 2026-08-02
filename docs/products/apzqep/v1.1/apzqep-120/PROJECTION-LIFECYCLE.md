# Projection Lifecycle — APZQEP-120-S11

```text
Event received (processor)
  → Builder maps payload → KnowledgeIndexDocument
    → Upsert | Remove
      → Searchable via Query Service
```

Statuses: `active` | `archived` | `superseded` | `deleted` | `unknown`

Version: `projectionVersion` **1.0.0** (`QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION`).
