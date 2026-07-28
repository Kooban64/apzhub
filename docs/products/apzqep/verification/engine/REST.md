# REST API — Verification

Base: `/api/v1/qep/verifications`

| Method | Path                          | Purpose                    |
| ------ | ----------------------------- | -------------------------- |
| GET    | `/`                           | List (filtered, paginated) |
| POST   | `/`                           | Create                     |
| GET    | `/{verificationId}`           | Detail                     |
| POST   | `/{verificationId}/request`   | Request                    |
| POST   | `/{verificationId}/assign`    | Assign                     |
| POST   | `/{verificationId}/start`     | Start                      |
| POST   | `/{verificationId}/complete`  | Complete (verify)          |
| POST   | `/{verificationId}/reject`    | Reject                     |
| POST   | `/{verificationId}/expire`    | Expire                     |
| POST   | `/{verificationId}/withdraw`  | Withdraw                   |
| POST   | `/{verificationId}/supersede` | Supersede                  |
| POST   | `/{verificationId}/cancel`    | Cancel                     |
| POST   | `/{verificationId}/retire`    | Retire                     |
| PATCH  | `/{verificationId}/metadata`  | Update metadata            |
| PATCH  | `/{verificationId}/rationale` | Update rationale           |
| PATCH  | `/{verificationId}/priority`  | Update priority            |
| GET    | `/{verificationId}/history`   | Domain history             |

Handlers: `apps/web/lib/api/v1/handlers/qep-verification.ts`  
Schemas: `apps/web/lib/api/v1/schemas/qep-verification.ts`  
Gateway: `gateway.qep.verification`

Responses use the Platform response envelope. DTOs include server-authoritative `availableActions` where mapped via `toVerificationDto`.

Error codes follow Platform + Verification domain failures (not-found, conflict, permission, validation, lifecycle, concurrency). Backend engine details are never exposed.
