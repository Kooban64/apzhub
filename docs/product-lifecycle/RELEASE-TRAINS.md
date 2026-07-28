# Release Train Model · Quarterly Planning · Release Promotion

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Related:** [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md)

---

## Release train model

A **Release Train** is a time-boxed delivery window that pulls Owner-approved backlog items into a coherent promotion candidate — **not** a greenfield mega-plan programme.

```text
Quarterly Planning → Approved train backlog → Delivery → Train hardening
      → Continuous Certification evidence → Owner Promotion Approval
      → SemVer tag / PORTFOLIO-RELEASE-REGISTER update
```

| Train type          | Typical SemVer       | Content                                  |
| ------------------- | -------------------- | ---------------------------------------- |
| **Platform train**  | Platform MINOR/PATCH | Shared platform capabilities / ops       |
| **Product train**   | Product MINOR/PATCH  | Single commercial product                |
| **Portfolio train** | Coordinated tags     | Multiple products + platform when needed |

## Quarterly planning

1. Groom backlog; propose train commitments (capacity-based).
2. Owner Approves the **train charter** (list of work-item IDs, non-goals, STOP confirmation).
3. No separate “Release N planning mega-pack” is required unless Owner requests one for a major shift (e.g. 2.0).
4. Mid-train adds require Owner Approval (no silent scope expansion).

## Release promotion

Promotion to Production Baseline / product Production SemVer requires:

1. Feature Acceptance for included items (or accepted train batch).
2. Quality evidence for train scope.
3. Updated Known Limitations.
4. Release notes / CHANGELOG.
5. Continuous Certification checklist (see [CONTINUOUS-CERTIFICATION.md](./CONTINUOUS-CERTIFICATION.md)).
6. Explicit Owner Promotion Approval.
7. PORTFOLIO-RELEASE-REGISTER + AI-MANIFEST / CURRENT-* refresh.

## Maintenance releases

See [HOTFIX-POLICY.md](./HOTFIX-POLICY.md) and ops Hotfix Policy — PATCH-focused, minimal scope, outside or beside the quarterly train.

## Explicit non-goal

This model does **not** authorise Release **1.3** or any SemVer bump by itself. Trains start only after Owner Approves a train charter or work items.
