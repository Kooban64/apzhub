# SCM Provider Contract — APZQEP-162

## Interface

Every source-control engine implements `ScmProvider`:

| Method             | Purpose                                 |
| ------------------ | --------------------------------------- |
| `connect`          | Authenticate / establish connection     |
| `health`           | Provider health / connection test       |
| `listRepositories` | Repository discovery                    |
| `getRepository`    | Single repository metadata              |
| `listBranches`     | Branch discovery                        |
| `listCommits`      | Commit ingestion (bounded)              |
| `listPullRequests` | Pull request ingestion (bounded)        |
| `listTags`         | Optional tag discovery                  |
| `listReleases`     | Optional release discovery              |
| `registerWebhook`  | Optional remote webhook registration    |
| `verifyWebhook`    | Signature / authenticity validation     |
| `normalizeWebhook` | Map provider payload → neutral delivery |

## Descriptor

| Field          | Notes                                               |
| -------------- | --------------------------------------------------- |
| `providerId`   | Stable id (`github`, `gitlab`, …)                   |
| `name`         | Display name                                        |
| `version`      | Provider package version                            |
| `status`       | `active` \| `placeholder`                           |
| `capabilities` | String capability tags (no provider-specific enums) |

## Neutrality rules

1. No GitHub field names on engine contracts (`x-github-*` stays inside provider).
2. Engine stores `RegisteredRepository` with `providerId` + `externalId` + `fullName`.
3. Domain events use past-tense `platform.scm.*` names.
4. Placeholders must refuse execution with a clear error.

## Wave 2 active provider

**GitHub** only. All other registered providers are placeholders.
