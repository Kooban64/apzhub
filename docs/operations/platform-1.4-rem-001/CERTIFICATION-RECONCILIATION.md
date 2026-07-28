# Certification Reconciliation — Platform-1.4-REM-001

## Changes (allowlist / pins only — no product behaviour)

| Area                                                                                     | Change                                                                                         |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| OpenAPI                                                                                  | Handler + metrics/identity allowlists accept **1.14.0**                                        |
| `platform-services`                                                                      | Cert pins / audits **0.30.0 → 0.32.0** (allowlists retain prior floors)                        |
| `notification-contracts`                                                                 | Cert pins **0.2.0 → 0.3.5** (`notification-core` remains 0.2.0)                                |
| Notify delivery freeze                                                                   | Allow ENG-004 `/providers` + `/deliveries*`; keep singular `/deliver`, send, channels, workers |
| Notify EventSource / deferred SMTP strings / delivery-api fetch / delivery EventBus port | Allowlisted as authorised ENG-003/004 surfaces                                                 |
| Search wiring                                                                            | Allow `apps/web/lib/search/wiring/*` type imports of platform-services                         |

## Validation executed

| Suite                                                         | Result         |
| ------------------------------------------------------------- | -------------- |
| Admin/Config/Identity/Notify/Metrics cert + closeout (sample) | **PASS** (169) |
| Search-008 + layered 001–007                                  | **PASS**       |
| Support certification                                         | **PASS**       |
| OpenAPI handler tests (identity/config/workflows)             | **PASS**       |
| Notify-002/005 audits                                         | **PASS**       |

## OR-DEF-002

**CLOSED** for repository certification pin/allowlist drift addressed under this programme.
