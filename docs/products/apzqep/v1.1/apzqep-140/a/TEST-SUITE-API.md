# Test Suite API — APZQEP-140-A

Base path: `/api/v1/qep/suites`

| Method | Path                   | Operation                         |
| ------ | ---------------------- | --------------------------------- |
| GET    | `/`                    | List / search / filter / sort     |
| POST   | `/`                    | Create                            |
| GET    | `/tree`                | Hierarchy                         |
| GET    | `/{suiteId}`           | Get aggregate (suite + history)   |
| PATCH  | `/{suiteId}`           | Update metadata                   |
| POST   | `/{suiteId}/lifecycle` | Lifecycle transition `{ status }` |
| POST   | `/{suiteId}/clone`     | Clone                             |
| POST   | `/{suiteId}/version`   | Bump version                      |
| POST   | `/{suiteId}/move`      | Move parent / folder              |

## Contracts

- Authenticated via platform API auth
- Standard success / collection / error envelopes
- No breaking platform contracts
- Tenant isolation via `ServiceRequestContext.tenantId`
