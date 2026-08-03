# API Security — APZQEP-152

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-152       |
| Artefact  | API-SECURITY     |
| Timestamp | 20260803T064000Z |

---

## Cap A–F surface

Routes under `/api/v1/qep/*` for Suites, Execution Plans, Execution Workspace, Defects, Enterprise Requirements, Enterprise Reporting.

All Cap handlers use `withPlatformApiAuth` (session + permission resolve + tenant ALS).

## Posture (post-remediation)

| Control                          | Status                                        |
| -------------------------------- | --------------------------------------------- |
| Unauthenticated                  | 401                                           |
| Authenticated, no Cap role       | Domain deny / 403 (fail closed)               |
| Authenticated + `qep-reader`     | Read ops only                                 |
| Authenticated + `qep-operator`   | Operator read/write (not Cap `*.admin` seed)  |
| Authenticated + `platform-admin` | Full via `*`                                  |
| Tenant                           | From session only                             |
| Body size                        | `PLATFORM_API_MAX_BODY_BYTES`                 |
| Validation                       | Zod schemas per Cap                           |
| Idempotency / correlation        | Tracing + optional idempotency key on context |
| Traffic                          | Platform traffic governance                   |

## Error mapping

Cap domain permission failures map to HTTP 403 (`FORBIDDEN`). Not-found and validation map to 404/400. Stack traces are not returned via `PlatformApiHttpError` translation.

## Cap F aggregation

`qualityFactsPort` collects via Cap A–E **repositories** under the caller’s Cap F path — no privileged synthetic actor. Caller still needs Cap F permissions for reporting operations that invoke collection.

## Explicit non-claims

- Cap paths do not all run through `ProductionAuthorizationProvider` / RequestPipeline operation map (domain `requirePermission` is the Cap enforcement point).
- Workspace HTML routes remain session-gated at middleware; Cap ACL for UI shell is not certified here.
