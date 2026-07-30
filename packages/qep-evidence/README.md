# `@apzhub/qep-evidence`

| Field              | Value                                             |
| ------------------ | ------------------------------------------------- |
| Capability         | Evidence Management (M09)                         |
| Version            | **1.0.0-rc.1**                                    |
| Class              | **PRODUCTION_READY_WITH_LIMITATIONS**             |
| Suitability        | **LIMITED_AVAILABILITY**                          |
| Domain             | **implemented-eng-110b**                          |
| Application        | **secured-eng-110e**                              |
| Infrastructure     | **abstractions-eng-110c** (ADR-0088 undecided)    |
| API / Presentation | **implemented-eng-110f**                          |
| Programme          | **APZQEP-FREEZE-003** Production Freeze Candidate |

## Rules

- Domain owns business rules; Application orchestrates; Security enforces access.
- Default-deny / fail-closed (L-02). Only `outcome === "allowed"` grants access.
- Execution flow: Transport → Security → Application → Domain → Repository Contracts → Storage Port → Adapters → Infrastructure.
- Persistence runtime is **in-memory** until Owner-authorised storage selection (ADR-0088). Not a silent production DB.

## Live surfaces

- REST: `/api/v1/qep/evidence`
- Workbench: `/workspace/qep/evidence`
- Module: `modules/qep-evidence/module.yaml`

## Accepted limitations (CERT-003)

- ADR-0088 durable storage deferred
- Evidence-specific observability deferred
- Event publication deferred
- L-EM-01 list/search permission+tenant scoped

## Not authorised under FREEZE-003

- Durable storage implementation · Freeze→Release transition · GA
