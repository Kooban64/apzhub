# APZHUB Enterprise Operating Model

> **Programme:** APZHUB-GOVERNANCE-001  
> **Organisation:** APZOR  
> **Platform:** APZHUB **1.1.0**  
> **Date:** 2026-07-20

---

## 1. Enterprise vision

**APZOR** delivers and operates **APZHUB** as an Enterprise Operating Platform: one identity, one permission model, one gateway path, and honest Production maturity (**PRODUCTION_READY_WITH_LIMITATIONS**).

APZHUB is never marketed as a “portal” or “launcher.” User-facing product names mask backend engines.

## 2. Business operating model

```text
APZOR Enterprise Governance (this model)
        │
        ├── Product & Portfolio Governance
        ├── Programme / Project Governance
        ├── Engineering Delivery (Engineering Operating Model)
        ├── Platform Operations (Operations Framework)
        ├── Security · Risk · Compliance Committees
        └── Continuous Improvement
                │
                ▼
        APZHUB Platform 1.1.0 (Production Baseline)
                │
                ▼
        Commercial Products + Shared Services + Engines (via adapters)
```

## 3. Value streams

| Stream                | Outcome                                                            |
| --------------------- | ------------------------------------------------------------------ |
| Customer / user value | Reliable product capabilities within Known Limitations             |
| Platform value        | Stable shared services, Event Bus, Automation Foundation, Identity |
| Delivery value        | Named Owner-approved programmes via Platform Delivery Standard     |
| Operational value     | Incidents, changes, resilience per Operations Framework            |
| Governance value      | Clear RACI, committees, decisions, auditability                    |

## 4. Lifecycles (enterprise view)

| Lifecycle        | Governed by                                             |
| ---------------- | ------------------------------------------------------- |
| Development      | Engineering Operating Model · PDS · DoR/DoD             |
| Operational      | Platform Operations Framework                           |
| Support          | Support Model · Incident/Problem Management             |
| Customer         | Product Management · Customer Journey (commercial pack) |
| Release / Change | Release + Change Governance (enterprise + ops)          |

## 5. Ownership domains

| Domain                                 | Owner role                                    |
| -------------------------------------- | --------------------------------------------- |
| Platform                               | Platform Owner                                |
| Product (each APZ product)             | Product Owner                                 |
| Service (catalogue service)            | Service Owner                                 |
| Environment (Dev/Test/Staging/Prod)    | Environment Owner                             |
| Data (platform metadata vs engine SoR) | Data Owner (per SoR rules — Document **011**) |
| Repository                             | Repository Governance (KF + AI-MANIFEST)      |
| AI usage                               | AI Governance                                 |

## 6. Non-negotiables

- Repository-first evidence
- Owner Approval for programmes and freeze exceptions
- Zero Trust — no AuthZ bypass for “business continuity”
- STOP: Email SoR · FIN-001 · Workflow execute unlock · Release 1.2 without Approval
