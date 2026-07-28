# GitLab CI Mapping

**Milestone:** R12-TCMS-01

Vendor DTOs stay in `src/internal/`. Public services return canonical models from `@apzhub/testing-contracts` (and thin repository/workflow metadata wrappers).

## Status mapping

| GitLab `status`                                                           | Canonical `PipelineRunStatus` |
| ------------------------------------------------------------------------- | ----------------------------- |
| created / pending / preparing / waiting_for_resource / scheduled / manual | `queued`                      |
| running                                                                   | `running`                     |
| success                                                                   | `passed`                      |
| failed                                                                    | `failed`                      |
| canceled / cancelled                                                      | `cancelled`                   |
| skipped                                                                   | `skipped`                     |
| otherwise                                                                 | `unknown`                     |

## Entity mapping

| GitLab        | Canonical                                         |
| ------------- | ------------------------------------------------- |
| Project       | `RepositoryMetadata`                              |
| Pipeline def  | `WorkflowMetadata` (`.gitlab-ci.yml` ref)         |
| Pipeline      | `PipelineRunMetadata` / `CanonicalPipelineResult` |
| Job           | `PipelineJob`                                     |
| Step          | `PipelineStep` (when present on job payload)      |
| Artifact      | `ArtifactReference` (no download)                 |
| Environment   | `PipelineEnvironment` (ref/sha)                   |
| Approval      | `PipelineApproval` (empty when unavailable)       |
| Job trace URL | `PipelineLogReference` (metadata only)            |

## Pipeline result adapter

`createGitLabCiPipelineResultAdapter()` accepts payloads with `kind: "gitlab_ci"` or native GitLab pipeline JSON. GitHub Actions-shaped payloads are rejected.
