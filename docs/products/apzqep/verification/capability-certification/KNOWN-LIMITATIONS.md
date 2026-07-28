# Known Limitations — APZQEP-CERT-040D

These limitations are **expected** and **do not block** certification.

| Limitation                          | Status                                |
| ----------------------------------- | ------------------------------------- |
| No Evidence capability              | Expected — future programme           |
| No Coverage capability              | Expected — future programme           |
| No Impact capability                | Expected — future programme           |
| No Certification Engine integration | Expected — future programme           |
| No AI implementation                | Expected — consumer architecture only |
| No MCP implementation               | Expected — consumer architecture only |

## Additional documented constraints (non-blocking)

| Constraint                                              | Notes                                                 |
| ------------------------------------------------------- | ----------------------------------------------------- |
| List API has no first-class `assignedTo` filter         | My Queue uses status filter + presentation filter     |
| Default subject resolver permissive for unwired domains | Documented in ENG-040B; injectable stricter resolvers |
| Playwright suite is smoke / route reservation           | Authenticated E2E mutations covered by Vitest mocks   |
| No dedicated 100k load-test campaign under CERT-040D    | Pagination architecture in place                      |

## Freeze implication

Limitations above remain outside the **1.0.0** frozen Verification capability surface until separately authorised.
