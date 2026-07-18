# GitHub Actions Mapping

**Milestone:** APZTCMS-016

Vendor DTOs stay in `src/internal/`. Public services return canonical models from `@apzhub/testing-contracts` (and thin repository/workflow metadata wrappers).

## Status mapping

| GitHub `status` / `conclusion`                | Canonical `PipelineRunStatus` |
| --------------------------------------------- | ----------------------------- |
| queued / pending / requested / waiting        | `queued`                      |
| in_progress                                   | `running`                     |
| conclusion `success`                          | `passed`                      |
| conclusion `failure` / `startup_failure`      | `failed`                      |
| conclusion `cancelled` / `canceled` / `stale` | `cancelled`                   |
| conclusion `skipped`                          | `skipped`                     |
| conclusion `timed_out`                        | `timed_out`                   |
| conclusion `action_required`                  | `queued`                      |
| otherwise                                     | `unknown`                     |

## Entity mapping

| GitHub        | Canonical                                         |
| ------------- | ------------------------------------------------- |
| Repository    | `RepositoryMetadata`                              |
| Workflow      | `WorkflowMetadata`                                |
| Workflow run  | `PipelineRunMetadata` / `CanonicalPipelineResult` |
| Job           | `PipelineJob`                                     |
| Step          | `PipelineStep`                                    |
| Artifact      | `ArtifactReference` (no download)                 |
| Environment   | `PipelineEnvironment`                             |
| Approval      | `PipelineApproval` (`kind: operations`)           |
| Job/step URLs | `PipelineLogReference` (metadata only)            |

## Mapping provider

`createGitHubActionsMappingProvider()` registers definitions via SDK `createMappingProvider`. Use `createGitHubActionsMappingRegistry()` / `createGitHubActionsMappingPipeline()` for registry consumers.
