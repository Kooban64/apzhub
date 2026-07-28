# Practice Note — Coverage Targets vs Behavioural Completeness

| Field            | Value                                                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status           | **PRACTICE NOTE** — candidate for OES-000 controlled revision                                                                                                    |
| Date             | 2026-07-27                                                                                                                                                       |
| Origin           | Owner Engineering Observation (APZQEP-ENG-060A ECR authorisation)                                                                                                |
| Normative effect | **None** until incorporated into a controlled OES revision                                                                                                       |
| Related          | [OES-000](./OES-000-Engineering-Standards-Constitution.md) **FROZEN 1.0.0**; [OES-002](./OES-002-Engineering-Review-and-Acceptance-Standard.md) **FROZEN 1.1.0** |

## Purpose

Record Owner guidance that coverage thresholds are **quality objectives**, and that Engineering Completion Review (ECR) may approve justified deviations where **behavioural completeness** has been demonstrated.

This note does **not** amend frozen OES-000. It is a candidate change for the next controlled revision (for example **OES-000 v1.1.0**).

## Recommended normative text (candidate for OES-000 v1.1.0)

> Coverage thresholds are expected objectives. Where thresholds are not achieved, the Engineering Completion Review shall determine whether uncovered code represents:
>
> - business logic,
> - lifecycle rules,
> - domain invariants,
> - policy behaviour,
> - externally observable behaviour,
>
> or only defensive, unreachable, generated, or infrastructure-support code.
>
> ECR may approve justified deviations where behavioural completeness has been demonstrated.

## Rationale

Artificial coverage inflation reduces the usefulness of coverage as a quality metric. Engineering effort should remain directed at product quality and observable domain behaviour, not numerical optimisation of unreachable or defensive paths.

## Application until OES-000 is revised

Under current frozen OES-000 / OES-002:

- Coverage objectives remain stated in engineering programmes.
- ECR (OES-002) remains the gate that assesses completion.
- Where Owner has authorised this interpretation for a specific programme (e.g. APZQEP-ENG-060A), ECR SHALL document residual classification and justification in the Completion Report / ECR record.
- CERTIFICATION remains a separate Owner-authorised programme and SHALL NOT invent coverage policy.

## First application

| Programme       | Evidence                                                                                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APZQEP-ENG-060A | ECR PASS · Owner Acceptance **ACCEPTED** coverage justification — [ECR](../../products/apzqep/test-plans/domain/ENGINEERING-COMPLETION-REVIEW.md) · [OWNER-ACCEPTANCE](../../products/apzqep/test-plans/domain/OWNER-ACCEPTANCE.md) |

**Owner precedent (2026-07-27):** Behavioural completeness takes precedence over raw coverage percentages, provided that any deviation is independently reviewed, justified, and documented.
