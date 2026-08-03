# Assessment — APZ Support

| Field              | Value                                 |
| ------------------ | ------------------------------------- |
| Product            | APZ Support                           |
| Backend alias      | Zammad · `@apzhub/integration-zammad` |
| Timestamp          | 20260803T084305Z                      |
| Maturity           | **Level 3 — Certified Product**       |
| Adoption readiness | **PARTIALLY READY**                   |

## Evidence anchors

- `docs/products/support/` · `docs/releases/support/1.0.0/` ACCEPTED/CLOSED; 2.0 planning docs
- Architecture + Zammad certification docs
- Code: `integrations/zammad/` (package **0.8.0** on disk; catalogue often **0.6.0** — drift)
- ENG-002: nascent · ENG-003: Pending (pre-ADOPT-001)

## Area ratings

| Area                     | Rating                | Evidence / gap                                                             |
| ------------------------ | --------------------- | -------------------------------------------------------------------------- |
| Engineering Governance   | PARTIAL               | Wave/OSS historical closed                                                 |
| Product Board Governance | NOT STARTED           | No PBR / PRODUCT-STATUS                                                    |
| Architecture             | SUBSTANTIAL           | Support + Zammad architecture                                              |
| Documentation            | SUBSTANTIAL           | Definition + release + 2.0 planning                                        |
| ES Compliance            | Evidence Insufficient | No ES product citation pack                                                |
| Testing                  | PARTIAL               | Quality evidence / UI cert docs                                            |
| Certification Readiness  | PARTIAL               | PRODUCTION_READY_WITH_LIMITATIONS historical                               |
| Spec Usage               | Evidence Insufficient | —                                                                          |
| Evidence Lifecycle       | PARTIAL               | Release evidence                                                           |
| Release Governance       | SUBSTANTIAL           | 1.0.0 ACCEPTED; 2.0 Awaiting Acceptance (planning only)                    |
| Operations Governance    | INITIAL               | No product OPS programme                                                   |
| Security Governance      | Evidence Insufficient | No product security pack under ENG-003                                     |
| Operational Readiness    | PARTIAL               | Historical readiness                                                       |
| Support Readiness        | PARTIAL               | Product is Support; standing ENG-003 support process Evidence Insufficient |
| Version / Release Mgmt   | PARTIAL               | 1.0.0 + adapter version drift                                              |
| Risk / Dependency        | PARTIAL               | Zammad dependency; drift is a risk                                         |
| Programme Governance     | PARTIAL               | Historical                                                                 |
| Operational Monitoring   | Evidence Insufficient | —                                                                          |
| Enhancement Governance   | Evidence Insufficient | —                                                                          |

## Adoption readiness rationale

PARTIALLY READY for Phase 1. Must reconcile adapter version documentation drift before Phase 2 engineering alignment.
