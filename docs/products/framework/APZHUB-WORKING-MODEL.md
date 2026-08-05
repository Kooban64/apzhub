# APZHUB Working Model — Portfolio Era

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T140000Z |

**Current operating state (foreword):** [APZHUB-CURRENT-OPERATING-STATE.md](./APZHUB-CURRENT-OPERATING-STATE.md)  
**Two-lane model (PB-002):** [APZHUB-TWO-LANE-OPERATING-MODEL.md](./APZHUB-TWO-LANE-OPERATING-MODEL.md)  
**Portfolio business roadmap:** [APZHUB-PORTFOLIO-BUSINESS-ROADMAP.md](./APZHUB-PORTFOLIO-BUSINESS-ROADMAP.md)

## Working agreement (post-construction)

The construction-era pattern of invent-instruction → paste into Cursor → agree → next slice is **retired**.

There should not always be a next Cursor instruction. **Wait** is a valid outcome.

| Role                                      | Actor                       | Owns                                                                                                                                                                                                     |
| ----------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chief Engineer & Operational Observer** | Cursor                      | Engineering; documentation updates; operational observation ([OBSERVE-001](../apzhub-observe-001/)); defect correction (when authorised); repository maintenance                                         |
| **Product Board / Portfolio Advisor**     | Strategic advisor (ChatGPT) | Product Board reviews; portfolio investment decisions; commercial strategy; product strategy; UX direction; operational evidence interpretation; long-term architecture **only if evidence requires it** |

| Cursor answers                  | Strategic advisor answers                             |
| ------------------------------- | ----------------------------------------------------- |
| **How?** (authorised work only) | **Why?** · **Should we?** · **Which one investment?** |

### When to convene the strategic advisor (six conversation types)

1. **Product Board Review** — bring weekly observations / Product Board Brief
2. **Commercial Strategy** — e.g. SaaS packaging, pricing
3. **Enterprise Capability Planning** — product vs portfolio vs platform for a friction theme
4. **AI Strategy** — where AI adds measurable value
5. **Executive Decision Support** — highest business value next quarter
6. **Architecture (rare)** — only when evidence shows the platform itself is the bottleneck

Do **not** ask the advisor for “the next Cursor instruction” by default for **platform evolution**. Ask: _Has the platform earned the right to change?_ If no → do not change the platform. If yes → choose the single highest-value platform investment.

**Portfolio delivery is separate:** executing the next approved product on the [business roadmap](./APZHUB-PORTFOLIO-BUSINESS-ROADMAP.md) does not require pilot friction. It still requires Mission → Owner Approval → Native Adoption.

Bring [PRODUCT-BOARD-BRIEF.md](../apzhub-observe-001/PRODUCT-BOARD-BRIEF.md) or [WEEKLY-LEARNING-SUMMARY.md](../apzhub-observe-001/WEEKLY-LEARNING-SUMMARY.md) when seeking **platform** investment advice.

Architecture and standards for Layer 1 evolve only through governance (Lane 1).

## Commercial identity

> **APZHUB is an Enterprise Productivity Platform that continuously improves the way people work by learning from how they actually work.**

## Permanent work principles

> **APZHUB answers “What do I need to do?”**  
> **Products answer “How do I do it?”**

> **Every new capability must eliminate measurable operational friction, not simply add functionality.**

> **The platform earns the right to evolve.**

## Era

**Two lanes in parallel** (PB-002):

| Lane  | Name               | Driver                                                        |
| ----- | ------------------ | ------------------------------------------------------------- |
| **1** | Platform evolution | Evidence (OBSERVE-001) — **frozen** unless thresholds / Owner |
| **2** | Portfolio delivery | Business roadmap — **APZ-DOCUMENTS-000 open**                 |

```text
Lane 1: Users work → Learning → Evidence → Board → One platform investment → Release
Lane 2: Business roadmap → PRODUCT-000 → Owner Approval → Native Adoption → (RI)
```

Avoid: platform engineering because idle; blocking portfolio completion with the platform freeze.

Phase 2: [APZHUB-PLATFORM-PHASE-2-UNIFIED-EXPERIENCE.md](./APZHUB-PLATFORM-PHASE-2-UNIFIED-EXPERIENCE.md) — **DECLARED** (latest)  
Phase 1: [APZHUB-PLATFORM-PHASE-1-COMPLETE.md](./APZHUB-PLATFORM-PHASE-1-COMPLETE.md) — **DECLARED**  
Operating model: [../apzhub-portfolio-001/ENTERPRISE-OPERATING-MODEL.md](../apzhub-portfolio-001/ENTERPRISE-OPERATING-MODEL.md)  
My Work Review: [APZHUB-MY-WORK-REVIEW.md](./APZHUB-MY-WORK-REVIEW.md)  
Unified Work (composition): [../apzhub-capability-001-eng-001/](../apzhub-capability-001-eng-001/)  
Operational pause: [OWNER-DECISION-MY-WORK-OPERATIONAL-PAUSE.md](./OWNER-DECISION-MY-WORK-OPERATIONAL-PAUSE.md)  
Internal readiness: [../apzhub-operate-001/](../apzhub-operate-001/) — **COMPLETE**  
Operational observation: [../apzhub-observe-001/](../apzhub-observe-001/) — **ACTIVE** (Lane 1)  
Documents mission: [../apzdocuments/](../apzdocuments/) — **OPEN** (Lane 2)

## Layers

| Layer                   | Nature                         | How it evolves                       |
| ----------------------- | ------------------------------ | ------------------------------------ |
| 1 — Enterprise Platform | Frozen / mature infrastructure | Governance only                      |
| 2 — APZHUB Products     | Where we spend time            | Mission → Playbook adoption          |
| 3 — Business Outcomes   | Why products exist             | Measured improvement or no promotion |

## Portfolio evolution

```text
Enterprise Standards
        │
        ▼
Product Mission
        │
        ▼
Native Adoption
        │
        ▼
Operational Adoption
        │
        ▼
Reference Implementation
        │
        ▼
Portfolio Operating Model
        │
        ▼
Enterprise Capability Model
        │
        ▼
Operational Learning
        │
        ▼
Business Value
```

## Methodology posture

Native Adoption is **operationally validated** (RI #001 + RI #002 + RI #003).

| Focus before                      | Focus now                                         |
| --------------------------------- | ------------------------------------------------- |
| Proving **how** to adopt products | Deciding **which** product deserves adoption next |
| Methodological refinement         | Business value over the next 3–6 months           |

Declaration: [APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md](./APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md)

## Portfolio categories

| Category                      | Products (current)                           |
| ----------------------------- | -------------------------------------------- |
| **Reference Implementations** | APZ Time · APZ Support · APZ Projects        |
| **Portfolio Candidates**      | APZ Documents · APZ Workflow · APZ Analytics |
| **Future Products**           | APZ Law Platform and others                  |

## Every product must answer

1. Does it solve a real operational problem?
2. Does it feel like APZHUB?
3. Does it operate through APZQEP?
4. Does it improve the daily lives of users?

## Standard product lifecycle (every future product)

```text
PRODUCT-000
Mission & Business Outcomes
        ↓
OWNER APPROVAL
        ↓
PRODUCT-NATIVE-001
(N-01…N-04 Playbook — engineering standard)
        ↓
Reference Implementation (optional — earned)
        ↓
RI Retrospective
        ↓
Operational Learning
```

Emerging Portfolio Patterns (observation only): [APZHUB-EMERGING-PORTFOLIO-PATTERNS.md](./APZHUB-EMERGING-PORTFOLIO-PATTERNS.md)  
RI retrospectives: [APZHUB-RI-RETROSPECTIVE.md](./APZHUB-RI-RETROSPECTIVE.md)

## Every product starts with a Mission

Before Native Adoption engineering:

> **Why does this product exist, and what measurable improvement will it make to the organisation?**

One concise **Product Mission & Business Outcomes** programme (**PRODUCT-000**). No technology. No architecture. No adapters. No engine names.

Owner APPROVED mission is the prerequisite for Native Adoption. Then apply the Playbook unchanged — no redesign.

## Business outcomes portfolio cares about

Delivery speed · Service quality · Operational visibility · Compliance · Productivity · Customer satisfaction · Decision-making.

If a product does not improve one of these, it should not move up the portfolio.

## Selecting the next candidate

Prefer the [Portfolio Business Roadmap](./APZHUB-PORTFOLIO-BUSINESS-ROADMAP.md) for Lane 2 sequencing.

Ask (Quarterly Portfolio Review) when reordering:

> **Which enterprise capability will create the greatest operational improvement for APZHUB over the next 3–6 months?**

Current answer (PB-002): **Document Management via APZ Documents** — start with APZ-DOCUMENTS-000.

Practice: [APZHUB-QUARTERLY-PORTFOLIO-REVIEW.md](./APZHUB-QUARTERLY-PORTFOLIO-REVIEW.md)  
Capability model: [../apzhub-portfolio-001/ENTERPRISE-CAPABILITY-MODEL.md](../apzhub-portfolio-001/ENTERPRISE-CAPABILITY-MODEL.md)  
Historical decision (QPR-001): [APZHUB-PORTFOLIO-DECISION-PROJECTS-NEXT.md](./APZHUB-PORTFOLIO-DECISION-PROJECTS-NEXT.md) → APZ Projects (**RI #003**)
