# APZ TCMS — Certification Approval Model

**Milestone:** APZTCMS-009  
**Service:** `CertificationApprovalService`

---

## Capabilities

- Reviewer / approver roles
- Multiple approval stages (configuration-driven)
- Delegation placeholders
- Reject / rework
- Approval history
- Digital signature / witness **placeholders** only

Subject binding: `subjectKind = certification_record`.

---

## Final approval

Requires authorised user with `certification.approve`. Workflow `approve` / `conditionallyApprove` refuse anonymous or auto-approve paths.

Related permissions: `certification.review`, `certification.reject`, `certification.override`.
