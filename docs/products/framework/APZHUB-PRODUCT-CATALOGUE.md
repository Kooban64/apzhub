# APZHUB — Product Catalogue (Enterprise Portfolio Baseline)

| Field       | Value                                    |
| ----------- | ---------------------------------------- |
| Programme   | **APZHUB-PORTFOLIO-BASELINE-001**        |
| Status      | **IN FORCE**                             |
| Timestamp   | 20260805T203000Z                         |
| Kind        | Authoritative product identity catalogue |
| Engineering | **NONE**                                 |

This catalogue describes **what each product is**. Version / availability indexes may exist elsewhere; **identity and SoR here are authoritative for the Enterprise Portfolio Baseline**.

Related (operational / historical indexes — do not override identity here): [../PRODUCT-CATALOGUE.md](../PRODUCT-CATALOGUE.md)

---

## APZ Time — RI #001

| Field                    | Value                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Purpose                  | Capture and manage effort against work                                                  |
| Business identity        | **Work Execution**                                                                      |
| System of Record         | Time entries / utilisation truth for work effort                                        |
| Enterprise role          | Measures effort in the Productivity Core                                                |
| Reference Implementation | **#001**                                                                                |
| Product maturity         | **Mature** — Native Adoption complete · FROZEN                                          |
| Future evolution         | Defects / authorised enhancements under APZQEP; no identity redesign without Owner Auth |

---

## APZ Support — RI #002

| Field                    | Value                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| Purpose                  | Operate service cases and sustain work                                   |
| Business identity        | **Service Operations**                                                   |
| System of Record         | Tickets / service cases                                                  |
| Enterprise role          | Sustains work in the Productivity Core                                   |
| Reference Implementation | **#002**                                                                 |
| Product maturity         | **Mature** — Native Adoption complete · FROZEN                           |
| Future evolution         | Defects / authorised enhancements under APZQEP; engine remains invisible |

---

## APZ Projects — RI #003

| Field                    | Value                                                                      |
| ------------------------ | -------------------------------------------------------------------------- |
| Purpose                  | Plan and deliver project work                                              |
| Business identity        | **Project Delivery**                                                       |
| System of Record         | Projects / delivery objects                                                |
| Enterprise role          | Defines and delivers work in the Productivity Core                         |
| Reference Implementation | **#003**                                                                   |
| Product maturity         | **Mature** — Native Adoption complete · FROZEN                             |
| Future evolution         | Defects / authorised enhancements under APZQEP; no portal/launcher framing |

---

## APZ Documents — RI #004

| Field                    | Value                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Purpose                  | Preserve enterprise information that supports work                                      |
| Business identity        | **Enterprise Information**                                                              |
| System of Record         | Documents / information lifecycle                                                       |
| Enterprise role          | Information layer of the Productivity Core                                              |
| Reference Implementation | **#004**                                                                                |
| Product maturity         | **Mature** — Native Adoption complete · FROZEN                                          |
| Future evolution         | Retention / governance consumed by reference from Law; Documents remain information SoR |

---

## APZ Workflow — RI #005

| Field                    | Value                                                       |
| ------------------------ | ----------------------------------------------------------- |
| Purpose                  | Coordinate business intent across work                      |
| Business identity        | **Business Process Governance**                             |
| System of Record         | Business process / journey definitions (intent)             |
| Enterprise role          | Business-process layer of the Productivity Core             |
| Reference Implementation | **#005**                                                    |
| Product maturity         | **Mature** — Native Adoption complete · FROZEN              |
| Future evolution         | Automation remains below intent; no execution-leak identity |

---

## APZ Analytics — RI #006

| Field                    | Value                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Purpose                  | Improve decisions through questions and insight                                               |
| Business identity        | **Enterprise Decision Support** / Decision Companion                                          |
| System of Record         | **None** — consumes other SoRs; never becomes one                                             |
| Enterprise role          | Decision-support layer of the Productivity Core                                               |
| Reference Implementation | **#006**                                                                                      |
| Product maturity         | **Mature** — Native Adoption complete · FROZEN                                                |
| Future evolution         | AI / predictive / recommendations require separate Owner Auth; dashboards stay below identity |

---

## APZ Law — RI #007

| Field                    | Value                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Purpose                  | Govern APZHUB obligations, policies, compliance, retention, and evidence                                                    |
| Business identity        | **Enterprise Governance** / Governance Companion                                                                            |
| System of Record         | Policies, obligations, compliance artefacts, governance evidence / retention requirements                                   |
| Enterprise role          | Enterprise Governance Layer — APZHUB-internal only                                                                          |
| Reference Implementation | **#007**                                                                                                                    |
| Product maturity         | **Mature** — Native Adoption complete · FROZEN                                                                              |
| Future evolution         | **Only** APZHUB governance requirements; permanently not a legal practice / case / law-firm / commercial legal SaaS product |

---

## APZQEP — Enterprise Quality

| Field                    | Value                                                          |
| ------------------------ | -------------------------------------------------------------- |
| Purpose                  | Decide quality and release for the platform and products       |
| Business identity        | **Enterprise Quality**                                         |
| System of Record         | Quality flows, decision packages, evidence (quality artefacts) |
| Enterprise role          | Quality layer binding all products                             |
| Reference Implementation | Quality baseline (not RI #001–#007 series)                     |
| Product maturity         | **Enterprise Quality Baseline IN FORCE**                       |
| Future evolution         | Evidence-driven (Lane 1); not redefined by product adoption    |

---

## APZHUB Platform — Enterprise Foundation

| Field                    | Value                                                                   |
| ------------------------ | ----------------------------------------------------------------------- |
| Purpose                  | Provide identity, workspace shell, platform services, and standards     |
| Business identity        | **Enterprise Foundation**                                               |
| System of Record         | Platform metadata (identity, permissions, nav, prefs, audit, events, …) |
| Enterprise role          | Foundation under all products                                           |
| Reference Implementation | Platform foundation (pre-RI portfolio construction)                     |
| Product maturity         | **Foundation COMPLETE**                                                 |
| Future evolution         | Lane 1 evidence-driven; constitution remains supreme                    |

---

## Catalogue rule

A product joins this baseline catalogue as **Mature / operational** only after Mission approval and Native Adoption N-01…N-04 under APZQEP — then optional RI designation and update of [APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md](./APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md).
