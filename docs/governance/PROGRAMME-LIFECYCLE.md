# APZHUB Programme Lifecycle

> **Programme:** APZHUB-GOVERNANCE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [ENGINEERING-OPERATING-MODEL](../operations/ENGINEERING-OPERATING-MODEL.md) · [AI-WORKFLOW](../foundation/AI-WORKFLOW.md) · [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)  
> **Date:** 2026-07-19

---

## Purpose

Canonical programme lifecycle for dashboard **Programme Governance** — applies to product, platform, docs-only, hotfix, and governance programmes.

---

## 1. Lifecycle (mandatory)

```text
Bootstrap
  → Recommendation (optional for docs-only Owner Approvals)
  → Owner Approval
  → Implementation (or documentation delivery)
  → Test / Certify (as applicable)
  → Acceptance Report
  → Owner Acceptance
  → CLOSED
  → Bootstrap (next)
```

Documentation-only programmes may compress Recommendation when Owner Approval is the commencement artefact — still require Completion + Acceptance Reports.

---

## 2. Dashboard status mapping

| Lifecycle point                        | Programme status enum              |
| -------------------------------------- | ---------------------------------- |
| Idea / recommendation filed            | `RECOMMENDED_AWAITING_APPROVAL`    |
| Owner Approval recorded                | `APPROVED_AWAITING_IMPLEMENTATION` |
| Delivery done; Acceptance Report filed | `IMPLEMENTED_AWAITING_ACCEPTANCE`  |
| Owner Acceptance                       | `ACCEPTED_CLOSED`                  |
| Explicit STOP / dependency             | `BLOCKED`                          |
| Owner cancels                          | `CANCELLED`                        |

---

## 3. Programme classes

| Class             | Examples                                        | Implementation authorised?         |
| ----------------- | ----------------------------------------------- | ---------------------------------- |
| Documentation     | KF, RELEASES-001, PORTFOLIO-001, GOVERNANCE-001 | Docs only                          |
| Product           | PROJECTS-001, Time 1.0.0                        | After Approval                     |
| Platform          | OSS-100-_, APZMETRICS-_                         | After Approval; freeze rules apply |
| Integration       | KIMAI-002, Plane waves                          | After Approval                     |
| Release packaging | Support 1.0.0 SemVer pack                       | Docs / metadata                    |
| Hotfix            | HOTFIX-*                                        | HOTFIX-POLICY                      |

---

## 4. Dashboard sections (Programme Governance)

| Section              | Content                                             |
| -------------------- | --------------------------------------------------- |
| Current Programme    | From CURRENT-MILESTONE “Active programme”           |
| Completed Programmes | ACCEPTED_CLOSED (recent window)                     |
| Pending Acceptance   | IMPLEMENTED_AWAITING_ACCEPTANCE                     |
| Blocked Programmes   | BLOCKED with reason                                 |
| Upcoming Programmes  | RECOMMENDED or Owner-declared next (not authorised) |

---

## 5. Required artefacts per state

| Status          | Minimum artefacts                                          |
| --------------- | ---------------------------------------------------------- |
| RECOMMENDED_*   | Recommendation / assessment doc                            |
| APPROVED_*      | Owner Approval text (chat or filed)                        |
| IMPLEMENTED_*   | Completion Report + Acceptance Report                      |
| ACCEPTED_CLOSED | Acceptance Report marked ACCEPTED / CLOSED; KF nav updated |

---

## 6. Rules

1. Conversation history never authorises implementation.
2. Acceptance ≠ Approval for the next programme.
3. Freeze breaks require ADR + Owner inside the programme.
4. Docs-only programmes still STOP on implementation verbs.

---

## Related

- [ENGINEERING-GOVERNANCE-DASHBOARD.md](./ENGINEERING-GOVERNANCE-DASHBOARD.md)
- [CERTIFICATION-LIFECYCLE.md](./CERTIFICATION-LIFECYCLE.md)
- [PORTFOLIO-STATUS-MODEL.md](./PORTFOLIO-STATUS-MODEL.md)
