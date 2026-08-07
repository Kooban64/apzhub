# APZHUB Portfolio — Reference Implementations

| Field     | Value                            |
| --------- | -------------------------------- |
| Status    | **GOVERNING**                    |
| Timestamp | 20260806T092000Z                 |
| Authority | Owner acceptance of RI #001–#008 |
| Kind      | Canonical portfolio map          |

## Purpose

This is the canonical map of APZHUB Reference Implementations.

Use it to understand:

- what each product is for,
- its durable business identity,
- its System of Record boundary,
- which portfolio layer it belongs to,
- and the permanent rule that **future products must complete Native Adoption before joining the operational platform**.

## Permanent rule

> **Future products must adopt the same Native Adoption Standard (N-01…N-04) under the APZQEP Enterprise Quality Baseline before becoming part of the operational platform.**

Playbook: [APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md](./APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md)

## Portfolio layers

| Layer                                | Status                 | Products                                                                          |
| ------------------------------------ | ---------------------- | --------------------------------------------------------------------------------- |
| **Enterprise Productivity Core**     | **COMPLETE** (Phase 2) | RI #001–#006                                                                      |
| **Enterprise Governance Layer**      | **OPERATIONAL**        | RI #007                                                                           |
| **Enterprise Organisational Memory** | **OPERATIONAL**        | RI #008                                                                           |
| **Future Expansion**                 | Later                  | New domains only if genuinely new capability — Mission + Native Adoption required |

---

## Reference Implementations

### RI #001 — APZ Time

| Field             | Value                                              |
| ----------------- | -------------------------------------------------- |
| Purpose           | Capture and manage effort against work             |
| Business identity | **Work Execution**                                 |
| System of Record  | Time entries / utilisation truth for work effort   |
| Layer             | Enterprise Productivity Core                       |
| Ops / RI          | Product Time packs · Reference Implementation #001 |

### RI #002 — APZ Support

| Field             | Value                                         |
| ----------------- | --------------------------------------------- |
| Purpose           | Operate service cases and sustain work        |
| Business identity | **Service Operations**                        |
| System of Record  | Tickets / service cases                       |
| Layer             | Enterprise Productivity Core                  |
| Ops / RI          | Support packs · Reference Implementation #002 |

### RI #003 — APZ Projects

| Field             | Value                                          |
| ----------------- | ---------------------------------------------- |
| Purpose           | Plan and deliver project work                  |
| Business identity | **Project Delivery**                           |
| System of Record  | Projects / delivery objects                    |
| Layer             | Enterprise Productivity Core                   |
| Ops / RI          | Projects packs · Reference Implementation #003 |

### RI #004 — APZ Documents

| Field             | Value                                           |
| ----------------- | ----------------------------------------------- |
| Purpose           | Preserve enterprise information                 |
| Business identity | **Enterprise Information**                      |
| System of Record  | Documents / information lifecycle               |
| Layer             | Enterprise Productivity Core                    |
| Ops / RI          | Documents packs · Reference Implementation #004 |

### RI #005 — APZ Workflow

| Field             | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| Purpose           | Coordinate business intent across work                             |
| Business identity | **Business Process Governance**                                    |
| System of Record  | Business process / journey definitions (intent)                    |
| Layer             | Enterprise Productivity Core                                       |
| Ops / RI          | [../apzworkflow/](../apzworkflow/) · Reference Implementation #005 |

### RI #006 — APZ Analytics

| Field             | Value                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Purpose           | Improve decisions with questions and insight                                                                           |
| Business identity | **Enterprise Decision Support** / Decision Companion                                                                   |
| System of Record  | **None** — consumes other SoRs; never becomes one                                                                      |
| Layer             | Enterprise Productivity Core                                                                                           |
| Ops / RI          | [../apzanalytics/](../apzanalytics/) · [REFERENCE-IMPLEMENTATION-006](../apzanalytics/REFERENCE-IMPLEMENTATION-006.md) |

### RI #007 — APZ Law

| Field             | Value                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Purpose           | Govern APZHUB obligations, policies, compliance, retention, and evidence                             |
| Business identity | **Enterprise Governance** / Governance Companion                                                     |
| System of Record  | Policies, obligations, compliance artefacts, governance evidence / retention requirements            |
| Layer             | **Enterprise Governance Layer**                                                                      |
| Ops / RI          | [../apzlaw/](../apzlaw/) · [REFERENCE-IMPLEMENTATION-007](../apzlaw/REFERENCE-IMPLEMENTATION-007.md) |

**Permanent boundary for RI #007:** APZ Law is an **internal APZHUB governance product only**. It is not a legal practice, case, law-firm, or commercial legal SaaS product. It grows only with APZHUB governance requirements.

### RI #008 — APZ Knowledge

| Field             | Value                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Purpose           | Curate and deliver organisational memory so people act correctly in context                                            |
| Business identity | **Enterprise Organisational Memory** / Memory Companion                                                                |
| System of Record  | Organisational memory objects only — references other SoRs; never replaces them                                        |
| Layer             | **Enterprise Organisational Memory**                                                                                   |
| Ops / RI          | [../apzknowledge/](../apzknowledge/) · [REFERENCE-IMPLEMENTATION-008](../apzknowledge/REFERENCE-IMPLEMENTATION-008.md) |

**Permanent boundary for RI #008:** APZ Knowledge is organisational memory only. It is not a document library, wiki, search portal, LMS, RAG platform, or AI assistant. It grows only with trusted enterprise experience and evidence-driven Owner Auth.

---

## Operating model (portfolio)

```text
Projects define the work.
Support sustains the work.
Time measures the effort.
Documents preserve the information.
Workflow coordinates the intent.
Analytics informs the decisions.
Law governs the obligations.
Knowledge remembers what the organisation has learned.
```

Users experience APZHUB products — never the underlying engines.

Product classes: [APZHUB-PRODUCT-CLASSES.md](./APZHUB-PRODUCT-CLASSES.md)

## How future products join

1. Mission pack Owner-APPROVED
2. Native Adoption programme authorised (Playbook unchanged)
3. N-01…N-04 complete under APZQEP
4. Reference Implementation designated
5. Portfolio map updated

Until then, a product is not part of the operational platform map — even if engineering prototypes exist.

## Related governing docs

| Doc                               | Path                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| **Enterprise Portfolio Baseline** | [APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md](./APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md) |
| Architecture Atlas                | [APZHUB-ARCHITECTURE-ATLAS.md](./APZHUB-ARCHITECTURE-ATLAS.md)                       |
| Product Catalogue                 | [APZHUB-PRODUCT-CATALOGUE.md](./APZHUB-PRODUCT-CATALOGUE.md)                         |
| Layer Model                       | [APZHUB-ENTERPRISE-LAYER-MODEL.md](./APZHUB-ENTERPRISE-LAYER-MODEL.md)               |
| Portfolio Roadmap                 | [APZHUB-PORTFOLIO-ROADMAP.md](./APZHUB-PORTFOLIO-ROADMAP.md)                         |
| Productivity Core                 | [APZHUB-ENTERPRISE-PRODUCTIVITY-CORE.md](./APZHUB-ENTERPRISE-PRODUCTIVITY-CORE.md)   |
| Governance Layer                  | [APZHUB-ENTERPRISE-GOVERNANCE-LAYER.md](./APZHUB-ENTERPRISE-GOVERNANCE-LAYER.md)     |
| Phase 2 complete                  | [APZHUB-PORTFOLIO-PHASE-2-COMPLETE.md](./APZHUB-PORTFOLIO-PHASE-2-COMPLETE.md)       |
| Working model                     | [APZHUB-WORKING-MODEL.md](./APZHUB-WORKING-MODEL.md)                                 |
| Business roadmap                  | [APZHUB-PORTFOLIO-BUSINESS-ROADMAP.md](./APZHUB-PORTFOLIO-BUSINESS-ROADMAP.md)       |
