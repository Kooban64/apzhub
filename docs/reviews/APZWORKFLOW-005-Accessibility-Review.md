# APZWORKFLOW-005 — Accessibility Review

**Scope:** Workflow Workbench (`/workspace/workflows`) as delivered in APZWORKFLOW-004  
**Result:** PASS with residual presentation debt tracked as non-blocking

## Verified conventions

| Area                      | Notes                                                                |
| ------------------------- | -------------------------------------------------------------------- |
| Toolbar                   | `role="toolbar"` + labelled Workflows commands                       |
| Tables                    | Captions (`sr-only`), row keyboard Enter/Space where selectable      |
| Status / errors           | `role="status"` / `role="alert"` for live regions                    |
| Definition Viewer / Graph | Section/`aria-label` landmarks; SVG nodes exposed via testids/labels |
| Audit Timeline            | List semantics with entry identity                                   |
| Empty / loading           | Distinct `data-testid` empty/loading states for assistive tech       |
| Tokens                    | Design tokens only (contrast via theme system)                       |

## Residual (non-blocking)

Large overview switcher and dense tables benefit from future a11y hardening in a later UX milestone — not a certification defect for management-plane readiness. Corrected only genuine defects found; no redesign performed.
