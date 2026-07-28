# APZQEP-OES-ENG-070A — APPENDIX C — Route & Proposed File Inventory

> **Proposed paths only.** Nothing in this appendix is created by this OES. Concrete Next.js file paths **SHALL** follow sibling QEP Workbench conventions (Test Specifications, Requirements, Traceability, Verification) once a future `APZQEP-ENG-070A` is authorised.

## Routes (stable URL contracts, from ARCH-014 Part 2 §4 / Appendix C)

| Route | Screen |
| ----- | ------ |
| `/workspace/qep/test-plans` | Dashboard |
| `/workspace/qep/test-plans/explorer` | Explorer |
| `/workspace/qep/test-plans/review` | Review queue |
| `/workspace/qep/test-plans/search` | Capability search |
| `/workspace/qep/test-plans/new` | Create Draft |
| `/workspace/qep/test-plans/plans/{planId}` | Inspector — Summary |
| `/workspace/qep/test-plans/plans/{planId}/edit` | Edit Draft |
| `/workspace/qep/test-plans/plans/{planId}/items` | Items / Linked Specifications panel |
| `/workspace/qep/test-plans/plans/{planId}/relationships` | Relationships panel |
| `/workspace/qep/test-plans/plans/{planId}/history` | History panel |
| `/workspace/qep/test-plans/plans/{planId}/versions` | Versions panel |
| `/workspace/qep/test-plans/plans/{planId}/compare?from={rev}&to={rev}` | Compare — **governed unavailable** (L-01) |
| `/workspace/qep/test-plans/plans/{planId}/audit` | Audit panel |

## Proposed file inventory (illustrative — not created)

| Proposed path | Purpose |
| ------------- | ------- |
| `apps/web/app/workspace/qep/test-plans/**` | Route segments mirroring the table above |
| `modules/qep-test-plans/module.yaml` | Module manifest — nav registration, permissions catalogue reference |
| `modules/qep-test-plans/components/**` | Explorer, Inspector panels, Action Bar, dialogs |
| `modules/qep-test-plans/api/client.ts` | Typed REST client for `/api/v1/qep/plans/*` |
| `modules/qep-test-plans/hooks/**` | TanStack Query hooks for list/detail/mutations |
| `packages/ui/**` | Any newly promoted shared primitives (with `component.yaml`) |
| `docs/products/apzqep/test-plans/workbench/**` | Future delivery evidence pack (WP-18) |

## Cross-capability deep-link targets (consumed, not owned)

| Target | Owning Workbench |
| ------ | ------------------ |
| Specification detail | Test Specifications Workbench (ARCH-012) |
| Requirement detail | Requirements Workbench |
| Trace Link detail | Traceability Workbench |
| Verification detail | Verification Workbench |
| Execution / Run / Evidence / Defect detail | Future capabilities — governed unavailable until they exist |

## END OF APPENDIX C
