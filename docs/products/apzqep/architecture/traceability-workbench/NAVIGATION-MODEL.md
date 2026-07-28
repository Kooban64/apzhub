# Navigation Model — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §4, §5, §15.

## Hierarchy

```text
Platform Activity Bar (QEP)
  → Module Sidebar (Requirements · Baselines · Traceability · future modules)
    → Traceability internal:
         Explorer · Matrix · Editor · Validation · Taxonomy · Search
         Right rail: Inspector | History | Lineage | Details | Activity
```

## Lineage navigation

| Mode | Behaviour |
| --- | --- |
| Upstream / downstream | Bounded hop lists from selection |
| Breadcrumbs | Workspace → Traceability → View → Trace Link → Endpoint context |
| Supersession | Predecessor ↔ successor |
| Cross-domain | Open endpoint in owning module when registered |
| Chain traversal | Explicit expand; configured max depth |

## Rules

- Shell owns global navigation (017); modules register entries (025).  
- Deep links re-validate permissions on restore (018).  
- No graph engine required.  
- Trace Link ids (`trl_*`) must not collide with Requirements Relationship routes.  
