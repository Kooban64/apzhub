# APZHUB Delivery Standard v1.0 — Reference Standard

| Field       | Value                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Document    | **APZHUB Delivery Standard**                                                                                                   |
| Version     | **1.0**                                                                                                                        |
| Kind        | **Reference Standard** — constitutional for product delivery · **not** a product · **not** a programme                         |
| Status      | **IN FORCE** · **IMMUTABLE** for Version 1.0                                                                                   |
| Proven by   | APZ Projects 3.0 · APZQEP 1.1 · APZ Workflow 1.0                                                                               |
| Authority   | Owner direction after three Production Ready products                                                                          |
| Timestamp   | 20260808T171000Z                                                                                                               |
| Complements | Document 000 (Engineering Constitution) · [APZHUB-PORTFOLIO-OPERATING-PRINCIPLE.md](./APZHUB-PORTFOLIO-OPERATING-PRINCIPLE.md) |

---

## Purpose

This document is the **operating constitution for finishing APZHUB products**.

It does **not** describe any specific application.

It defines how every APZHUB product is assessed, inventoried, engineered, certified, released, and entered into Operational Learning.

**We do not invent how to build each product. We operate the APZHUB Delivery Standard.**

Every new product begins with:

> Apply the APZHUB Delivery Standard.

No further debate about methodology.

---

## Two layers of APZHUB

| Layer                           | What it is                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| **Layer 1 — Products**          | Business applications (Projects, APZQEP, Workflow, Support, Analytics, Knowledge, Time) |
| **Layer 2 — Delivery Standard** | The repeatable engineering operating model that finishes those products                 |

Layer 2 is independent of any single product. It is a permanent asset of APZOR.

---

## Operating principle (gate)

**No APZHUB product enters Engineering Execution without a finite closeout inventory.**

Canonical detail: [APZHUB-PORTFOLIO-OPERATING-PRINCIPLE.md](./APZHUB-PORTFOLIO-OPERATING-PRINCIPLE.md).

### Four Owner questions (mandatory before coding)

1. What already exists?
2. What is missing?
3. What defines Production Ready?
4. What is the shortest path to get there?

Until those answers form a finite inventory with exit criteria, work stays in assessment only.

---

## Lifecycle (do not change)

```text
Assess
  → Finite Inventory (Owner Accept)
  → Engineering
  → Production Readiness
  → Hardening
  → Release Candidate
  → Production Ready (Owner Accept)
  → Operational Learning
```

| Stage                    | Meaning                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Assess**               | Repository is truth. Classify A / B / C. Answer the four questions.                                    |
| **Finite Inventory**     | Closed set of Phase 1–4 items. No open-ended backlog. No “while we’re here…”. No architecture rewrite. |
| **Engineering**          | Remove inventory item by item. Report only **Closed / In Progress / Remaining**.                       |
| **Production Readiness** | Durability · migration · certification · fail-closed defaults.                                         |
| **Hardening**            | Accessibility · security · performance · regression · operational readiness.                           |
| **Release Candidate**    | Evidence pack · guides · Owner release decision pending.                                               |
| **Production Ready**     | Owner APPROVED · tag · freeze branch · scoreboard · **CLOSED**.                                        |
| **Operational Learning** | Operate. Learn. Defects / security / critical hotfixes only until Product Board opens a new version.   |

**Protect the inventory.** Ideas will come. Do not let them grow. Finish. Then move on.

---

## Engineering gates

| Gate | Required                                                                      |
| ---- | ----------------------------------------------------------------------------- |
| G0   | Owner Accept of finite closeout inventory                                     |
| G1   | Phase 1 (remaining product functionality) Closed or Owner-deferred in writing |
| G2   | Phase 2 (production readiness) Closed or Owner-waived                         |
| G3   | Phase 3 (hardening H1–H5) Closed                                              |
| G4   | Release Candidate pack published                                              |
| G5   | Owner Release Decision — Production Ready APPROVED                            |
| G6   | Production tag + freeze branch + portfolio scoreboard updated                 |

Engineering Execution is unauthorised before G0. Production Ready is unauthorised before G5.

---

## Certification & release governance

- Repository evidence over historic documentation claims.
- Production Ready is an **explicit engineering state**, not a feeling.
- Hardening is its **own phase**, not an afterthought.
- Release Candidate precedes Production Ready.
- Owner decisions are written and authoritative.
- After Production Ready: freeze — expand only for defects, security vulnerabilities, or critical operational hotfixes.
- Next version only via Product Board / approved Product Era process.

---

## AI / engineering execution philosophy

During Engineering Execution, AI and engineers act as an **engineering lead**, not an open-ended architect:

implement → verify → migrate → certify → harden → release

Forbidden without inventory authority:

- Architecture redesign
- New frameworks or programmes
- Endless documentation loops
- Expanding scope mid-closeout

---

## Explicitly out of this standard

This standard does **not** authorise:

- A specific product’s feature set
- Platform Evolution (cross-product search, notifications, command palette, portfolio AI, etc.)
- Redesign of Document 000 or foundation docs 001–029

Platform Evolution is a **separate programme**, opened only after all portfolio products are individually Production Ready.

---

## Remaining portfolio (same cadence — no exceptions)

APZ Support · APZ Analytics · APZ Knowledge · APZ Time

Each starts with the four questions. Each finishes under this standard. No version 2 of the process until Owner amends this Reference Standard.

---

## Programme eras (no overlap)

| Era                      | Outcome                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **Foundation**           | Architecture, governance, engineering standards, operating model established.          |
| **Validation**           | Delivery Standard proven — APZ Projects · APZQEP · APZ Workflow → Production Ready.    |
| **Portfolio Completion** | Apply this immutable standard **unchanged** to Support · Analytics · Knowledge · Time. |
| **Platform Evolution**   | Begins **only** after all seven products are Production Ready.                         |

Each era finishes before the next begins. There is no overlap.

The inventing phase of APZHUB is closed. The portfolio is in **Portfolio Completion** — delivery, not redesign.

---

## Immutability

**Version 1.0 of this Reference Standard is frozen.**

**Products evolve. The Delivery Standard is intentionally stable.**

Amend only if Owner directs a new version identifier (e.g. 1.1), and only when one of the following is true:

- a defect is discovered in the standard itself;
- regulation requires a change;
- technology fundamentally changes the lifecycle; or
- experience across multiple products demonstrates an objective improvement.

Silent reinterpretation is prohibited. No “version 2 of the process” mid-portfolio.

Proven three times. Reuse without reinvention.

---

## Related

- Operating principle: [APZHUB-PORTFOLIO-OPERATING-PRINCIPLE.md](./APZHUB-PORTFOLIO-OPERATING-PRINCIPLE.md)
- Portfolio scoreboard: [APZHUB-PORTFOLIO-STATUS.md](./APZHUB-PORTFOLIO-STATUS.md)
- Engineering Constitution: [../000-apzhub-engineering-constitution.md](../000-apzhub-engineering-constitution.md)
- Delivery references: APZ Projects 3.0 · APZQEP 1.1 · APZ Workflow 1.0
