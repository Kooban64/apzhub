# APZ QEP — Document Mapping (TCMS → QEP)

> **Programme:** APZQEP-TRANSITION-001  
> **Rule:** No historical document discarded. Paths preserved with bridges.

## Official vs historical roots

| Role                              | Path                      |
| --------------------------------- | ------------------------- |
| **Official product root**         | `docs/products/apzqep/`   |
| Historical commercial pack        | `docs/products/apz-tcms/` |
| Historical requirements slug pack | `docs/products/apztcms/`  |

## Mapping table

| Historical artefact                        | Status    | QEP relationship                                                                 |
| ------------------------------------------ | --------- | -------------------------------------------------------------------------------- |
| `apz-tcms/README.md`                       | Preserved | Bridge → apzqep                                                                  |
| `apz-tcms/*` planning/cert packs           | Preserved | Historical 1.0.0 PRWL context                                                    |
| `apztcms/README.md`                        | Preserved | Bridge → apzqep + requirements                                                   |
| `apztcms/requirements/*` (APZTCMS-REQ-001) | Preserved | Evolved into **APZQEP-REQ-001** (do not discard)                                 |
| `apzqep/requirements/*` (APZQEP-REQ-001)   | Active    | Authoritative QEP Requirements Baseline (Awaiting Acceptance)                    |
| Releases `docs/releases/tcms/`             | Preserved | Historical SemVer evidence; future releases may use `qep/` when Owner authorises |
| Foundation indexes citing “APZ TCMS”       | Updated   | Prefer APZ QEP; note former name                                                 |

## Terminology mapping (cross-links)

| Old term                        | New term                                                      |
| ------------------------------- | ------------------------------------------------------------- |
| APZ TCMS                        | APZ QEP (APZ Quality Engineering Platform)                    |
| Test Case Management            | Quality Engineering / Verification Management                 |
| Test case (as product identity) | Verification (manual procedure remains valid form)            |
| APZTCMS-DEF-001 (planned)       | Superseded → **APZQEP-DEF-001** after Requirements Acceptance |
| APZTCMS-REQ-001                 | Preserved; evolved into **APZQEP-REQ-001**                    |

## v1.1 programme document map (active)

| Programme                                            | Path                                                                                  | Status                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| APZQEP-110 Product Planning                          | `docs/products/apzqep/v1.1/`                                                          | **APPROVED**                                                        |
| APZQEP-111 Solution Architecture                     | `docs/products/apzqep/v1.1/*ARCHITECTURE*` · `ENGINEERING-PROGRAMMES.md`              | **APPROVED**                                                        |
| APZQEP-120 Engineering Execution Planning            | `docs/products/apzqep/v1.1/apzqep-120/`                                               | **PLANNING COMPLETE** — Board review; implementation not authorised |
| Standing record                                      | `docs/products/apzqep/STANDING-PROGRAMME-RECORD.md`                                   | **IN FORCE**                                                        |
| Evidence Catalogue Platform (S05)                    | `docs/products/apzqep/EVIDENCE-CATALOGUE-PLATFORM.md`                                 | **IMPLEMENTED** (LA)                                                |
| S05 engineering notes                                | `docs/products/apzqep/v1.1/apzqep-120/S05-ENGINEERING-NOTES.md`                       | **COMPLETE**                                                        |
| Evidence Lifecycle & Governance (S06)                | `docs/products/apzqep/EVIDENCE-LIFECYCLE-GOVERNANCE.md`                               | **IMPLEMENTED** (LA)                                                |
| S06 engineering notes                                | `docs/products/apzqep/v1.1/apzqep-120/S06-ENGINEERING-NOTES.md`                       | **COMPLETE**                                                        |
| APZQEP Engineering Framework v1.0                    | `docs/products/apzqep/engineering/APZQEP-ENGINEERING-FRAMEWORK.md`                    | **BASELINED** · Maintenance **ACTIVE** — core product               |
| APZQEP-ENG-001 programme                             | `docs/products/apzqep/engineering/`                                                   | **CLOSED** — Framework v1.0; successor APZHUB-ENG-002               |
| APZQEP Portfolio Status Snapshot                     | `docs/products/apzqep/engineering/APZQEP-PORTFOLIO-STATUS.md`                         | **IN FORCE** (Board closure snapshot)                               |
| APZQEP Engineering Framework Changelog               | `docs/products/apzqep/engineering/APZQEP-ENGINEERING-FRAMEWORK-CHANGELOG.md`          | **ACTIVE** — governance evolution record                            |
| APZQEP → APZHUB Promotion Review                     | `docs/products/apzqep/engineering/APZQEP-ENG-001-PROMOTION-REVIEW.md`                 | **CERTIFIED** — Standards SPLIT refinement                          |
| APZHUB-ENG-002 Portfolio Engineering Standards       | `docs/engineering/APZHUB-ENG-002/`                                                    | Foundation COMPLETE · Phase 1 CLOSED · ES promotions ON HOLD        |
| APZHUB-ENG-002 Governance Foundation Complete        | `docs/engineering/APZHUB-ENG-002/GOVERNANCE-FOUNDATION-COMPLETE.md`                   | Conversation baseline · chapter closed                              |
| APZHUB-ENG-002 Phase 1 Closed                        | `docs/engineering/APZHUB-ENG-002/PHASE-1-CLOSED.md`                                   | ES-001…ES-003 closed · promotions ON HOLD                           |
| APZQEP-120 next programme recommendation             | `docs/products/apzqep/v1.1/apzqep-120/PRODUCT-BOARD-RECOMMENDATION-NEXT-PROGRAMME.md` | **S07** recommended · implementation NONE                           |
| APZHUB Engineering Governance                        | `docs/engineering/APZHUB-ENGINEERING-GOVERNANCE.md`                                   | Governance Version **1.0 STABLE**                                   |
| APZHUB Engineering Governance History                | `docs/engineering/APZHUB-ENGINEERING-GOVERNANCE-HISTORY.md`                           | Non-normative historical record                                     |
| APZHUB Enterprise Engineering Standards Catalogue    | `docs/engineering/APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md`                          | ES-001…ES-003 Active; ES-004 = first enhancement candidate          |
| APZHUB Enterprise Engineering Baseline               | `docs/engineering/APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md`                          | **1.2 ACTIVE** · series **1.x STABLE**                              |
| APZHUB Enterprise Testing Standard (ES-001)          | `docs/engineering/APZHUB-TESTING-STANDARD.md`                                         | **ACTIVE** v1.0                                                     |
| APZHUB Enterprise Certification Standard (ES-002)    | `docs/engineering/APZHUB-CERTIFICATION-STANDARD.md`                                   | **ACTIVE** v1.0                                                     |
| APZHUB Enterprise Engineering Spec Template (ES-003) | `docs/engineering/APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE.md`                       | **ACTIVE** v1.0 — Specify (Baseline 1.2)                            |
| APZHUB-ENG-002 Phase 1A Baseline 1.2 Review          | `docs/engineering/APZHUB-ENG-002/PHASE-1A-BASELINE-1.2-REVIEW.md`                     | **FINAL CERTIFIED / ACCEPTED**                                      |
| APZHUB-ENG-002 Phase 1A Board Resolution             | `docs/engineering/APZHUB-ENG-002/PRODUCT-BOARD-RESOLUTION-PHASE-1A.md`                | **ACCEPTED**                                                        |
| APZHUB-ENG-002 Baseline 1.x STABLE                   | `docs/engineering/APZHUB-ENG-002/BASELINE-1.x-STABLE.md`                              | **DECLARED** — evolving era                                         |
| APZHUB-ENG-002 Governance Era 1                      | `docs/engineering/APZHUB-ENG-002/ENGINEERING-GOVERNANCE-ERA-1.md`                     | **COMPLETE**                                                        |
| APZHUB-ENG-002 Stable Baseline Policy                | `docs/engineering/APZHUB-ENG-002/STABLE-BASELINE-POLICY.md`                           | **NORMATIVE**                                                       |
| APZHUB-ENG-002 Governance Process Freeze             | `docs/engineering/APZHUB-ENG-002/GOVERNANCE-PROCESS-FREEZE.md`                        | **NORMATIVE**                                                       |
| APZHUB-ENG-002 Enterprise Enhancement Policy         | `docs/engineering/APZHUB-ENG-002/ENTERPRISE-ENHANCEMENT-POLICY.md`                    | **NORMATIVE**                                                       |

## Indexes updated in this programme

- `docs/foundation/CURRENT-STATE.md`
- `docs/foundation/CURRENT-MILESTONE.md`
- `docs/foundation/ACTIVE-BACKLOG.md`
- `docs/foundation/PROJECT-INDEX.md`
- `docs/foundation/AI-MANIFEST.md`
- `docs/foundation/OWNER-ACCEPTANCE-REGISTER.md`
- `docs/foundation/DOCUMENT-MAP.md`
- `docs/foundation/PRODUCT-CATALOGUE.md`
- `docs/products/PRODUCT-DOCUMENT-MAP.md`
- `docs/products/README.md`
- `docs/operations/evidence/portfolio-recert/README.md`
