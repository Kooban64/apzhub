# Workspace Model — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §5.

## Canonical panes

| Pane | Role |
| --- | --- |
| Explorer | Trace Link inventory, filters, saved filters, taxonomy browse entry |
| Main | Matrix · Editor · Comparison · Validation · Search · Analysis tabs (+ split) |
| Inspector | Trace summary, endpoints, actions |
| History | Immutable domain history |
| Lineage | Bounded upstream / downstream navigation |
| Details | Extended metadata / links |
| Activity | Validation and attention feed |
| Status bar | Lifecycle, counts, filter summary, hints |

## Primary workspaces

Trace Explorer · Trace Matrix · Trace Inspector · Trace History · Trace Link Editor · Trace Link Comparison · Trace Taxonomy Browser · Trace Validation · Trace Search · Future Coverage / Impact / Certification Lineage / Evidence Lineage views.

## Layout rules

- Hosted inside Platform shell (005/016); not a parallel shell.
- Right-rail modes mutually exclusive by default for density control.
- Pane sizes and collapse state preference/session persisted (018/023).
- Split confined to Main workspace.
- Fully usable without graph rendering.
