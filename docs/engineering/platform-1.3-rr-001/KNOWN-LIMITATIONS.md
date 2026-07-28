# Known Limitations — Platform-1.3-RR-001

> **Date:** 2026-07-23  
> **Honesty rule:** Remediation of CERT quality blockers does **not** by itself constitute production certification.

## CERT blockers remediated under this programme

| ID             | Prior classification (CERT-001) | RR-001 status                                                   |
| -------------- | ------------------------------- | --------------------------------------------------------------- |
| P13-CERT-QF-01 | Remaining / Blocking            | **RESOLVED** — RR-001 **ACCEPTED** · re-verified under CERT-002 |
| P13-CERT-QF-02 | Remaining / Blocking            | **RESOLVED** — RR-001 **ACCEPTED** · re-verified under CERT-002 |
| P13-CERT-QF-03 | Remaining                       | **RESOLVED** — RR-001 **ACCEPTED** · re-verified under CERT-002 |
| P13-CERT-QF-04 | Formatting (Owner RR-001 label) | **RESOLVED** — RR-001 **ACCEPTED** · re-verified under CERT-002 |

CERT evidence also listed Integration SDK wave milestone wording as QF-04; that item was already PASS on CERT re-run and was **not** in Owner RR-001 authorised remediation list.

## Limitations still in force (unchanged)

| ID              | Item                                              | Status         |
| --------------- | ------------------------------------------------- | -------------- |
| P13-KL-ND-01    | SMTP delivery                                     | **DEFERRED**   |
| P13-KL-ND-02    | SMS / push / Teams / Slack                        | Not authorised |
| P13-KL-ND-03    | PostgreSQL delivery store production wiring       | Remaining      |
| P13-KL-ND-04…06 | Preference / template / external recipient limits | Remaining      |
| P13-KL-ND-07    | POPIA formal compliance review                    | Residual risk  |
| P13-KL-ND-08    | Shared-host capacity certification                | Not claimed    |
| PL12-KL-07      | Email SoR                                         | Excluded       |
| PL12-KL-08      | FIN-001                                           | STOP           |
| PL12-KL-09      | Workflow Execute                                  | Gated          |
| Integration SDK | **1.0.0** Architecture Frozen                     | In force       |
| WebSockets      | Unauthorised                                      | In force       |

## Gates not claimed green by RR-001

- Full monorepo `pnpm test`
- Playwright portfolio / production smoke

## Residual risks

1. RR-001 **ACCEPTED**. Final production posture is under **Platform-1.3-CERT-002** (recommendation **PRODUCTION READY WITH LIMITATIONS**). CERT-001 remains historical **NOT READY FOR PRODUCTION**.
2. Broader suite / Playwright residuals from prior certification programmes remain.
3. SMTP / Email SoR / capacity / POPIA residuals remain binding.
