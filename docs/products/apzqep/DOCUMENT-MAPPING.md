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

| Old term                        | New term                                                            |
| ------------------------------- | ------------------------------------------------------------------- |
| APZ TCMS                        | APZ QEP (APZ Quality Engineering Platform)                          |
| Test Case Management            | Quality Engineering / Verification Management                       |
| Test case (as product identity) | Verification (manual procedure remains valid form)                  |
| APZTCMS-DEF-001 (planned)       | Superseded → **APZQEP-DEF-001** after Requirements Acceptance       |
| APZTCMS-REQ-001                 | Preserved; evolved into **APZQEP-REQ-001**                          |

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
