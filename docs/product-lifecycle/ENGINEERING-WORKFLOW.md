# Engineering Workflow · Definition of Ready · Definition of Done · Feature Acceptance

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Normative ops refs:** [DEFINITION-OF-READY](../operations/DEFINITION-OF-READY.md) · [DEFINITION-OF-DONE](../operations/DEFINITION-OF-DONE.md) · [QUALITY-GATES](../engineering/platform-delivery/QUALITY-GATES.md) · PDS

---

## Engineering workflow (continuous)

```text
Owner Approval (scoped work item)
      ↓
Definition of Ready
      ↓
Implement under PDS + architecture boundaries
      ↓
Quality gates (typecheck · lint · tests · audits · a11y as applicable)
      ↓
Documentation + KL updates
      ↓
Definition of Done
      ↓
Feature Acceptance (Owner)
      ↓
Merge / promote via Release Train or Hotfix / Maintenance path
```

## Definition of Ready (continuous product)

An item is Ready when:

1. Owner Approval ID / work-item ID exists.
2. Scope and non-goals are explicit (including STOP adjacency).
3. Acceptance criteria are testable.
4. Architecture touchpoints and freeze/ADR needs are identified.
5. Dependencies (packages, SoRs, ops) are known.
6. Test approach is stated (unit / integration / E2E as applicable).
7. Host coexistence impact assessed when deployable.

Aligns with and does not weaken [DEFINITION-OF-READY](../operations/DEFINITION-OF-READY.md).

## Definition of Done (continuous product)

Done requires [DEFINITION-OF-DONE](../operations/DEFINITION-OF-DONE.md) minimum gates, plus:

1. No Module→Connector / Service→Engine bypass.
2. Public API / SemVer compatibility respected (or ADR + Owner for breaks).
3. KL / CHANGELOG / registers updated when user-visible or baseline-impacting.
4. Feature Acceptance report filed for the work item (or train bundle when Owner allows batch Acceptance).

## Feature Acceptance

| Mode              | When                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| **Per work item** | Default — preferred for P0 / high risk                                |
| **Train batch**   | Owner may Accept a quarterly train bundle with itemised exit criteria |

Feature Acceptance means:

1. Scope delivered.
2. Quality gates met.
3. Architecture compliance held.
4. Residual limitations documented.
5. Item closed in backlog; CURRENT-MILESTONE updated if it was the active authorisation.

Acceptance does **not** automatically bump platform/product SemVer — that is Release Promotion ([RELEASE-TRAINS.md](./RELEASE-TRAINS.md) · [VERSIONING-POLICY.md](./VERSIONING-POLICY.md)).
