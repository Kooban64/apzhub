# APZ QEP — Product Glossary (Definition)

> **Programme:** APZQEP-DEF-002 (expansion of APZQEP-DEF-001)  
> **Baseline version:** 1.0.0-def (expanded)  
> **Aligns with:** [../requirements/PRODUCT-GLOSSARY.md](../requirements/PRODUCT-GLOSSARY.md)

| Term | Definition |
| ---- | ---------- |
| APZ QEP | APZ Quality Engineering Platform — official product name |
| APZ TCMS | Former name — historical only; do not use as active product identity |
| Verification | Primary work unit proving requirements; supersedes “test case” as product noun |
| Verification procedure | Reusable specification for proving a requirement (includes classical test case form) |
| Verification session | Human-centred execution context for manual or guided verification |
| Verification run | Planned or batch execution instance (manual, automated ingest, or hybrid) |
| Evidence | Artefact captured during verification supporting readiness or certification |
| Evidence pack | Curated set of evidence supporting a release readiness or certification scope |
| Evidence lock | Immutable state applied to approved evidence packs at certification |
| Certification | Formal human quality decision for a defined scope — never automated |
| Certification scope | Release, sprint, build, or project boundary subject to certification |
| Approved with qualifications | Certification outcome with recorded operational qualifications |
| Rejected | Certification outcome requiring remediation before release |
| Continuous certification signal | Indicator requesting re-certification review — never auto-flips status |
| Release readiness | Aggregated confidence snapshot before certification; includes gates and waivers |
| Quality Intelligence | Explainable decision support — not autonomous authority |
| Traceability | Requirement → verification → execution → evidence → defect linkage |
| Coverage gap | Missing or incomplete verification/evidence for an approved requirement |
| Risk exposure | Identified quality risk affecting readiness or certification |
| Waiver | Approved exception affecting readiness with recorded justification |
| Workspace | Role-aware UX composition of modules, views, and actions for a persona |
| Persona | Structured role definition with goals, permissions, and workspace access |
| Module | Product area within QEP (22 modules including Home and MCP) |
| MCP | Model Context Protocol — preferred governed IDE/agent interaction channel |
| System of Record (SoR) | Authoritative store — QEP for listed quality domains |
| AI assistant / AI Agent | Non-authoritative actor; cannot certify, approve, or become SoR |
| Human gate | Mandatory human approval point in a workflow |
| Maturity level (L1–L7) | Organisational QE maturity; L7 = continuous cert signals |
| Platform Service | APZHUB orchestration layer between modules and connectors |
| Connector | Integration adapter between Platform Services and backend engines |

## Usage rules

- Use **Verification** not “test case” in product-facing language unless quoting external systems.
- Use **APZ QEP** not APZ TCMS in active documentation.
- **Certification** always implies a named accountable human actor.
- **AI** and **MCP** are assistive channels — never certification authority.

## DEF-002 note

Glossary terms are unchanged in meaning from DEF-001. DEF-002 expanded term coverage for enterprise clarity across personas, workflows, and models.
