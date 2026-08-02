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

| Programme                                 | Path                                                                     | Status                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| APZQEP-110 Product Planning               | `docs/products/apzqep/v1.1/`                                             | **APPROVED**                                                                                                        |
| APZQEP-111 Solution Architecture          | `docs/products/apzqep/v1.1/*ARCHITECTURE*` · `ENGINEERING-PROGRAMMES.md` | **APPROVED**                                                                                                        |
| APZQEP-120 Engineering Execution Planning | `docs/products/apzqep/v1.1/apzqep-120/`                                  | **PLANNING COMPLETE** — Board review; implementation not authorised                                                 |
| Standing record                           | `docs/products/apzqep/STANDING-PROGRAMME-RECORD.md`                      | **IN FORCE**                                                                                                        |
| Evidence Catalogue Platform (S05)         | `docs/products/apzqep/EVIDENCE-CATALOGUE-PLATFORM.md`                    | **IMPLEMENTED** (LA)                                                                                                |
| S05 engineering notes                     | `docs/products/apzqep/v1.1/apzqep-120/S05-ENGINEERING-NOTES.md`          | **COMPLETE**                                                                                                        |
| Evidence Lifecycle & Governance (S06)     | `docs/products/apzqep/EVIDENCE-LIFECYCLE-GOVERNANCE.md`                  | **IMPLEMENTED** (LA)                                                                                                |
| S06 engineering notes                     | `docs/products/apzqep/v1.1/apzqep-120/S06-ENGINEERING-NOTES.md`          | **COMPLETE**                                                                                                        |
| APZQEP Engineering Framework v1.0         | `docs/products/apzqep/engineering/APZQEP-ENGINEERING-FRAMEWORK.md`       | **BASELINED** — core product (Constitution, Handbook, Standards, Spec Template)                                     |
| APZQEP-ENG-001 programme                  | `docs/products/apzqep/engineering/`                                      | Phases 1–4 CERTIFIED; Framework v1.0 BASELINED; Testing Standard COMPLETE; next = Certification Standard; docs only |

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
