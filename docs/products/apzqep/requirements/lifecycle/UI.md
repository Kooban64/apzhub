# UI

Presentation layer (`qep-requirements-views.tsx`) is **display-only** for lifecycle:

- Status badge from API `status` field
- Action buttons rendered from `GET .../transitions` (disabled when empty)
- Transition confirmation dialog with reason (required for reject) and comments
- Lifecycle history panel from `GET .../lifecycle`
- Create/edit forms do **not** expose status — create always starts as draft

No lifecycle logic or transition matrix in the UI.
