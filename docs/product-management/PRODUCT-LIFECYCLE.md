# APZHUB Commercial Product Lifecycle

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Complements (does not replace):** [docs/products/PRODUCT-LIFECYCLE.md](../products/PRODUCT-LIFECYCLE.md) (engineering)  
> **Date:** 2026-07-19

---

## Purpose

Define the **commercial** lifecycle for every APZ product — from concept through retirement — independent of engineering programme IDs.

---

## Standard stages

| Stage                 | Definition                                                   | Exit criteria (commercial)                                                                         |
| --------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Concept**           | Intent and problem framing; no commitment to ship            | Portfolio entry + vision pack                                                                      |
| **Planning**          | Personas, editions, licensing posture, GTM hypothesis        | Definition pack + commercial card                                                                  |
| **Implementation**    | Owner-approved engineering programmes deliver capability     | Certification path defined                                                                         |
| **Beta**              | Limited customers / internal validation; edition draft       | Feedback loop; limitation register                                                                 |
| **Release Candidate** | Packaging complete; commercial claims freeze for release     | Release evidence pack ready                                                                        |
| **Production**        | Owner-accepted SemVer (or platform PRWL for platform-native) | Listed in [PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md) where applicable |
| **Maintenance**       | Patches / limited minors; no strategic feature growth        | Support + quality KPIs held                                                                        |
| **Retirement**        | End-of-sale / end-of-support declared                        | Migration path + Owner notice                                                                      |

---

## Stage diagram

```text
Concept → Planning → Implementation → Beta → Release Candidate
                                                    ↓
                                               Production
                                                    ↓
                                              Maintenance
                                                    ↓
                                               Retirement
```

Major new value may re-enter **Planning** as a new SemVer line (e.g. Support 2.0) without retiring the current Production baseline.

---

## Current portfolio placement (evidence)

| Product          | Commercial lifecycle stage                                     | Engineering maturity (evidence)                        |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| APZ Projects     | **Production** / Maintenance-ready                             | Production **1.1.0**                                   |
| APZ Time         | **Production** / Maintenance-ready                             | Production **1.0.0**                                   |
| APZ Support      | **Production** (PRWL); Major 2.0 in **Planning**               | Production **1.0.0**; 2.0 planning Awaiting Acceptance |
| APZ Documents    | **Production** (platform); product SemVer **Planning**         | Platform PRWL frozen                                   |
| APZ Analytics    | **Concept**                                                    | Metabase absent                                        |
| APZ Workflow     | **Production** (platform PRWL); product packaging **Planning** | n8n read-only frozen                                   |
| APZ TCMS         | **Production** (PRWL where certified)                          | testing-* vertical                                     |
| APZ Law Platform | **Implementation** / validation                                | In Development; primary commercial vertical            |

---

## Rules

1. Do not advertise Production until Owner Acceptance (or documented platform PRWL baseline for platform-native products).
2. Retirement requires Owner decision and migration messaging.
3. Engineering “Implementation Ready” ≠ commercial Beta.

---

## Related

- [PRODUCT-RELEASE-LIFECYCLE.md](./PRODUCT-RELEASE-LIFECYCLE.md)
- [ROADMAP-MANAGEMENT.md](./ROADMAP-MANAGEMENT.md)
- [COMMERCIAL-ROADMAP.md](./COMMERCIAL-ROADMAP.md)
