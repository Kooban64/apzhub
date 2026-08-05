# Workspace Experience — TIME-NATIVE-001-A03

| Field     | Value            |
| --------- | ---------------- |
| Status    | **COMPLETE**     |
| Timestamp | 20260804T200500Z |

## Product framing

Users experience **APZHUB → APZ Time**. Presentation is owned by the Time workspace UI; business state remains on Time platform services.

## Composition

| Element                 | Implementation                                                                 |
| ----------------------- | ------------------------------------------------------------------------------ |
| Page chrome             | `PageShell` — product name **APZ Time**, breadcrumbs, title, actions           |
| Workspace frame         | `TimeWorkspaceFrame` — primary column + optional context panel                 |
| Responsive behaviour    | Context panel stacks below content on small screens; sticky aside on `lg+`     |
| Workspace state         | Session/local preferences (`apzhub.time.*`) for last entities + onboarding tip |
| Empty / loading / error | Shared `EmptyState` / `LoadingState` / `ErrorState` with APZ Time copy         |

## Operator overview

`/workspace/time` presents:

- Recent work (timesheets)
- Current timer (running timesheet in context panel)
- Quick actions
- Optional getting-started tip (dismissible)

No adapter-console concepts on the overview.
