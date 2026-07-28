# Navigation Architecture — APZQEP-ARCH-006

> Companion extract. Authoritative detail: [REQUIREMENTS-WORKBENCH-ARCHITECTURE.md](./REQUIREMENTS-WORKBENCH-ARCHITECTURE.md) §3, §4, §5, §18.

## Hierarchy

```text
Platform Activity Bar (QEP)
  → Module Sidebar (Requirements · Baselines · future modules)
    → Explorer modes (Living · Baseline · Versions · Saved views)
      → Main workspace tabs + Right-rail modes
```

## Rules

- Shell owns global navigation (017); modules register entries (025).
- Breadcrumbs: Workspace → Module area → View → Artefact → Version/Baseline context.
- Deep links re-validate permissions on restore (018).
- `relationships` / `baselines` path segments remain reserved identities, not Requirement ids.
