# REST API — APZQEP-ENG-050B

## Base

`/api/v1/qep/specifications`

## Endpoints

| Method | Path | Operation |
| ------ | ---- | --------- |
| POST | `/` | Create |
| GET | `/` | List / Search (`?q=`) |
| GET | `/{id}` | Get |
| PATCH | `/{id}` | Update draft |
| GET | `/{id}/history` | History |
| GET | `/{id}/versions` | Versions |
| GET | `/{id}/relationships` | List relationships |
| POST | `/{id}/relationships` | Add relationship |
| POST | `/{id}/review` | Submit for review |
| POST | `/{id}/approve` | Approve |
| POST | `/{id}/reject` | Reject |
| POST | `/{id}/withdraw` | Withdraw |
| POST | `/{id}/supersede` | Supersede |
| POST | `/{id}/retire` | Retire |
| POST | `/{id}/cancel` | Cancel |

## Response style

Repository-standard envelopes via `jsonDataResponse` / `jsonCollectionResponse` (`{ data, meta }` / `{ data, page, meta }`).

## Auth

`withPlatformApiAuth` + Platform RequestPipeline authorization (`qep.specification.*`).
