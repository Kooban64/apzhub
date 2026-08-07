# Design Support — Baseline Inventory (as-built)

| Field    | Value                                                     |
| -------- | --------------------------------------------------------- |
| Snapshot | 20260806T194400Z                                          |
| Scope    | APZ Projects workbench + Wave A delivery + Context wiring |

## Workspace & shell

- Router: `apps/web/components/projects/projects-workspace-router.tsx`
- Local chrome: `projects-ui.tsx` (PageShell, tables, badges — not full `@apzhub/ui` DataTable)
- Base path: `/workspace/projects`

## Screens present

| Area                                | Status                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| Home dashboard                      | Present (thin)                                                                            |
| Project list / create / detail      | Present                                                                                   |
| My Work                             | Present                                                                                   |
| Tasks / Backlog / Sprints / Roadmap | Present — **thin** (tasks tables; sprints = group by `sprintId`; roadmap = due-date sort) |
| Search / Help / Settings / Health   | Present                                                                                   |
| Delivery tab + panels               | Present (Wave A)                                                                          |
| Enterprise Context aside            | Present on project detail                                                                 |

## Wave A delivery (platform Postgres)

Milestones · Risks · Decisions · Actions · Delivery health · Delivery dashboard — API + UI panels exist.

## Engine-backed (Plane via Platform Services)

Projects CRUD · Tasks CRUD · assign / transition — production path via `/api/v1/projects` and `/api/v1/tasks`.

## Contracts exist but UI/client thin or missing

Sprint entity CRUD · Labels/Statuses/Modules admin · Roadmap entity · Activity feed · Parent/hierarchy UX · Board/Kanban · Gantt · Comments/attachments · Portfolio · Templates · Baselines · Critical path · Approvals · Import/Export · Dedicated Projects notifications

## Shared platform assets available

- `@apzhub/ui` (Button, Input, Card, shell primitives — DataTable underused by Projects)
- Enterprise Context composition service + panel
- Search projects package + lifecycle hooks
- Event manifests under `events/projects/` (notify wiring not product-complete)
- Design System / tokens mandate (006 / 028)

## Tests

Unit/component coverage for routes, API client, delivery service, Context panel; Playwright workbench + Context specs exist.
