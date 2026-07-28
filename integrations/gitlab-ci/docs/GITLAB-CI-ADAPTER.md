# GitLab CI Adapter (`@apzhub/integration-gitlab-ci`)

**Milestone:** R12-TCMS-01  
**Package:** `integrations/gitlab-ci/` **v0.1.0**  
**Integration ID:** `gitlab-ci`

---

## Purpose

Read-only GitLab CI reference adapter for APZ TCMS CI/CD. Extends `IntegrationAdapterBase` and follows the [Reference Adapter Standard](../../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md). Maps GitLab pipeline metadata to canonical pipeline models from `@apzhub/testing-contracts`.

**Not in scope:** pipeline dispatch/rerun/cancel, binary artifact or log downloads, FIN/Email/Execute integrations, Platform Services, Gateway routes, UI, Event Bus, persistence, live OAuth auth, project management beyond read metadata.

---

## Core services (`adapter.core`)

| Service       | Access                               | Notes                  |
| ------------- | ------------------------------------ | ---------------------- |
| Repositories  | `adapter.core.repositories`          | getRepository          |
| Workflows     | `adapter.core.workflows`             | list / get             |
| Pipeline runs | `adapter.core.pipelineRuns` / `runs` | list / get             |
| Jobs / steps  | `adapter.core.jobs` / `steps`        | read-only              |
| Artifacts     | `adapter.core.artifacts`             | metadata only          |
| Logs          | `adapter.core.logs`                  | URL metadata only      |
| Approvals     | `adapter.core.approvals`             | empty when unavailable |
| Summary       | `adapter.core.summary`               | PipelineSummary        |
| Version       | `adapter.core.version`               | API `v4`               |

---

## Architecture path

```text
adapter.core.*
  → GitLabCiCoreServices
  → GitLabCiRestClient
  → GitLab REST API v4
```

Public index never exports the REST client or raw GitLab DTOs.

---

## Parse-only TCMS adapter

`createGitLabCiPipelineResultAdapter()` implements `PipelineResultAdapter` with `kind: "gitlab_ci"`. It parses GitLab-shaped pipeline payloads into `CanonicalPipelineResult` with **no network I/O**.

---

## Related guides

- [GITLAB-CI-MAPPING.md](./GITLAB-CI-MAPPING.md)
- [GITLAB-CI-COMPATIBILITY.md](./GITLAB-CI-COMPATIBILITY.md)
- [GITLAB-CI-AUTHENTICATION.md](./GITLAB-CI-AUTHENTICATION.md)
- [GITLAB-CI-DEVELOPER.md](./GITLAB-CI-DEVELOPER.md)
