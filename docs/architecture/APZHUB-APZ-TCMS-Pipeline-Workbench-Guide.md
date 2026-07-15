# APZHUB APZ TCMS — Pipeline Workbench Guide (APZTCMS-018)

## Surfaces

| View | Route kind | Data source |
|---|---|---|
| Pipelines home | `pipelines` | SoR `listPipelines` + `listProviders` |
| Repository | `pipeline-repository` | Live `getRepository` |
| Workflows | `pipeline-workflows` | Live `listWorkflows` |
| Runs | `pipeline-runs` | Live `listRuns` |
| Run detail | `pipeline-run-detail` | Live jobs/steps/artifacts/summary + SoR `getLinks` |

## UX rules

- Presentation only — no domain services or adapters in components
- Status badges, loading/empty/error states via shared `testing-ui`
- Client-side search/filter on runs table is allowed
- No dispatch / edit / rerun / cancel controls
- Link panels show empty states when SoR links are absent

## Commands (read-only)

Refresh, Open Workflow, Open Run, View Artifacts, View Summary, View Evidence, View Coverage, View Certification, View Release — permission-gated with `pipeline.read` / `pipeline.import`.

## Accessibility

- Tables have captions; badges expose status text
- Search landmark on runs list
- Keyboard-focusable row activation via shared table
- Contrast via design tokens only
