# Analytics Workbench — Navigation

| Surface         | Registration                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Activity Bar    | `workbench.navigation` · workspace `analytics` · icon `chart-column` · order `28`                    |
| Sidebar         | `navigation.sidebar` entries for Home, suites, Saved, Datasets, Reports, Search, Health, Diagnostics |
| Default landing | `/workspace/analytics`                                                                               |
| Deep links      | `/workspace/analytics/{suite\|dashboards/{id}\|saved\|…}`                                            |
| Command palette | `workbench.actions` with `palette: true`                                                             |
| Search          | Workspace Search view filters authorised catalogue titles/tags                                       |

Permission keys: `analytics.dashboard.view`, `analytics.dataset.view`, `analytics.report.run`, `analytics.saved.manage` (plus aggregates).
