# APZHUB-1.1-001 — Acceptance Report

> **Programme:** APZHUB-1.1-001  
> **Title:** Release 1.1 — Law Authorization Hardening (OBS-LAW-01)  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** **ACCEPTED / CLOSED**  
> **Date:** 2026-07-19  
> **Completion:** [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)  
> **Quality:** [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)  
> **Compatibility:** [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)

---

## Purpose

Request Owner Acceptance that **OBS-LAW-01** is implemented, verified, and closed in Known Limitations for Law Platform authorization wiring.

## Exit criteria verification

| Criterion                                                                | Met |
| ------------------------------------------------------------------------ | --- |
| Law user-facing hydration uses auth adapter (not allow-all via dev flag) | Yes |
| Law client shell receives session AuthZ context                          | Yes |
| Law HTTP API denies without grants; no `*` injection                     | Yes |
| Namespace wildcards (`legal.*`) honored in Workbench adapter             | Yes |
| Health summaries retain explicit allow-all                               | Yes |
| Release 1.0 public APIs preserved                                        | Yes |
| OBS-LAW-02 / FIN-001 / Email SoR / 1.2 not implemented                   | Yes |
| Quality evidence filed                                                   | Yes |
| Known Limitations updated (OBS-LAW-01 / KL-LAW-03 closed)                | Yes |

## Recommendation presented for acceptance

# READY FOR OWNER ACCEPTANCE

## Owner decision

| Field                         | Value                                   |
| ----------------------------- | --------------------------------------- |
| Decision                      | **ACCEPTED**                            |
| Date                          | 2026-07-19                              |
| Conditions                    | Release 1.0 remains Production Baseline |
| Next authorised 1.1 programme | **APZHUB-1.1-002** (OBS-LAW-02)         |

## Acceptance means

1. OBS-LAW-01 is **closed** for Law authorization residual stated in readiness reviews.
2. Platform **1.0.0** remains Production Baseline until a separate Platform **1.1.0** certification.
3. Further 1.1 work still requires **named Owner Approval** (e.g. OBS-LAW-02).
4. Repository remains Operational Delivery · Architecture Frozen · QA-002 PRODUCTION READY hygiene.
