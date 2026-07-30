# Known Limitations Register — APZQEP-RELEASE-004

Authority: APZQEP-CERT-003 Owner Acceptance (limitations remain binding).

| ID                | Limitation                                                                    | Status          |
| ----------------- | ----------------------------------------------------------------------------- | --------------- |
| ADR-0088          | Durable storage undecided; memory-only persistence                            | Accepted for LA |
| Observability     | Evidence-specific health/metrics deferred                                     | Accepted for LA |
| Event publication | Not published to platform bus                                                 | Accepted for LA |
| L-EM-01           | List/search permission+tenant scoped; per-item ACL on identified-resource ops | Accepted for LA |
| GA                | General Availability not approved                                             | Binding         |
| Durable SoR       | Unrestricted Evidence SoR not approved                                        | Binding         |

Release blocker **B-01** is an operational repository-access constraint, not a CERT-003 product limitation. RELEASE-003 **B-02** is closed via REM-002 and is not a RELEASE-004 blocker.
