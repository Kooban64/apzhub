# APZ QEP — Product Definition (Control Document)

> **Programme:** APZQEP-DEF-002 (expansion of APZQEP-DEF-001)  
> **Baseline version:** 1.0.0-def (expanded)  
> **Status:** IMPLEMENTED / AWAITING OWNER ACCEPTANCE  
> **Product:** APZ QEP — APZ Quality Engineering Platform  
> **Category:** Enterprise Quality Engineering Platform  
> **Platform baseline:** Certified Platform 1.4  
> **Constitution:** APZQEP-CONSTITUTION-001 **ACCEPTED / CLOSED**

## Document control

| Field | Value |
| ----- | ----- |
| Official name | **APZ QEP** |
| Expanded name | APZ Quality Engineering Platform |
| Product ID | `apzqep` |
| Former name | APZ TCMS (historical — preserved) |
| Definition method | DEF-001 controlled passes 1–6; DEF-002 depth expansion and consolidation |
| Prior programme | APZQEP-DEF-001 — structure accepted |
| Active programme | **APZQEP-DEF-002** — depth expansion complete |
| Next programme | **APZQEP-ARCH-001** (after Owner Acceptance only) |

## Central product outcome

APZ QEP helps an organisation answer:

> **Can this software be released with sufficient confidence?**

The answer is composed from governed SoR information: approved requirements, verification coverage, execution results, open defects, risk exposure, evidence completeness, approval status, compliance obligations, release gates, certification history, and human accountability.

## Authority hierarchy

```text
Product Vision → Constitution → Requirements → Discovery → Product Definition (this pack)
```

This pack is the product contract for **APZQEP-ARCH-001**. Architects must not invent product behaviour outside this baseline. DEF-002 raised depth; it did not redesign DEF-001 structure or decisions.

## Baseline structure (preserved from DEF-001)

| Layer | Content | Primary documents |
| ----- | ------- | ----------------- |
| Identity & positioning | Product name, category, philosophy, central question | [PRODUCT-OVERVIEW.md](./PRODUCT-OVERVIEW.md) |
| Modules | 22 product areas including Home & MCP | [PRODUCT-MODULES.md](./PRODUCT-MODULES.md) · [MODULE-CATALOGUE.md](./MODULE-CATALOGUE.md) |
| Personas & workspaces | 21 personas with full structured tables; role workspaces | [PERSONAS.md](./PERSONAS.md) · [ROLE-WORKSPACES.md](./ROLE-WORKSPACES.md) |
| Workflows | 35 individual user workflows with gates and outcomes | [USER-WORKFLOWS.md](./USER-WORKFLOWS.md) · [AI-WORKFLOWS.md](./AI-WORKFLOWS.md) · [MCP-WORKFLOWS.md](./MCP-WORKFLOWS.md) |
| Models | Verification, evidence, traceability, risk, certification, readiness | [VERIFICATION-MODEL.md](./VERIFICATION-MODEL.md) · [EVIDENCE-MODEL.md](./EVIDENCE-MODEL.md) · [TRACEABILITY-MODEL.md](./TRACEABILITY-MODEL.md) · [RISK-MODEL.md](./RISK-MODEL.md) · [CERTIFICATION-MODEL.md](./CERTIFICATION-MODEL.md) · [RELEASE-READINESS.md](./RELEASE-READINESS.md) |
| UX / IA / navigation | Experience principles, information architecture, navigation map | [USER-EXPERIENCE.md](./USER-EXPERIENCE.md) · [INFORMATION-ARCHITECTURE.md](./INFORMATION-ARCHITECTURE.md) · [NAVIGATION-MAP.md](./NAVIGATION-MAP.md) |
| Boundaries & capabilities | In/out scope, capability classification, MVP, editions | [PRODUCT-BOUNDARIES.md](./PRODUCT-BOUNDARIES.md) · [PRODUCT-CAPABILITIES.md](./PRODUCT-CAPABILITIES.md) · [MVP-DEFINITION.md](./MVP-DEFINITION.md) |
| Decisions & traceability | Product decisions; requirements mapping | [PRODUCT-DEFINITION-DECISIONS.md](./PRODUCT-DEFINITION-DECISIONS.md) · [REQUIREMENTS-TO-DEFINITION-TRACEABILITY.md](./REQUIREMENTS-TO-DEFINITION-TRACEABILITY.md) |

## DEF-002 expansion summary

APZQEP-DEF-002 consolidated and deepened the DEF-001 baseline without changing product decisions:

- **Personas:** 21 full structured persona tables (not prose summaries)
- **Workflows:** 35 individual workflow definitions with actors, steps, gates, and outcomes
- **Models:** Substantive verification, evidence, traceability, risk, certification, and readiness model documentation
- **UX / IA / navigation:** Enterprise-grade experience, information architecture, and navigation coverage

All DEF-001 decisions (DEF-D-001 through DEF-D-010) remain authoritative. See [PRODUCT-DEFINITION-DECISIONS.md](./PRODUCT-DEFINITION-DECISIONS.md) for DEF-D-011 (depth expansion without decision change).

## Product identity (normative)

| Aspect | Definition |
| ------ | ---------- |
| What it is | Enterprise Quality Engineering Platform governing quality across the SDLC |
| What testing is | One capability — not the product identity |
| SoR | QEP for requirements, verification, evidence, certification, quality metrics/intelligence, audit, traceability |
| AI posture | Assistants only; default OFF; never SoR; never auto-certify |
| MCP posture | Preferred governed IDE/agent channel; no autonomous certify |
| Platform | Native APZHUB product; Module → Platform Service → Connector → Engine |

## Philosophy (preserved from Constitution)

Quality before Testing · Verification before Execution · Evidence before Opinion · Certification before Release · Knowledge before Automation · Governance before Convenience · Security by Design · Platform-first · API-first · AI assists Humans · Humans remain Accountable · Everything Traceable / Auditable / Explainable / Measurable · Enterprise-first · Standards over Shortcuts.

## Pass 1 — Source review summary (DEF-001)

| Source | Use in Definition |
| ------ | ----------------- |
| PRODUCT-VISION | Identity, SDLC quality governance |
| Constitution pack | Immutable constraints; SoR; AI; cert; security; boundaries |
| REQ-001 | BR/SR/CR/FR/NFR/AIR/IR/SEC/RPT — capability obligations |
| Discovery | Differentiators, MVP sequencing, competitive non-goals |
| REQ maturity / glossary | Verification-centric language; maturity levels |

### Interpretations recorded (non-overrides)

| ID | Interpretation | Authority basis |
| -- | -------------- | --------------- |
| INT-001 | Product folder uses `product-definition/` (Owner DEF deliverable path) while PRODUCTS-003 generic path is `definition/` — both valid; this pack is authoritative for QEP | Owner programme |
| INT-002 | Maturity presented as L1–L7 per Owner DEF brief (extends REQ MM L1–L6 by splitting continuous cert signals as L7) | Owner DEF + Constitution continuous cert |
| INT-003 | “Home and Command Centre” is a product area/workspace, not a separate commercial product | Discovery UX + DEF modules list |
| INT-004 | Manual Tester / Exploratory Tester are specialisations of QA Engineer persona family | REQ PSN + Owner persona list |
| INT-005 | MVP excludes runtime AI ON and advanced MCP write tools; includes manual-first complete lifecycle | Discovery + Constitution AI default OFF |

### Conflicts resolved

| Conflict | Resolution |
| -------- | ---------- |
| TCMS vs QEP identity | QEP official; TCMS historical only |
| Test case vs verification | Verification primary; test procedure is a form |
| Next after Discovery was DEF then Constitution inserted | Constitution accepted; DEF proceeds now |
| AI-native vs AI default OFF | Vision/capability AI-native; runtime OFF until authorised — non-conflict |

## Pack composition

See [README.md](./README.md). Full index: 36 files.

## Explicit non-goals (Definition level)

- No system/solution/technical architecture  
- No database, API, event, or ADR design  
- No UI mock-ups or wireframes  
- No production code or Platform 1.4 / 2.0 work  

## Approval

See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md).
