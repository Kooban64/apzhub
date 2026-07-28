# Accessibility Model — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §18. Aligns with ARCH-006 accessibility principles.

## Requirements

| Area | Rule |
| --- | --- |
| Keyboard navigation | Full operation without pointer |
| Screen readers | Named regions; table/grid semantics; live regions for validation |
| High contrast | Token themes (006/022) |
| Focus management | Visible focus; restore after dialogs; logical pane order |
| ARIA | Roles for Explorer list, Matrix grid, Inspector, dialogs |
| Responsive | Collapsible panes; Matrix may fall back to list |
| Colour independence | State never colour-only |
| WCAG | Target **AA** |

## Large datasets

Virtualised lists/grids; announce result counts; jump-to Trace ID command.
