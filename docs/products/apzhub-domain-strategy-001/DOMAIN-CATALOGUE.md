# APZHUB — Domain Catalogue

| Field     | Value                                                                                     |
| --------- | ----------------------------------------------------------------------------------------- |
| Programme | APZHUB-DOMAIN-STRATEGY-001                                                                |
| Status    | **IN FORCE**                                                                              |
| Timestamp | 20260806T023000Z                                                                          |
| Authority | [APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md](../framework/APZHUB-ENTERPRISE-DOMAIN-STRATEGY.md) |

For each domain:

1. Why does this domain exist?
2. What business capabilities belong to it?
3. Which existing products support it?
4. What future products may emerge?
5. What is explicitly out of scope?

---

# Part A — Established domains (baseline)

## Foundation Domain

| Field  | Value                 |
| ------ | --------------------- |
| Status | **ESTABLISHED**       |
| Layer  | Enterprise Foundation |

| Question              | Answer                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**               | APZHUB needs a single identity, workspace, platform services, and standards layer so native products share one operating environment. |
| **Capabilities**      | Identity & access · Workspace shell · Platform services · Cross-cutting standards · Telemetry foundations                             |
| **Existing products** | APZHUB Platform (Foundation)                                                                                                          |
| **Future products**   | None as separate commercial products — evolution is Lane 1 platform change                                                            |
| **Out of scope**      | Business SoRs · product-specific UX identity · engine-facing consoles for end users                                                   |

---

## Quality Domain

| Field  | Value              |
| ------ | ------------------ |
| Status | **ESTABLISHED**    |
| Layer  | Enterprise Quality |

| Question              | Answer                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Why**               | Every product change must follow one quality and release contract — otherwise the portfolio fragments.                           |
| **Capabilities**      | Quality flows · Impact & policy · Decision packages · Evidence · Release gates · Operational learning                            |
| **Existing products** | APZQEP                                                                                                                           |
| **Future products**   | Evolution of APZQEP only (Lane 1 / Owner Auth) — not parallel quality products                                                   |
| **Out of scope**      | Product-private quality systems · reopening APZQEP architecture via product adoption · replacing Product Board / Owner decisions |

---

## Operations Domain

| Field  | Value                 |
| ------ | --------------------- |
| Status | **ESTABLISHED**       |
| Layer  | Enterprise Operations |

| Question              | Answer                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Why**               | APZOR must plan work, sustain service, and account for effort as the daily operating spine of the enterprise.                |
| **Capabilities**      | Project delivery · Service operations · Work execution / effort · Operational coordination with process & information layers |
| **Existing products** | APZ Projects (RI #003) · APZ Support (RI #002) · APZ Time (RI #001)                                                          |
| **Future products**   | Possible specialised ops satellites only if Mission proves a distinct capability — default is deepen existing RIs            |
| **Out of scope**      | Absorbing Documents / Workflow / Analytics / Law SoRs · becoming a “portal” over engines · HR/finance as ops identity        |

---

## Business Process Domain

| Field  | Value                         |
| ------ | ----------------------------- |
| Status | **ESTABLISHED**               |
| Layer  | Enterprise Business Processes |

| Question              | Answer                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Why**               | Enterprise work needs coordinated **business intent** across products — not disconnected task automation.            |
| **Capabilities**      | Journey / process definition · Cross-product orchestration of intent · Process governance (business)                 |
| **Existing products** | APZ Workflow (RI #005)                                                                                               |
| **Future products**   | Unlikely as a second process product; deepen Workflow. Automation tooling remains below identity.                    |
| **Out of scope**      | Execution engines as product identity · replacing project/support SoRs · legal/compliance obligations (→ Governance) |

---

## Information Domain

| Field  | Value                                         |
| ------ | --------------------------------------------- |
| Status | **ESTABLISHED** (Knowledge expansion planned) |
| Layer  | Enterprise Information                        |

| Question              | Answer                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Why**               | The enterprise must preserve and find the information that supports work — with clear ownership.                      |
| **Capabilities**      | Document / information lifecycle · Filing & discovery of work artefacts · Information supporting operational products |
| **Existing products** | APZ Documents (RI #004)                                                                                               |
| **Future products**   | **APZ Knowledge** (see Knowledge Domain) — may sit adjacent or as a peer product within Information                   |
| **Out of scope**      | Governance evidence SoR (→ Law) · becoming a generic file dump without work context · legal practice DMS              |

---

## Insight Domain

| Field  | Value                       |
| ------ | --------------------------- |
| Status | **ESTABLISHED**             |
| Layer  | Enterprise Decision Support |

| Question              | Answer                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Why**               | Leaders and operators need better decisions from enterprise questions — not another dashboard estate.        |
| **Capabilities**      | Decision support · Question → insight → decision · Observational analytics over operational SoRs             |
| **Existing products** | APZ Analytics (RI #006)                                                                                      |
| **Future products**   | Advanced insight (AI / predictive) only under separate Owner Auth — still Insight Domain, not a new identity |
| **Out of scope**      | Owning operational SoRs · dashboard-first product identity · BI engine branding                              |

---

## Governance Domain

| Field  | Value                 |
| ------ | --------------------- |
| Status | **ESTABLISHED**       |
| Layer  | Enterprise Governance |

| Question              | Answer                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Why**               | APZHUB work must operate within organisational obligations, policies, compliance, retention, and evidence.                    |
| **Capabilities**      | Policies · Obligations · Compliance · Approvals · Regulatory duties (reference) · Retention · Governance evidence             |
| **Existing products** | APZ Law (RI #007) — **APZHUB-internal only**                                                                                  |
| **Future products**   | Deeper governance capabilities as APZHUB needs grow; Quality remains peer domain (APZQEP), not absorbed into Law              |
| **Out of scope**      | Legal practice / matters / trust / billing / court / commercial legal SaaS · legal advice · external legal profession tooling |

---

# Part B — Planned expansion domains

None of the following domains are authorised for Mission or engineering. They define **where expansion may go**.

## People Domain

| Field                | Value       |
| -------------------- | ----------- |
| Status               | **PLANNED** |
| Illustrative product | APZ People  |

| Question              | Answer                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Why**               | APZOR will need coherent people operations (hire-to-retire) inside the same enterprise platform experience.           |
| **Capabilities**      | HR administration · Onboarding · Performance · Learning · Organisation structure (illustrative — Mission will refine) |
| **Existing products** | None as SoR; Time may **reference** people/effort context                                                             |
| **Future products**   | APZ People (or Mission-defined name)                                                                                  |
| **Out of scope**      | Payroll as identity until Mission says so · replacing Time SoR · consumer HR marketplace · engine-led “HRIS portal”   |

---

## Finance Domain

| Field                | Value       |
| -------------------- | ----------- |
| Status               | **PLANNED** |
| Illustrative product | APZ Finance |

| Question              | Answer                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Why**               | Financial control and enterprise money flows belong in the platform once Operations and Governance are mature. |
| **Capabilities**      | Financial planning · Accounting interfaces · Cost visibility · Enterprise finance controls (Mission-refined)   |
| **Existing products** | None as finance SoR; operational products may emit cost-relevant signals                                       |
| **Future products**   | APZ Finance                                                                                                    |
| **Out of scope**      | Law-practice billing identity · turning Time into a finance system · bank-core / treasury as silent scope      |

---

## Customer Domain

| Field                | Value       |
| -------------------- | ----------- |
| Status               | **PLANNED** |
| Illustrative product | APZ CRM     |

| Question              | Answer                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| **Why**               | Customer relationships and commercial pipelines are a natural expansion beyond internal operations.   |
| **Capabilities**      | Customer records · Pipeline · Account management · Customer success coordination (Mission-refined)    |
| **Existing products** | Support may touch customer issues; Support remains service SoR, not CRM                               |
| **Future products**   | APZ CRM                                                                                               |
| **Out of scope**      | Absorbing Support tickets as CRM · marketing automation as default identity · engine brand as product |

---

## Assets Domain

| Field                | Value       |
| -------------------- | ----------- |
| Status               | **PLANNED** |
| Illustrative product | APZ Assets  |

| Question              | Answer                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Why**               | Physical and digital asset stewardship needs a home when APZOR scale requires it.                 |
| **Capabilities**      | Asset register · Lifecycle · Assignment · Maintenance coordination (Mission-refined)              |
| **Existing products** | None                                                                                              |
| **Future products**   | APZ Assets                                                                                        |
| **Out of scope**      | Documents-as-asset-register · ITSM takeover of Support · facilities IoT platforms without Mission |

---

## Procurement Domain

| Field                | Value           |
| -------------------- | --------------- |
| Status               | **PLANNED**     |
| Illustrative product | APZ Procurement |

| Question              | Answer                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Why**               | Buying and supplier management are enterprise capabilities that should share identity, quality, and governance context. |
| **Capabilities**      | Requisition · Supplier management · Purchase-to-pay coordination (Mission-refined)                                      |
| **Existing products** | None; Governance/Finance may constrain by reference later                                                               |
| **Future products**   | APZ Procurement                                                                                                         |
| **Out of scope**      | Silent ERP replacement · Finance Domainscope creep without Mission · Law as purchasing system                           |

---

## Risk Domain

| Field                | Value       |
| -------------------- | ----------- |
| Status               | **PLANNED** |
| Illustrative product | APZ Risk    |

| Question              | Answer                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **Why**               | Operational and enterprise risk management may need a dedicated home beyond Law’s obligation catalogue. |
| **Capabilities**      | Risk register · Controls · Risk assessments · Treatment tracking (Mission-refined)                      |
| **Existing products** | Law (governance obligations) and APZQEP (quality risk) — adjacent, not substitutes                      |
| **Future products**   | APZ Risk                                                                                                |
| **Out of scope**      | Collapsing into Law or APZQEP without Mission · insurance brokerage platforms · legal advice            |

---

## Knowledge Domain

| Field             | Value                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Status            | **OPERATIONAL** · **RI #008** · Native **FROZEN**                                                                           |
| Identity          | **Enterprise Organisational Memory**                                                                                        |
| Product / RI      | [../apzknowledge/](../apzknowledge/) **RI #008**                                                                            |
| Definition pack   | [../apzhub-knowledge-domain-001/OWNER-APPROVAL.md](../apzhub-knowledge-domain-001/OWNER-APPROVAL.md) **CLOSED**             |
| Architecture pack | [../apzhub-knowledge-architecture-001/OWNER-APPROVAL.md](../apzhub-knowledge-architecture-001/OWNER-APPROVAL.md) **CLOSED** |
| Evaluation        | [../apzhub-domain-evaluation-001/](../apzhub-domain-evaluation-001/) · **4.60** · accepted                                  |

| Question              | Answer                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**               | Beyond documents-as-files, enterprises need curated, discoverable organisational memory that helps people act correctly in context.                           |
| **Capabilities**      | See [KNOWLEDGE-CAPABILITY-MAP.md](../apzhub-knowledge-domain-001/KNOWLEDGE-CAPABILITY-MAP.md) — candidates, not commitments                                   |
| **Existing products** | None as Knowledge SoR; Documents / Law / Core products are referenced — see [KNOWLEDGE-BOUNDARIES.md](../apzhub-knowledge-domain-001/KNOWLEDGE-BOUNDARIES.md) |
| **Future products**   | Possible APZ Knowledge — **only after** Domain Definition acceptance + Mission Auth                                                                           |
| **Out of scope**      | Replacing Documents · Law SoR · wiki dump · AI-as-identity · enterprise search for all SoRs · RAG without separate Auth                                       |

---

# Cross-domain placement of the baseline portfolio

| Domain                                                                | Products today            |
| --------------------------------------------------------------------- | ------------------------- |
| Foundation                                                            | APZHUB Platform           |
| Quality                                                               | APZQEP                    |
| Operations                                                            | Time · Support · Projects |
| Business Process                                                      | Workflow                  |
| Information                                                           | Documents                 |
| Insight                                                               | Analytics                 |
| Governance                                                            | Law                       |
| People · Finance · Customer · Assets · Procurement · Risk · Knowledge | — (planned)               |
