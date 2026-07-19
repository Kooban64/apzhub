# Change Management Standard

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [ENGINEERING-OPERATING-MODEL](./ENGINEERING-OPERATING-MODEL.md) · [AI-WORKFLOW](../foundation/AI-WORKFLOW.md) · ADR process

---

## Purpose

Classify proposed changes and route them through the correct approval path before implementation.

---

## Change types

| Type                          | Examples                         | Path                                                                               |
| ----------------------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| **Feature request**           | New user capability in a product | Product backlog → Definition Pack update if needed → IR → Owner-approved programme |
| **Product enhancement**       | Extend accepted Production slice | Owner-approved product programme; respect KNOWN-LIMITATIONS honesty                |
| **Platform enhancement**      | New shared service capability    | Justify product/ops need; ADR if freeze/cross-cutting; Owner-approved programme    |
| **Architecture change**       | Layering, SoR, SDK public API    | **ADR mandatory** + Owner Approval + named programme                               |
| **Breaking change**           | Contract/API break               | ADR + MAJOR version + Owner + migration plan                                       |
| **Documentation / ops model** | This folder                      | Owner Approval for material governance changes                                     |
| **Hotfix**                    | Production defect                | [HOTFIX-POLICY](./HOTFIX-POLICY.md)                                                |

---

## Risk assessment (minimum)

Before Owner Approval of implementation scope, record:

1. **Impact** — users, data, security, freezes
2. **Blast radius** — packages/apps touched
3. **Rollback** — feasible?
4. **Dependencies** — adapters/services available on disk
5. **Quality** — test/cert plan
6. **Limitations** — what remains out of scope

---

## Owner approval requirements

| Situation                            | Owner Approval required?                   |
| ------------------------------------ | ------------------------------------------ |
| New named programme                  | **Yes**                                    |
| Scope expansion mid-programme        | **Yes**                                    |
| Frozen architecture / SDK public API | **Yes** (+ ADR)                            |
| Production release / deploy          | **Yes** (release approval)                 |
| Typo-only docs in approved programme | No (Technical Lead)                        |
| Hotfix P1                            | Yes (may be expedited — see Hotfix Policy) |

---

## Feature / enhancement intake

```text
Request logged
  → Classify (product vs platform vs architecture)
  → Risk assessment
  → Product Definition Pack / ADR as required
  → Programme Recommendation (docs only)
  → Owner Approval
  → Implementation under DEFINITION-OF-READY
```

Do not implement from a chat suggestion alone. Repository + Owner gates apply.

---

## Consistency

Changes must remain consistent with:

- Knowledge Foundation status docs
- Product Portfolio & Definition Packs
- Product Engineering Reference Implementation
- QA-002 PRODUCTION READY baseline
- Documents 000–029 and freezes
