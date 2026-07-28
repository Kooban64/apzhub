# APZQEP-ENG-020F Part 3 — Implementation

| Field | Value |
| --- | --- |
| Programme | APZQEP-ENG-020F Part 3 |
| Title | Requirements Workbench Exposure, Quality Assurance and Operational Readiness |
| Architecture | APZQEP-ARCH-006 **ACCEPTED** |
| Package | `@apzhub/qep-requirements` **0.10.0** |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

## Delivered

| Area | Delivery |
| --- | --- |
| Routes | `/workspace/qep/requirements/relationships` (+ `/new`, `/supersede`, `/{id}`) |
| Explorer | List-first Relationship Explorer with type/lifecycle/conflicts filters |
| Create | Guided create with requirement search, taxonomy, semantic profile, rationale |
| Supersede | Dedicated supersession workflow (backend create+activate) |
| Detail / Inspector | Multi-pane grid; actions from `availableActions` only |
| Requirement panel | Inbound/outbound counts + conflict indicator on Requirement detail |
| Context banners | Immutable lifecycle, Content Version pins, Baseline scope |
| Telemetry | `emitQepWorkbenchTelemetry` for load/create/lifecycle/supersede |
| Tests | Component tests, availableActions contract tests, Playwright route smoke |

## Explicit non-delivery

Graph visualisation · Traceability · Verification · AI · MCP · unrestricted bulk mutation (no safe bulk API) · programme Owner Acceptance.
