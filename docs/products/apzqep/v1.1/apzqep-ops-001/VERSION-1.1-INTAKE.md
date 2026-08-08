# VERSION-1.1-INTAKE

| Field                   | Value                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Programme               | APZQEP-OPS-001                                                                                                         |
| Timestamp               | 20260803T072224Z                                                                                                       |
| Version 1.1 engineering | **APZQEP-161 AUTHORISED to open** — await Owner Auth; 162–166 not authorised                                           |
| Version 1.1 planning    | **APZQEP-160 APPROVED** (PBR-APZQEP-160) — [../apzqep-160/](../apzqep-160/) · [../pbr-apzqep-160/](../pbr-apzqep-160/) |

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

| ID      | Summary                          | Justification               | Requested by         | Evidence | Ops impact | Priority | Risk   | Caps         | Scope | Recommendation                           | Status              |
| ------- | -------------------------------- | --------------------------- | -------------------- | -------- | ---------- | -------- | ------ | ------------ | ----- | ---------------------------------------- | ------------------- |
| V11-001 | Permission-aware Cap shell nav   | Reduce UX friction from 403 | Ops / Board residual | KI-001   | Low        | P3       | Low    | Shell / Caps | S     | Delivered in V1.1 via QX-P1-01           | **Closed in V1.1**  |
| V11-002 | Project membership attribute ACL | Stronger project isolation  | Security residual    | KI-002   | Medium     | P3       | Medium | Authz / Caps | M     | Explicit Defer to Version 1.2 (QX-P1-05) | **Deferred → V1.2** |
| V11-003 | Cap-specific a11y depth          | Accessibility maturity      | 150R residual        | KI-005   | Low        | P4       | Low    | Caps UI      | M     | Defer pending adoption                   | Intake              |

## Gate

```text
No enhancement is authorised for implementation.
Open Version 1.1 only after sufficient operational evidence
and Product Board authorisation.
```
