# Inspector — APZQEP-ENG-030C

Implements ARCH-008 [INSPECTOR-MODEL.md](../../architecture/traceability-workbench/INSPECTOR-MODEL.md).

## Behaviour

- Component: `QepTraceLinkDetailView`
- Panes: Context / Summary / Inspector fields (identity, endpoints, taxonomy, lifecycle, authority, confidence, scope, rationale, provenance cues)
- History shortcut to dedicated History route
- Edits (rationale, confidence, authority, scope) only when listed in DTO `availableActions`

## availableActions

| Rule        | Detail                                                               |
| ----------- | -------------------------------------------------------------------- |
| Source      | Server DTO field `availableActions` only                             |
| Computation | Backend `computeTraceLinkAvailableActions` / `@apzhub/qep-contracts` |
| UI          | Buttons/dialogs rendered iff action string present                   |
| Forbidden   | Inferring actions from lifecycle client-side                         |

Contract tests: `qep-traceability-available-actions.test.ts`, detail view tests in `qep-traceability-views.test.tsx`.
