# APZHUB-1.2-007 — Quality Evidence

> **Programme:** APZHUB-1.2-007  
> **Date:** 2026-07-20

---

| Gate                    | Command / evidence                                                                                                               | Result              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Typecheck               | `pnpm --filter @apzhub/integration-gitlab-ci typecheck` · `pnpm --filter @apzhub/platform-services typecheck`                    | Pass                |
| Lint                    | `pnpm --filter @apzhub/integration-gitlab-ci lint` · `pnpm --filter @apzhub/platform-services lint`                              | Pass                |
| Unit tests              | `integrations/gitlab-ci` (6) · `gitlab-ci-providers.test.ts` (1) · `testing-pipelines-gitlab.test.ts` (1)                        | Pass                |
| Integration / contracts | `gitlab_ci` in `PIPELINE_PROVIDER_KINDS`; SoR import via parse adapter                                                           | Pass                |
| Adapter audit           | `pnpm audit:gitlab-ci`                                                                                                           | PASS (0 violations) |
| Regression              | Architecture boundary tests updated to forbid Module/HTTP → `integration-gitlab-ci`                                              | Pass (scoped)       |
| Compatibility           | SemVer **0.1.0** adapter; platform-services public API additive only; GHA **0.1.0** unchanged                                    | Pass                |
| Architecture            | Adapter → SDK + testing-contracts only; providers → public adapter API; no Module→Connector; Shared HTTP Transport; no mutations | Pass                |

## Architecture verification

- Path: Workbench/HTTP → Gateway → Platform Services → ProviderRegistry → `@apzhub/integration-gitlab-ci` → GitLab REST v4 (read-only).
- SoR ingestion: `PipelineResultAdapter` parse-only (no live network).
- Mirrors frozen `@apzhub/integration-github-actions` **0.1.0** posture; does not thaw GHA Reference Adapter Standard.
