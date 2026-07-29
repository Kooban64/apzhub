# SECURITY-VERIFICATION-REPORT — APZQEP-CERT-002

## Certification questions

| #   | Question                                | Answer                                                 | Evidence                                              |
| --- | --------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| 1   | Every known default-allow path removed? | **Yes**                                                | Source inspection; TR-03/TR-04                        |
| 2   | Access without affirmative approval?    | **No**                                                 | Only `outcome === "allowed"`                          |
| 3   | API route bypass EvidenceAccessPort?    | **No** for associate; list uses read+tenant            | Route → handler → service → command                   |
| 4   | Workbench bypass server decision?       | **No**                                                 | UI uses availableActions; server re-enforces          |
| 5   | Cross-tenant evidence access?           | **No**                                                 | get → null; associate requires tenant execution       |
| 6   | Unconfigured adapter grants access?     | **No**                                                 | `evidence_access_check_not_configured`                |
| 7   | Indeterminate grants access?            | **No**                                                 | Forbidden                                             |
| 8   | Adapter exception grants access?        | **No**                                                 | unavailable → Forbidden                               |
| 9   | Timeout/unavailable grants access?      | **No** (exception path); no silent timeout allow       | Port catch path                                       |
| 10  | Authorised workflows functional?        | **Yes**                                                | allow/baseline associate tests                        |
| 11  | Denied decisions handled securely?      | **Yes**                                                | Forbidden/Validation; no URI in audit details         |
| 12  | Audit correct?                          | **Yes** for deny associate; success via mutation audit | enforcement + orchestration                           |
| 13  | API compatibility preserved?            | **Yes** (semantics tightened for insecure configs)     | COMPATIBILITY-ASSESSMENT                              |
| 14  | DB compatibility preserved?             | **Yes** — no migration                                 | Candidate integrity                                   |
| 15  | Material regression?                    | **No** in automated suites                             | REGRESSION-REPORT                                     |
| 16  | Suitable for patch release?             | **Yes** (recommend)                                    | GA/patch assessments                                  |
| 17  | Unrestricted GA supportable now?        | **Not recommended yet**                                | Playwright gap + L-01/L-03/L-04 + coarse baseline ACL |

## Default-deny conditions verified

Unconfigured · undefined · null · indeterminate · adapter throw · missing actor/tenant · unsupported scheme · malformed URI · explicit deny · insufficient permission · cross-tenant get.

## Positive authorisation

Explicit allow and baseline affirmative policy grant associate for valid actor+URI under execute permission.

## Residual notes (not L-02 bypasses)

1. Production uses affirmative **baseline** URI/actor policy until a finer Evidence Management ACL is injected — intentional REM design.
2. `listEvidenceReferences` is execution-read gated (references only), not EvidenceAccessPort.
3. Playwright authenticated journeys incomplete in this environment; no dedicated browser deny/allow evidence specs.
