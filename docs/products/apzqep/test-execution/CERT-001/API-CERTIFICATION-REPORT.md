# API Certification Report — APZQEP-CERT-001

## Catalogue

Base: `/api/v1/qep/executions`

| Method    | Path                                    | Auth                             |
| --------- | --------------------------------------- | -------------------------------- |
| GET, POST | `/`                                     | `withPlatformApiAuth` + pipeline |
| GET       | `/assigned`                             | ✅                               |
| GET       | `/review-queue`                         | ✅                               |
| POST      | `/ingestions`                           | ✅                               |
| GET       | `/progress/by-plan/[planId]`            | ✅                               |
| GET       | `/[executionId]`                        | ✅                               |
| GET       | `/[executionId]/manifest`               | ✅                               |
| GET       | `/[executionId]/history`                | ✅                               |
| GET       | `/[executionId]/available-actions`      | ✅                               |
| GET       | `/[executionId]/steps`                  | ✅                               |
| POST      | `/[executionId]/steps/[stepId]/results` | ✅                               |
| GET, POST | `/[executionId]/evidence-references`    | ✅                               |
| GET, POST | `/[executionId]/observations`           | ✅                               |
| POST      | `/[executionId]/actions/[action]`       | ✅                               |

## Verification

| Check                                    | Result     | Evidence                                         |
| ---------------------------------------- | ---------- | ------------------------------------------------ |
| Request validation (Zod / parseJsonBody) | ✅         | Handlers + schemas                               |
| Response envelope / typed errors         | ✅         | `mapHandlerError`                                |
| Authentication                           | ✅         | `withPlatformApiAuth`                            |
| Authorization                            | ✅         | `qepTestExecution` 28-op map → `qep.execution.*` |
| Versioning path `/api/v1`                | ✅         | REST-first platform convention                   |
| Handler unit coverage                    | ✅         | 8 handler tests PASS                             |
| Disabled service → 503                   | ✅         | Handler tests                                    |
| OpenAPI consistency                      | ⚠ FAIL gap | No paths in Platform OpenAPI (L-01)              |

## Verdict

**PASS WITH LIMITATIONS** — live API surface and authz certified; OpenAPI documentation consistency **not** certified (L-01 disposition required).
