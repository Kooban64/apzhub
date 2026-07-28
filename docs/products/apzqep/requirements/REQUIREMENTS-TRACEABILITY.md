# APZ QEP — Requirements Traceability Matrix

> **Programme:** APZQEP-REQ-001  
> **Baseline version:** 1.0.0-req  
> **Rule:** Idea/Vision → Requirement → (later) Definition → Architecture → Test

## Vision → requirement families

| Vision / philosophy theme                             | Primary requirement IDs                    |
| ----------------------------------------------------- | ------------------------------------------ |
| Enterprise QE platform (not mere TCMS)                | BR-001–BR-007, FR-002–FR-018               |
| Verification-centric (manual/automated/AI/continuous) | FR-006–FR-009, FR-012–FR-013, FR-042, MM-* |
| QEP as SoR; AI assistants                             | AIR-013, AIR-021, AIR-024, BR-003          |
| Mandatory traceability                                | FR-014, FR-002–FR-003, BR-021              |
| Evidence & certification                              | FR-017–FR-019, FR-037, RR-007–RR-010       |
| Human approval                                        | FR-018, AIR-009, AIR-013                   |
| Responsible AI                                        | AIR-015–AIR-017, AIR-019                   |
| Progressive maturity                                  | MM-001–MM-004, ROADMAP                     |
| Platform layering                                     | BR-027, FR-030, IR-011                     |
| Enterprise governance                                 | FR-028, SEC-_, RR-_                        |

## Persona → stakeholder → journey

| Persona                     | SR     | Primary journeys        |
| --------------------------- | ------ | ----------------------- |
| PSN-001 Executive           | SR-001 | UJ-009                  |
| PSN-002 Product Owner       | SR-002 | UJ-001, UJ-007          |
| PSN-003 Business Analyst    | SR-003 | UJ-001                  |
| PSN-004 Project Manager     | SR-004 | UJ-007                  |
| PSN-005 Developer           | SR-005 | UJ-006                  |
| PSN-006 QA Engineer         | SR-006 | UJ-002, UJ-003, UJ-005  |
| PSN-007 Automation Engineer | SR-007 | UJ-004                  |
| PSN-008 Release Manager     | SR-008 | UJ-007, UJ-008, UJ-010  |
| PSN-009 Operations          | SR-009 | IR-008, NFR-009/013/014 |
| PSN-010 Support             | SR-010 | NFR-016                 |
| PSN-011 Compliance Officer  | SR-011 | UJ-011, RR-*            |
| PSN-012 Auditor             | SR-012 | UJ-008, UJ-011          |
| PSN-013 Customer            | SR-013 | UX-005, IR-001          |
| PSN-014 Integrator          | SR-014 | UJ-012                  |
| PSN-015 AI Agent            | SR-015 | UJ-005, UJ-012          |

## BR → FR / AIR / IR / SEC (P0 sample)

| BR / CR                        | Downstream                   |
| ------------------------------ | ---------------------------- |
| BR-015 Native SoR              | FR-001, UX-005, IR-035       |
| BR-016 Verification modes      | FR-006–FR-009, FR-012–FR-013 |
| BR-017 Cert/evidence/readiness | FR-017–FR-019, RPT-004       |
| BR-018 Platform alignment      | IR-001–IR-011, NFR-007       |
| CR-008 On-prem                 | NFR-003, CR-005              |
| SR-008 Release Manager         | FR-017, FR-018, UJ-008       |
| SR-015 AI Agent                | AIR-*, IR-019, FR-041        |

## Historical mapping (APZTCMS-REQ-001 → APZQEP-REQ-001)

| Historical family        | QEP evolution                               |
| ------------------------ | ------------------------------------------- |
| BR/SR TCMS identity      | BR/SR QEP identity                          |
| FR test plans/cases/runs | FR verification plans/procedures/runs       |
| AIR-*                    | Expanded AIR-* (agents, NL, providers, MCP) |
| IR CI/ALM                | Expanded IDE/MCP/AI providers               |
| RR-*                     | SECURITY-REQUIREMENTS SEC-* + RR-*          |
| CR-*                     | Embedded in BUSINESS-REQUIREMENTS           |

Preserved pack remains at `docs/products/apztcms/requirements/`.

## Later traceability (post-Acceptance)

| Column (future)    | Populated by                           |
| ------------------ | -------------------------------------- |
| Definition refs    | APZQEP-DEF-001                         |
| Architecture / ADR | Architecture programmes                |
| Test / CERT        | Engineering & certification programmes |

## Conflict register

| Conflict                                      | Resolution                                     | Status                  |
| --------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Official name TCMS vs QEP                     | QEP official; TCMS historical                  | Resolved                |
| Next DEF id APZTCMS-DEF-001 vs APZQEP-DEF-001 | **APZQEP-DEF-001**                             | Resolved                |
| AI-native vs AI default OFF                   | Vision AI-native; runtime OFF until authorised | Resolved (non-conflict) |
