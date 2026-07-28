# APZHUB Release 1.1 — Platform Roadmap

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-19

---

## Shared platform themes

| Area                            | 1.1 posture                                                                                                                               | Evidence driver         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Knowledge Foundation            | **Maintain** — keep AI-MANIFEST authoritative                                                                                             | PL-KL-12                |
| Platform Delivery Standard      | **Maintain** — mandatory for all 1.1 programmes                                                                                           | ENGINEERING-001         |
| Integration SDK **1.0.0**       | **Maintain** (frozen) — ADR+Owner to change                                                                                               | Architecture freeze     |
| Identity / AuthZ                | **Enhance** — Law OBS-LAW-01 delivered (APZHUB-1.1-001); further least-privilege audits remain                                            | OBS-LAW-01              |
| Workbench / DEF                 | **Maintain** + polish debt reduction                                                                                                      | Law UX · QA stubs       |
| Search / publication            | **Enhance** selective adapters (e.g. search-time / search-law if approved)                                                                | Product KLs             |
| Event Bus / Outbox              | **Enhance** — Support publish + ENF Attention (APZHUB-1.1-003 **ACCEPTED**); Automation Foundation (APZHUB-1.1-004); outbox depth remains | PL-KL-02 · Support KL   |
| Notifications                   | **Enhance** — Law OBS-LAW-02 delivered (APZHUB-1.1-002); Support KL may remain                                                            | OBS-LAW-02 · Support KL |
| Analytics platform              | **Enhance** persistence/maturity                                                                                                          | Analytics KL            |
| Workflow platform               | **Enhance** toward gated execute                                                                                                          | Workflow KL             |
| Documents platform              | **Maintain** metadata-first unless unlocked                                                                                               | Documents KL            |
| Testing platform                | **Enhance** within GHA freeze                                                                                                             | TCMS KL                 |
| Legal platform                  | **Enhance** OBS + UX                                                                                                                      | Law KL                  |
| Observability / Admin / Metrics | **Maintain** + ops runbook depth                                                                                                          | Ops readiness           |
| Financial Engine                | **Defer**                                                                                                                                 | FIN-001 · R-05          |
| Email SoR                       | **Defer**                                                                                                                                 | Law KL · Future roadmap |

---

## Platform SemVer target

```text
APZHUB Platform 1.0.0 (Production Baseline — ACCEPTED)
        → selected 1.1 delivery programmes
        → APZHUB Platform 1.1.0 certification (future programme)
```

Patch **1.0.x** remains available for urgent Production defects only (Owner Approval).
