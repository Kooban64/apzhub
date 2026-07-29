# OWNER PRODUCTION RELEASE DECISION

**Programme:** APZQEP-RELEASE-001  
**Capability:** Test Execution  
**Programme Type:** Production Release  
**Date:** 2026-07-29  
**Package:** `@apzhub/qep-test-execution` **1.0.0**  
**Git tag:** `apzqep-test-execution-v1.0.0`  
**Evidence (implementation):** `docs/operations/evidence/portfolio-recert/20260729T164800Z-APZQEP-RELEASE-001.json`  
**Evidence (acceptance):** `docs/operations/evidence/portfolio-recert/20260729T174800Z-APZQEP-RELEASE-001-ACCEPTANCE.json`

## Decision

**ACCEPTED**

**APPROVED**

**PRODUCTION RELEASE BASELINED**

**PROGRAMME CLOSED**

## Release assessment

| Assessment                  | Result                           |
| --------------------------- | -------------------------------- |
| Production Baseline         | ✅ PASS                          |
| Repository Integrity        | ✅ PASS                          |
| Source Control Traceability | ✅ PASS                          |
| Tagged Release              | ✅ PASS                          |
| Build Reproducibility       | ✅ PASS                          |
| Validation                  | ✅ PASS (56/56)                  |
| Risk Acceptance             | ✅ PASS                          |
| Engineering Changes         | ✅ NONE                          |
| Release Recommendation      | ✅ LIMITED_AVAILABILITY_APPROVED |

## Production baseline

**`@apzhub/qep-test-execution` v1.0.0** is the official Production Release baseline.

## Availability

| Class                                                                           | Decision                                                               |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Limited Availability (pilot / internal / controlled rollout / selected tenants) | ✅ **APPROVED**                                                        |
| Unrestricted General Availability                                               | ❌ **NOT APPROVED** — L-02 EvidenceAccessPort must be remediated first |

## Operational note

Push branch / publish tag / verify remote reproducibility are operational activities outside Engineering Governance and require no further Owner approval.

## Lifecycle status

Architecture → Engineering Specification → Engineering → ECR → Certification → Freeze → Production Release — **COMPLETE** for Test Execution.

## Concurrent authorisation

A separate Owner Directive for **APZQEP-LIFECYCLE-001** (APZ Engineering Lifecycle Standard v1.0) was issued concurrently.

## STOP

```text
APZQEP-RELEASE-001
ACCEPTED
APPROVED
PRODUCTION RELEASE BASELINED
CLOSED
BASELINE: @apzhub/qep-test-execution 1.0.0
AVAILABILITY: LIMITED
```
