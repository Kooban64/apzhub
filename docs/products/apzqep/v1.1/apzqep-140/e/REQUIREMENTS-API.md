# Requirements API

Base: `/api/v1/qep/enterprise-requirements`

| Method    | Path                 | Purpose             |
| --------- | -------------------- | ------------------- |
| GET/POST  | `/`                  | List / create       |
| GET       | `/matrix`            | Traceability matrix |
| GET       | `/coverage`          | Coverage dashboard  |
| GET/PATCH | `/{id}`              | Get / update        |
| POST      | `/{id}/lifecycle`    | Transition          |
| POST      | `/{id}/link-suite`   | Explicit suite link |
| GET       | `/{id}/coverage`     | Derived coverage    |
| GET       | `/{id}/traceability` | Derived links       |
| GET       | `/{id}/history`      | History             |

Distinct from frozen ENG `/api/v1/qep/requirements`.
