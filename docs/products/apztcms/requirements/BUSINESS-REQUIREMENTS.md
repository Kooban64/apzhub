# APZ TCMS — Business & Stakeholder Requirements

> **Programme:** APZTCMS-REQ-001 · IDs: BR-* · SR-*

## 1. Business Requirements

### Vision

APZ TCMS is the enterprise Test Management and Quality Engineering platform for APZHUB — unifying manual, automated, and AI-assisted testing with certification, evidence, traceability, and release readiness under one branded product.

### Mission

Enable organisations to plan, execute, evidence, certify, and govern quality across APZHUB products and customer portfolios with auditable native SoR, Platform IAM, and self-hosted-first operations.

### Business objectives

| ID     | Requirement                                                                             | Priority | Risk     | Acceptance criteria                                                               |
| ------ | --------------------------------------------------------------------------------------- | -------- | -------- | --------------------------------------------------------------------------------- |
| BR-001 | Deliver a native APZHUB TCMS SoR (not Kiwi-branded / not engine-as-product)             | P0       | Critical | Product identity is APZ TCMS; no Kiwi/engine brand in UI                          |
| BR-002 | Serve internal APZHUB product quality governance                                        | P0       | High     | All suite products can be represented as projects/contexts in TCMS                |
| BR-003 | Serve external enterprise customers as a commercial TCMS offering                       | P0       | High     | Commercial tiers defined (see CR-*); multi-tenant ready intent                    |
| BR-004 | Support manual + automated + AI-assisted testing models                                 | P0       | High     | FR coverage for all three modes; AI gated by AIR-*                                |
| BR-005 | Provide certification, evidence, and release readiness as first-class capabilities      | P0       | Critical | Certification states + evidence repository + release readiness views required     |
| BR-006 | Maintain strategic positioning as Quality Engineering platform (not a CI admin console) | P0       | Medium   | CI integrations are metadata/orchestration adjacent; not full SCM admin UX        |
| BR-007 | Align with Platform 1.4 certified baseline and freezes                                  | P0       | Critical | No requirement mandates breaking Platform freezes without named Platform Approval |

### Target market

| ID     | Requirement                                                                                    | Priority | Risk   | Acceptance criteria                                     |
| ------ | ---------------------------------------------------------------------------------------------- | -------- | ------ | ------------------------------------------------------- |
| BR-008 | Target mid-market and enterprise QA / engineering organisations                                | P1       | Medium | Personas and commercial tiers reflect enterprise buyers |
| BR-009 | Target regulated industries needing auditable evidence (legal-tech adjacency via APZHUB suite) | P1       | Medium | Compliance requirements RR-* address audit/retention    |

### Commercial opportunities & strategic positioning

| ID     | Requirement                                                               | Priority | Risk | Acceptance criteria                                 |
| ------ | ------------------------------------------------------------------------- | -------- | ---- | --------------------------------------------------- |
| BR-010 | Position APZ TCMS as suite differentiator and standalone sellable product | P0       | High | Commercial requirements CR-* define licensing/tiers |
| BR-011 | Marketplace / partner expansion is optional later                         | P3       | Low  | CR marketplace marked P3                            |

### Success measures

| ID     | Requirement                                                                               | Priority | Risk     | Acceptance criteria                                 |
| ------ | ----------------------------------------------------------------------------------------- | -------- | -------- | --------------------------------------------------- |
| BR-012 | Definition (DEF-001) can proceed from this baseline without requirement gaps for P0 items | P0       | Critical | Checklist complete; all P0 have acceptance criteria |
| BR-013 | Traceability from BR/SR/FR to later Definition/Architecture/Test is established           | P0       | High     | Traceability matrix lists all in-scope IDs          |
| BR-014 | Quality governance reduces release risk for APZHUB portfolio products                     | P1       | Medium   | Release readiness + certification FR present        |

### Business constraints

| ID     | Requirement                                                              | Priority | Risk     | Acceptance criteria                          |
| ------ | ------------------------------------------------------------------------ | -------- | -------- | -------------------------------------------- |
| BR-015 | Self-hosted / CE-first; no mandatory EE engine dependency                | P0       | High     | Integration candidates prefer CE/self-hosted |
| BR-016 | Layering: Module → Platform Service → Connector → Engine only            | P0       | Critical | No FR proposes module→engine                 |
| BR-017 | Existing 1.0.0 PRWL packaging is context, not a ceiling on this baseline | P1       | Low      | Baseline documents P0–P3 horizon explicitly  |

---

## 2. Stakeholder Requirements

| ID     | Stakeholder            | Requirement                                                      | Priority | Risk     | Acceptance criteria                                  |
| ------ | ---------------------- | ---------------------------------------------------------------- | -------- | -------- | ---------------------------------------------------- |
| SR-001 | Executive              | Portfolio quality visibility and release readiness signals       | P0       | High     | Executive dashboards / readiness views required (FR) |
| SR-002 | Product Owner          | Backlog-aligned coverage and certification status per product    | P0       | High     | Projects + coverage + certification FR               |
| SR-003 | QA Manager             | Plan/suite/case governance, assignment, and sign-off             | P0       | High     | Plans/suites/cases/approvals FR                      |
| SR-004 | Test Analyst           | Efficient manual case authoring and execution                    | P0       | High     | Manual cases + runs FR                               |
| SR-005 | Automation Engineer    | Import/link automated results; CI metadata; not rewrite runners  | P0       | High     | Automation + CI integration FR/IR                    |
| SR-006 | Developer              | Defect linkage and failure context without leaving APZHUB        | P1       | Medium   | Defects + Projects/ALM integration IR                |
| SR-007 | Project Manager        | Traceability from requirements to tests to defects to release    | P0       | High     | Requirements traceability FR                         |
| SR-008 | Release Manager        | Gate releases on certification/evidence completeness             | P0       | Critical | Release management + certification FR                |
| SR-009 | Operations             | Health, backup/recovery expectations, observability              | P0       | High     | NFR ops + IR Observability                           |
| SR-010 | Support                | Clear product identity, known limitations, supportable incidents | P1       | Medium   | Commercial + NFR maintainability                     |
| SR-011 | Auditor                | Immutable audit of privileged and certification actions          | P0       | Critical | RR audit + FR audit                                  |
| SR-012 | Compliance             | POPIA/GDPR-aligned personal data handling in TCMS                | P0       | Critical | RR POPIA/GDPR                                        |
| SR-013 | Customer (external)    | Branded TCMS UX; no engine login for standard users              | P0       | High     | UX brand + Platform Identity IR                      |
| SR-014 | External API consumers | Versioned REST APIs with authz and rate limits                   | P1       | Medium   | FR API + NFR                                         |

### Persona goals (summary)

| Persona             | Goals                     | Pain points                | Success metrics                            |
| ------------------- | ------------------------- | -------------------------- | ------------------------------------------ |
| QA Manager          | Govern quality process    | Tool sprawl, weak evidence | % plans executed; certification cycle time |
| Test Analyst        | Author/execute cases fast | Clunky UX, poor search     | Cases executed / day                       |
| Automation Engineer | Reliable result ingestion | Flaky CI linkage           | Automated runs linked                      |
| Release Manager     | Go/no-go clarity          | Ambiguous readiness        | Release decisions with evidence pack       |
| Auditor             | Prove who certified what  | Missing audit trails       | Audit export completeness                  |
