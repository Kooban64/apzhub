# Assessment — APZ Workflow

| Field              | Value                                  |
| ------------------ | -------------------------------------- |
| Product            | APZ Workflow                           |
| Aliases            | Automation · `apz-workflow` · n8n path |
| Timestamp          | 20260803T084305Z                       |
| Maturity           | **Level 2 — Governed Engineering**     |
| Adoption readiness | **NOT READY**                          |

## Evidence anchors

- `docs/products/workflow/` + `docs/products/apz-workflow/`
- Extensive `docs/architecture/APZHUB-Workflow-*` + security reviews
- Code: `packages/workflow-*`, `integrations/n8n`
- **Absent** from PRODUCT-CATALOGUE and ENG-002 adoption table
- Acceptance conflict pattern similar to Analytics
- Platform notes: Execute unlock deferred in places

## Area ratings

| Area                     | Rating                | Evidence / gap                         |
| ------------------------ | --------------------- | -------------------------------------- |
| Engineering Governance   | PARTIAL               | APZ-WORKFLOW-001/002                   |
| Product Board Governance | NOT STARTED           | No PBR / PRODUCT-STATUS                |
| Architecture             | SUBSTANTIAL           | Deep architecture / freeze notices     |
| Documentation            | SUBSTANTIAL           | Dual packs + platform docs             |
| ES Compliance            | Evidence Insufficient | —                                      |
| Testing                  | PARTIAL               | Quality evidence cited                 |
| Certification Readiness  | PARTIAL               | Cert report / PRWL; authority conflict |
| Spec Usage               | Evidence Insufficient | —                                      |
| Evidence Lifecycle       | PARTIAL               | Release artefacts                      |
| Release Governance       | Evidence Insufficient | CLOSED vs Awaiting Acceptance          |
| Operations Governance    | INITIAL               | Ops readiness docs only                |
| Security Governance      | SUBSTANTIAL           | Multiple security reviews/guides       |
| Operational Readiness    | PARTIAL               | Historical                             |
| Support Readiness        | Evidence Insufficient | —                                      |
| Version / Release Mgmt   | Evidence Insufficient | Conflict                               |
| Risk / Dependency        | PARTIAL               | n8n + execute-deferred risk            |
| Programme Governance     | PARTIAL               | Historical                             |
| Operational Monitoring   | Evidence Insufficient | —                                      |
| Enhancement Governance   | Evidence Insufficient | —                                      |

## Adoption readiness rationale

**NOT READY** until acceptance/catalogue authority resolved. Architecture/security depth is high; governance face is not.
