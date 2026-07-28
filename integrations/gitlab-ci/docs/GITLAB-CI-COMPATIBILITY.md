# GitLab CI Compatibility

**Milestone:** R12-TCMS-01  
**Supported API version:** `v4` (GitLab REST API)

## Read-only scope

This adapter implements **metadata and read-only diagnostics** only. The following operations are explicitly unsupported:

- `dispatch` — trigger new pipelines
- `rerun` — retry failed pipelines
- `cancel` — cancel running pipelines
- `download` — artifact or log body download

FIN, Email, and Execute integrations are **not in scope** for this package.

## Core service capabilities

`GITLAB_CI_CORE_SERVICE_CAPABILITIES` documents implemented read services: repositories, workflows, pipelineRuns, jobs, steps, artifacts (metadata), logs (URL metadata), approvals (optional/empty), summary, and version.

## Health and diagnostics

| Signal                     | Meaning                                     |
| -------------------------- | ------------------------------------------- |
| `gitlab_ci_api`            | REST API reachability after connection test |
| `gitlab_ci_authentication` | PAT resolved via SecretProvider             |
| `gitlab_ci_configuration`  | Normalized config present                   |
| `gitlab_ci_capabilities`   | Core service count reported                 |
| `gitlab_ci_rate_limit`     | Observed rate-limit headers when present    |

Adapter diagnostics include `unsupportedOperations` and never expose secret values.

## Self-hosted GitLab

Configure `baseUrl` and `apiBaseUrl` for self-managed instances (e.g. `https://gitlab.example.com/api/v4`). CE/OSS REST endpoints are used; no Enterprise-only features are required.
