# APZ QEP — Product Requirements (Control Document)

> **Programme:** APZQEP-REQ-001  
> **Baseline version:** 1.0.0-req  
> **Status:** **ACCEPTED**

> **Platform baseline:** Certified Platform 1.4  
> **Product baseline:** APZQEP-TRANSITION-001 **ACCEPTED**  
> **Classification:** Native APZHUB product  
> **External engine:** None (native SoR)

## Document control

| Field                             | Value                                                      |
| --------------------------------- | ---------------------------------------------------------- |
| Official product name             | **APZ QEP** (APZ Quality Engineering Platform)             |
| Former name                       | APZ TCMS (historical — preserved)                          |
| Product ID                        | `apzqep`                                                   |
| Author                            | APZHUB Product Engineering (methodology)                   |
| Scope type                        | Full product Requirements Baseline                         |
| Prior artefacts                   | APZTCMS-REQ-001 **PRESERVED** — evolved into this baseline |
| Next programme (after Acceptance) | **APZQEP-DEF-001** Product Definition Baseline             |

## Product vision (normative summary)

**APZ QEP is an AI-native Enterprise Quality Engineering Platform.**

It governs software quality throughout the complete Software Development Lifecycle. Testing is **one capability**. The platform manages the complete quality lifecycle: requirements, verification (manual, automated, AI-assisted, continuous), traceability, evidence, defects, release readiness, certification, analytics, and continuous quality improvement.

Authoritative vision detail: [../PRODUCT-VISION.md](../PRODUCT-VISION.md).

## Product philosophy (normative summary)

1. Quality Engineering rather than Test Management
2. Verification rather than Test Cases alone (manual / automated / AI-assisted / continuous)
3. Continuous Quality as an operating posture
4. Mandatory traceability to approved requirements
5. Evidence as first-class SoR content
6. Certification readiness as a core capability
7. Human approval for certification-impacting actions
8. Responsible AI
9. **APZ QEP is the System of Record**
10. **AI systems are assistants — never SoR**
11. Enterprise governance (RBAC, audit, compliance)
12. Progressive automation maturity (see [MATURITY-MODEL.md](./MATURITY-MODEL.md))

Authoritative philosophy detail: [../PRODUCT-PHILOSOPHY.md](../PRODUCT-PHILOSOPHY.md).

## Baseline composition

| Pack document                                                      | Content                                            |
| ------------------------------------------------------------------ | -------------------------------------------------- |
| [BUSINESS-REQUIREMENTS.md](./BUSINESS-REQUIREMENTS.md)             | BR-_, SR-_, CR-* (commercial) · market positioning |
| [FUNCTIONAL-REQUIREMENTS.md](./FUNCTIONAL-REQUIREMENTS.md)         | FR-_, UX-_                                         |
| [NON-FUNCTIONAL-REQUIREMENTS.md](./NON-FUNCTIONAL-REQUIREMENTS.md) | NFR-*                                              |
| [AI-REQUIREMENTS.md](./AI-REQUIREMENTS.md)                         | AIR-*                                              |
| [INTEGRATION-REQUIREMENTS.md](./INTEGRATION-REQUIREMENTS.md)       | IR-*                                               |
| [SECURITY-REQUIREMENTS.md](./SECURITY-REQUIREMENTS.md)             | SEC-_, RR-_                                        |
| [REPORTING-REQUIREMENTS.md](./REPORTING-REQUIREMENTS.md)           | RPT-*                                              |
| [PERSONAS.md](./PERSONAS.md)                                       | PSN-*                                              |
| [USER-JOURNEYS.md](./USER-JOURNEYS.md)                             | UJ-*                                               |
| [MATURITY-MODEL.md](./MATURITY-MODEL.md)                           | MM-*                                               |
| [ROADMAP.md](./ROADMAP.md)                                         | Roadmap phases                                     |
| [REQUIREMENTS-TRACEABILITY.md](./REQUIREMENTS-TRACEABILITY.md)     | Matrix                                             |
| [PRODUCT-GLOSSARY.md](./PRODUCT-GLOSSARY.md)                       | Terms                                              |

## Priority legend

| Priority | Meaning                                              |
| -------- | ---------------------------------------------------- |
| **P0**   | Must for enterprise MVP / regulatory hard stop       |
| **P1**   | Should for first enterprise release after Definition |
| **P2**   | Could / Phase 2–3                                    |
| **P3**   | Parked / long-term                                   |

## Explicit non-goals (requirements level)

- QEP shall **not** replace Vitest / Playwright / Jest / Cypress as test runners (orchestrates and records results).
- QEP shall **not** auto-certify releases without human approval.
- QEP shall **not** call ALM/CI/AI provider clients from modules — Module → Platform Service → Connector → Engine only.
- QEP shall **not** redesign Platform 1.4 or unilaterally unlock Platform freezes.
- QEP shall **not** treat Kiwi TCMS (or any third-party TCMS) as SoR.
- AI shall **never** become the source of truth.
- This programme does **not** authorise Product Definition, Architecture, ADRs, schema, APIs, UI, or production code.

## Conflicts with preserved TCMS baseline

| Topic                               | Resolution                                                    |
| ----------------------------------- | ------------------------------------------------------------- |
| Product name APZ TCMS               | Superseded as official identity by **APZ QEP**                |
| Test-case-centric framing           | Evolved to **verification-centric** Quality Engineering       |
| Next programme APZTCMS-DEF-001      | Superseded naming → **APZQEP-DEF-001**                        |
| Historical FR wording (plans/cases) | Mapped to verification terminology; historical pack preserved |

No unresolved conflicting requirements remain for P0 items.

## Approval

See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md). Requirements Approval does **not** authorise Definition, Architecture, or Engineering.
