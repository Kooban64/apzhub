# VISUAL-COMPONENT-LIBRARY — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |

## Component catalogue (architecture — not implemented here)

| Component              | Package home                | Notes                             |
| ---------------------- | --------------------------- | --------------------------------- |
| KPI card               | platform-dashboard / ui     | Value + trend + deep link         |
| Trend chart            | platform-visualization      | Time-series                       |
| Quality score display  | platform-visualization      | Dimensional + overall             |
| Confidence indicator   | platform-visualization      | Level + numeric                   |
| Heat map               | platform-visualization      | Risk / failure concentration      |
| Coverage visualisation | platform-visualization      | Requirement / automation coverage |
| Execution timeline     | platform-visualization      | Runs / sessions                   |
| Repository timeline    | platform-visualization      | Commits / PRs / sync              |
| Evidence timeline      | platform-visualization      | Artifact chronology               |
| Risk matrix            | platform-visualization      | Likelihood × impact               |
| Recommendation panel   | APZQEP QI presentation      | Explainability mandatory          |
| Status indicators      | ui                          | Health / gate / provider          |
| Notification strip     | Notification framework face | Consume, do not send              |
| Activity feed          | Activity stream projection  | Permission-filtered               |
| Audit timeline         | platform-visualization      | QI / SCM / automation audits      |
| Provider status board  | Ops dashboard               | Active vs placeholder             |

## Hierarchy (028)

Primitives → composite visualization → workspace widgets → APZQEP business dashboards.

Business dashboards live in APZQEP modules; shared primitives live in platform packages + `@apzhub/ui`.

## Manifest-first (future engineering)

Each shared visualization/widget starts with `component.yaml` per UI Component SDK (028). Storybook + a11y tests mandatory before merge.
