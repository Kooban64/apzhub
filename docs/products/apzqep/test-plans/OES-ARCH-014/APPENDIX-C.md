# APZQEP-OES-ARCH-014 — APPENDIX C — Screen Inventory

> Inventory only. **No React components, pages, or file layout** authorised by this appendix.

| # | Screen / surface | Route (architectural) | Primary component(s) | Consumes |
| - | ------------------ | ----------------------- | ----------------------- | -------- |
| 1 | Dashboard | `/workspace/qep/test-plans` | Dashboard widgets | List/aggregate APIs |
| 2 | Explorer | `/workspace/qep/test-plans/explorer` | Plan Explorer | `GET /api/v1/qep/plans` |
| 3 | Review queue | `/workspace/qep/test-plans/review` | Review Queue | `GET /api/v1/qep/plans?status=review` |
| 4 | Search | `/workspace/qep/test-plans/search` | Capability Search | Platform Search Service |
| 5 | Create Draft | `/workspace/qep/test-plans/new` | Create Draft Form | `POST /api/v1/qep/plans` |
| 6 | Plan Inspector — Summary | `/workspace/qep/test-plans/plans/{planId}` | Plan Inspector (Summary panel) | `GET /api/v1/qep/plans/{planId}` |
| 7 | Plan Inspector — Edit | `/workspace/qep/test-plans/plans/{planId}/edit` | Edit Draft Form | `PATCH /api/v1/qep/plans/{planId}` |
| 8 | Plan Inspector — Items | `/workspace/qep/test-plans/plans/{planId}/items` | Linked Specifications panel | Plan DTO `items[]` (L-02) |
| 9 | Plan Inspector — Relationships | `/workspace/qep/test-plans/plans/{planId}/relationships` | Relationships panel | Reference fields + deep links |
| 10 | Plan Inspector — History | `/workspace/qep/test-plans/plans/{planId}/history` | History panel | `GET .../history` |
| 11 | Plan Inspector — Versions | `/workspace/qep/test-plans/plans/{planId}/versions` | Versions panel | `GET .../versions` |
| 12 | Plan Inspector — Compare | `/workspace/qep/test-plans/plans/{planId}/compare` | Compare (governed unavailable, L-01) | `GET .../compare` *(not yet delivered)* |
| 13 | Plan Inspector — Audit | `/workspace/qep/test-plans/plans/{planId}/audit` | Audit panel | History / audit projection |
| 14 | Action dialogs | Overlay (no dedicated route) | Submit / Approve / Reject / Return-to-Draft / Mark-Ready / Start-Execution / Complete / Archive / Cancel / Supersede / Clone / Transfer-Ownership / Assign / Schedule | `POST .../actions/*` (ENG-060B Part 4 §2.1) |
| 15 | Governed empty / not-found / forbidden states | Any route above | Design System empty/error patterns | N/A |

## Cross-capability deep-link targets (consumed, not owned)

| Target | Owning Workbench |
| ------ | ------------------ |
| Specification detail | Test Specifications Workbench (ARCH-012) |
| Requirement detail | Requirements Workbench |
| Trace Link detail | Traceability Workbench |
| Verification detail | Verification Workbench |
| Execution / Run / Evidence / Defect detail | Future capabilities — governed unavailable until they exist |
