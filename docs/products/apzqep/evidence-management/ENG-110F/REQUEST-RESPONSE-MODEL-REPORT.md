# Request / Response Model Report — APZQEP-ENG-110F

| Field               | Value                                         |
| ------------------- | --------------------------------------------- |
| Schemas             | `apps/web/lib/api/v1/schemas/qep-evidence.ts` |
| Contract identities | `packages/qep-evidence/src/api/models/`       |
| Response helpers    | `apps/web/lib/api/v1/response.ts`             |

## Request validation

Zod schemas validate path params, query strings, and JSON bodies before gateway invocation. Examples: `qepEvidenceCaptureBodySchema`, `qepEvidenceListQuerySchema`, `qepEvidenceActionBodySchema`, `qepEvidenceAccessCheckBodySchema`.

## Response envelopes

Handlers return platform-standard envelopes via `jsonDataResponse` / `jsonCollectionResponse`. Evidence DTOs include `availableActions` on detail responses for Workbench action-bar binding.

## Out of scope

No SQL persistence models, storage provider payloads, authentication session schemas, or event envelope publication added in this wave.
