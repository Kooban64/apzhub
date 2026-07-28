# Workspace Architecture — APZQEP-ARCH-006

> Companion extract. Authoritative detail: [REQUIREMENTS-WORKBENCH-ARCHITECTURE.md](./REQUIREMENTS-WORKBENCH-ARCHITECTURE.md) §4.

## Canonical panes

| Pane         | Role                                   |
| ------------ | -------------------------------------- |
| Explorer     | Inventory, filters, saved views        |
| Main         | Editor / compare / analyse (+ split)   |
| Inspector    | Selection properties and actions       |
| Relationship | Inbound/outbound/grouped Relationships |
| Details      | Extended metadata / links              |
| Activity     | Validation and attention feed          |
| Status bar   | Lifecycle, counts, scope, hints        |

## Layout rules

- Hosted inside Platform shell (005/016); not a parallel shell.
- Right rail modes are mutually exclusive by default for density control.
- Pane sizes and collapse state are preference/session persisted (018/023).
- Split is confined to Main workspace.
