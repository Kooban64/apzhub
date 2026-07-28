# Accessibility — APZQEP-ENG-030C

Conforms to ARCH-008 [ACCESSIBILITY-MODEL.md](../../architecture/traceability-workbench/ACCESSIBILITY-MODEL.md) and Design System WCAG AA target.

## Implemented cues

- Semantic headings / tables via shared `QepTable` / `QepPageShell`
- Labelled filters and form controls
- Status not colour-only (`QepStatusBadge` + text)
- Confirmation dialogs for restricting lifecycle transitions
- Matrix accessible list fallback
- Keyboard-operable primary flows (shared UI primitives)

Automated coverage in component Vitest suite; full axe regression remains Platform-level.
