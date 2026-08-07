# APZHUB — Enterprise Portfolio Baseline

| Field       | Value                                               |
| ----------- | --------------------------------------------------- |
| Programme   | **APZHUB-PORTFOLIO-BASELINE-001**                   |
| Status      | **IN FORCE**                                        |
| Timestamp   | 20260805T203000Z                                    |
| Kind        | Canonical architectural overview                    |
| Engineering | **NONE** (documentation only)                       |
| Authority   | Owner Authorisation — Enterprise Portfolio Baseline |

## What is APZHUB today?

> **APZHUB is an Enterprise Productivity Platform that continuously improves the way people work by learning from how they actually work.**

It is a portfolio of **native products** with durable business identities, one identity and workspace model, one quality baseline (APZQEP), and a proven Native Adoption path. Users experience APZHUB — never the underlying engines.

This document is the definitive description of that completed baseline. It does not redesign the platform. It describes what now exists.

---

## 1. Vision

| APZHUB is                                               | APZHUB is not                                |
| ------------------------------------------------------- | -------------------------------------------- |
| An enterprise productivity and governance platform      | A portal, launcher, or app switcher          |
| A portfolio of native products with business identities | A collection of engine wrappers              |
| One identity, workspace, and quality model              | Separate logins, consoles, or quality tracks |
| Capability-led for executives                           | Engine-led for users                         |

**Design language (examples already proven):**

| Above the boundary      | Below / secondary              |
| ----------------------- | ------------------------------ |
| Workflow (intent)       | Automation (execution tooling) |
| Documents (information) | Repository chrome              |
| Analytics (decisions)   | Dashboards                     |
| Law (governance)        | Practice management            |

---

## 2. Enterprise Operating Model

Canonical: [../apzhub-portfolio-001/ENTERPRISE-OPERATING-MODEL.md](../apzhub-portfolio-001/ENTERPRISE-OPERATING-MODEL.md)

```text
Enterprise Platform
        │
        ▼
Business Capabilities
        │
        ▼
Native Products
        │
        ▼
Implementation Engines (invisible)
```

**Frozen investment principles:**

1. APZHUB answers “What do I need to do?” — Products answer “How do I do it?”
2. Every new capability must eliminate measurable operational friction.
3. The platform earns the right to evolve.

**Two lanes:**

| Lane                       | Driver                    | Posture                                                       |
| -------------------------- | ------------------------- | ------------------------------------------------------------- |
| **1 — Platform evolution** | Operational evidence      | Evidence-driven; not unfrozen by portfolio work               |
| **2 — Portfolio delivery** | Approved business roadmap | **PAUSED** after this baseline until Owner Auth for expansion |

See: [APZHUB-TWO-LANE-OPERATING-MODEL.md](./APZHUB-TWO-LANE-OPERATING-MODEL.md)

---

## 3. Portfolio structure

| Pillar                             | Status          | Anchor                                                      |
| ---------------------------------- | --------------- | ----------------------------------------------------------- |
| Enterprise Platform Foundation     | **COMPLETE**    | Constitution · platform standards · Unified Work Experience |
| APZQEP Enterprise Quality Baseline | **COMPLETE**    | Quality / release / evidence                                |
| Product Native Adoption Standard   | **COMPLETE**    | Playbook N-01…N-04                                          |
| Enterprise Productivity Core       | **COMPLETE**    | RI #001–#006                                                |
| Enterprise Governance Layer        | **OPERATIONAL** | RI #007                                                     |
| Future Enterprise Expansion        | **PLANNED**     | Mission + Native Adoption required                          |

---

## 4. Layer model

Canonical detail: [APZHUB-ENTERPRISE-LAYER-MODEL.md](./APZHUB-ENTERPRISE-LAYER-MODEL.md)

```text
Enterprise Governance          → APZ Law (RI #007)
        │
Enterprise Decision Support    → APZ Analytics (RI #006)
        │
Enterprise Business Processes  → APZ Workflow (RI #005)
        │
Enterprise Information         → APZ Documents (RI #004)
        │
Enterprise Operations          → APZ Projects · Support · Time (RI #003–#001)
        │
Enterprise Quality             → APZQEP
        │
Enterprise Foundation          → APZHUB Platform
```

---

## 5. Product catalogue

Canonical: [APZHUB-PRODUCT-CATALOGUE.md](./APZHUB-PRODUCT-CATALOGUE.md)

| RI   | Product       | Business identity           |
| ---- | ------------- | --------------------------- |
| #001 | APZ Time      | Work Execution              |
| #002 | APZ Support   | Service Operations          |
| #003 | APZ Projects  | Project Delivery            |
| #004 | APZ Documents | Enterprise Information      |
| #005 | APZ Workflow  | Business Process Governance |
| #006 | APZ Analytics | Enterprise Decision Support |
| #007 | APZ Law       | Enterprise Governance       |

**Platform quality product:** APZQEP — Enterprise Quality (not an RI in the productivity/governance series; binds all products).

---

## 6. Reference Implementations

Canonical map: [APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md](./APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md)

**Permanent rule:** Future products must complete Native Adoption (N-01…N-04) under APZQEP before joining the operational platform.

---

## 7. Capability map

| Enterprise capability       | Product           | Layer              |
| --------------------------- | ----------------- | ------------------ |
| Work Execution              | APZ Time          | Operations         |
| Service Operations          | APZ Support       | Operations         |
| Project Delivery            | APZ Projects      | Operations         |
| Enterprise Information      | APZ Documents     | Information        |
| Business Process Governance | APZ Workflow      | Business Processes |
| Enterprise Decision Support | APZ Analytics     | Decision Support   |
| Enterprise Governance       | APZ Law           | Governance         |
| Enterprise Quality          | APZQEP            | Quality            |
| Enterprise Platform         | APZHUB Foundation | Foundation         |

Operating sentence:

```text
Projects define the work.
Support sustains the work.
Time measures the effort.
Documents preserve the information.
Workflow coordinates the intent.
Analytics informs the decisions.
Law governs the obligations.
```

---

## 8. Systems of Record principles

1. **One System of Record per datum.**
2. Platform PostgreSQL holds platform metadata — never duplicate backend business data as authoritative.
3. Products own their business SoR; others **consume by reference**.
4. Analytics owns **no** SoR — it consumes.
5. Law owns APZHUB governance objects only — not peer operational SoRs and not external legal practice.
6. Engines are invisible; users never see engine identity as product identity.

---

## 9. Native Adoption model

| Phase | Title                          | Nature              |
| ----- | ------------------------------ | ------------------- |
| N-01  | Native UX Audit                | Analysis only       |
| N-02  | Identity Convergence           | Identity only       |
| N-03  | Product Experience Convergence | Presentation only   |
| N-04  | Operational Quality Adoption   | Process / docs only |

Playbook: [APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md](./APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md)  
Standard: [APZHUB-PRODUCT-NATIVE-ADOPTION-STANDARD.md](./APZHUB-PRODUCT-NATIVE-ADOPTION-STANDARD.md)

The Playbook is **unchanged**. It changes only when operational evidence requires evolution.

---

## 10. APZQEP relationship

| Role                              | Owner                   |
| --------------------------------- | ----------------------- |
| Quality / release decisions       | **APZQEP**              |
| Product business identity         | **Each native product** |
| Platform constitution / standards | **APZHUB Foundation**   |

Every product change follows:

```text
Request → Quality Flow → Impact → Policy → Decision Package → Evidence → Release → Operational Learning
```

APZQEP does not become the product. Products do not invent private quality systems.

---

## 11. Future evolution principles

1. **Baseline first.** Expansion starts from this document set.
2. **Domains before products.** Investment asks what business capability APZOR needs — see [APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md](./APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md).
3. **No silent products.** Domain → Mission → Owner Approval → Native Adoption → (optional) RI.
4. **Lane 1 remains evidence-driven.** Portfolio expansion does not unfreeze platform redesign.
5. **Lane 2 READY** — open only after Domain Selection Method + Owner Auth for a named domain.
6. **Plug in — do not redefine.** New products join the core; they do not reopen foundation architecture.
7. **Identity before features.** Wrong product ambition is an architectural defect.
8. **Engines stay invisible.** Users experience APZHUB only.

Roadmap face: [APZHUB-PORTFOLIO-ROADMAP.md](./APZHUB-PORTFOLIO-ROADMAP.md)  
Domain strategy: [APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md](./APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md)  
Domain selection: [APZHUB-DOMAIN-SELECTION-METHOD.md](./APZHUB-DOMAIN-SELECTION-METHOD.md)  
Navigational atlas: [APZHUB-ARCHITECTURE-ATLAS.md](./APZHUB-ARCHITECTURE-ATLAS.md)

---

## Declaration

> **The APZHUB Enterprise Portfolio Baseline is complete.**

The platform foundation, quality baseline, Productivity Core (RI #001–#006), and Governance Layer (RI #007) form a **complete enterprise platform baseline**. Future work is expansion from this baseline — not definition of it.

Programme pack: [../apzhub-portfolio-baseline-001/](../apzhub-portfolio-baseline-001/)
