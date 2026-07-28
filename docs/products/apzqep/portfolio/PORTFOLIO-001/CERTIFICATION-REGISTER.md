# Certification Register — APZQEP-PORTFOLIO-001

Consolidated register of every Component and Capability Certification programme executed during the First Capability Wave, classified per [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md). Cited from each capability's own certification pack — no new certification activity performed here.

## Capability Certifications (the gate for 1.0.0 and Freeze eligibility)

| Programme            | Capability                                                  | Class                             | Status                                                                              | Pack                                                                                                          |
| -------------------- | ----------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **APZQEP-REQ-001**   | Requirements                                                | PRODUCTION_READY_WITH_LIMITATIONS | **ACCEPTED / CLOSED / COMPLETE** — 1.0.0 CERTIFIED / FROZEN                         | [requirements/capability-certification/](../../requirements/capability-certification/README.md)               |
| **APZQEP-TRACE-001** | Traceability                                                | PRODUCTION_READY_WITH_LIMITATIONS | **ACCEPTED / CLOSED / COMPLETE** — 1.0.0 CERTIFIED / FROZEN                         | [traceability/capability-certification/](../../traceability/capability-certification/README.md)               |
| **APZQEP-CERT-040D** | Verification                                                | PRODUCTION_READY_WITH_LIMITATIONS | **ACCEPTED / CLOSED / COMPLETE** — 1.0.0 CERTIFIED / FROZEN                         | [verification/capability-certification/](../../verification/capability-certification/README.md)               |
| **APZQEP-CERT-050D** | Test Specifications                                         | PRODUCTION_READY_WITH_LIMITATIONS | **CERTIFIED / APPROVED / CLOSED**                                                   | [test-specifications/capability-certification/](../../test-specifications/capability-certification/README.md) |
| **APZQEP-CERT-080A** | Test Plans (integrated Domain + Infrastructure + Workbench) | PRODUCTION_READY_WITH_LIMITATIONS | **CERTIFIED / APPROVED / CLOSED** — `@apzhub/qep-test-plans` promoted 0.2.0 → 1.0.0 | [test-plans/capability-certification/](../../test-plans/capability-certification/README.md)                   |

## Component Certifications (Test Plans — the only capability delivered with the full layered pattern)

| Programme            | Layer          | Class                                            | Status                                                                                                | Pack                                                                                |
| -------------------- | -------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **APZQEP-CERT-060A** | Domain         | DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS         | **CERTIFIED / APPROVED / CLOSED** — `@apzhub/qep-test-plans` 0.1.0 CERTIFIED                          | [test-plans/domain-certification/](../../test-plans/domain-certification/README.md) |
| **APZQEP-CERT-060B** | Infrastructure | INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS | **CERTIFIED / APPROVED / CLOSED** — `@apzhub/qep-test-plans` 0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED | [test-plans/CERT-060B/](../../test-plans/CERT-060B/README.md)                       |
| **APZQEP-CERT-070A** | Workbench      | WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS      | **CERTIFIED / APPROVED / CLOSED** — `@apzhub/qep-test-plans` 0.2.0 WORKBENCH COMPONENT CERTIFIED      | [test-plans/CERT-070A/](../../test-plans/CERT-070A/README.md)                       |

## Freeze decisions (Owner Freeze Review — not certification, not engineering)

| Programme                                 | Capability          | Status                            | Pack                                                                                            |
| ----------------------------------------- | ------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| (recorded under APZQEP-REQ-001)           | Requirements        | FROZEN                            | [requirements/capability-certification/](../../requirements/capability-certification/README.md) |
| (recorded under APZQEP-TRACE-001)         | Traceability        | FROZEN                            | [traceability/capability-certification/](../../traceability/capability-certification/README.md) |
| (recorded under APZQEP-CERT-040D)         | Verification        | FROZEN                            | [verification/capability-certification/](../../verification/capability-certification/README.md) |
| Test Specifications Owner Freeze Decision | Test Specifications | **FROZEN / BASELINE ESTABLISHED** | [test-specifications/freeze/](../../test-specifications/freeze/README.md)                       |
| **APZQEP-FREEZE-080A**                    | Test Plans          | **FROZEN / APPROVED / CLOSED**    | [test-plans/freeze/](../../test-plans/freeze/README.md)                                         |

## Certification independence (established practice, honoured throughout)

Every certification programme above was conducted per [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md): CERT evaluates the capability **as delivered**; it does not implement, fix, refactor, or redesign. Where deficiencies existed, they were recorded as limitations (see [KNOWN-LIMITATIONS-REGISTER.md](./KNOWN-LIMITATIONS-REGISTER.md)) rather than silently engineered away.

## Totals

| Certification type        |              Count |
| ------------------------- | -----------------: |
| Capability Certifications |                  5 |
| Component Certifications  | 3 (all Test Plans) |
| Freeze Decisions          |                  5 |

## STOP

This register consolidates existing, closed certification decisions. No certification, remediation, or Version Promotion activity is performed by this document or this programme.
