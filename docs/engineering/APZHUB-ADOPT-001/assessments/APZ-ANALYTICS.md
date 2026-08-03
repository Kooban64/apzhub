# Assessment — APZ Analytics

| Field              | Value                              |
| ------------------ | ---------------------------------- |
| Product            | APZ Analytics                      |
| Alias              | `apz-analytics` · Metabase path    |
| Timestamp          | 20260803T084305Z                   |
| Maturity           | **Level 2 — Governed Engineering** |
| Adoption readiness | **NOT READY**                      |

## Evidence anchors

- `docs/products/analytics/` + `docs/products/apz-analytics/`
- `docs/releases/analytics/` including 1.0.0 claims
- Code: `apps/web/lib/analytics`, `packages/analytics-contracts`; Metabase integration cited
- **Absent** from `docs/products/PRODUCT-CATALOGUE.md` and ENG-002 adoption table
- Acceptance conflict: register/AI-MANIFEST ACCEPTED/CLOSED vs product README “Awaiting Acceptance”

## Area ratings

| Area                     | Rating                | Evidence / gap                                 |
| ------------------------ | --------------------- | ---------------------------------------------- |
| Engineering Governance   | PARTIAL               | APZ-ANALYTICS-001/002 packs                    |
| Product Board Governance | NOT STARTED           | No PBR / PRODUCT-STATUS                        |
| Architecture             | INITIAL               | Thin vs Law/Workflow                           |
| Documentation            | PARTIAL               | Dual packs; catalogue omission                 |
| ES Compliance            | Evidence Insufficient | —                                              |
| Testing                  | PARTIAL               | Vitest/Playwright cited                        |
| Certification Readiness  | PARTIAL               | Certification report filed; authority conflict |
| Spec Usage               | Evidence Insufficient | —                                              |
| Evidence Lifecycle       | PARTIAL               | Release artefacts                              |
| Release Governance       | Evidence Insufficient | ACCEPTED vs Awaiting Acceptance conflict       |
| Operations Governance    | INITIAL               | Ops readiness artefact only                    |
| Security Governance      | Evidence Insufficient | —                                              |
| Operational Readiness    | PARTIAL               | Artefact exists                                |
| Support Readiness        | Evidence Insufficient | —                                              |
| Version / Release Mgmt   | Evidence Insufficient | 1.0.0 claims under conflict                    |
| Risk / Dependency        | PARTIAL               | Metabase dependency; authority risk HIGH       |
| Programme Governance     | PARTIAL               | Historical                                     |
| Operational Monitoring   | Evidence Insufficient | —                                              |
| Enhancement Governance   | Evidence Insufficient | —                                              |

## Adoption readiness rationale

**NOT READY** for Phase 1 until Product Board / Owner resolves acceptance status and catalogue inclusion. Assessment must not invent which face is authoritative.
