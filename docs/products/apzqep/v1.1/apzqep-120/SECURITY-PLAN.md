# Security Plan — APZQEP-120

Translates APZHUB Zero Trust (**013**) and portfolio security into APZQEP-120 slice gates. Does **not** duplicate portfolio governance documents.

---

## Principles

- Default-deny; server-authoritative PermissionService.
- No second authorisation framework.
- Better Auth = authentication only.
- Tenant isolation proven by tests on every ACL-touching slice.
- Secrets never in repo/logs; typed errors without provider leakage.
- Evidence confidentiality: ACL + storage IAM + audit.

---

## Threat → slice mapping

| Threat                           | Mitigation slices                         |
| -------------------------------- | ----------------------------------------- |
| List/search ACL leak (L-EM-01)   | **S01**, S19                              |
| TE attach bypass                 | **S02**, S19                              |
| Evidence loss / tamper           | S03–S05, S10                              |
| Cross-tenant search              | S12, S19                                  |
| Notification leakage             | S13                                       |
| Upload abuse / malware           | S04 hooks, S19; AV product optional Owner |
| Worker duplicate side effects    | S08–S09                                   |
| Secret in artifacts (Playwright) | S16                                       |
| Privilege escalation             | S06 delete restrictions, S19              |

---

## Per-slice security minimum

| Slice type               | Required                                                      |
| ------------------------ | ------------------------------------------------------------- |
| ACL (S01,S02,S12)        | Cross-tenant + deny tests                                     |
| Storage/upload (S04,S05) | Size/type limits; path safety; hash integrity; no secret logs |
| Worker (S08–S10)         | Idempotency; least-privilege worker identity                  |
| Notify (S13)             | Tenant scope; no PII in wrong tenant                          |
| OpenAPI (S15)            | No security-sensitive internal fields newly exposed           |
| Runner (S16)             | Sandbox/timeouts; artifact ACL                                |
| S19                      | Full suite + dependency audit                                 |

---

## Verification gates

1. **Slice gate:** security tests green for that slice.
2. **Band gate (R0/R2/R3):** tenant isolation pack.
3. **Programme gate (S19/S20):** checklist complete; P0 security defects = NONE.

---

## Secure failure

Unavailable Evidence ACL → **deny** (fail-closed).  
Storage down → typed unavailable; no partial corrupt metadata without reconciliation path (S10).

---

## Out of scope for 120

External pen-test execution (Owner may commission). Portfolio-wide IAM redesign. Authentik migration.
