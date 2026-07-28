# APZHUB Release 1.2 — Operational Readiness Review

> **Programme:** APZHUB-1.2-008  
> **Date:** 2026-07-20  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** Theme A programmes · [docs/operations/](../../../operations/README.md) · [OPERATIONAL-RISK-REGISTER](../../../operations/OPERATIONAL-RISK-REGISTER.md)

---

## 1. Purpose

Assess whether Release **1.2** Theme A operational outcomes are sufficient for Platform **1.2.0** certification entry under PRWL.

---

## 2. Theme A outcomes

| Area                          | Programme      | Operational state                                                                                       |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| Backup / restore verification | APZHUB-1.2-002 | Drill runner + runbook + live PASS evidence filed; keep ≤90 days current                                |
| Alert strategy / runbooks     | APZHUB-1.2-003 | Policy catalogue + runbook depth filed; **manual-triage** — no live Observe evaluation/delivery claimed |
| Host coexistence              | APZHUB-1.2-004 | Reserved-port catalogue + capacity thresholds + coexistence audit filed; no legacy remap                |

---

## 3. Ops readiness matrix

| Check                                                | Result                                       |
| ---------------------------------------------------- | -------------------------------------------- |
| Restore drill capability documented and evidenced    | **PASS**                                     |
| Alert / incident runbooks deepened                   | **PASS WITH NOTES** (live delivery residual) |
| Host coexistence controls documented and auditable   | **PASS**                                     |
| Ops risk register updated for R12-OPS-01…03          | **PASS**                                     |
| Secrets / Zero Trust ops posture unchanged           | **PASS** (no STOP overclaim)                 |
| Administration Workspace / monitoring stack redesign | **N/A** — not in 1.2 scope                   |

---

## 4. Residual operational limitations

1. Live Observe alert evaluation and notification delivery remain a future programme (OPS-R-05).
2. Restore evidence currency must be maintained operationally (≤90 days).
3. Shared-host coexistence still requires Owner gate for disruptive host changes (ENVIRONMENT.md).
4. Themes D–E persistence / Support CE depth remain P1 residuals (not ops Theme A blockers).

---

## 5. Conclusion

Operational readiness for the **authorised Theme A scope** supports certification entry as **PRWL**. Certification packaging should consolidate ops matrices; it must not invent live alerting GA.

**Supports:** **READY FOR RELEASE 1.2 CERTIFICATION**
