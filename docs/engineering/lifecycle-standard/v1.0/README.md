# APZ Engineering Lifecycle Standard

| Item               | Value                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Document           | **APZ Engineering Lifecycle Standard**                                                            |
| Version            | **1.0.0**                                                                                         |
| Status             | **IMPLEMENTED / AWAITING OWNER LIFECYCLE STANDARD DECISION**                                      |
| Evidence           | `docs/operations/evidence/portfolio-recert/20260729T175000Z-APZQEP-LIFECYCLE-001.json`            |
| Programme          | **APZQEP-LIFECYCLE-001**                                                                          |
| Authority          | Owner — product-agnostic standard for all APZOR products                                          |
| Provenance         | Proven by APZQEP Test Execution lifecycle (ARCH → ES → Waves 1–5 → ECR → CERT → FREEZE → RELEASE) |
| Normative language | **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional          |

---

## Purpose

This suite is the definitive, product-agnostic engineering lifecycle for APZOR products. It consolidates Architecture, Engineering Specification, Wave Engineering, Build Contract, Engineering Completion Review (ECR), Certification, Freeze, Release, and post-release stages into one navigable standard.

Adopters **SHALL** treat this suite as the lifecycle authority for new capability programmes once Owner-accepted. Related IN FORCE artefacts under `docs/engineering/oes/` remain binding and are referenced, not replaced, until Owner directs otherwise.

---

## Navigation

| Document                                                                         | Role                                                                        |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [ENGINEERING-LIFECYCLE.md](./ENGINEERING-LIFECYCLE.md)                           | Full stage definitions including GA, Maintenance, EOL                       |
| [ENGINEERING-OPERATING-MODEL.md](./ENGINEERING-OPERATING-MODEL.md)               | AI-assisted, governance-first operating model                               |
| [BUILD-CONTRACT.md](./BUILD-CONTRACT.md)                                         | Definitive Build Contract (continuous evidence mandatory)                   |
| [OWNER-GOVERNANCE.md](./OWNER-GOVERNANCE.md)                                     | Authorisation, acceptance, baselining, closure, risk, release               |
| [PROGRAMME-LIFECYCLE.md](./PROGRAMME-LIFECYCLE.md)                               | Programme types and Owner Directives                                        |
| [architecture/README.md](./architecture/README.md)                               | Architecture stage                                                          |
| [engineering-specification/README.md](./engineering-specification/README.md)     | Engineering Specification stage                                             |
| [engineering-waves/README.md](./engineering-waves/README.md)                     | Wave Engineering index                                                      |
| [engineering-review/README.md](./engineering-review/README.md)                   | Engineering Completion Review (ECR)                                         |
| [certification/README.md](./certification/README.md)                             | Certification stage                                                         |
| [freeze/README.md](./freeze/README.md)                                           | Freeze stage                                                                |
| [release/README.md](./release/README.md)                                         | Release stage                                                               |
| [risk-management/README.md](./risk-management/README.md)                         | Risk management across the lifecycle                                        |
| [diagrams/LIFECYCLE.md](./diagrams/LIFECYCLE.md)                                 | Full lifecycle Mermaid diagram                                              |
| [examples/TEST-EXECUTION-PROVENANCE.md](./examples/TEST-EXECUTION-PROVENANCE.md) | Test Execution reference implementation                                     |
| [REPOSITORY-STANDARDS.md](./REPOSITORY-STANDARDS.md)                             | Versioning, changelog, evidence, packages, release artefacts, tagging       |
| [templates/](./templates/)                                                       | Reusable programme templates (Instruction, Decision, reports, registers)    |
| [cursor-directives/](./cursor-directives/README.md)                              | Cursor / agent prompt skeletons per lifecycle stage                         |
| [owner-decisions/](./owner-decisions/README.md)                                  | Narrow Owner Decision forms (acceptance, authorisation, risk, availability) |

### Engineering Waves

| Wave                           | Document                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| Wave 01 — Repository           | [WAVE-01-REPOSITORY.md](./engineering-waves/WAVE-01-REPOSITORY.md)                 |
| Wave 02 — Domain               | [WAVE-02-DOMAIN.md](./engineering-waves/WAVE-02-DOMAIN.md)                         |
| Wave 03 — Application          | [WAVE-03-APPLICATION.md](./engineering-waves/WAVE-03-APPLICATION.md)               |
| Wave 04 — Infrastructure & API | [WAVE-04-INFRASTRUCTURE-API.md](./engineering-waves/WAVE-04-INFRASTRUCTURE-API.md) |
| Wave 05 — Workbench            | [WAVE-05-WORKBENCH.md](./engineering-waves/WAVE-05-WORKBENCH.md)                   |

---

## Related IN FORCE artefacts

| Artefact                   | Location                                                                                                                                                       | Relationship                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Engineering Build Contract | [../../oes/ENGINEERING-BUILD-CONTRACT.md](../../oes/ENGINEERING-BUILD-CONTRACT.md)                                                                             | IN FORCE — consolidated herein for adopters  |
| OES-003                    | [../../oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md](../../oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md) | IN FORCE — Wave Engineering authority        |
| OES trilogy                | [../../oes/README.md](../../oes/README.md)                                                                                                                     | Writing, review, and specification standards |

---

## Programme pack

| Pack                                                                                        | Role                                                 |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [../../../products/apzqep/LIFECYCLE-001/](../../../products/apzqep/LIFECYCLE-001/README.md) | APZQEP-LIFECYCLE-001 — this suite is the deliverable |

---

## STOP

```text
APZ ENGINEERING LIFECYCLE STANDARD
VERSION 1.0.0
IMPLEMENTED
AWAITING OWNER LIFECYCLE STANDARD DECISION
PROGRAMME APZQEP-LIFECYCLE-001
NO PRODUCT APPLICATION STARTED
```
