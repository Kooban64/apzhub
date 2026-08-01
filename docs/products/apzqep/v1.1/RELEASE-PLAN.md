# Release Plan — APZQEP 1.1 → 2.0

## Version intent

| Version | Intent                                                                               | Availability expectation                            |
| ------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| **1.1** | Operable QE platform: Runs/Suites/Defects + discovery + AI assist MVP + LA hardening | LIMITED_AVAILABILITY or expanded LA; GA not assumed |
| **1.2** | Enterprise depth: Coverage, Certification Engine, ALM, Analytics                     | LA → selective Production Ready with Limitations    |
| **1.3** | Assurance: compliance, audit, GA readiness programmes                                | Candidate for unrestricted GA Owner decision        |
| **2.0** | Portfolio quality intelligence                                                       | New major baseline                                  |

---

## Version 1.1 — include

| Area                 | In                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------- |
| LA hardening         | Evidence storage path + ACL; TE L-OP-01 / events / OpenAPI hygiene                           |
| Test operating model | **Suites · Runs · Defects**                                                                  |
| Discovery            | Unified search; notifications; command palette                                               |
| UX                   | QEP Home; QA/Tester/Risk dashboards; release readiness MVP                                   |
| AI                   | Guardrails; RAG; req analysis; test gen draft; evidence summary; release narrative; chat MVP |
| Automation           | CI ingestion improvements; run linkage                                                       |
| Explicitly **out**   | Coverage engine; Jira deep sync; Executive portfolio; unrestricted GA; autonomous AI         |

**Exit:** APZQEP-120 certification + Owner limited release decision.

---

## Version 1.2 — include

| Area                                          | In                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Coverage & Impact engines                     |                                                                        |
| Certification Engine (product)                |                                                                        |
| ALM integrations (Jira primary; Azure follow) |                                                                        |
| Documents integration                         |                                                                        |
| Analytics + Executive dashboard               |                                                                        |
| AI depth                                      | Optimisation, regression selection, defect classify, RCA, eval harness |
| Admin                                         | QEP administration module                                              |

**Out:** Full multi-product portfolio scorecards (2.0); GA unless Owner accelerates via 1.3.

---

## Version 1.3 — include

| Area                                      | In  |
| ----------------------------------------- | --- |
| Unified audit + compliance export packs   |     |
| GA readiness programmes for Evidence + TE |     |
| Advanced AI evaluation / model policy     |     |
| Azure Boards/Test Plans bridge maturation |     |
| Hardening of 1.2 enterprise features      |     |

**Exit:** Owner may authorise unrestricted GA under separate decision.

---

## Version 2.0 — include

| Area                                    | In  |
| --------------------------------------- | --- |
| Portfolio QE across APZHUB products     |     |
| Cross-product quality intelligence      |     |
| Platform-scale AI assistants            |     |
| Possible edition packaging (commercial) |     |

---

## Mapping to programmes

See [TECHNICAL-ROADMAP.md](./TECHNICAL-ROADMAP.md): 111–120 → **1.1**; 121–124 → **1.2**; 125–126 → **1.3**; 200 → **2.0**.

## Release governance reminder

Each version still requires Freeze → Owner Accept → Release programme. Planning here does **not** create tags or promote packages.
