# AUDIT-VERIFICATION-REPORT — APZQEP-CERT-002

| Event                                     | Required?                  | Observed                                             | Notes                                                |
| ----------------------------------------- | -------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| Denied associate                          | Yes (REM)                  | **PASS** — `evidence_access_denied`                  | details: outcome/accessAction only — **no URI/body** |
| Successful associate                      | Mutation audit             | **PASS** — `associateEvidence` via `persistMutation` | Existing model                                       |
| Download                                  | N/A                        | No blob download API                                 | ADR-0080                                             |
| Policy/dependency failure                 | Mapped to deny audit path  | **PASS** when assert throws                          | Same deny audit branch                               |
| Cross-tenant get                          | Not evidence_access_denied | Returns null — no false existence audit required     | Secure not-found                                     |
| Secrets / tokens / evidence body in audit | Must not appear            | **PASS** — deny details omit URI                     | Inspected                                            |

## Result

Audit behaviour for L-02 deny path is **verified**. Residual Medium/Low: no dedicated `evidence_access_allowed` event beyond mutation audit (accepted model).
