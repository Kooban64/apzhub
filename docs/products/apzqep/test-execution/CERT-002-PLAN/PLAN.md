# CERT-002 Execution Plan (planning only)

## Objectives

1. Independently confirm L-02 default-allow path is absent in candidate **1.0.1-rc.1**.
2. Re-validate security scenarios in the REM-001 Access Decision Matrix.
3. Perform direct API bypass testing against evidence-reference endpoints.
4. Confirm cross-tenant isolation for evidence references.
5. Verify audit of denied evidence access.
6. Confirm regression of authorised associate workflows.
7. Assess release-candidate readiness for a later **1.0.1** promotion decision.
8. Recommend risk closure posture for RA-02 / L-02 to Owner.
9. Separately note unrestricted GA readiness **recommendation only** (Owner decides in a future programme).

## Planned activities

| #   | Activity                                                                   | Method                                     |
| --- | -------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | Code / design review of EvidenceAccessPort + associate path                | Independent review vs REM-001 design       |
| 2   | Re-run package security + regression suites                                | Vitest                                     |
| 3   | Direct API tests (authenticated / forbidden / unconfigured / cross-tenant) | Handler + integration as available         |
| 4   | Audit verification                                                         | Inspect `evidence_access_denied` emissions |
| 5   | Workbench non-authority check                                              | Confirm UI cannot override denial          |
| 6   | Playwright (if environment supports)                                       | Evidence associate deny/allow paths        |
| 7   | Candidate identity check                                                   | Confirm 1.0.1-rc.1 not silently finalised  |
| 8   | Limitation / risk recommendation                                           | Owner-facing disposition                   |

## Expected outputs (when executed under future Owner Instruction)

- CERT-002 Certification Report (delta)
- Security Verification Matrix (executed)
- Regression Report
- Limitation Disposition recommendation (close / hold)
- Owner Decision pack

## Gate

```text
PLANNING ONLY
NOT AUTHORISED
```

Do not start execution without Owner Instruction **APZQEP-CERT-002**.
