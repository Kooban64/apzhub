# Wave-Based Engineering Delivery — Amendment Summary

| Field              | Value                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Programme          | **APZQEP-GOV-ENG-BUILD-001**                                                                               |
| Status             | **ACCEPTED / APPROVED / OPERATING MODEL AMENDMENT BASELINED / CLOSED**                                     |
| Normative standard | [OES-003](../../../../engineering/oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md) |

## Amendment

Monolithic Engineering programmes are replaced by **Owner-authorised Engineering Waves** with mandatory Owner Review between Waves, under the Engineering Build Contract.

## Lifecycle (amended Engineering stage)

```text
… → Owner OES Acceptance
  → Engineering Build Contract (binding)
  → Engineering Wave 1 → Owner Review
  → Engineering Wave 2 → Owner Review
  → …
  → ECR
  → Owner Acceptance
  → Certification → Version Promotion → Freeze
```

## Wave properties (normative summary)

| Property     | Rule                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| Concept      | Bounded, reviewable Engineering increment                                  |
| Scope        | Only Owner Instruction + Architecture + OES                                |
| Owner Review | Mandatory between Waves                                                    |
| Evidence     | Completion report, tests/build, traceability, deviations, Owner pack, JSON |
| Completion   | Buildable repo; tests/docs; Build Contract compliance                      |
| Progression  | No auto-start of next Wave                                                 |
| Rollback     | Owner may require revert of failed Wave                                    |

## Test Execution reservation

See [TEST-EXECUTION-WAVE-RESERVATION.md](./TEST-EXECUTION-WAVE-RESERVATION.md).
