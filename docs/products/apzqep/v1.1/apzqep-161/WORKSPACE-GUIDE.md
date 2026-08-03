# Workspace Guide — Enterprise Automation (APZQEP-161)

## Routes

Base: `/workspace/qep/automation`

| Surface          | Path / behaviour                                      |
| ---------------- | ----------------------------------------------------- |
| Home / Queue     | `/workspace/qep/automation` — queue + history table   |
| Providers        | `…/providers` — registry (active + placeholders)      |
| Execution detail | `…/executions/{id}` — status, timing, artifacts, refs |
| History / Queue  | Same list surface (Wave 1)                            |

Module: `modules/qep-automation` (M07 **enabled**).

## Actions

- **Run Playwright dry-run** — enqueues and runs immediately via provider-neutral API.
- Navigate to provider list and execution detail.

## UI components

Uses shared QEP shell primitives (`QepPageShell`, `QepPanel`, `QepTable`, status badges). No Playwright branding in the product surface.
