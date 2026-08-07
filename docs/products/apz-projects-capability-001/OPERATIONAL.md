# Operational — APZ-PROJECTS-CAPABILITY-001

## Capabilities delivered

| Capability           | Surface                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| Delivery Dashboard   | Project tab `delivery` · `GET /api/v1/projects/:id/delivery-dashboard` |
| Milestone Management | Tab `milestones` · platform Postgres SoR for milestones                |
| Risk Register        | Tab `risks`                                                            |
| Decision Register    | Tab `decisions` (operational; not APZQEP)                              |
| Action Register      | Tab `actions` (governance actions ≠ work items)                        |
| Health Model         | Transparent rules · schedule / risks / milestones / overdue actions    |
| Native experience    | Context panel, breadcrumbs, My Work, settings/help unchanged           |

## SoR ownership

- Projects remains System of Record for projects, tasks, and delivery registers.
- Delivery tables are platform metadata owned by Projects (`platform_project_*`).
- No Plane milestone dependency — Wave A milestones are native platform stores.
- Enterprise Context remains composition-only; may reference risks later.

## Health rules (no AI)

- **Red:** overdue milestones, critical open risks, or ≥3 overdue actions.
- **Amber:** high risks open, behind-progress milestones, or 1–2 overdue actions.
- **Green:** indicators within thresholds.
