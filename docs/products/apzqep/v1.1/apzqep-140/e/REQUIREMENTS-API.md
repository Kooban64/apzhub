# Requirements API

Base: `/api/v1/qep/enterprise-requirements`

| Method    | Path                      | Purpose             |
| --------- | ------------------------- | ------------------- |
| GET/POST  | `/`                       | List / create       |
| GET       | `/matrix`                 | Traceability matrix |
| GET       | `/coverage-dashboard`     | Coverage dashboard  |
| GET/PATCH | `/{id}`                   | Get / update        |
| POST      | `/{id}/lifecycle`         | Transition          |
| POST      | `/{id}/link-suite`        | Explicit suite link |
| GET       | `/{id}/coverage-snapshot` | Derived coverage    |
| GET       | `/{id}/traceability`      | Derived links       |
| GET       | `/{id}/history`           | History             |

Distinct from frozen ENG `/api/v1/qep/requirements`.

Note: API path segments avoid the gitignored name `coverage/`; workspace UX may still use `/coverage`.
