# VERSION-1.1-INTAKE

| Field                   | Value              |
| ----------------------- | ------------------ |
| Programme               | APZQEP-OPS-001     |
| Timestamp               | 20260803T072224Z   |
| Version 1.1 engineering | **NOT AUTHORISED** |
| Version 1.1 planning    | **NOT OPENED**     |

## Purpose

Controlled enhancement backlog feeding future Product Board decisions. Every item is intake only.

## Required fields (every item)

| Field                  | Required                                                   |
| ---------------------- | ---------------------------------------------------------- |
| Identifier             | Yes (`V11-001`…)                                           |
| Summary                | Yes                                                        |
| Business justification | Yes                                                        |
| Requested by           | Yes                                                        |
| Evidence               | Yes                                                        |
| Operational impact     | Yes                                                        |
| Priority               | Yes                                                        |
| Risk                   | Yes                                                        |
| Affected capabilities  | Yes                                                        |
| Estimated scope        | Yes (T-shirt / narrative — not a commitment)               |
| Recommendation         | Yes (Defer / Consider for 1.1 planning / Ops-only)         |
| Status                 | Intake / Board-reviewed / Deferred / Accepted-for-planning |

## Intake backlog

| ID      | Summary                          | Justification               | Requested by         | Evidence | Ops impact | Priority | Risk   | Caps         | Scope | Recommendation                       | Status |
| ------- | -------------------------------- | --------------------------- | -------------------- | -------- | ---------- | -------- | ------ | ------------ | ----- | ------------------------------------ | ------ |
| V11-001 | Permission-aware Cap shell nav   | Reduce UX friction from 403 | Ops / Board residual | KI-001   | Low        | P3       | Low    | Shell / Caps | S     | Consider after usage evidence        | Intake |
| V11-002 | Project membership attribute ACL | Stronger project isolation  | Security residual    | KI-002   | Medium     | P3       | Medium | Authz / Caps | M     | Consider after security ops evidence | Intake |
| V11-003 | Cap-specific a11y depth          | Accessibility maturity      | 150R residual        | KI-005   | Low        | P4       | Low    | Caps UI      | M     | Defer pending adoption               | Intake |

## Gate

```text
No enhancement is authorised for implementation.
Open Version 1.1 only after sufficient operational evidence
and Product Board authorisation.
```
