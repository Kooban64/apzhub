# REST API — APZQEP-ENG-060B

## Base

`/api/v1/qep/plans`

## Endpoints

| Method | Path                        | Operation                     |
| ------ | --------------------------- | ----------------------------- |
| POST   | `/`                         | Create                        |
| GET    | `/`                         | List / Search (`?q=`)         |
| GET    | `/{planId}`                 | Get                           |
| PATCH  | `/{planId}`                 | Update draft content          |
| GET    | `/by-number/{number}`       | Get by plan number            |
| PATCH  | `/{planId}/metadata`        | Update metadata               |
| PATCH  | `/{planId}/ownership`       | Transfer ownership            |
| PATCH  | `/{planId}/assignment`      | Update assignment             |
| PATCH  | `/{planId}/schedule`        | Update schedule               |
| POST   | `/{planId}/items`           | Add item                      |
| PATCH  | `/{planId}/items/{itemId}`  | Update item                   |
| DELETE | `/{planId}/items/{itemId}`  | Remove item                   |
| POST   | `/{planId}/items/reorder`   | Reorder items                 |
| POST   | `/{planId}/submit`          | Submit for review             |
| POST   | `/{planId}/approve`         | Approve                       |
| POST   | `/{planId}/reject`          | Reject                        |
| POST   | `/{planId}/return-to-draft` | Return rejected plan to draft |
| POST   | `/{planId}/ready`           | Mark ready for execution      |
| POST   | `/{planId}/execute`         | Start execution               |
| POST   | `/{planId}/complete`        | Complete                      |
| POST   | `/{planId}/archive`         | Archive                       |
| POST   | `/{planId}/cancel`          | Cancel                        |
| POST   | `/{planId}/supersede`       | Supersede                     |
| POST   | `/{planId}/clone`           | Clone                         |
| GET    | `/{planId}/history`         | History                       |
| GET    | `/{planId}/versions`        | Revisions/versions            |
| GET    | `/{planId}/readiness`       | Execution readiness           |

## Response style

Repository-standard envelopes via `jsonDataResponse` / `jsonCollectionResponse` (`{ data, meta }` / `{ data, page, meta }`).

## Auth

`withPlatformApiAuth` + Platform RequestPipeline authorization (`qep.plan.*`). Handlers reject with `503 QEP_SERVICE_UNAVAILABLE` when QEP platform services are not bootstrapped.
