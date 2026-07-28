# APZOR Organisational Model (around APZHUB)

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20

---

## Structure (logical)

```text
APZOR Owner / Executive
├── Platform Ownership
├── Product Management
├── Engineering
├── Platform Operations
├── Security & Compliance
├── Risk Management
└── Knowledge / Documentation
```

## Departments (functions)

| Function                            | Mission                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| Executive / Owner Office            | Baseline Acceptance; STOP exceptions; strategic direction    |
| Product Management                  | Commercial roadmap, personas, GTM, product SemVer programmes |
| Platform Architecture               | Architecture freeze integrity; ADR facilitation; ARB         |
| Engineering                         | Delivery under Engineering Operating Model + PDS             |
| Platform Operations                 | Production ops per Operations Framework                      |
| Security                            | SecOps, identity hygiene, security committee                 |
| Risk & Compliance                   | Risk register, compliance overlays, audit support            |
| Programme Management Office (light) | Named programmes, cadence, acceptance tracking               |
| Knowledge Management                | Documentation governance, AI-MANIFEST honesty                |

## Environments ownership

| Environment | Owner                              | Constraint                  |
| ----------- | ---------------------------------- | --------------------------- |
| Development | Engineering Lead                   | No Production data          |
| Testing     | QA / Engineering                   | CI gates                    |
| Staging     | Release Manager + Ops              | Production-like             |
| Production  | Platform Ops Lead + Platform Owner | Change Management mandatory |

Host coexistence with legacy stacks: [ENVIRONMENT.md](../../ENVIRONMENT.md).
