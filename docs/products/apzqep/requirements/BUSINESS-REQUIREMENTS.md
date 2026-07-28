# APZ QEP — Business Requirements

> **Programme:** APZQEP-REQ-001 · IDs: BR-* · SR-* · CR-*  
> **Includes:** Market positioning · commercial objectives · stakeholder needs

## 1. Product vision & mission

### Vision

APZ QEP is an **AI-native Enterprise Quality Engineering Platform** that governs software quality throughout the complete Software Development Lifecycle. Testing is one capability; the platform manages the complete quality lifecycle.

### Mission

Enable organisations to specify quality-relevant requirements, plan and execute verification (manual, automated, AI-assisted, continuous), maintain mandatory traceability, manage evidence and defects, assess release readiness, certify with human approval, and continuously improve quality — under APZHUB branding on Certified Platform 1.4, with QEP as SoR and AI as assistants only.

---

## 2. Industry problem statement

| ID     | Requirement                                                                                                                                           | Priority | Risk     | Acceptance criteria                                                       |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------- |
| BR-001 | Quality tools are fragmented across test cases, CI dashboards, ALM tickets, spreadsheets, and chat AI — creating weak evidence and certification gaps | P0       | Critical | Product scope covers end-to-end quality lifecycle, not case library alone |
| BR-002 | Traditional TCMS products optimise case management; enterprises need Quality Engineering with certification, evidence, and AI governance              | P0       | High     | Positioning and FR set differentiate from “just TCMS”                     |
| BR-003 | AI coding assistants generate tests without auditable SoR, human gates, or requirement traceability                                                   | P0       | Critical | AIR-* require human acceptance; QEP remains SoR                           |

---

## 3. Market landscape & competitive positioning

### Landscape (requirements intent)

| Class                | Examples                                     | Typical strength         | Typical gap vs QEP intent                                |
| -------------------- | -------------------------------------------- | ------------------------ | -------------------------------------------------------- |
| Classic TCMS         | Tuskr, Kiwi TCMS, TestRail                   | Case/plan/run management | Limited enterprise certification SoR; weak AI governance |
| ALM-embedded testing | Xray, Azure Test Plans, Jira Test Management | ALM adjacency            | Engine brand coupling; not APZHUB-native SoR             |
| Dev platform quality | GitLab Quality                               | Pipeline-centric         | Not full QE SoR for multi-tool enterprises               |
| Issue trackers       | Jira                                         | Work tracking            | Not verification/certification SoR                       |

### Competitive comparison (where APZ QEP intentionally differs)

| Competitor / class   | Where QEP differs (intent)                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **Tuskr**            | QEP is QE + certification + AI-native governance on APZHUB suite, not standalone lightweight TCMS |
| **Kiwi TCMS**        | QEP is native APZHUB SoR; Kiwi is **out of scope** as SoR/engine; brand masking                   |
| **TestRail**         | QEP emphasises continuous certification, evidence packs, Platform IAM/Zero Trust, MCP/IDE agents  |
| **Xray**             | QEP is not Jira-plugin-bound; ALM sync is optional connector; QEP owns quality SoR                |
| **Azure Test Plans** | QEP is multi-CI/multi-ALM; not Azure-locked; self-hosted-first                                    |
| **Jira**             | Jira is work tracker adjacency; QEP owns verification/evidence/certification                      |
| **GitLab Quality**   | QEP orchestrates multi-pipeline results into certification SoR; not GitLab-only                   |

| ID     | Requirement                                                                                         | Priority | Risk     | Acceptance criteria                                           |
| ------ | --------------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------- |
| BR-004 | Document and maintain competitive differentiation as Quality Engineering Platform (not plugin TCMS) | P0       | High     | This section + FR coverage of certification/evidence/AI gates |
| BR-005 | Never position Kiwi or other engines as the user-facing product                                     | P0       | Critical | UX brand requirements; IR brand masking                       |

### Key differentiators

1. Native APZHUB Quality Engineering SoR on certified Platform 1.4
2. Verification-centric model (beyond test cases)
3. Certification & continuous certification as core
4. AI-native with interchangeable providers; AI never SoR; never auto-certify
5. MCP-preferred IDE/agent integration
6. Suite adjacency (Projects, Documents, Analytics, Observability, Identity)
7. Self-hosted / CE-first enterprise posture

### Value proposition

| ID     | Requirement                                                                                                              | Priority | Risk | Acceptance criteria              |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | -------- | ---- | -------------------------------- |
| BR-006 | Value proposition: one governed platform from requirement → verification → evidence → certification → continuous quality | P0       | High | Journeys and FR cover full chain |
| BR-007 | Value for buyers: reduce release risk, auditability, AI productivity without losing control                              | P0       | High | Personas + AIR human gates       |

### Future market opportunities

| ID     | Requirement                                                                      | Priority | Risk   | Acceptance criteria        |
| ------ | -------------------------------------------------------------------------------- | -------- | ------ | -------------------------- |
| BR-008 | Marketplace for verification templates, agents, and connectors (later)           | P3       | Low    | Roadmap P3; CR marketplace |
| BR-009 | Partner / professional services ecosystem for enterprise rollout                 | P2       | Medium | CR professional services   |
| BR-010 | Regulated-industry overlays (legal-tech suite adjacency) without weakening audit | P1       | Medium | SEC/RR industry overlays   |

---

## 4. Target customers

| ID     | Segment                                                                | Priority | Acceptance criteria                              |
| ------ | ---------------------------------------------------------------------- | -------- | ------------------------------------------------ |
| BR-011 | Internal APZHUB portfolio quality governance                           | P0       | All suite products representable as QEP contexts |
| BR-012 | Mid-market and enterprise engineering/QA organisations                 | P0       | Personas + commercial tiers                      |
| BR-013 | Regulated / audit-heavy organisations needing evidence & certification | P1       | SEC retention + certification FR                 |
| BR-014 | Organisations adopting AI IDEs needing governed quality SoR            | P1       | MCP + AIR requirements                           |

---

## 5. Business objectives & success criteria

| ID     | Requirement                                                        | Priority | Risk     | Acceptance criteria                             |
| ------ | ------------------------------------------------------------------ | -------- | -------- | ----------------------------------------------- |
| BR-015 | Deliver native APZHUB QEP SoR (not engine-as-product)              | P0       | Critical | Product identity APZ QEP; no engine brand in UI |
| BR-016 | Support manual + automated + AI-assisted + continuous verification | P0       | Critical | FR + MM coverage                                |
| BR-017 | Certification, evidence, release readiness first-class             | P0       | Critical | FR + RPT + SEC                                  |
| BR-018 | Align with Platform 1.4 freezes and layering                       | P0       | Critical | No FR breaks freezes without Platform Approval  |
| BR-019 | This baseline enables Definition without P0 gaps                   | P0       | Critical | Checklist complete; all P0 have AC              |
| BR-020 | Traceability Idea/BR → FR → later Definition/Architecture/Test     | P0       | High     | Traceability matrix complete for in-scope IDs   |

### KPIs (business intent — measured post-implementation)

| ID     | KPI                                                                     | Priority | Acceptance criteria |
| ------ | ----------------------------------------------------------------------- | -------- | ------------------- |
| BR-021 | % requirements with linked verification                                 | P0       | Coverage views FR   |
| BR-022 | Certification cycle time (request → human sign-off)                     | P1       | Cert workflow FR    |
| BR-023 | % automated verification results linked to SoR                          | P1       | Automation FR/IR    |
| BR-024 | Audit export completeness for certification actions                     | P0       | SEC audit           |
| BR-025 | AI suggestion accept rate (productivity) without auto-certify incidents | P2       | AIR audit metrics   |

---

## 6. Commercial requirements (CR-*)

| ID     | Topic                 | Requirement                                                                               | Priority | Risk     | Acceptance criteria                |
| ------ | --------------------- | ----------------------------------------------------------------------------------------- | -------- | -------- | ---------------------------------- |
| CR-001 | Licensing             | Suite and/or standalone APZHUB licensing for QEP                                          | P0       | High     | License model in Definition        |
| CR-002 | Subscription          | Starter / Professional / Enterprise tier intent                                           | P0       | Medium   | Feature matrix by tier             |
| CR-003 | Entitlements          | Gate advanced AI, multi-CI, HA, marketplace by tier                                       | P1       | Medium   | Platform Governance entitlements   |
| CR-004 | Revenue               | Standalone QEP + suite uplift + services                                                  | P1       | Medium   | Commercial narrative in Definition |
| CR-005 | Enterprise licensing  | Named enterprise agreements, SSO/entitlement packs                                        | P0       | High     | Enterprise edition docs            |
| CR-006 | Marketplace           | Optional later templates/agents/connectors                                                | P3       | Low      | Parked                             |
| CR-007 | Cloud                 | Optional managed cloud later (Owner-gated)                                                | P2       | Medium   | Not MVP-required                   |
| CR-008 | On-premise            | First-class self-hosted / on-prem                                                         | P0       | Critical | Self-hosted path                   |
| CR-009 | Hybrid                | Optional later (control plane / data residency split)                                     | P3       | Low      | Parked                             |
| CR-010 | Professional services | Implementation, migration from TCMS tools, training                                       | P2       | Medium   | Services catalogue intent          |
| CR-011 | Partner ecosystem     | Integrators for connectors and industry overlays                                          | P2       | Medium   | Partner programme intent           |
| CR-012 | Pricing philosophy    | Value-based (seats / projects / automation / AI usage) — prices Owner commercial decision | P1       | Low      | Philosophy stated; prices TBD      |
| CR-013 | Support lifecycle     | Publish support window per SemVer                                                         | P0       | Medium   | Support policy in releases         |
| CR-014 | Editions              | Honest limitations per edition                                                            | P0       | High     | KNOWN-LIMITATIONS per edition      |

---

## 7. Stakeholder requirements (SR-*)

| ID     | Stakeholder            | Requirement                                       | Priority | Risk     | Acceptance criteria           |
| ------ | ---------------------- | ------------------------------------------------- | -------- | -------- | ----------------------------- |
| SR-001 | Executive              | Portfolio quality & readiness visibility          | P0       | High     | Executive dashboards RPT      |
| SR-002 | Product Owner          | Coverage & certification per product              | P0       | High     | Projects + coverage + cert FR |
| SR-003 | Business Analyst       | Requirements quality & traceability               | P0       | High     | Requirements FR               |
| SR-004 | Project Manager        | End-to-end traceability & status                  | P0       | High     | Traceability FR               |
| SR-005 | Developer              | Defect/failure context in APZHUB                  | P1       | Medium   | Defects + ALM IR              |
| SR-006 | QA Engineer            | Efficient manual verification authoring/execution | P0       | High     | Manual verification FR        |
| SR-007 | Automation Engineer    | Result ingestion; not rewrite runners             | P0       | High     | Automation FR/IR              |
| SR-008 | Release Manager        | Go/no-go on evidence & certification              | P0       | Critical | Readiness + cert FR           |
| SR-009 | Operations             | Health, backup/recovery, observability            | P0       | High     | NFR + IR Observability        |
| SR-010 | Support                | Supportable product identity & limitations        | P1       | Medium   | Commercial + NFR              |
| SR-011 | Compliance Officer     | POPIA/GDPR/ISO-aligned controls                   | P0       | Critical | SEC-*                         |
| SR-012 | Auditor                | Immutable audit of cert & privileged actions      | P0       | Critical | SEC audit                     |
| SR-013 | Customer (external)    | Branded QEP UX; no engine login                   | P0       | High     | UX brand + Identity IR        |
| SR-014 | Third-party Integrator | Versioned APIs, webhooks, MCP tools               | P1       | Medium   | IR API/MCP                    |
| SR-015 | AI Agent               | Governed tools only; never SoR/certify alone      | P0       | Critical | AIR + MCP IR                  |

## 8. Business constraints

| ID     | Requirement                                                  | Priority | Risk     | Acceptance criteria               |
| ------ | ------------------------------------------------------------ | -------- | -------- | --------------------------------- |
| BR-026 | Self-hosted / CE-first; no mandatory EE engine dependency    | P0       | High     | IR prefer CE/self-hosted          |
| BR-027 | Layering Module → Platform Service → Connector → Engine only | P0       | Critical | No FR proposes module→engine      |
| BR-028 | Historical APZ TCMS 1.0.0 PRWL is context, not ceiling       | P1       | Low      | P0–P3 horizon explicit            |
| BR-029 | Evolve APZTCMS-REQ-001; do not discard                       | P0       | High     | DOCUMENT-MAPPING / preserved path |
