# Owner Approval Workflow

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Related:** [OWNER-ACCEPTANCE-REGISTER](../foundation/OWNER-ACCEPTANCE-REGISTER.md) · PDS templates · CURRENT-MILESTONE

---

## Principle

**No engineering without Owner Approval.** Continuous delivery does not mean continuous unsupervised coding.

## Approval types

| Type                               | Authorises                                              | Does not authorise             |
| ---------------------------------- | ------------------------------------------------------- | ------------------------------ |
| **Work-item Approval**             | Implement one backlog item (or small explicit set)      | SemVer promotion · STOP themes |
| **Train charter Approval**         | Deliver listed items in a quarterly train               | Unlisted scope · redesign      |
| **Hotfix Approval**                | Minimal production fix                                  | Features / refactors           |
| **Promotion Approval**             | SemVer / Production Baseline advance                    | New engineering scope          |
| **STOP / Major theme Approval**    | Named Email / FIN / Execute / redesign / 2.0-class work | Implicit adjacent features     |
| **Lifecycle / Standards Approval** | Docs frameworks (this pack)                             | Code                           |

## Workflow

```text
Backlog candidate
      ↓
Owner Approval (ID + scope + non-goals + recommendation expectation)
      ↓
CURRENT-MILESTONE / AI-MANIFEST updated (active authorisation)
      ↓
Engineering under PDS
      ↓
Feature Acceptance (Owner)
      ↓
(optional) Promotion Approval
```

## Acceptance vs Approval

| Term                 | Meaning                                        |
| -------------------- | ---------------------------------------------- |
| **Owner Approval**   | Permission to start work                       |
| **Owner Acceptance** | Confirmation work (or pack) is done and closed |

Both are recorded in OWNER-ACCEPTANCE-REGISTER (or successor continuous register section).

## AI / agent rules

1. Bootstrap from AI-MANIFEST only.
2. Do not invent Approvals from conversation history.
3. Do not start Release 1.3 / P1 / STOP from lifecycle docs alone.
4. Stop when CURRENT-MILESTONE says stop.
