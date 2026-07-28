# Hotfix & Maintenance Release Policy (Product Lifecycle View)

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Normative source:** [operations/HOTFIX-POLICY.md](../operations/HOTFIX-POLICY.md) — **this file does not supersede it**  
> **Related:** [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [INCIDENT-MANAGEMENT-STANDARD](../operations/INCIDENT-MANAGEMENT-STANDARD.md)

---

## Hotfix process (summary)

1. Classify severity (S1–S4 / P1–P4) per ops Hotfix Policy.
2. S1/S2: expedited Owner Approval; minimal fix only.
3. Branch from production tag; no feature work / refactors.
4. Regression tests for defect + critical path.
5. Certify · tag PATCH · deploy · verify health.
6. File evidence; close; create follow-up backlog item if prevention remains.

## Maintenance release process

| Aspect   | Rule                                                                |
| -------- | ------------------------------------------------------------------- |
| Intent   | Bounded PATCH (or Owner-scoped small MINOR) for production hygiene  |
| Scope    | Defects, security patches, KL honesty docs — not strategic features |
| Approval | Owner Approval of maintenance charter / item list                   |
| Quality  | DoD gates; scoped suite allowed with Tech Lead rationale            |
| Outcome  | PATCH (default) SemVer promotion + register update                  |

## Continuous product rule

Hotfixes and maintenance releases **do not** reopen Platform **1.2.0** as a project. They produce successor PATCH/MINOR evidence under continuous lifecycle.
