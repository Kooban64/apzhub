# Navigation Model — APZ-PROJECTS-NATIVE-001-N03

| Field     | Value                       |
| --------- | --------------------------- |
| Slice     | APZ-PROJECTS-NATIVE-001-N03 |
| Status    | **COMPLETE**                |
| Timestamp | 20260805T072500Z            |

## Registration

Workbench sidebar contributions (Support pattern):

| Route                          | Label        | Permission             |
| ------------------------------ | ------------ | ---------------------- |
| `/workspace/projects`          | Dashboard    | `projects.view`        |
| `/workspace/projects/list`     | All Projects | `projects.view`        |
| `/workspace/projects/my-work`  | My Work      | `projects.task.view`   |
| `/workspace/projects/tasks`    | Tasks        | `projects.task.view`   |
| `/workspace/projects/backlog`  | Backlog      | `projects.task.view`   |
| `/workspace/projects/sprints`  | Sprints      | `projects.sprint.view` |
| `/workspace/projects/roadmap`  | Roadmap      | `projects.view`        |
| `/workspace/projects/search`   | Search       | `projects.view`        |
| `/workspace/projects/help`     | Help         | `projects.view`        |
| `/workspace/projects/settings` | Settings     | `projects.view`        |
| `/workspace/projects/health`   | Readiness    | `projects.admin`       |

Parent activity-bar module: `services/projects/manifests/projects/module.yaml` — view title **APZ Projects**.
