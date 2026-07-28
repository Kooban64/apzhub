# Workbench — APZQEP-ENG-040C

## Principles

- Reuses Platform shell + ARCH-006 grammar (docking, panels, toolbar, navigation, command palette host, sessions, theme).
- Queue-first / list-first / inspector-first (ARCH-010).
- Consumes `/api/v1/qep/verifications/*` only — no new REST, no new persistence, no client lifecycle rules.
- Actions rendered exclusively from DTO `availableActions`.

## Surfaces

Explorer · My Queue · Team Queue · Dashboard · Search · History · Detail/Inspector · Decision dialog · Timeline · Create · Supersede

## Shell reuse

Hosted by `DesktopShell` + catch-all `/workspace/[[...segments]]`. In-workspace chrome via `QepPageShell` / `QepPanel` / `QepTable`.
