# APZ TCMS — Release Readiness Guide

**Milestone:** APZTCMS-008

---

## Principle

Release readiness is **computed and explainable**. TCMS never auto-approves a release (`isDecision: false`).

---

## Dimensions

| Dimension            | Typical inputs                          |
| -------------------- | --------------------------------------- |
| Execution readiness  | Manual/automation completion rates      |
| Coverage readiness   | Requirement/plan/suite coverage %       |
| Evidence readiness   | Missing evidence on completed work      |
| Approval readiness   | Pending vs decided approvals            |
| Automation readiness | Import health / automation completeness |
| Defect readiness     | Open critical/high defects              |
| Risk readiness       | Unmitigated high/critical risks         |

Each dimension returns a score and **reasons** array. Overall readiness aggregates dimensions (documented in service implementation — typically constrained by the weakest critical dimension).

---

## Certification readiness

`CertificationReadinessService` exposes structured inputs only — it does **not** issue certifications (APZTCMS-009).

---

## Related

[Quality Intelligence Architecture](./APZHUB-APZ-TCMS-Quality-Intelligence-Architecture.md)
