# GitHub Actions Adapter (`@apzhub/integration-github-actions`)

**Milestone:** APZTCMS-016  
**Package:** `integrations/github-actions/` **v0.1.0**  
**Integration ID:** `github-actions`

---

## Purpose

Read-only GitHub Actions reference adapter for APZ TCMS CI/CD. Extends `IntegrationAdapterBase` and follows the [Reference Adapter Standard](../../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md). Maps GitHub Actions metadata to canonical pipeline models from `@apzhub/testing-contracts`.

**Not in scope:** workflow dispatch/rerun/cancel, binary downloads, Platform Services, Gateway routes, UI, Event Bus, persistence, live OAuth/GitHub App auth, repository management beyond read metadata, issues, PRs.

---

## Core services (`adapter.core`)

| Service       | Access                               | Notes             |
| ------------- | ------------------------------------ | ----------------- |
| Repositories  | `adapter.core.repositories`          | getRepository     |
| Workflows     | `adapter.core.workflows`             | list / get        |
| Pipeline runs | `adapter.core.pipelineRuns` / `runs` | list / get        |
| Jobs / steps  | `adapter.core.jobs` / `steps`        | read-only         |
| Artifacts     | `adapter.core.artifacts`             | metadata only     |
| Logs          | `adapter.core.logs`                  | URL metadata only |
| Approvals     | `adapter.core.approvals`             | empty on 404      |
| Summary       | `adapter.core.summary`               | PipelineSummary   |
| Version       | `adapter.core.version`               | API `2022-11-28`  |

---

## Architecture path

```text
adapter.core.* / adapter.operations
  → GitHubActionsCoreServices / GitHubActionsOperationsService
  → GitHubActionsOperationRunner → GitHubActionsRestClient
  → SDK createHttpIntegrationClient → GitHub REST API
```

Public index never exports the REST client or raw GitHub DTOs.

---

## Parse-only TCMS adapter

`createGitHubActionsPipelineResultAdapter()` implements `PipelineResultAdapter` with `kind: "github_actions"`. It parses GitHub-shaped workflow run payloads into `CanonicalPipelineResult` with **no network I/O**.

---

## Related guides

- [GITHUB-ACTIONS-MAPPING.md](./GITHUB-ACTIONS-MAPPING.md)
- [GITHUB-ACTIONS-COMPATIBILITY.md](./GITHUB-ACTIONS-COMPATIBILITY.md)
- [GITHUB-ACTIONS-AUTHENTICATION.md](./GITHUB-ACTIONS-AUTHENTICATION.md)
- [GITHUB-ACTIONS-DEVELOPER.md](./GITHUB-ACTIONS-DEVELOPER.md)
