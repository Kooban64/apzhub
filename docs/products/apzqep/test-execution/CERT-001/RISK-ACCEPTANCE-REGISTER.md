# Risk Acceptance Register — APZQEP-CERT-001

Owner signature required at Certification Decision for Freeze eligibility.

| ID    | Related | Risk statement                                                                          | Residual severity                  | Owner acceptance                                                                                                                     |
| ----- | ------- | --------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| RA-01 | L-01    | API published without Platform OpenAPI entries for `/api/v1/qep/executions`             | Medium                             | ✅ **ACCEPTED** — Accept for Release                                                                                                 |
| RA-02 | L-02    | Evidence URI accessibility not enforced (default-allow EvidenceAccessPort)              | High                               | ✅ **ACCEPTED** — controlled production/pilot only; **mandatory remediation before unrestricted GA**; must not become permanent debt |
| RA-03 | L-03    | Execution domain events enqueued but not dispatched; no async notify/search from outbox | Medium (High if consumers assumed) | ✅ **ACCEPTED** — Accept for Release (no consumer dependency)                                                                        |
| RA-04 | L-04    | No automated Postgres repository/RLS integration tests                                  | Medium                             | ✅ **ACCEPTED** — Accept with Risk Acceptance                                                                                        |

**Register status:** **APPROVED** by Owner Certification Decision (2026-07-29).

## Explicit non-claims (if risks accepted)

By accepting this register, Owner acknowledges that Certification **does not claim**:

1. OpenAPI consumer-contract completeness for Test Execution APIs.
2. Evidence ACL enforcement at association time.
3. End-to-end outbox publication to platform event consumers.
4. CI-locked Postgres persistence/RLS regression coverage.

## If RA-02 is rejected

```text
CERTIFICATION RECOMMENDATION FLIPS TO:
RETURN TO ENGINEERING
ITEM: Wire EvidenceAccessPort evidenceCheck in production bootstrap
THEN: Re-enter Certification (delta) or continue CERT-001 after Owner re-authorises
```
