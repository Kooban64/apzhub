# SCOPE-AND-BOUNDARY — APZQEP-REM-001

## In scope

| Item                                | Notes                                              |
| ----------------------------------- | -------------------------------------------------- |
| EvidenceAccessPort contract         | Typed decisions + evaluateAccess                   |
| Default-deny adapter                | Fail-closed on omit / error / indeterminate        |
| associateEvidence enforcement       | Always assert; never skip                          |
| Production / test factory wiring    | Explicit baseline check when caller omits override |
| Gateway bootstrap                   | Passes `createBaselineEvidenceAccessCheck()`       |
| Denied-access audit                 | `evidence_access_denied`                           |
| Security + regression tests         | Package + related web/platform suites              |
| Version candidate                   | `1.0.1-rc.1` (not final 1.0.1)                     |
| Documentation + continuous evidence | This pack                                          |
| CERT-002 planning                   | Planning pack only                                 |

## Out of scope

- L-01 OpenAPI, L-03 outbox consumer, L-04 Postgres integration tests
- Unrestricted GA / release promotion / deployment
- CERT-002 execution or certification verdict
- New evidence storage providers / blob download subsystem
- AuthN, RBAC model redesign, tenancy redesign
- Unrelated API/schema/migrations
- Lifecycle Standard edits

## Compatibility

- Production baseline **1.0.0** identity preserved.
- Candidate **1.0.1-rc.1** is a security patch candidate.
- Legitimate associate workflows remain available under affirmative baseline / external ACL grant.
- No breaking public REST path changes; denial now occurs where access was previously silently allowed when unconfigured.
