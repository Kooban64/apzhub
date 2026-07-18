# APZHUB APZ TCMS — GitHub Actions Operations Guide

**Milestone:** APZTCMS-020  
**Audience:** Operators, platform engineers

---

## Composition

Use `createPlatformServicesWithGitHubActions({ githubActionsCore, … })` after `createGitHubActionsAdapter()` with PAT via SecretProvider.

Ensure Testing platform services receive `providerResolver` and SoR `pipelineAdapters` including `createGitHubActionsPipelineResultAdapter()`.

Postgres migrations through **0032** required for SoR pipeline tables.

## Health & diagnostics

- Probe connectivity via adapter connect / health checks.
- Inspect diagnostics for API version, rate-limit remaining, capability gaps — never expect tokens in output.
- Classify operational health: HEALTHY / DEGRADED / LIMITED / UNAVAILABLE.

## Permissions

| Permission                            | Typical use                                   |
| ------------------------------------- | --------------------------------------------- |
| `pipeline.read`                       | Browse live + SoR metadata                    |
| `pipeline.import`                     | importRun / importFromProvider / refresh      |
| `pipeline.link`                       | evidence/coverage/certification/release links |
| `pipeline.providers`                  | list adapters                                 |
| `pipeline.archive` / `pipeline.audit` | SoR admin/audit                               |

## Limitations operators must accept

- Read-only — no dispatch/rerun/cancel
- No artifact/log binary retrieval
- GitHub App / OAuth not live
- Live browse requires provider registration; otherwise live facets return provider-unsupported errors

## Runbooks

1. **Auth failure** — verify PAT scope + SecretProvider ref; check diagnostics `authenticationStatus`.
2. **Rate limited** — inspect rate-limit diagnostics; back off; do not retry-storm from UI.
3. **Approvals empty** — treat as optional unavailable, not hard failure.
4. **Import refresh** — `importFromProvider` then inspect SoR links for governance.
