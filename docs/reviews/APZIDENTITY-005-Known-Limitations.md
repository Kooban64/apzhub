# APZIDENTITY-005 — Known Limitations Register

**Date:** 2026-07-17  
**Classification impact:** Intentional product boundaries → `PRODUCTION_READY_WITH_LIMITATIONS`

| ID | Limitation | Defect? | Residual risk |
| --- | --- | --- | --- |
| L-01 | No authentication administration | No | Auth plane separate |
| L-02 | No password / MFA / session / token management | No | Credential material never in Identity SoR |
| L-03 | No OAuth / OIDC / SAML | No | IdP integration out of scope |
| L-04 | No SCIM / LDAP / Entra / Google Workspace sync | No | Directory sync out of scope |
| L-05 | No provisioning to backend engines | No | Service assignments are metadata links |
| L-06 | No invitation email delivery | No | Notification platform owns delivery |
| L-07 | No Event Bus / AI | No | Future milestones |
| L-08 | Branch coverage below 95% on consolidated vertical | Accepted | Critical security/lifecycle branches covered |
| L-09 | Live Playwright webServer may be blocked by Testing slug conflict | External | Spec mock-routed; list validated |
| L-10 | Unit CI uses in-memory persistence parity | Accepted | Production requires PostgreSQL |

These limitations do not claim unsupported capabilities.
