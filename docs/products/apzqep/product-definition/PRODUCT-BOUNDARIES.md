# APZ QEP — Product Boundaries

> **Programme:** APZQEP-DEF-002 (expansion of APZQEP-DEF-001) · Authority: Constitution Product Guardrails  
> **Baseline version:** 1.0.0-def (expanded)

## APZ QEP is

An **Enterprise Quality Engineering Platform** — the System of Record for quality-relevant requirements, verification, evidence, certification, quality metrics and intelligence, audit, and traceability on APZHUB.

APZ QEP governs the quality lifecycle from approved requirements through verification design, execution, evidence capture, defect and risk management, traceability, release readiness assessment, and human certification. It answers whether software can be released with sufficient confidence — not whether work items are tracked, code is hosted, or pipelines are executed.

## APZ QEP is not

| Not | May still |
| --- | --------- |
| An ALM platform | Link/sync issues and projects via Platform Services; represent quality project contexts |
| A project-management platform | Represent quality projects, releases, and scopes within QE governance |
| A source-control platform | Link repositories and builds as references for traceability and evidence |
| A CI/CD platform | Ingest pipeline metadata and automated verification results |
| An automation runner | Reference external runners; govern and ingest results — never execute as product identity |
| A device cloud | Attach device-cloud evidence references to verification sessions |
| A generic document-management platform | Use Platform Documents for evidence packs and compliance artefacts |
| A generic observability platform | Consume Platform Observability for operational quality signals |
| A general-purpose AI chatbot | Provide governed AI Quality Workspace with human gates |
| A replacement for every engineering tool | Integrate via Platform Services and connectors; remain QE-focused |

## Boundary tests (Definition)

**In-boundary:** A proposed capability improves the answer to *Can this software be released with sufficient confidence?* via governed quality information — requirements, verification, evidence, defects, risk, traceability, readiness, certification, audit, or quality intelligence.

**Out-of-boundary:** A proposed capability primarily manages work items, pipelines, code hosting, device farms, or unrestricted agent automation without QE SoR purpose.

**Integration boundary:** APZ QEP integrates with ALM, SCM, CI/CD, defect trackers, and observability systems through Platform Services and connectors. Integration does not make QEP those systems. QEP remains authoritative only for its SoR domains.

## Enterprise boundary posture

| Concern | QEP role | External system role |
| ------- | -------- | -------------------- |
| Requirements | SoR for quality-relevant requirements; approve/baseline | ALM may source or sync; QEP governs quality approval |
| Verification | SoR for verification design, library, sessions, runs | Runners execute; QEP governs and ingests |
| Evidence | SoR for evidence packs; lock on certification | Documents/storage may hold files; QEP governs pack integrity |
| Defects | SoR for quality defects linked to verification | External trackers may sync; QEP governs quality linkage |
| Certification | SoR for human certification decisions | Release tools may consume cert status; QEP is authoritative |
| Audit | SoR for quality audit trail | Platform audit complements; QEP owns quality events |

## DEF-002 note

Boundary decisions are unchanged from DEF-001 (DEF-D-008). DEF-002 expanded enterprise clarity of boundary tests and integration posture without altering in/out scope.
