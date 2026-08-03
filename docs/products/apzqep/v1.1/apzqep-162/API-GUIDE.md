# API Guide — APZQEP-162

Base: `/api/v1/qep/scm`

All routes are provider-neutral. Do **not** expose GitHub-specific request/response shapes.

| Method | Path                                 | Operation                       |
| ------ | ------------------------------------ | ------------------------------- |
| GET    | `/providers`                         | List provider descriptors       |
| POST   | `/providers/connect`                 | Connect provider                |
| GET    | `/repositories`                      | List registered repositories    |
| POST   | `/repositories`                      | Register repository             |
| GET    | `/repositories/{repositoryId}`       | Repository + traceability links |
| POST   | `/repositories/{repositoryId}/sync`  | Synchronise refs                |
| POST   | `/repositories/{repositoryId}/state` | Enable / disable                |
| GET    | `/webhooks`                          | Webhook delivery audit          |
| POST   | `/webhooks/{providerId}`             | Ingest webhook                  |
| POST   | `/traceability`                      | Create relationship link        |

## Auth

Wrapped with `withPlatformApiAuth`. Correlation IDs via platform tracing.

## Errors

Typed platform error envelope (`SCM_ERROR`, `VALIDATION_FAILED`, `NOT_FOUND`). No raw GitHub API errors to clients.
