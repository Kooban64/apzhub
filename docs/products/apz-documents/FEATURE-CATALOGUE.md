# APZ Documents — Feature Catalogue (Release 1.0)

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** [RELEASE-1.0-DEFINITION.md](./RELEASE-1.0-DEFINITION.md) · APZDOCS-006 Vertical Certification

---

## Legend

| Tag   | Meaning                                                                         |
| ----- | ------------------------------------------------------------------------------- |
| **F** | Foundation on disk (APZDOCS frozen PRWL)                                        |
| **P** | Planned for commercial Release 1.0 packaging (not authorised by this programme) |
| **L** | Later than Release 1.0                                                          |
| **X** | Explicitly excluded from Release 1.0                                            |

---

## Catalogue

| ID           | Feature                                       | Tag             | Notes                                                        |
| ------------ | --------------------------------------------- | --------------- | ------------------------------------------------------------ |
| DOC-META-01  | Document metadata SoR                         | **F** / **P**   | Productise existing SoR                                      |
| DOC-META-02  | Version descriptors                           | **F** / **P**   | Metadata versions — not binary diff                          |
| DOC-ORG-01   | Folders                                       | **F** / **P**   | Manifest + services                                          |
| DOC-ORG-02   | Collections                                   | **F** / **P**   |                                                              |
| DOC-ORG-03   | Tags                                          | **F** / **P**   |                                                              |
| DOC-LC-01    | Classify                                      | **F** / **P**   |                                                              |
| DOC-LC-02    | Archive / restore                             | **F** / **P**   |                                                              |
| DOC-LC-03    | Retention descriptors                         | **F** / **P**   |                                                              |
| DOC-IAM-01   | Permissions (`document.*`)                    | **F** / **P**   | Permission-driven shell                                      |
| DOC-HTTP-01  | HTTP `/api/v1/documents/*`                    | **F** / **P**   | OpenAPI platform                                             |
| DOC-UX-01    | Workbench `/workspace/documents`              | **F** / **P**   |                                                              |
| DOC-CLI-01   | Typed HTTP client                             | **F** / **P**   | No gateway/integration imports                               |
| DOC-STO-01   | Storage coordinator (FS / S3-compat / memory) | **F**           | CE/self-hosted                                               |
| DOC-SRCH-01  | Search publication (`search-documents`)       | **F** / **P**   | Via Platform Search — not standalone search UI               |
| DOC-DIAG-01  | Diagnostics / health contribution             | **F** / **P**   |                                                              |
| DOC-PKG-01   | Commercial SemVer **1.0.0** evidence pack     | **P**           | `docs/releases/documents/1.0.0/` absent                      |
| DOC-INT-01   | Identity / AuthZ alignment                    | **F** / **P**   | Consumes platform IAM                                        |
| DOC-INT-02   | Workflow cross-product links                  | **L** / partial | Not required for 1.0 packaging                               |
| DOC-INT-03   | Analytics document metrics                    | **L**           | Out of 1.0                                                   |
| DOC-PRV-01   | Paperless-ngx adapter                         | **X**           | No adapter on disk                                           |
| DOC-BIN-01   | Uploads / downloads / binary transfer         | **X**           | APZDOCS certified non-goal                                   |
| DOC-BIN-02   | OCR / AI / preview / editing                  | **X**           | Certified non-goal                                           |
| DOC-BIN-03   | Version binary comparison                     | **X**           | Certified non-goal                                           |
| DOC-NTF-01   | Documents-owned notification subsystem        | **X**           | Use Platform Notification Framework only if later authorised |
| DOC-CLOUD-01 | Azure Blob / GCS certified providers          | **X**           | Not in APZDOCS storage cert                                  |

---

## Release 1.0 feature cut line

Commercial **1.0.0** shall claim only features that are:

1. Implemented behind Platform Services + permissions (APZDOCS freeze), **and**
2. Covered by vertical + product certification evidence, **and**
3. Documented in Known Limitations where residual.

Release 1.0 is **metadata-first**. Do not market binary DMS features excluded by APZDOCS-006.
