# WORKSPACE-ARCHITECTURE — APZQEP-164-000

| Field     | Value                                  |
| --------- | -------------------------------------- |
| Programme | APZQEP-164-000                         |
| Timestamp | 20260803T191002Z                       |
| Base path | `/workspace/qep/dashboards` (intended) |

## Shell integration (005 / 016 / 017)

Enterprise Dashboard Workspace registers under QEP Activity Bar / Sidebar as **Dashboards** (or **Quality Experience** label — Board may choose). Layout uses permanent shell regions; no isolated page chrome.

## Landing pages

| Landing     | Audience focus                         | Primary content                           |
| ----------- | -------------------------------------- | ----------------------------------------- |
| Executive   | Risk, readiness, portfolio quality     | Scores, release gates, recommendations    |
| Engineering | Delivery health, automation, SCM       | Trends, repo activity, failures           |
| QA          | Coverage, evidence, defects, execution | Suites, evidence completeness, QI signals |
| Project     | Single project / product slice         | Scoped KPIs and readiness                 |
| Operations  | Providers, jobs, health                | Automation/SCM/QI provider status         |
| Personal    | User-pinned views                      | Saved layouts, recent recommendations     |

## Workspace features

- Saved views (filters + layout + time range) — platform metadata only
- Pinned dashboards — Preference Service hierarchy (023)
- Deep links to Evidence / QI recommendation / Execution / SCM repo
- Global search integration (020) — permission-filtered
- Command palette integration (019) — open dashboard / pin / refresh / accept recommendation (via services)
- Responsive layouts — desktop-first, usable tablet; mobile read-focused
- Session restore — layout refs only; re-validate permissions on restore (018)

## Non-goals

- Conversational AI panel
- Editing SoR entities inside dashboard chrome (use existing workspaces)
- Hardcoded module list in shell (025 registry)
