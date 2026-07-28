# APZHUB Continuous Product Lifecycle

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Date:** 2026-07-20  
> **Baseline:** Platform **1.2.0**  
> **Classification:** DOCUMENTATION ONLY — permanent after Owner Acceptance

---

## 1. Operating principle

After Platform **1.2.0**, APZHUB runs as a **continuous product** — not a sequence of greenfield release mega-programmes.

```text
Intake → Backlog → Owner Approval → Engineering (PDS) → Feature Acceptance
                              ↓
                    Quarterly Release Train / Hotfix / Maintenance
                              ↓
                    Continuous Certification · SemVer Promotion · LTS / EOL
```

## 2. What changes vs project delivery

| Project era (≤ 1.2)                                         | Continuous product era (≥ post-1.2.0)                        |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| Large planning programmes (e.g. 1.2-001) before every train | Continuous backlog + quarterly planning cadence              |
| One mega-scope release plan                                 | Prioritised backlog items pulled into trains                 |
| Engineering often one backlog ID per Owner programme        | Same discipline — **scoped work items** still Owner-approved |
| Readiness + portfolio certification as train closeout       | Continuous certification + scheduled promotions              |
| STOP themes blocked via planning                            | STOP themes still require **dedicated Owner Approval**       |

## 3. What does not change

1. Document **000** Constitution and foundation architecture (001–029).
2. Platform Delivery Standard — quality, architecture boundaries, no stage-skipping for capability depth.
3. Owner Acceptance authority — no silent engineering.
4. Architecture freezes / ADRs.
5. STOP themes (Email SoR, FIN-001, Workflow Execute unlock, redesign) without named Approval.
6. Platform **1.2.0** Production Baseline integrity until a future Owner-accepted promotion.

## 4. Work item types

| Type                           | Typical source                   | Default lane               |
| ------------------------------ | -------------------------------- | -------------------------- |
| Feature / customer enhancement | Intake · product backlog         | Quarterly train            |
| Operational improvement        | Ops risk · runbooks · drills     | Quarterly or ops cadence   |
| Technical debt                 | PIR · hygiene · SemVer alignment | Quarterly (bounded)        |
| Security improvement           | Threats · hardening              | Expedited or train         |
| Compliance improvement         | Audit · certification gaps       | Train or gated             |
| Incident-driven                | Production incidents             | Hotfix / follow-up backlog |
| Hotfix                         | S1/S2 defects                    | Hotfix Policy              |
| Maintenance release            | PATCH / limited MINOR            | Maintenance process        |

## 5. Authority order (conflict)

1. Document **000**
2. Accepted ADRs + Architecture Freeze notices
3. Platform Delivery Standard
4. **This Product Lifecycle** (continuous operating model)
5. Operations / Governance / Commercial standards (as cited)
6. Named Owner Approval for a work item
7. Conversation history — never authoritative

## 6. Recommendation impact

Supports: **CONTINUOUS PRODUCT LIFECYCLE READY**
