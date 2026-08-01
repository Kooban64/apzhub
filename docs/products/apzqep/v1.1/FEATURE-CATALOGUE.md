# Feature Catalogue — APZQEP v1.1

Features are grouped by domain. IDs cross-reference [PROGRAMME-BACKLOG.md](./PROGRAMME-BACKLOG.md).

Legend: **C** Core · **E** Enterprise · **A** AI · **R** Reporting · **U** Automation · **M** Management · **D** Administration · **I** Integration · **S** Security · **P** Compliance · **O** Portfolio · **X** Executive

---

## Core

| ID        | Feature                                                        | Theme | Release |
| --------- | -------------------------------------------------------------- | ----- | ------- |
| F-CORE-01 | Test Suites (create, version, associate specs)                 | T2    | 1.1     |
| F-CORE-02 | Test Runs (plan execution instances, progress, results rollup) | T2    | 1.1     |
| F-CORE-03 | Defects (lifecycle, link to execution/evidence/req)            | T2    | 1.1     |
| F-CORE-04 | QEP Home / personal workspace                                  | T4    | 1.1     |
| F-CORE-05 | Unified entity search (all QEP types)                          | T3    | 1.1     |
| F-CORE-06 | Command Palette QEP actions                                    | T3    | 1.1     |
| F-CORE-07 | Platform notifications for QEP domain events                   | T3    | 1.1     |

## Enterprise

| ID       | Feature                                                            | Theme | Release                 |
| -------- | ------------------------------------------------------------------ | ----- | ----------------------- |
| F-ENT-01 | Evidence durable storage (ADR-0088 decision + implementation path) | T1    | 1.1                     |
| F-ENT-02 | Evidence list/search ACL hardening (L-EM-01)                       | T1    | 1.1                     |
| F-ENT-03 | TE authenticated Playwright journeys (L-OP-01)                     | T1    | 1.1                     |
| F-ENT-04 | Domain event publication (TE + Evidence → bus)                     | T1    | 1.1                     |
| F-ENT-05 | Coverage engine (req↔spec↔run)                                     | T6    | 1.2                     |
| F-ENT-06 | Impact analysis                                                    | T6    | 1.2                     |
| F-ENT-07 | Certification Engine (product)                                     | T6    | 1.2                     |
| F-ENT-08 | Release readiness product UI                                       | T4    | 1.1 (MVP) / 1.2 (depth) |

## AI

See [AI-STRATEGY.md](./AI-STRATEGY.md). MVP in 1.1:

| ID         | Feature                                                        | Release |
| ---------- | -------------------------------------------------------------- | ------- |
| F-AI-01    | AI Requirement Analysis (draft insights)                       | 1.1     |
| F-AI-02    | AI Test Generation (draft cases from req/spec)                 | 1.1     |
| F-AI-03    | AI Evidence Summaries                                          | 1.1     |
| F-AI-04    | AI Release Readiness narrative                                 | 1.1     |
| F-AI-05    | AI Chat Assistant (scoped RAG over QEP)                        | 1.1     |
| F-AI-06    | Prompt Library + Guardrails + Human approval                   | 1.1     |
| F-AI-07–20 | Optimisation, RCA, defect classify, data gen, eval, model mgmt | 1.2–2.0 |

## Reporting / Executive

| ID       | Feature                        | Release |
| -------- | ------------------------------ | ------- |
| F-RPT-01 | QA Dashboard                   | 1.1     |
| F-RPT-02 | Tester Dashboard               | 1.1     |
| F-RPT-03 | Release / Risk Dashboard (MVP) | 1.1     |
| F-RPT-04 | Executive Dashboard            | 1.2     |
| F-RPT-05 | Portfolio quality scorecards   | 1.3–2.0 |
| F-RPT-06 | Scheduled report packs         | 1.2     |

## Automation

| ID       | Feature                               | Release |
| -------- | ------------------------------------- | ------- |
| F-AUT-01 | CI result ingestion enhancements      | 1.1     |
| F-AUT-02 | Automation run linkage to Suites/Runs | 1.1     |
| F-AUT-03 | Webhook / pipeline status surface     | 1.2     |

## Management / Administration / Security / Compliance

| ID       | Feature                                           | Release |
| -------- | ------------------------------------------------- | ------- |
| F-ADM-01 | QEP Administration (capability toggles, defaults) | 1.2     |
| F-SEC-01 | Unified audit explorer                            | 1.2     |
| F-CMP-01 | Compliance evidence packs export                  | 1.3     |
| F-MGT-01 | Saved views / personal filters across modules     | 1.1     |

## Integration

| ID       | Feature                                       | Release      |
| -------- | --------------------------------------------- | ------------ |
| F-INT-01 | Integration architecture for ALM (Jira/Azure) | 1.1 (design) |
| F-INT-02 | Jira defect/issue sync                        | 1.2          |
| F-INT-03 | Azure Test Plans / Boards bridge              | 1.2–1.3      |
| F-INT-04 | Documents deep-link / attach                  | 1.2          |
| F-INT-05 | GitHub checks enrichment                      | 1.2          |

## Module improvement recommendations

| Module                                                                                | v1.0                   | v1.1 recommendation                                   |
| ------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| Requirements–Plans                                                                    | Complete               | Maintain; AI assist overlays; search                  |
| Test Execution                                                                        | Partial LA             | Harden L-OP-01, events, OpenAPI                       |
| Evidence                                                                              | Partial LA             | Storage path, ACL, events, obs                        |
| Runs / Suites / Defects                                                               | Missing                | **Build**                                             |
| Reporting / QI / Portfolio / Risk / AI / Admin / Integrations / Audit / Certification | Stubs                  | Prioritise per release plan; do not fake Completeness |
| Search / Notifications / Command Palette                                              | Platform-adjacent gaps | **Close** for QEP entities                            |
