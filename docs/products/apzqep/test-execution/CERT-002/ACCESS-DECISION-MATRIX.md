# ACCESS-DECISION-MATRIX — APZQEP-CERT-002

| ID  | Scenario                     | Actor         | Tenant | Evidence Relationship | Policy Result      | Expected Outcome         | Actual Outcome                     | Evidence                 | Result      |
| --- | ---------------------------- | ------------- | ------ | --------------------- | ------------------ | ------------------------ | ---------------------------------- | ------------------------ | ----------- |
| S01 | Explicit allow               | Executor      | Same   | Valid https URI       | allow              | Associate OK             | Associate OK                       | enforcement + port       | **PASS**    |
| S02 | Explicit deny                | Executor      | Same   | Valid URI             | deny               | Forbidden + audit        | Forbidden + audit                  | enforcement              | **PASS**    |
| S03 | No check configured          | Executor      | Same   | Valid URI             | n/a                | Deny                     | Deny `not_configured`              | port                     | **PASS**    |
| S04 | Undefined result             | Executor      | Same   | Valid URI             | undefined          | Deny indeterminate       | Deny                               | port                     | **PASS**    |
| S05 | Null result                  | Executor      | Same   | Valid URI             | null               | Deny                     | Deny                               | port                     | **PASS**    |
| S06 | Malformed decision object    | Executor      | Same   | Valid URI             | `{}` / non-outcome | Deny indeterminate       | Deny                               | normalizeCheckResult     | **PASS**    |
| S07 | Adapter failure              | Executor      | Same   | Valid URI             | throw              | Deny unavailable         | Deny                               | port + enforcement       | **PASS**    |
| S08 | Adapter timeout (throw)      | Executor      | Same   | Valid URI             | throw timeout      | Deny                     | Deny                               | enforcement failing port | **PASS**    |
| S09 | Unauthenticated / empty user | —             | Same   | Valid URI             | baseline           | Deny                     | Deny                               | port                     | **PASS**    |
| S10 | Insufficient permission      | Reader        | Same   | Valid URI             | allow port         | Forbidden (RBAC)         | Forbidden                          | enforcement              | **PASS**    |
| S11 | Cross-tenant get             | Other tenant  | Cross  | Existing refs         | n/a                | No disclosure            | `null`                             | enforcement              | **PASS**    |
| S12 | Unknown/unsupported scheme   | Executor      | Same   | `file:`               | baseline           | Deny                     | Deny                               | port                     | **PASS**    |
| S13 | Unknown action download deny | Executor      | Same   | Valid URI             | deny download      | Forbidden                | Forbidden                          | port                     | **PASS**    |
| S14 | Direct API associate path    | Authenticated | Same   | Via handler           | server enforce     | Enforced in service      | Wired; unit mocks service          | handler + source         | **PASS***   |
| S15 | Workbench direct navigation  | UI            | Same   | availableActions      | server             | No client grant          | Client cannot grant                | Workbench source + unit  | **PASS**    |
| S16 | Authorised association       | Executor      | Same   | Valid URI             | allow              | Success                  | Success                            | enforcement              | **PASS**    |
| S17 | Unauthorised association     | Deny port     | Same   | Valid URI             | deny               | Fail + audit             | Fail + audit                       | enforcement              | **PASS**    |
| S18 | Audit verification           | Executor      | Same   | Deny                  | deny               | `evidence_access_denied` | Present; no URI body               | enforcement              | **PASS**    |
| S19 | Browser deny/allow evidence  | —             | —      | —                     | —                  | Independent E2E          | Spec mocks 201; journeys timed out | Playwright report        | **LIMITED** |

\*Handler tests prove routing to `associateEvidence`; enforcement proven in application layer (handler mocks gateway).
