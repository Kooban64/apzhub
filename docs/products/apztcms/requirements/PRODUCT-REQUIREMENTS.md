# APZ TCMS — Product Requirements (Control Document)

> **Programme:** APZTCMS-REQ-001  
> **Baseline version:** 1.0.0-req  
> **Status:** READY FOR REQUIREMENTS APPROVAL  
> **Platform baseline:** Certified Platform 1.4  
> **Classification:** Native APZHUB  
> **External engine:** None (native SoR)

## Document control

| Field                             | Value                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Product name                      | APZ TCMS                                                                                    |
| Product ID                        | apztcms                                                                                     |
| Author                            | APZHUB Product Engineering (methodology)                                                    |
| Scope type                        | New product requirements baseline (full product horizon)                                    |
| Prior production context          | APZ TCMS **1.0.0** PRWL (packaging / vertical) — does not limit this baseline’s P0–P3 scope |
| Next programme (after Acceptance) | **APZTCMS-DEF-001** Product Definition                                                      |

## Vision (summary)

APZ TCMS shall be the enterprise Test Management and Quality Engineering platform for all APZHUB products and external customers — covering manual testing, automated testing, AI-assisted testing, certification, evidence, traceability, reporting, release readiness, and quality governance — under APZHUB branding on Platform 1.4.

## Mission (summary)

Provide a permissioned, auditable, native System of Record for quality engineering that orchestrates test assets and evidence, integrates with Platform services and selected CI/ALM tools, and never exposes backend engine brands or auto-certifies without human approval.

## Baseline composition

| Pack document                                                      | Content    |
| ------------------------------------------------------------------ | ---------- |
| [BUSINESS-REQUIREMENTS.md](./BUSINESS-REQUIREMENTS.md)             | BR-_, SR-_ |
| [FUNCTIONAL-REQUIREMENTS.md](./FUNCTIONAL-REQUIREMENTS.md)         | FR-_, UX-_ |
| [NON-FUNCTIONAL-REQUIREMENTS.md](./NON-FUNCTIONAL-REQUIREMENTS.md) | NFR-*      |
| [COMPLIANCE-REQUIREMENTS.md](./COMPLIANCE-REQUIREMENTS.md)         | RR-*       |
| [AI-REQUIREMENTS.md](./AI-REQUIREMENTS.md)                         | AIR-*      |
| [INTEGRATION-REQUIREMENTS.md](./INTEGRATION-REQUIREMENTS.md)       | IR-*       |
| [COMMERCIAL-REQUIREMENTS.md](./COMMERCIAL-REQUIREMENTS.md)         | CR-*       |
| [REQUIREMENTS-TRACEABILITY.md](./REQUIREMENTS-TRACEABILITY.md)     | Matrix     |

## Priority legend

| Priority | Meaning                                              |
| -------- | ---------------------------------------------------- |
| **P0**   | Must for enterprise MVP / regulatory hard stop       |
| **P1**   | Should for first enterprise release after Definition |
| **P2**   | Could / phase 2–3                                    |
| **P3**   | Parked / long-term                                   |

## Explicit non-goals (requirements level)

- TCMS shall **not** replace Vitest/Playwright/Jest as test runners (orchestrates / records results).
- TCMS shall **not** auto-certify releases without human approval.
- TCMS shall **not** call Plane/GitHub/GitLab/Jira/Azure DevOps clients from modules — Platform Service → Connector only.
- TCMS shall **not** redesign Platform 1.4 or enable Platform freezes (Email SoR, durable notify flag, Workflow Execute, etc.) by itself.
- Kiwi TCMS as SoR is **out of scope** (native APZHUB).

## Approval

See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md). Requirements Approval does **not** authorise Definition, Architecture, or Engineering.
